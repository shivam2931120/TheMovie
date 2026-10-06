"""Regression checks for temporal leakage, ranking metrics and sparse inputs."""
import math
from pathlib import Path
import sys
import unittest

import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from evaluate_model import chronological_holdout, dcg, evaluate_recommendations, tags_before
from train_model import build_rating_matrix


class EvaluationTests(unittest.TestCase):
    def test_holdout_keeps_all_future_events_and_timestamp_ties_out_of_training(self):
        ratings = pd.DataFrame({"userId": [1, 1, 2, 1, 2], "movieId": [1, 2, 1, 3, 4], "rating": [5, 4, 5, 1, 5], "timestamp": [1, 2, 3, 4, 4]})
        train, test = chronological_holdout(ratings, 0.25)
        self.assertLess(train.timestamp.max(), test.timestamp.min())
        self.assertEqual(set(test.movieId), {3, 4})
        self.assertIn(1, set(test.rating))  # Future dislikes must not train the model.
        self.assertEqual(len(train) + len(test), len(ratings))

    def test_tags_use_the_same_training_cutoff(self):
        train = pd.DataFrame({"timestamp": [1, 3]})
        tags = pd.DataFrame({"timestamp": [1, 3, 4], "tag": ["past", "boundary", "future"]})
        self.assertEqual(tags_before(tags, train).tag.tolist(), ["past", "boundary"])

    def test_first_dcg_position_has_no_discount(self):
        self.assertEqual(dcg([1]), 1)
        self.assertAlmostEqual(dcg([1, 1]), 1 + 1 / math.log2(3))
        self.assertEqual(dcg([]), 0)

    def test_seen_dislikes_are_excluded_and_unservable_positives_count_in_recall(self):
        train = pd.DataFrame({"userId": [1] * 4, "movieId": [1, 2, 3, 4], "rating": [5, 5, 4, 1]})
        test = pd.DataFrame({"userId": [1, 1], "movieId": [5, 6], "rating": [5, 5]})
        metrics = evaluate_recommendations({1: [4, 5], 2: [4, 5], 3: [4, 5]}, train, test, {1, 2, 3, 4, 5})
        self.assertEqual(metrics["users"], 1)
        self.assertEqual(metrics["recall_at_20"], 0.5)
        self.assertEqual(metrics["test_positive_catalog_fraction"], 0.5)
        self.assertAlmostEqual(metrics["ndcg_at_20"], 1 / (1 + 1 / math.log2(3)))

    def test_zero_recommendations_are_not_dropped_from_metrics(self):
        train = pd.DataFrame({"userId": [1] * 3, "movieId": [1, 2, 3], "rating": [5, 5, 4]})
        test = pd.DataFrame({"userId": [1], "movieId": [4], "rating": [5]})
        metrics = evaluate_recommendations({}, train, test, {1, 2, 3, 4})
        self.assertEqual(metrics["users"], 1)
        self.assertEqual(metrics["recall_at_20"], 0)

    def test_normalization_preserves_missing_zeros_and_finite_constant_users(self):
        ratings = pd.DataFrame({"userId": [1, 1, 2, 2], "movieId": [10, 20, 10, 30], "rating": [5, 1, 3, 3]})
        raw = build_rating_matrix(ratings, [10, 20, 30]).toarray()
        centered = build_rating_matrix(ratings, [10, 20, 30], "user_centered").toarray()
        np.testing.assert_array_equal(raw, [[5, 3], [1, 0], [0, 3]])
        self.assertGreater(centered[0, 0], 0)
        self.assertLess(centered[1, 0], 0)
        self.assertEqual(centered[1, 1], 0)
        self.assertTrue(np.isfinite(centered).all())
        np.testing.assert_array_equal(centered[:, 1], [0, 0, 0])


if __name__ == "__main__":
    unittest.main()
