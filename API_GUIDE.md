# Movie Data API Integration

This app uses **TMDB** as the primary movie and TV data source. **OMDB** is optional and remains available as an enrichment/fallback helper.

## TMDB Features

**Primary source** for:
- Search movies by title
- Search TV shows and people
- Discover by genre, year, rating, language, runtime, and provider
- Movie and TV details with cast, trailers, reviews, providers, collections, and seasons

## OMDB Features

**Optional source** for:
- Movie search and details fallback
- Movie details with full plot
- IMDb, Rotten Tomatoes, Metacritic ratings
- Awards & nominations
- Box office data
- Director, writer, cast info
- High-quality posters

**Get your free key:** https://www.omdbapi.com/apikey.aspx

## Setup

1. Get a TMDB API key from https://www.themoviedb.org/settings/api
2. Add it to `.env.local`:

```bash
NEXT_PUBLIC_TMDB_API_KEY=your_key_here
```

3. Optionally get an OMDB key from https://www.omdbapi.com/apikey.aspx
4. Add it to `.env.local`:

```bash
NEXT_PUBLIC_OMDB_API_KEY=your_key_here
```

## API Functions

Primary app functions are in `src/api/tmdb.js`. Optional OMDB helper functions are in `src/api/omdb.js`:

### Search Movies
```javascript
import { searchMovies } from './api/omdb';

const results = await searchMovies('Inception', 1);
// Returns: { results, page, total_results, total_pages }
```

### Get Movie Details
```javascript
import { getMovieDetails } from './api/omdb';

const movie = await getMovieDetails('tt1375666'); // IMDb ID
// Returns full movie object with plot, ratings, cast, etc.
```

### Browse Popular Movies
```javascript
import { getPopularMovies } from './api/omdb';

const movies = await getPopularMovies(1);
// Returns curated popular movie results
```

### Discover with Filters
```javascript
import { discoverMovies } from './api/omdb';

const results = await discoverMovies({ 
  page: 1, 
  genreId: 3, // Drama
  year: 2020,
  sortBy: 'popularity.desc' 
});
```

### Get Similar Movies
```javascript
import { getSimilarMovies } from './api/omdb';

const similar = await getSimilarMovies('tt1375666');
// Returns movies with similar genres
```

### Get Genre List
```javascript
import { getGenres } from './api/omdb';

const genres = await getGenres();
// Returns standard genre list for filtering
```

## TasteDive API (TV Shows)

TasteDive provides recommendations for TV shows based on a given show title.

### Setup
- Get your API key: https://tastedive.com/read/api
- Add to `.env.local`:
  ```
  NEXT_PUBLIC_TASTEDIVE_API_KEY=your_key_here
  ```

### Usage Example
```javascript
import { getSimilarTvShows } from './api/tastedive';

const recommendations = await getSimilarTvShows('Breaking Bad', 10);
// Returns array of recommended TV shows with teaser, Wikipedia, and YouTube links
```

### Response Format
```javascript
[
  {
    name: "Better Call Saul",
    type: "show",
    wTeaser: "Spin-off of Breaking Bad...",
    wUrl: "https://en.wikipedia.org/wiki/Better_Call_Saul",
    yID: "xyz123",
    yUrl: "https://youtube.com/watch?v=xyz123"
  },
  // ...more
]
```

## FM-DB API (Optional IMDb Fallback)

FM-DB is used only on movie detail pages when TMDB does not provide a usable
poster or YouTube trailer. It does not require an API key.

```javascript
import { getFmdbMedia, getFmdbPoster } from './api/fmdb';

const posterUrl = getFmdbPoster('tt1375666');
const media = await getFmdbMedia('tt1375666');
// media: { url, youtubeId } or null when FM-DB is unavailable
```

The app obtains the IMDb ID from TMDB's `external_ids` response. No FM-DB
account, key, or environment variable is required. Because this is an
optional third-party service, failures are ignored and the TMDB page remains
usable.

## Response Format

All functions return data in a normalized format compatible with the UI:

```javascript
{
  id: "tt1375666",           // IMDb ID
  title: "Inception",
  overview: "Full plot...",
  poster_path: "https://...", // Full URL
  backdrop_path: "https://...",
  release_date: "16 Jul 2010",
  vote_average: 8.8,          // IMDb rating
  runtime: 148,
  genres: [{ id: 1, name: "Action" }],
  // OMDB extras:
  director: "Christopher Nolan",
  actors: "Leonardo DiCaprio, ...",
  awards: "Won 4 Oscars...",
  imdbRating: "8.8",
  rottenTomatoes: "87%",
  metacritic: "74/100"
}
```

## API Limits

- **Free tier**: 1,000 requests/day
- Rate limiting: Respectful usage recommended
- No poster rate limits (direct CDN URLs)

## Notes

- TMDB returns numeric IDs used by the main app routes
- OMDB returns IMDb IDs as movie identifiers
- All poster/backdrop URLs are full CDN links (no path prefix needed)
- Ratings include IMDb, Rotten Tomatoes, and Metacritic when available
- Genre filtering searches by genre name (client-side filtering applied)
