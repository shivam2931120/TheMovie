"""Leakage-resistant temporal evaluation of the exported item-neighbor model.

Run from the repository root: python ml/evaluate_model.py
Hyperparameters are selected on validation; only the selected model is compared
with the original raw-rating baseline on the later, untouched test window.
"""
import argparse
import hashlib
import json
import math
import platform
from collections import defaultdict
from pathlib import Path

import numpy as np
import pandas as pd
import scipy
import sklearn
from sklearn.decomposition import TruncatedSVD
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from train_model import (
    CHUNK_SIZE, COLLAB_WEIGHT, CONTENT_WEIGHT, QUALITY_WEIGHT,
    RECOMMENDATION_COUNT, SVD_COMPONENTS, build_rating_matrix,
    clean_title, normalize_genres,
)

POSITIVE_RATING = 4.0
TEST_FRACTION = 0.2
MIN_POSITIVES_PER_USER = 3
CANDIDATES = [
    {"name": "raw_baseline", "normalization": "raw", "collab": COLLAB_WEIGHT, "content": CONTENT_WEIGHT, "quality": QUALITY_WEIGHT},
    {"name": "raw_60_40", "normalization": "raw", "collab": 0.60, "content": 0.40, "quality": 0.04},
    {"name": "centered_68_32", "normalization": "user_centered", "collab": 0.68, "content": 0.32, "quality": 0.04},
    {"name": "centered_60_40", "normalization": "user_centered", "collab": 0.60, "content": 0.40, "quality": 0.04},
]


def load_data():
    directory = Path("ml/data/ml-latest-small")
    return tuple(pd.read_csv(directory / f"{name}.csv") for name in ("movies", "ratings", "tags"))


def chronological_holdout(ratings, test_fraction=TEST_FRACTION):
    """Global timestamp cutoff removes *all* future ratings, including dislikes.

    Equal-time events stay together; another user's later activity cannot leak
    into an earlier user's evaluation, as it can with per-user latest positives.
    """
    if not 0 < test_fraction < 1 or ratings.empty:
        raise ValueError("A nonempty dataset and a fraction between 0 and 1 are required")
    cutoff = ratings["timestamp"].quantile(1 - test_fraction, interpolation="nearest")
    return ratings[ratings["timestamp"] < cutoff].copy(), ratings[ratings["timestamp"] >= cutoff].copy()


def tags_before(tags, train_ratings):
    return tags[tags["timestamp"] <= train_ratings["timestamp"].max()].copy()


def build_features(movies, train_ratings, tags, normalization="raw"):
    tags = tags_before(tags, train_ratings)
    tag_text = tags.groupby("movieId")["tag"].apply(lambda values: " ".join(map(str, values))).reset_index(name="tag_text")
    movies = movies.merge(tag_text, on="movieId", how="left")
    movies["content"] = movies["title"].apply(clean_title) + " " + movies["genres"].apply(normalize_genres) + " " + movies["tag_text"].fillna("")
    movies = movies[movies["movieId"].isin(train_ratings["movieId"])].sort_values("movieId").reset_index(drop=True)
    sparse_ratings = build_rating_matrix(train_ratings, movies["movieId"], normalization)
    components = min(SVD_COMPONENTS, sparse_ratings.shape[1] - 1, sparse_ratings.shape[0] - 1)
    if components < 1:
        raise ValueError("At least two users and two rated movies are required")
    latent = TruncatedSVD(n_components=components, random_state=42).fit_transform(sparse_ratings)
    content = TfidfVectorizer(stop_words="english", ngram_range=(1, 2), sublinear_tf=True, max_features=30000).fit_transform(movies["content"])
    stats = train_ratings.groupby("movieId")["rating"].agg(["count", "mean"])
    global_mean = float(train_ratings["rating"].mean())
    quality = ((stats["count"] * stats["mean"] + 25 * global_mean) / (stats["count"] + 25)).reindex(movies["movieId"]).to_numpy(dtype=np.float32)
    quality = (quality - quality.min()) / (np.ptp(quality) or 1.0)
    return movies, latent, content, quality


def generate_candidate_recommendations(movies, latent_matrix, content_matrix, quality, candidates=None):
    candidates = candidates or CANDIDATES
    total = len(movies)
    movie_ids = movies["movieId"].to_numpy()
    recommendations = {candidate["name"]: {} for candidate in candidates}
    for start in range(0, total, CHUNK_SIZE):
        end = min(start + CHUNK_SIZE, total)
        collab_chunk = cosine_similarity(latent_matrix[start:end], latent_matrix)
        content_chunk = cosine_similarity(content_matrix[start:end], content_matrix)
        for candidate in candidates:
            scores_chunk = candidate["collab"] * collab_chunk + candidate["content"] * content_chunk + candidate["quality"] * quality[np.newaxis, :]
            for local_idx, scores in enumerate(scores_chunk):
                idx = start + local_idx
                scores[idx] = -np.inf
                count = min(RECOMMENDATION_COUNT, total - 1)
                indices = np.argpartition(scores, -count)[-count:]
                # Stable ID tie-breaking makes repeated runs deterministic.
                indices = sorted(indices, key=lambda i: (-float(scores[i]), int(movie_ids[i])))
                recommendations[candidate["name"]][int(movie_ids[idx])] = [int(movie_ids[i]) for i in indices]
        print(f"Generated {end}/{total} movie neighbors", flush=True)
    return recommendations


def positive_by_user(ratings):
    positives = defaultdict(set)
    for row in ratings[ratings["rating"] >= POSITIVE_RATING].itertuples():
        positives[int(row.userId)].add(int(row.movieId))
    return positives


def dcg(hits):
    return sum(hit / math.log2(index + 2) for index, hit in enumerate(hits))


def evaluate_recommendations(recommendations, train_ratings, test_ratings, model_movie_ids, return_per_user=False):
    train_positive = positive_by_user(train_ratings)
    test_positive = positive_by_user(test_ratings)
    seen = train_ratings.groupby("userId")["movieId"].apply(set).to_dict()
    model_movie_ids = set(model_movie_ids)
    per_user = []
    recommended_movies = set()
    positive_count = covered_positive_count = 0
    for user in sorted(set(train_positive) & set(test_positive)):
        seeds = train_positive[user] & model_movie_ids
        relevant = test_positive[user]  # Unservable positives remain in the recall denominator.
        if len(seeds) < MIN_POSITIVES_PER_USER:
            continue
        scores = defaultdict(float)
        for seed in sorted(seeds):
            for rank, movie_id in enumerate(recommendations.get(seed, [])):
                if movie_id not in seen[user]:
                    scores[movie_id] += 1 + 1 / (rank + 1)
        ranked = [movie for movie, _ in sorted(scores.items(), key=lambda entry: (-entry[1], entry[0]))[:RECOMMENDATION_COUNT]]
        recommended_movies.update(ranked)
        hits = [int(movie in relevant) for movie in ranked]
        hit_count = sum(hits)
        per_user.append({
            "user": int(user), "precision": hit_count / RECOMMENDATION_COUNT,
            "recall": hit_count / len(relevant),
            "ndcg": dcg(hits) / dcg([1] * min(len(relevant), RECOMMENDATION_COUNT)),
            "hit": int(hit_count > 0),
        })
        positive_count += len(relevant)
        covered_positive_count += len(relevant & model_movie_ids)
    def mean(key):
        return float(np.mean([row[key] for row in per_user])) if per_user else 0.0
    metrics = {
        "users": len(per_user), "precision_at_20": mean("precision"),
        "recall_at_20": mean("recall"), "ndcg_at_20": mean("ndcg"),
        "hit_rate_at_20": mean("hit"),
        "coverage": len(recommended_movies) / len(model_movie_ids) if model_movie_ids else 0.0,
        "test_positive_catalog_fraction": covered_positive_count / positive_count if positive_count else 0.0,
    }
    return (metrics, per_user) if return_per_user else metrics


def evaluate_candidates(movies, train, test, tags, candidates):
    results = []
    users_by_model = {}
    for normalization in sorted({candidate["normalization"] for candidate in candidates}):
        group = [candidate for candidate in candidates if candidate["normalization"] == normalization]
        print(f"Fitting {normalization}: {len(train)} training ratings", flush=True)
        catalog, latent, content, quality = build_features(movies, train, tags, normalization)
        neighbors = generate_candidate_recommendations(catalog, latent, content, quality, group)
        for candidate in group:
            metrics, per_user = evaluate_recommendations(neighbors[candidate["name"]], train, test, catalog["movieId"], True)
            results.append({**candidate, **metrics})
            users_by_model[candidate["name"]] = per_user
    return results, users_by_model


def paired_bootstrap(baseline, candidate, samples=2000):
    baseline = {row["user"]: row for row in baseline}
    candidate = {row["user"]: row for row in candidate}
    users = sorted(set(baseline) & set(candidate))
    if not users:
        return {"users": 0}
    differences = np.array([candidate[u]["ndcg"] - baseline[u]["ndcg"] for u in users])
    rng = np.random.default_rng(42)
    means = differences[rng.integers(0, len(users), size=(samples, len(users)))].mean(axis=1)
    return {"users": len(users), "ndcg_mean_difference": float(differences.mean()), "ndcg_difference_95pct_ci": np.quantile(means, [0.025, 0.975]).tolist(), "samples": samples}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--report", default="ml/metrics/temporal-evaluation.json")
    args = parser.parse_args()
    movies, ratings, tags = load_data()
    development, test = chronological_holdout(ratings, 0.15)
    train, validation = chronological_holdout(development, 0.15 / 0.85)
    validation_results, _ = evaluate_candidates(movies, train, validation, tags, CANDIDATES)
    selected = max(validation_results, key=lambda result: (result["ndcg_at_20"], result["recall_at_20"]))
    selected_config = next(candidate for candidate in CANDIDATES if candidate["name"] == selected["name"])
    final_candidates = [CANDIDATES[0]] + ([selected_config] if selected_config["name"] != CANDIDATES[0]["name"] else [])
    test_results, per_user = evaluate_candidates(movies, development, test, tags, final_candidates)
    comparison = paired_bootstrap(per_user["raw_baseline"], per_user[selected["name"]])
    confidence_lower = comparison.get("ndcg_difference_95pct_ci", [0])[0]
    report = {
        "protocol": "Global temporal 70/15/15 split; tune on validation NDCG@20; compare selected model on untouched test; all rated items excluded; all positive test items included in recall.",
        "positive_threshold": POSITIVE_RATING, "min_training_positives": MIN_POSITIVES_PER_USER,
        "seed": 42, "svd_components": SVD_COMPONENTS, "recommendation_count": RECOMMENDATION_COUNT,
        "split": {"train_ratings": len(train), "validation_ratings": len(validation), "test_ratings": len(test), "validation_start_timestamp": int(validation.timestamp.min()), "test_start_timestamp": int(test.timestamp.min()), "train_tags": len(tags_before(tags, train)), "development_tags": len(tags_before(tags, development))},
        "environment": {"python": platform.python_version(), "numpy": np.__version__, "pandas": pd.__version__, "scipy": scipy.__version__, "sklearn": sklearn.__version__},
        "data_sha256": {name: hashlib.sha256(Path(f"ml/data/ml-latest-small/{name}.csv").read_bytes()).hexdigest() for name in ("movies", "ratings", "tags")},
        "validation_results": validation_results, "selected_on_validation": selected["name"],
        "test_results": test_results, "paired_bootstrap": comparison,
        "deployment_recommended": selected["name"] != "raw_baseline" and confidence_lower > 0,
        "limitations": ["MovieLens Small is historical movie-only data, not this app's users or TV viewing.", "Only users with three prior positive ratings and at least one future positive rating are evaluated.", "Unseen catalog items lack collaborative neighbors; content cold-start coverage is not measured.", "Per-user bootstrap uncertainty does not measure repeated time splits or production behavior.", "Item-neighbor evaluation uses rank-voting seeds; production personalized feedback weights require their own evaluation."],
    }
    target = Path(args.report)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({"selected": selected["name"], "test": test_results, "comparison": comparison, "deployment_recommended": report["deployment_recommended"]}, indent=2))
    print(f"Report: {target}")


if __name__ == "__main__":
    main()
