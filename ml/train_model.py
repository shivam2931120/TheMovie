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
    except FileNotFoundError:
        download_dataset()
        movies = pd.read_csv("ml/data/ml-latest-small/movies.csv")
        ratings = pd.read_csv("ml/data/ml-latest-small/ratings.csv")
        links = pd.read_csv("ml/data/ml-latest-small/links.csv")

    # Merge TMDB IDs
    movies = movies.merge(links, on='movieId', how='left')
    
    # ---------------------------------------------------------
    # PART A: Content-Based Filtering (The "Genre" Brain)
    # ---------------------------------------------------------
    print("🧠 Training Content Model (Genres)...")
    movies['content'] = movies['title'] + " " + movies['genres'].str.replace('|', ' ')
    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(movies['content'])
    
    # Compute Content Similarity
    content_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
    
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
    
    # Reduce to 50 "Latent Features"
    svd = TruncatedSVD(n_components=50, random_state=42)
    latent_matrix = svd.fit_transform(sparse_user_movie)
    
    # Compute Collaborative Similarity on the clean Latent Matrix
    print("👥 Computing SVD Similarity...")
    collab_sim = cosine_similarity(latent_matrix, latent_matrix)
    
    # ---------------------------------------------------------
    # PART C: Hybrid Fusion
    # ---------------------------------------------------------
    print("⚗️ Fusing Models (70% Human / 30% Content)...")
    
    # We need to ensure matrices are same shape. 
    # Since we filtered 'movies' to match 'ratings', we must re-compute content_sim for the filtered movies
    tfidf_matrix_filtered = tfidf.fit_transform(movies['content'])
    content_sim_filtered = cosine_similarity(tfidf_matrix_filtered, tfidf_matrix_filtered)
    
    # Weighted Average
    # 0.7 weight to Human Ratings (Smarter)
    # 0.3 weight to Genres (Good for stability)
    hybrid_sim = (0.7 * collab_sim) + (0.3 * content_sim_filtered)
    
    # ---------------------------------------------------------
    # Export
    # ---------------------------------------------------------
    print("📦 Generating Recommendations Map...")
    
    recommendation_map = {}
    count = 0
    total = len(movies)
    
    for idx, row in movies.iterrows():
        try:
            # Get similarity scores from Hybrid Matrix
            sim_scores = list(enumerate(hybrid_sim[idx]))
            
            # Sort
            sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
            
            # Get top 20 (excluding self)
            sim_scores = sim_scores[1:21]
            
            movie_indices = [i[0] for i in sim_scores]
            
            # Get TMDB IDs using the indices
            tmdb_id = str(int(row['tmdbId'])) if not pd.isna(row['tmdbId']) else None
            
            if tmdb_id:
                recs = []
                for i in movie_indices:
                    rec_tmdb = movies.iloc[i]['tmdbId']
                    if not pd.isna(rec_tmdb):
                        recs.append(int(rec_tmdb))
                
                recommendation_map[tmdb_id] = recs
                
        except Exception as e:
            continue
            
        count += 1
        if count % 1000 == 0:
            print(f"Processed {count}/{total} movies")

    os.makedirs('src/data', exist_ok=True)
    with open('src/data/recommendations.json', 'w') as f:
        json.dump(recommendation_map, f)
        
    print(f"✅ Success! Trained on {total} movies.")
    print("Artifacts exported to src/data/recommendations.json")

if __name__ == "__main__":
    train_and_export()
