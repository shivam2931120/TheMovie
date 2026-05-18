import math
from collections import defaultdict

import numpy as np
import pandas as pd
from scipy.sparse import csr_matrix
from sklearn.decomposition import TruncatedSVD
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from train_model import (
    CHUNK_SIZE,
    COLLAB_WEIGHT,
    CONTENT_WEIGHT,
    QUALITY_WEIGHT,
    RECOMMENDATION_COUNT,
    SVD_COMPONENTS,
    clean_title,
    download_dataset,
    normalize_genres,
)

POSITIVE_RATING = 4.0
TEST_FRACTION = 0.2
MIN_POSITIVES_PER_USER = 3

CANDIDATES = [
    {"name": "current", "collab": COLLAB_WEIGHT, "content": CONTENT_WEIGHT, "quality": QUALITY_WEIGHT},
    {"name": "balanced_60_40_q04", "collab": 0.60, "content": 0.40, "quality": 0.04},
    {"name": "balanced_64_36_q04", "collab": 0.64, "content": 0.36, "quality": 0.04},
    {"name": "collab_70_30_q04", "collab": 0.70, "content": 0.30, "quality": 0.04},
    {"name": "collab_72_28_q02", "collab": 0.72, "content": 0.28, "quality": 0.02},
    {"name": "collab_75_25_q00", "collab": 0.75, "content": 0.25, "quality": 0.00},
]


def load_data():
    try:
        movies = pd.read_csv("ml/data/ml-latest-small/movies.csv")
        ratings = pd.read_csv("ml/data/ml-latest-small/ratings.csv")
        tags = pd.read_csv("ml/data/ml-latest-small/tags.csv")
    except FileNotFoundError:
        download_dataset()
        movies = pd.read_csv("ml/data/ml-latest-small/movies.csv")
        ratings = pd.read_csv("ml/data/ml-latest-small/ratings.csv")
        tags = pd.read_csv("ml/data/ml-latest-small/tags.csv")

    return movies, ratings, tags


def chronological_holdout(ratings):
    test_indices = []

    for _, user_ratings in ratings.groupby("userId"):
        positives = user_ratings[user_ratings["rating"] >= POSITIVE_RATING].sort_values("timestamp")
        if len(positives) < MIN_POSITIVES_PER_USER:
            continue

        test_count = max(1, int(round(len(positives) * TEST_FRACTION)))
        test_indices.extend(positives.tail(test_count).index.tolist())

    test_ratings = ratings.loc[test_indices].copy()
    train_ratings = ratings.drop(index=test_indices).copy()
    return train_ratings, test_ratings


def build_features(movies, train_ratings, tags):
    tag_text = tags.groupby("movieId")["tag"].apply(lambda values: " ".join(map(str, values))).reset_index(name="tag_text")
    movies = movies.merge(tag_text, on="movieId", how="left")
    movies["tag_text"] = movies["tag_text"].fillna("")
    movies["clean_title"] = movies["title"].apply(clean_title)
    movies["content"] = (
        movies["clean_title"]
        + " "
        + movies["genres"].apply(normalize_genres)
        + " "
        + movies["tag_text"]
    )

    user_movie_matrix = train_ratings.pivot(index="movieId", columns="userId", values="rating").fillna(0)
    movies = movies[movies["movieId"].isin(user_movie_matrix.index)].reset_index(drop=True)
    user_movie_matrix = user_movie_matrix.loc[movies["movieId"]]

    sparse_user_movie = csr_matrix(user_movie_matrix.values)
    svd = TruncatedSVD(n_components=SVD_COMPONENTS, random_state=42)
    latent_matrix = svd.fit_transform(sparse_user_movie)

    tfidf = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2),
        sublinear_tf=True,
        max_features=30000,
    )
    content_matrix = tfidf.fit_transform(movies["content"])

    rating_stats = train_ratings.groupby("movieId").agg(
        rating_count=("rating", "count"),
        rating_mean=("rating", "mean"),
    ).reset_index()
    global_mean = float(train_ratings["rating"].mean())
    min_votes = 25
    rating_stats["quality"] = (
        (rating_stats["rating_count"] / (rating_stats["rating_count"] + min_votes)) * rating_stats["rating_mean"]
        + (min_votes / (rating_stats["rating_count"] + min_votes)) * global_mean
    )

    movies = movies.merge(rating_stats[["movieId", "quality"]], on="movieId", how="left")
    movies["quality"] = movies["quality"].fillna(global_mean)
    quality = movies["quality"].to_numpy(dtype=np.float32)
    quality = (quality - quality.min()) / ((quality.max() - quality.min()) or 1.0)

    return movies, latent_matrix, content_matrix, quality


def generate_candidate_recommendations(movies, latent_matrix, content_matrix, quality):
    total = len(movies)
    movie_ids = movies["movieId"].to_numpy()
    recommendations = {candidate["name"]: {} for candidate in CANDIDATES}

    for start in range(0, total, CHUNK_SIZE):
        end = min(start + CHUNK_SIZE, total)
        collab_chunk = cosine_similarity(latent_matrix[start:end], latent_matrix)
        content_chunk = cosine_similarity(content_matrix[start:end], content_matrix)

        for candidate in CANDIDATES:
            scores_chunk = (
                candidate["collab"] * collab_chunk
                + candidate["content"] * content_chunk
                + candidate["quality"] * quality[np.newaxis, :]
            )

            for local_idx, scores in enumerate(scores_chunk):
                idx = start + local_idx
                scores = scores.copy()
                scores[idx] = -np.inf

                candidate_count = min(RECOMMENDATION_COUNT * 3, total - 1)
                candidate_indices = np.argpartition(scores, -candidate_count)[-candidate_count:]
                candidate_indices = candidate_indices[np.argsort(scores[candidate_indices])[::-1]]
                recommendations[candidate["name"]][int(movie_ids[idx])] = [
                    int(movie_ids[candidate_idx])
                    for candidate_idx in candidate_indices[:RECOMMENDATION_COUNT]
                ]

        print(f"Evaluated recommendations for {end}/{total} movies")

    return recommendations


def positive_by_user(ratings):
    positives = defaultdict(set)
    for row in ratings[ratings["rating"] >= POSITIVE_RATING].itertuples():
        positives[int(row.userId)].add(int(row.movieId))
    return positives


def dcg(hits):
    return sum(hit / math.log2(index + 2) for index, hit in enumerate(hits, start=1))


def evaluate_recommendations(recommendations, train_ratings, test_ratings, model_movie_ids):
    train_positives = positive_by_user(train_ratings)
    test_positives = positive_by_user(test_ratings)
    users = sorted(set(train_positives) & set(test_positives))
    model_movie_ids = set(model_movie_ids)

    precision_sum = 0.0
    recall_sum = 0.0
    ndcg_sum = 0.0
    hit_count = 0
    evaluated_users = 0
    recommended_movies = set()

    for user_id in users:
        seeds = train_positives[user_id] & model_movie_ids
        relevant = test_positives[user_id] & model_movie_ids
        if not seeds or not relevant:
            continue

        scores = defaultdict(float)
        for seed in seeds:
            for rank, movie_id in enumerate(recommendations.get(seed, [])):
                if movie_id in seeds:
                    continue
                scores[movie_id] += 1.0 + (1.0 / (rank + 1))

        if not scores:
            continue

        ranked = [movie_id for movie_id, _ in sorted(scores.items(), key=lambda item: (-item[1], item[0]))[:RECOMMENDATION_COUNT]]
        recommended_movies.update(ranked)
        hits = [1 if movie_id in relevant else 0 for movie_id in ranked]
        hit_total = sum(hits)
        ideal_hits = [1] * min(len(relevant), RECOMMENDATION_COUNT)

        precision_sum += hit_total / RECOMMENDATION_COUNT
        recall_sum += hit_total / len(relevant)
        ndcg_sum += dcg(hits) / (dcg(ideal_hits) or 1.0)
        hit_count += 1 if hit_total > 0 else 0
        evaluated_users += 1

    return {
        "users": evaluated_users,
        "precision_at_20": precision_sum / evaluated_users if evaluated_users else 0.0,
        "recall_at_20": recall_sum / evaluated_users if evaluated_users else 0.0,
        "ndcg_at_20": ndcg_sum / evaluated_users if evaluated_users else 0.0,
        "hit_rate_at_20": hit_count / evaluated_users if evaluated_users else 0.0,
        "coverage": len(recommended_movies) / len(model_movie_ids) if model_movie_ids else 0.0,
    }


def main():
    movies, ratings, tags = load_data()
    train_ratings, test_ratings = chronological_holdout(ratings)
    print(f"Train ratings: {len(train_ratings)}")
    print(f"Test ratings: {len(test_ratings)}")

    movies, latent_matrix, content_matrix, quality = build_features(movies, train_ratings, tags)
    candidate_recommendations = generate_candidate_recommendations(movies, latent_matrix, content_matrix, quality)
    model_movie_ids = set(movies["movieId"].astype(int))

    results = []
    for candidate in CANDIDATES:
        metrics = evaluate_recommendations(
            candidate_recommendations[candidate["name"]],
            train_ratings,
            test_ratings,
            model_movie_ids,
        )
        results.append({**candidate, **metrics})

    results = sorted(results, key=lambda item: (item["recall_at_20"], item["ndcg_at_20"], item["hit_rate_at_20"]), reverse=True)

    print("\nModel evaluation ranked by Recall@20:")
    for result in results:
        print(
            f"{result['name']}: "
            f"recall={result['recall_at_20']:.4f}, "
            f"precision={result['precision_at_20']:.4f}, "
            f"ndcg={result['ndcg_at_20']:.4f}, "
            f"hit_rate={result['hit_rate_at_20']:.4f}, "
            f"coverage={result['coverage']:.4f}, "
            f"users={result['users']}"
        )

    best = results[0]
    print(
        "\nBest candidate: "
        f"{best['name']} "
        f"(collab={best['collab']}, content={best['content']}, quality={best['quality']})"
    )


if __name__ == "__main__":
    main()
