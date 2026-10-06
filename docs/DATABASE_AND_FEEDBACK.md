# Database storage and consented learning

## Configure

Set server-only `DATABASE_URL` to your PostgreSQL provider's pooled connection URL
and TLS settings. Do not disable certificate verification. Keep Clerk publishable
and server keys configured; ownership comes exclusively from the authenticated
session. Apply schema before serving account routes:

```sh
npm run db:migrate
```

For local development only:

```sh
docker compose up -d db
```

Use `postgresql://themovie:local-development-only@127.0.0.1:54329/themovie`
as the local `DATABASE_URL`. Never use these development credentials in production.
The named Docker volume persists data across container restarts.

Configure a Clerk webhook for `user.deleted` at `/api/webhooks/clerk` and set its
server-only `CLERK_WEBHOOK_SIGNING_SECRET`. Verified deletions remove account
features, learning events and rate counters transactionally. A minimal owner-ID
tombstone prevents in-flight legacy imports from recreating deleted records.
Configure provider retries and verify delivery before production account deletion.
As with consent revocation, copied exports and previously trained artifacts require
separate cleanup/retraining.

## Migration and saves

`account_features` stores owner-scoped JSONB documents for watchlists, watched
items, ratings, lists, recent titles, episode progress, diary, recommendation
settings, profile preferences, goals, and existing local social data.

The first authenticated read imports that feature from the same owner's legacy
Clerk metadata with an insert-if-absent operation. Existing database rows always
win. Clerk metadata stays intact as a rollback copy; new writes use PostgreSQL.
Guest/legacy device storage merges into the account and is removed only after a
successful database save. Pending device snapshots retain edits/deletions across
reloads and are scoped by account. Cross-device stale revisions return 409.
The sync notice lets the user use the account copy or deliberately replace it
with their device copy. Saves retry on edits, reconnection, or the Retry action.
Failed database saves do not silently write back to bounded Clerk metadata.
Public shared lists read current database state, so revocation takes effect when
the database save succeeds. Publishing/revoking waits for sync before success.

Snapshots are bounded to 2 MiB per request. They remove Clerk's 7 KiB shared
metadata ceiling, but very large libraries should eventually use normalized
item/entry tables and paginated operations. Revisions detect conflicts; they do
not merge conflicting edits from two devices automatically.

## Learning consent and deletion

Learning is disabled by default and cannot be enabled by importing guest data.
In "Shape your recommendations", signed-in users can opt in, turn learning off,
or delete learning history. Turning consent off deletes their stored events in
the same transaction. Personal taste ranking still uses private account data
without opting into shared-model training.

Committed account mutations derive rating, watch/rewatch, watchlist, dismissal,
and episode events. Recommendation cards record impressions after at least 60%
visibility for one second, and clicks when a details link is used. Event IDs make
replayed requests idempotent. Feedback ingestion checks server-side consent,
owner identity, origin, event shape, batch size and a per-account minute limit.
Diary notes, biography, email, and usernames are excluded. Client impression
logging is best effort and ignores hidden tabs; exposure should still be assessed
before using these events as an unbiased engagement metric.

Set a private stable random `ML_EXPORT_SECRET`, then export:

```sh
npm run ml:export -- ml/private/events.jsonl
python3 -m venv /tmp/themovie-ml-venv
/tmp/themovie-ml-venv/bin/pip install -r ml/requirements.txt
/tmp/themovie-ml-venv/bin/python ml/train_feedback.py ml/private/events.jsonl
# Only if the measured promotion gates pass:
/tmp/themovie-ml-venv/bin/python ml/train_feedback.py ml/private/events.jsonl --promote
```

Exports are owner-pseudonymized HMAC JSONL with private file permissions and no
profile/diary text. The `ml/private/` directory is ignored by Git. Pseudonymous
exports remain personal data. Remove stale exports/candidates after consent
revocation; deletion from the database cannot erase already copied exports or
remove an individual's contribution from previously trained model artifacts.
Regenerate models from currently consented data before a later release.

Use `npm run ml:status` first to inspect aggregate consented feedback counts and
model readiness without exporting account identifiers.

The trainer compares seeded SVD (32/64 dimensions, with/without inverse-frequency
weighting), sparse item cosine and two popularity-adjusted RP3β-style graph
candidates. Movie and TV matrices are fitted independently. Each media type selects its configuration on
validation. Repeated behavior is capped per title/kind/day, episode counts are
bounded, and explicit ratings and dismissals have separate state. Restoring a
hidden title cancels that dismissal in subsequent exports. Missing interactions and impressions are never
assumed to be dislikes. Movie and TV identities stay separate even when numeric
TMDB IDs coincide. Global chronological training/validation/test windows with
later-window timestamp ties exclude future events. Promotion requires at least
50 eligible users per media type in both validation and test, with three prior
positive titles of that type, and NDCG@20 at least 0.005 higher than both popularity
and the shipped graph in both windows, with a positive lower bound for each
paired 95% bootstrap NDCG-gain interval. Weighted similarities retain their scores
and co-user support, require two shared users, and shrink weak support toward zero.
Reports record input SHA-256, library versions, configuration choices, coverage,
precision, recall, hit rate, and explicit reasons for blocked promotion. This benchmarks offline
graphs; it does not prove gains over the full live movie ranker or TMDB TV
retrieval. Record online metrics and evaluate those separately before an
accuracy claim. No new feedback model is promoted without real feedback. Candidate output files
are immutable and default to timestamped private paths; `--output` cannot write
inside `src/` or overwrite the input export.

Runtime movie ranking blends the MovieLens, approved feedback, and fresh TMDB
candidate graphs. Fresh seed metadata and discover candidates include titles
missing from MovieLens. Both media use smoothed rating quality. TV ranking retrieves
bounded TMDB candidates, incorporates TV ratings/diary/saved
shows/episode history, and applies the same dislikes and variety controls. It can
use a promoted TV feedback graph; otherwise it works from TMDB/content similarity.

## Release checks requiring configured services

- Migrate a staging database, sign in as two accounts, and confirm isolated reads.
- Import a legacy account and guest history; refresh and check saved deletions.
- Edit the same feature from two devices and resolve the conflict explicitly.
- Confirm public list access disappears after revocation has synced.
- Toggle learning, inspect events, delete history, and confirm consent-off writes
  produce no learning events.
- Review mobile widths (320, 390, 768), keyboard navigation, dialog focus/Escape,
  reduced motion, touch actions, and zoom reflow with the actual authenticated app.
