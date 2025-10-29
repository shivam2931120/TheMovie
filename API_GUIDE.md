# OMDB API Integration

This app uses **OMDB (Open Movie Database)** for comprehensive movie data.

## OMDB Features

**Primary source** for:
- Search movies by title
- Movie details with full plot
- IMDb, Rotten Tomatoes, Metacritic ratings
- Awards & nominations
- Box office data
- Director, writer, cast info
- High-quality posters

**Get your free key:** https://www.omdbapi.com/apikey.aspx

## Setup

1. Visit https://www.omdbapi.com/apikey.aspx
2. Select **FREE tier** (1,000 requests/day)
3. Verify your email
4. Add key to `.env`:

```bash
VITE_OMDB_API_KEY=your_key_here
```

## API Functions

All functions are in `src/api/omdb.js`:

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
- Add to `.env`:
  ```
  VITE_TASTEDIVE_API_KEY=your_key_here
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

- OMDB returns IMDb IDs as movie identifiers
- All poster/backdrop URLs are full CDN links (no path prefix needed)
- Ratings include IMDb, Rotten Tomatoes, and Metacritic when available
- Genre filtering searches by genre name (client-side filtering applied)
