# Taste and viewing improvements

## Taste setup

Open `/taste` from the home prompt or **Shape your recommendations**. Search
movies and TV, choose 5–10 personal ratings, optionally select up to five genres,
and save. The ratings use the existing ratings dashboard and recommendation
profile. They do not create watched history or diary entries. Existing ratings
can be revised; selected ratings are shown across searches and type filters.
Skipping is supported, and the page can be revisited.

## Recommendation feedback

Recommendation cards offer three actions with Undo:

- **Already watched** records watched history and hides the title.
- **Not my taste** hides it and supplies negative taste evidence.
- **Not now** snoozes the title for seven days without a negative signal.

Hidden titles can be restored in recommendation settings. Legacy hidden entries
retain the previous dislike interpretation. Switching away from a dislike or
restoring it emits a neutral cancellation, when shared learning is enabled.
Neither streaming selections nor snoozes are learning events. Shared learning
still requires explicit consent; these features do not turn consent on.

## Streaming preferences

Save a country and up to 30 services in recommendation settings or taste setup.
Changing country clears service selections. Choose All services, Prefer my
services, or Only my services. Without selected services, availability does not
restrict results. Personalized movie/TV retrieval includes available candidates,
and a bounded set of ranked candidates is checked against subscription
availability. Prefer retains the taste ordering within matching/nonmatching
groups; Only returns verified matches and can return few or no results.
Unverified supplemental home rows are omitted in Only mode.

Details pages default to the saved country, allow a temporary country override,
and label selected subscription services. Availability is supplied by JustWatch
through TMDB, includes attribution, and is not guaranteed current or exhaustive.
Rentals and purchases do not count as included subscription access.

Official query reference:
- https://developer.themoviedb.org/reference/discover-movie
- https://developer.themoviedb.org/reference/discover-tv

## TV progress

Library → TV Progress shows the earliest known aired, unwatched regular episode
and offers marking it watched with Undo. Season fetch failures expose Retry
rather than a false caught-up state. Specials are excluded from next-episode
selection. Episode trackers offer a next-episode action, an account-scoped spoiler
setting, and temporary individual reveals. Unwatched titles/summaries are hidden
by default. Future episodes and episodes without an air date cannot be newly
marked watched. Scheduled dates can change; unknown dates remain explicit.

## Diary

Diary entries can be edited and explicitly marked as rewatches, including a
rewatch whose first viewing was never logged. Older entries continue using
chronological history until an explicit choice is saved. First-watch/rewatch
labels and insights share that classification.

Diary and Insights expose editable monthly/yearly goals (1–10,000 viewings).
Goals count diary entries, including rewatches and show-level TV entries; they
are not episode-count or duration goals. Monthly/yearly comparisons include
viewing change, average rating change and leading genre. Empty prior periods do
not produce an invalid percentage. Calendar comparisons may include an
incomplete current period. Private notes remain excluded from learning and recap
downloads.

## Persistence and delivery

New settings extend `recommendationPreferences`, rewatches extend `watchDiary`,
and goals use existing `watchGoals` JSON documents. No database schema migration
is needed. Existing revision/conflict handling and device recovery remain in use.
Authenticated production saves and real provider/episode availability require
confirmation with a signed-in session; static checks do not establish those
runtime outcomes. No replacement shared feedback model was trained or promoted.
