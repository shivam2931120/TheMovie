# Release calendar and diary insights

## Release calendar — `/calendar`

- Browse regional movie releases by month and release type, with explicit pagination. TMDB discovery identifies candidates; movie details supply the actual matching regional release dates. A title may have several release events.
- My releases includes watchlist movies, watchlist TV shows and shows with episode progress. TV dates come from episode air dates; they are independent of the movie country filter. Episode titles and plots are omitted to avoid spoilers.
- Desktop month grid filters the agenda by day; mobile uses the agenda. Month controls, filters and links work with a keyboard.
- Export downloads loaded events as an all-day iCalendar snapshot. IDs remain stable, text is escaped and lines are folded by UTF-8 byte length. Export does not create a subscribed calendar or reminders.
- Requests are cancellable, stale responses ignored, failures reported with retry, and missing/changed dates explained. Title fetches use bounded workers. Account changes reset the personal view through the existing account owner boundary.
- Coverage is limited to TMDB data. Browse is a movie calendar, not a complete global episode index. Digital releases are not guaranteed subscription-platform premieres. TV has original date information, not guaranteed local air times.

## Diary insights — `/diary/insights`

- Month, year and all-time periods; viewing counts, first watches, rewatches, personal rating average, movie/TV split and previous-period count comparisons.
- Full labelled year of monthly activity, monthly daily activity, genre counts, rating distribution, highest personally rated and most revisited titles.
- Rewatch classification uses complete diary history. Titles are keyed by media type and ID. Ratings of zero are unrated. Multi-genre titles contribute to each genre; missing metadata coverage is shown.
- Duration includes only positive known movie runtimes. TV diary entries are show-level records, so no episode-duration inference is made. The existing diary time counter now follows the same movie-only interpretation.
- Recap is a user-initiated text download containing summary statistics and top titles, never private notes. Insights require no external analytics or new persisted account fields.

## Delivery boundary

These features use existing account contexts and TMDB configuration. No schema migration, scheduled job or notification provider is required. Existing hosted account sync prerequisites still apply. Local static checks are separate from browser interaction QA and production deployment.

## Checks for this implementation

- ESLint: passed with no warnings.
- TypeScript: passed; final production build also completed its TypeScript phase.
- Production build: passed, including `/calendar` and `/diary/insights`.
- Whitespace diff check: passed.
- Automated tests and browser interaction QA were not run in this implementation turn. Changes are local and have not been committed, pushed or deployed.
