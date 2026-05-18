import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from scipy.sparse import csr_matrix
import json
import os
import requests
import zipfile
import io
import re

SEARCH_INDEX_PATH = "src/data/recommendation-search-index.json"
RECOMMENDATIONS_PATH = "src/data/recommendations.json"
TOP_SEARCH_TERMS = 28
RECOMMENDATION_COUNT = 20
CHUNK_SIZE = 256
SVD_COMPONENTS = 80
COLLAB_WEIGHT = 0.68
CONTENT_WEIGHT = 0.32
QUALITY_WEIGHT = 0.04

def clean_title(title):
    return re.sub(r"\s*\(\d{4}\)\s*$", "", str(title)).strip()

def extract_year(title):
    match = re.search(r"\((\d{4})\)\s*$", str(title))
    return int(match.group(1)) if match else None

def normalize_genres(genres):
    return str(genres).replace("|", " ").replace("(no genres listed)", "")

def build_search_index(movies, ratings, tags):
    print("🔎 Building Search Intent Model...")

    rating_stats = ratings.groupby("movieId").agg(
        rating_count=("rating", "count"),
        rating_mean=("rating", "mean"),
    ).reset_index()

    global_mean = float(ratings["rating"].mean())
    min_votes = 25
    rating_stats["quality"] = (
        (rating_stats["rating_count"] / (rating_stats["rating_count"] + min_votes)) * rating_stats["rating_mean"]
        + (min_votes / (rating_stats["rating_count"] + min_votes)) * global_mean
    )

    tag_text = tags.groupby("movieId")["tag"].apply(lambda values: " ".join(map(str, values))).reset_index(name="tag_text")

    search_movies = movies.merge(rating_stats, on="movieId", how="left").merge(tag_text, on="movieId", how="left")
    search_movies = search_movies.dropna(subset=["tmdbId"]).copy()
    search_movies["rating_count"] = search_movies["rating_count"].fillna(0).astype(int)
    search_movies["rating_mean"] = search_movies["rating_mean"].fillna(global_mean)
    search_movies["quality"] = search_movies["quality"].fillna(global_mean)
    search_movies = (
        search_movies
        .sort_values(["tmdbId", "rating_count", "quality"], ascending=[True, False, False])
        .drop_duplicates(subset=["tmdbId"], keep="first")
        .sort_values("movieId")
        .reset_index(drop=True)
    )
    search_movies["tag_text"] = search_movies["tag_text"].fillna("")
    search_movies["clean_title"] = search_movies["title"].apply(clean_title)
    search_movies["year"] = search_movies["title"].apply(extract_year)
    search_movies["genre_text"] = search_movies["genres"].apply(normalize_genres)

    # Title and genre text are intentionally repeated to bias the sparse model
    # toward search intent, while tags add useful mood/theme vocabulary.
    search_movies["search_text"] = (
        (search_movies["clean_title"] + " ") * 4
        + (search_movies["genre_text"] + " ") * 2
        + search_movies["tag_text"]
    )

    vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2),
        sublinear_tf=True,
        max_features=30000,
    )
    search_matrix = vectorizer.fit_transform(search_movies["search_text"])
    terms = np.array(vectorizer.get_feature_names_out())

    quality_min = float(search_movies["quality"].min())
    quality_max = float(search_movies["quality"].max())
    quality_range = quality_max - quality_min or 1.0

    entries = []
    for idx, row in search_movies.reset_index(drop=True).iterrows():
        vector = search_matrix.getrow(idx)
        if vector.nnz:
            order = np.argsort(vector.data)[::-1][:TOP_SEARCH_TERMS]
            top_terms = [
                [str(terms[vector.indices[i]]), round(float(vector.data[i]), 5)]
                for i in order
            ]
        else:
            top_terms = []

        entries.append({
            "id": int(row["tmdbId"]),
            "title": row["clean_title"],
            "year": None if pd.isna(row["year"]) else int(row["year"]),
            "genres": [genre for genre in str(row["genres"]).split("|") if genre and genre != "(no genres listed)"],
            "terms": top_terms,
            "quality": round((float(row["quality"]) - quality_min) / quality_range, 4),
            "votes": int(row["rating_count"]),
        })

    return {
        "version": 2,
        "model": "tfidf_search_intent_plus_bayesian_quality",
        "entries": entries,
    }

def download_dataset():
    if not os.path.exists("ml/data/ml-latest-small"):
        print("Downloading MovieLens Small Dataset...")
        url = "https://files.grouplens.org/datasets/movielens/ml-latest-small.zip"
        r = requests.get(url)
        z = zipfile.ZipFile(io.BytesIO(r.content))
        z.extractall("ml/data")
        print("Dataset extracted to ml/data/")

def train_and_export():
    print("🚀 Starting Hybrid AI Training...")

    # 1. Load Data
    try:
        movies = pd.read_csv("ml/data/ml-latest-small/movies.csv")
        ratings = pd.read_csv("ml/data/ml-latest-small/ratings.csv")
        links = pd.read_csv("ml/data/ml-latest-small/links.csv")
        tags = pd.read_csv("ml/data/ml-latest-small/tags.csv")
    except FileNotFoundError:
        download_dataset()
        movies = pd.read_csv("ml/data/ml-latest-small/movies.csv")
        ratings = pd.read_csv("ml/data/ml-latest-small/ratings.csv")
        links = pd.read_csv("ml/data/ml-latest-small/links.csv")
        tags = pd.read_csv("ml/data/ml-latest-small/tags.csv")

    # Merge TMDB IDs
    movies = movies.merge(links, on='movieId', how='left')
    search_index = build_search_index(movies, ratings, tags)
    
    # ---------------------------------------------------------
    # PART A: Content-Based Filtering (The "Genre" Brain)
    # ---------------------------------------------------------
    print("🧠 Training Content Model (Genres)...")
    tag_text = tags.groupby("movieId")["tag"].apply(lambda values: " ".join(map(str, values))).reset_index(name="tag_text")
    movies = movies.merge(tag_text, on="movieId", how="left")
    movies["tag_text"] = movies["tag_text"].fillna("")
    movies["clean_title"] = movies["title"].apply(clean_title)
    movies['content'] = (
        movies['clean_title'] + " "
        + movies['genres'].apply(normalize_genres) + " "
        + movies["tag_text"]
    )
    tfidf = TfidfVectorizer(
        stop_words='english',
        ngram_range=(1, 2),
        sublinear_tf=True,
        max_features=30000,
    )
    
    # ---------------------------------------------------------
    # PART B: Collaborative Filtering (The "Human" Brain)
    # ---------------------------------------------------------
    print("👥 Training Collaborative Model (User Patterns)...")
    
    # Create User-Item Matrix (Rows: Movies, Cols: Users)
    user_movie_matrix = ratings.pivot(index='movieId', columns='userId', values='rating')
    
    # Fill NaN with 0 (user didn't rate)
    user_movie_matrix = user_movie_matrix.fillna(0)
    
    # Align indices between 'movies' DF and 'user_movie_matrix'
    # Use only movies that exist in both
    available_movie_ids = user_movie_matrix.index
    movies = movies[movies['movieId'].isin(available_movie_ids)].reset_index(drop=True)
    
    # Re-filter matrix to match sorted movies dataframe order
    user_movie_matrix = user_movie_matrix.loc[movies['movieId']]
    
    # Convert to Sparse Matrix for speed
    sparse_user_movie = csr_matrix(user_movie_matrix.values)
    
    # ---------------------------------------------------------
    # IMPROVEMENT: SVD (Matrix Factorization)
    # Reduces noise and finds "Latent Patterns" (e.g. concepts like "Dark Humour")
    # This is the technique that popularized the Netflix Prize
    # ---------------------------------------------------------
    print("✨ Applying SVD (Matrix Factorization)...")
    from sklearn.decomposition import TruncatedSVD
    
    # Reduce to latent preference features. 80 components keeps more signal than
    # the previous 50 while staying small enough for fast offline generation.
    svd = TruncatedSVD(n_components=SVD_COMPONENTS, random_state=42)
    latent_matrix = svd.fit_transform(sparse_user_movie)

    # ---------------------------------------------------------
    # PART C: Hybrid Fusion
    # ---------------------------------------------------------
    print(f"⚗️ Fusing Models ({COLLAB_WEIGHT:.0%} Human / {CONTENT_WEIGHT:.0%} Content + Quality Rerank)...")
    
    # Re-compute content vectors after filtering to the rated movie universe.
    tfidf_matrix_filtered = tfidf.fit_transform(movies['content'])

    rating_stats = ratings.groupby("movieId").agg(
        rating_count=("rating", "count"),
        rating_mean=("rating", "mean"),
    ).reset_index()
    global_mean = float(ratings["rating"].mean())
    min_votes = 25
    rating_stats["quality"] = (
        (rating_stats["rating_count"] / (rating_stats["rating_count"] + min_votes)) * rating_stats["rating_mean"]
        + (min_votes / (rating_stats["rating_count"] + min_votes)) * global_mean
    )
    movies = movies.merge(rating_stats[["movieId", "quality"]], on="movieId", how="left")
    movies["quality"] = movies["quality"].fillna(global_mean)
    quality = movies["quality"].to_numpy(dtype=np.float32)
    quality = (quality - quality.min()) / ((quality.max() - quality.min()) or 1.0)
    
    # ---------------------------------------------------------
    # Export
    # ---------------------------------------------------------
    print("📦 Generating Recommendations Map...")
    
    recommendation_map = {}
    count = 0
    total = len(movies)
    
    tmdb_ids = movies["tmdbId"].to_numpy()
    for start in range(0, total, CHUNK_SIZE):
        end = min(start + CHUNK_SIZE, total)
        collab_chunk = cosine_similarity(latent_matrix[start:end], latent_matrix)
        content_chunk = cosine_similarity(tfidf_matrix_filtered[start:end], tfidf_matrix_filtered)
        hybrid_chunk = (
            (COLLAB_WEIGHT * collab_chunk)
            + (CONTENT_WEIGHT * content_chunk)
            + (QUALITY_WEIGHT * quality[np.newaxis, :])
        )

        for local_idx, scores in enumerate(hybrid_chunk):
            idx = start + local_idx
            tmdb_id = str(int(tmdb_ids[idx])) if not pd.isna(tmdb_ids[idx]) else None
            if not tmdb_id:
                continue

            scores[idx] = -np.inf
            candidate_count = min(RECOMMENDATION_COUNT * 3, total - 1)
            candidate_indices = np.argpartition(scores, -candidate_count)[-candidate_count:]
            candidate_indices = candidate_indices[np.argsort(scores[candidate_indices])[::-1]]

            recs = []
            for candidate_idx in candidate_indices:
                rec_tmdb = tmdb_ids[candidate_idx]
                if pd.isna(rec_tmdb):
                    continue
                recs.append(int(rec_tmdb))
                if len(recs) >= RECOMMENDATION_COUNT:
                    break

            recommendation_map[tmdb_id] = recs

        count = end
        print(f"Processed {count}/{total} movies")

    os.makedirs('src/data', exist_ok=True)
    with open(RECOMMENDATIONS_PATH, 'w') as f:
        json.dump(recommendation_map, f)

    with open(SEARCH_INDEX_PATH, 'w') as f:
        json.dump(search_index, f)
        
    print(f"✅ Success! Trained on {total} movies.")
    print(f"Artifacts exported to {RECOMMENDATIONS_PATH} and {SEARCH_INDEX_PATH}")

if __name__ == "__main__":
    train_and_export()
