# Frontend release checks — 2026-10-06

## Changes

- Compact hero with pause, focus/hover suspension, and reduced-motion support.
- Five mobile navigation destinations and a Library for saved titles, watched
  history, lists, diary, and TV episode progress.
- Shared native trailer dialog with focus wrapping, Escape dismissal, and
  restoration to its trigger.
- Cancelled stale search requests and loading, empty, error, and retry states.
- Touch card menus, saved/watched badges, and account-scoped Undo notices.
- Independent catalogue sections with isolated loading and retry controls.
- Brighter muted text, contrasting filled buttons, and labelled region selectors.
- Direct, sized TMDB artwork. The previous deployed optimizer returned HTTP 402
  `OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED`, while the source image returned 200.

## Completed checks

- ESLint, TypeScript, and production build.
- Chromium homepage at 375, 768, and 1440 pixels; no horizontal overflow.
- Mobile Library, Lists, Diary, movie details, and TV details; no horizontal overflow.
- Axe WCAG A/AA checks on those eight page/viewport combinations: no reported
  violations after the contrast and label fixes. No page JavaScript exceptions.
- Search results, modal focus, and Escape dismissal.
- Trailer focus containment, Escape dismissal, and focus restoration.
- Deliberately failed catalogue request: other rows stayed usable; retry recovered
  without reloading the page.
- Watchlist and watched actions followed by Undo restored their prior state using
  a disposable Clerk development account. The test account was deleted afterward.
- Touch card action menu and saved state with synthetic guest data.

Browser scripts, synthetic data, and screenshots were kept outside the repository.

## Boundaries

Visual regression comparison is inconclusive because no committed screenshot
baseline exists. Screenshot inspection and automated axe results are not a full
screen-reader or cross-browser accessibility assessment. Core Web Vitals were not
measured. Authenticated UI checks do not establish production database durability;
hosted PostgreSQL, live Clerk credentials, and a production deletion webhook still
need configuration. Local image optimizer timeouts were also observed before
switching to the source images.
