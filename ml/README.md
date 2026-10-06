# Recommendation model and evaluation

The shipped recommendation graph combines MovieLens user-rating SVD item
similarity, title/genre/tag TF-IDF similarity, and Bayesian rating quality.
It is an offline movie-to-movie model. The application's live personalization
layer combines those neighbors with the current user's feedback; the graph
itself does not retrain when someone watches or rates a title. MovieLens has no
TV interaction data.

## Reproduce the experiment

Run from the repository root with the checked-in MovieLens Small CSV files:

```bash
python3 -m venv /tmp/themovie-ml-venv
/tmp/themovie-ml-venv/bin/pip install -r ml/requirements.txt
OPENBLAS_NUM_THREADS=1 OMP_NUM_THREADS=1 /tmp/themovie-ml-venv/bin/python -m unittest discover -s ml/tests -v
OPENBLAS_NUM_THREADS=1 OMP_NUM_THREADS=1 /tmp/themovie-ml-venv/bin/python ml/evaluate_model.py
```

Evaluation writes `ml/metrics/temporal-evaluation.json`. It neither downloads
data nor modifies the application's recommendation artifacts. The report
records dataset SHA-256 hashes, library versions, cutoffs, cohort sizes, all
validation candidates, and final test results. The random seed is 42.

## Corrected protocol

Ratings are separated by global timestamps into approximately 70% training,
15% validation, and 15% test events. Timestamp ties stay in the later window.
All future events, including negative ratings, are withheld. Tags use the same
training cutoff. Features, Bayesian quality, and SVD are fitted from training
only; the selected configuration is refitted on training plus validation before
test evaluation. The latest test window is not used to select hyperparameters.

Recommendations exclude every previously rated item, including disliked items.
Users need three prior positive ratings (at least 4/5) and a future positive
rating. Zero-result users remain in averages. Unservable test positives remain
in the recall denominator; the report separately measures their catalog
coverage. DCG discounts rank one by log2(2), as required. Old evaluation numbers
with future rating/tag leakage, positive-only exclusion, or the prior DCG
formula are not comparable to this report.

## Measured result

The experiment compares the existing raw-rating SVD with user-centered,
standard-deviation-scaled observed ratings and a second hybrid weight setting.
Missing ratings remain sparse zeros; constant-rating users produce finite
vectors using a variance floor.

| Validation candidate | NDCG@20 | Recall@20 |
| --- | ---: | ---: |
| Raw SVD, 68% collaborative / 32% content | 0.15577 | 0.08531 |
| Raw SVD, 60% / 40% | 0.15530 | 0.08486 |
| Centered/scaled SVD, 68% / 32% | 0.12007 | 0.07490 |
| Centered/scaled SVD, 60% / 40% | 0.13343 | 0.07867 |

The raw baseline wins validation. Its untouched test NDCG@20 is **0.09228**,
Recall@20 **0.04106**, Precision@20 **0.085**, and hit rate **0.50**. Only 14
validation and 30 test users qualify across these global windows; this is a
small returning-user cohort, not evidence of general production performance.
The tested normalization does **not** establish an improvement, so training
keeps `RATING_NORMALIZATION = "raw"` and shipped JSON artifacts stay unchanged.

## Improving it further

The next useful model work is gathering consented application feedback for
both movies and TV, and measuring the live feedback ranker on a held-out event
stream. Watching, rewatching, rating, explicit dismissals, and impressions have
different meanings: an unwatched title is not automatically a dislike.
Evaluate ranking quality alongside catalog coverage, variety, and repeated
recommendations. Keep cold-start content recommendations for titles without
collaborative interactions, and compare candidates against a popularity
baseline and the existing graph before changing shipped weights.

`train_model.py` supports the normalized candidate through
`build_rating_matrix(..., normalization="user_centered")` for future
experiments. Changing `RATING_NORMALIZATION` and running training exports
`src/data/recommendations.json` and the search index; do that only after a
measured improvement, since it replaces the deployed graph.

## Application feedback and TV learning

The application now collects opt-in events in PostgreSQL and supports separate
movie/TV neighbor learning with `train_feedback.py`. See
[database and feedback setup](../docs/DATABASE_AND_FEEDBACK.md) for export,
chronological evaluation, promotion gates, and privacy boundaries. The checked-in
feedback artifact is empty until real data supports promotion; no application
accuracy improvement is asserted from the new training code alone.

### Weighted feedback pipeline

`npm run ml:status` prints aggregate feedback counts, consent readiness and the
currently deployed feedback artifact. Training requires at least 200 valid events,
three positive history titles per media type, and 50 eligible users of that type
in both chronological evaluation windows. Those are minimum gates, not a promise
that the data is sufficient to learn useful taste patterns.

The trainer compares four candidates: SVD with 32 components, SVD with 32 or 64
components and inverse-frequency weights, and item cosine with inverse-frequency
weights. Movie and TV configurations are chosen independently on validation.
Repeated behavioral events are capped per title/kind/day. Episode counts have
bounded influence. Explicit ratings and dismissals are tracked separately;
restoring a hidden title cancels the dismissal, and deleting a standalone rating
cancels its explicit signal. Neither action automatically declares a new like.

Similarities require two shared users and are shrunk by `support/(support+5)`.
Version 2 feedback artifacts retain `{id, score, support}` neighbors instead of
discarding learned similarity magnitudes. The runtime supports legacy ID arrays,
blends the approved graph with other sources, applies negative taste penalties,
and reranks for genre variety. Scores are ranking values, not match probabilities.
Movie and TV retrieval incorporate fresh TMDB candidates; seed metadata covers
titles absent from the historical movie model. Rating quality is smoothed toward
a common prior so a single high vote does not dominate discovery.

Candidate reports record input SHA-256, dependency versions, selected settings,
NDCG, recall, precision, hit rate, catalog coverage, and blocked promotion reasons.
Promotion requires a minimum NDCG gain of 0.005 over both comparison graphs in
both windows. The shipped graph is a retrospective comparator with unverified
historical training provenance; it must not be presented as a leakage-free
MovieLens baseline. The live TMDB pipeline requires its own online evaluation.

### Public-data benchmark, 2026-10-06

The public dataset can exercise the new trainer without collecting app activity:

```sh
/tmp/themovie-ml-venv/bin/python ml/prepare_movielens_feedback.py
OPENBLAS_NUM_THREADS=1 OMP_NUM_THREADS=1 /tmp/themovie-ml-venv/bin/python \
  ml/train_feedback.py ml/private/movielens-benchmark.jsonl \
  --output ml/private/movielens-benchmark-candidate.json
```

The preparation command creates a new file and refuses to overwrite one.
Benchmark events are explicitly marked and cannot be promoted with `--promote`.
The run used 100,823 public ratings linked to TMDB and discarded no invalid events.
Only 14 validation and 30 held-out users qualify, with no TV feedback.

| Candidate | Validation NDCG@20 |
| --- | ---: |
| SVD 32 | 0.14814 |
| SVD 32, inverse frequency | 0.15207 |
| SVD 64, inverse frequency | 0.14352 |
| Item cosine, inverse frequency | 0.16123 |

The validation-selected item cosine scored **0.13052** held-out NDCG@20 versus
**0.14457** for popularity. It does not justify promotion. The feedback artifact
remains unchanged. These results are not directly comparable with the earlier
MovieLens hybrid experiment above, which uses different targets and scoring.
Full aggregate results and limitations are in
[feedback-movielens-benchmark.json](metrics/feedback-movielens-benchmark.json).

Sources: [TruncatedSVD](https://scikit-learn.org/stable/modules/generated/sklearn.decomposition.TruncatedSVD.html),
[TMDB discovery](https://developer.themoviedb.org/reference/discover-movie).
