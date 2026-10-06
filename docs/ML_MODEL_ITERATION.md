# Recommendation model iteration

## Product target

Rank unseen movie or TV titles that a user is likely to enjoy, using explicit
ratings, saved titles and bounded viewing activity. Preserve dislikes,
exclusions, variety controls, cold-start content retrieval and explanations.
Ranking scores are not calibrated match probabilities.

## Data readiness observed on 2026-10-06

The existing local PostgreSQL container was stopped. After starting that same
container, `npm run ml:status` reported zero opted-in accounts and no consented
events. The shipped feedback artifact is empty (version 1, no training date).
This is a local database observation, not a production traffic audit. Learning
consent remains disabled by default; no account's consent was changed.

The shipped MovieLens SVD/content graph and live profile ranker still provide
recommendations. An empty application-feedback graph does not imply that the
application has no recommendation model.

## Hypotheses and implementation

1. Fit movie and TV matrices independently. Previously, joint user vectors made
   movie activity affect TV normalization/embeddings even though exported edges
   were restricted to the same media type.
2. Compare two RP3β-style item graphs against the existing four SVD/cosine
   candidates. Popularity penalties (`beta=0.3/0.6`) may improve discovery of
   less popular relevant titles. Binary distinct-user transitions, minimum
   support and shrinkage reduce repeated-viewing influence. Row-max-scaled
   exports are an adaptation for the existing graph combiner.
3. Measure long-tail exposure, mean recommended training-user frequency and
   average returned result count alongside ranking quality and coverage.
4. Require a positive paired-bootstrap NDCG-gain lower bound against both
   comparators in both windows, in addition to the existing minimum cohort
   and ranking-gain gates. Validation intervals after model selection are
   exploratory. The shipped artifact comparator has retrospective provenance.
5. Use unique private candidate outputs. Candidates cannot overwrite the input
   export or write into `src/` through the output argument. Public benchmarks
   cannot be promoted.

Reference: [Christoffel et al., RecSys 2015](https://recsys.acm.org/recsys15/session-4b/).

## Research benchmark

The checked-in public MovieLens Small ratings are adapted into 100,823 events.
They contain movies only. The previous 70/15/15 chronological split is reused
for comparability. Because this holdout has already been inspected, results
are exploratory and cannot establish a fresh independent production gain.
The live TMDB retrieval, user-profile weighting and diversity reranker are not
measured by this offline item-graph benchmark.

No live artifact is replaced unless currently consented application data
supports promotion. The next application experiment needs new consented
observation windows, separate movie/TV cohorts and evaluation of the actual
serving path. Existing predictions remain the fallback.

## Observed result and decision

- Validation-selected candidate: RP3β-style `beta=0.3`, NDCG@20 0.20206
  versus 0.16123 for the previous cosine candidate.
- Reused later window: NDCG@20 0.15975 versus 0.14457 for popularity;
  Recall@20 0.06953 versus 0.06107.
- Paired NDCG-gain 95% interval against popularity: [-0.01858, 0.04751].
- Cohorts: 14 validation users, 30 later-window users; no TV cohort.
- Long-tail fraction: zero for both candidate and popularity under the declared
  bottom-80% catalog definition. Mean recommended training-user frequency is
  119.595 versus 135.023 for popularity; this alone is not diversity evidence.
- Promotion: blocked. The minimum cohort and uncertainty gates fail, and the
  candidate does not beat the retrospective shipped graph. No live model change.

See [aggregate report](../ml/metrics/rp3beta-movielens-benchmark.json).

## Checks and delivery

The complete six-candidate public-data training/evaluation/export command
finished with the pinned dependencies and single-thread BLAS. Python compilation,
ESLint and whitespace checks passed. Software unit tests, browser checks and
production deployment were not run in this model-development pass. Raw events
and the candidate graph stay under ignored `ml/private/`; only aggregate public
benchmark metrics are included for review. The local database container remains
running; no user consent or account data was changed.
