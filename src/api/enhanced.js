import * as tmdb from "./tmdb";
import { searchMovies as omdbSearch, getMovieDetails as omdbDetails, getGenres as omdbGenres } from "./omdb";
import { getSimilarTvShows } from "./tastedive";

// Check if an API key is available

const hasTmdbKey = () => {
  const key = import.meta.env.VITE_TMDB_API_KEY;
  return key && typeof key === "string" && key.trim().length > 0;
};

const hasOmdbKey = () => {
  const key = import.meta.env.VITE_OMDB_API_KEY;
  return key && typeof key === "string" && key.trim().length > 0;
};

// Demo/Sample movies for when no API keys are available
const DEMO_MOVIES = [
  { id: 1, title: "The Dark Knight", poster_path: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg", backdrop_path: "https://image.tmdb.org/t/p/original/hkBaDkMWbLaf8B1lsWsKX7Ew3Xq.jpg", vote_average: 9.0, release_date: "2008-07-18", overview: "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.", genres: [{ id: 28, name: "Action" }, { id: 80, name: "Crime" }, { id: 18, name: "Drama" }] },
  { id: 2, title: "Inception", poster_path: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg", backdrop_path: "https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg", vote_average: 8.4, release_date: "2010-07-16", overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.", genres: [{ id: 28, name: "Action" }, { id: 878, name: "Science Fiction" }, { id: 12, name: "Adventure" }] },
  { id: 3, title: "Interstellar", poster_path: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", backdrop_path: "https://image.tmdb.org/t/p/original/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg", vote_average: 8.6, release_date: "2014-11-07", overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.", genres: [{ id: 12, name: "Adventure" }, { id: 18, name: "Drama" }, { id: 878, name: "Science Fiction" }] },
  { id: 4, title: "The Matrix", poster_path: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg", backdrop_path: "https://image.tmdb.org/t/p/original/fNG7i7RqMErkcqhohV2a6cV1Ehy.jpg", vote_average: 8.7, release_date: "1999-03-31", overview: "A computer hacker learns about the true nature of reality and his role in the war against its controllers.", genres: [{ id: 28, name: "Action" }, { id: 878, name: "Science Fiction" }] },
  { id: 5, title: "Pulp Fiction", poster_path: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg", backdrop_path: "https://image.tmdb.org/t/p/original/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg", vote_average: 8.5, release_date: "1994-10-14", overview: "The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.", genres: [{ id: 53, name: "Thriller" }, { id: 80, name: "Crime" }] },
  { id: 6, title: "Fight Club", poster_path: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", backdrop_path: "https://image.tmdb.org/t/p/original/hZkgoQYus5vegHoetLkCJzb17zJ.jpg", vote_average: 8.4, release_date: "1999-10-15", overview: "An insomniac office worker and a devil-may-care soap maker form an underground fight club.", genres: [{ id: 18, name: "Drama" }] },
  { id: 7, title: "Forrest Gump", poster_path: "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg", backdrop_path: "https://image.tmdb.org/t/p/original/3h1JZGDhZ8nzxdgvkxha0qBqi05.jpg", vote_average: 8.5, release_date: "1994-07-06", overview: "The story depicts several decades in the life of Forrest Gump, a slow-witted but kind-hearted man from Alabama.", genres: [{ id: 35, name: "Comedy" }, { id: 18, name: "Drama" }, { id: 10749, name: "Romance" }] },
  { id: 8, title: "The Shawshank Redemption", poster_path: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg", backdrop_path: "https://image.tmdb.org/t/p/original/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg", vote_average: 9.3, release_date: "1994-09-23", overview: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.", genres: [{ id: 18, name: "Drama" }, { id: 80, name: "Crime" }] },
  { id: 9, title: "Gladiator", poster_path: "https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg", backdrop_path: "https://image.tmdb.org/t/p/original/2Ie49YHCf0XEGNlyDHBnWZU8NXF.jpg", vote_average: 8.2, release_date: "2000-05-05", overview: "A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family.", genres: [{ id: 28, name: "Action" }, { id: 18, name: "Drama" }, { id: 12, name: "Adventure" }] },
  { id: 10, title: "The Godfather", poster_path: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg", backdrop_path: "https://image.tmdb.org/t/p/original/tmU7GeKVybMWFButWEGl2M4GeiP.jpg", vote_average: 9.2, release_date: "1972-03-14", overview: "The aging patriarch of an organized crime dynasty transfers control to his reluctant son.", genres: [{ id: 18, name: "Drama" }, { id: 80, name: "Crime" }] },
  { id: 11, title: "Avengers: Endgame", poster_path: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg", backdrop_path: "https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg", vote_average: 8.3, release_date: "2019-04-24", overview: "The Avengers assemble once more in order to reverse Thanos' actions and restore balance to the universe.", genres: [{ id: 28, name: "Action" }, { id: 12, name: "Adventure" }, { id: 878, name: "Science Fiction" }] },
  { id: 12, title: "Spider-Man: No Way Home", poster_path: "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg", backdrop_path: "https://image.tmdb.org/t/p/original/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg", vote_average: 8.0, release_date: "2021-12-15", overview: "Peter Parker is unmasked and no longer able to separate his normal life from the high-stakes of being a super-hero.", genres: [{ id: 28, name: "Action" }, { id: 12, name: "Adventure" }, { id: 878, name: "Science Fiction" }] },
];

// Get demo results (with pagination and filtering)
const getDemoResults = (page = 1, pageSize = 12, filter = null) => {
  let movies = [...DEMO_MOVIES];

  if (filter?.genreId) {
    movies = movies.filter(m => m.genres.some(g => g.id === parseInt(filter.genreId)));
  }
  if (filter?.year) {
    movies = movies.filter(m => m.release_date?.startsWith(filter.year.toString()));
  }
  if (filter?.rating) {
    movies = movies.filter(m => m.vote_average >= parseFloat(filter.rating));
  }

  // Shuffle for variety
  movies = movies.sort(() => Math.random() - 0.5);

  const start = (page - 1) * pageSize;
  const results = movies.slice(start, start + pageSize);

  return {
    results,
    page,
    total_results: movies.length,
    total_pages: Math.ceil(movies.length / pageSize),
  };
};

// Enhanced Movie Search
export const enhancedMovieSearch = async (query, page = 1) => {
  try {
    if (hasTmdbKey()) {
      return await tmdb.searchMovies(query, page);
    }
  } catch (error) {
    console.warn("TMDB search failed:", error);
  }

  try {
    if (hasOmdbKey()) {
      return await omdbSearch(query, page);
    }
  } catch (error) {
    console.warn("OMDB search failed:", error);
  }

  // Demo fallback - filter by query
  const demo = getDemoResults(page);
  demo.results = DEMO_MOVIES.filter(m =>
    m.title.toLowerCase().includes(query.toLowerCase())
  );
  return demo;
};

// Enhanced Discover with filters
export const enhancedDiscover = async ({ page = 1, genreId, year, rating, sortBy } = {}) => {
  try {
    if (hasTmdbKey()) {
      return await tmdb.discoverMovies({
        page,
        genreId,
        year,
        minRating: rating,
        sortBy: sortBy || "popularity.desc",
      });
    }
  } catch (error) {
    console.warn("TMDB discover failed:", error);
  }

  // Demo fallback with filtering
  return getDemoResults(page, 12, { genreId, year, rating });
};

// Enhanced Popular Movies
export const enhancedPopular = async (page = 1) => {
  try {
    if (hasTmdbKey()) {
      return await tmdb.getPopularMovies(page);
    }
  } catch (error) {
    console.warn("TMDB popular failed:", error);
  }

  // Demo fallback
  return getDemoResults(page);
};

// Enhanced Trending Movies
export const enhancedTrending = async (timeWindow = "week", page = 1) => {
  try {
    if (hasTmdbKey()) {
      return await tmdb.getTrendingMovies(timeWindow, page);
    }
  } catch (error) {
    console.warn("TMDB trending failed:", error);
  }
  return getDemoResults(page);
};

// Enhanced Now Playing
export const enhancedNowPlaying = async (page = 1) => {
  try {
    if (hasTmdbKey()) {
      return await tmdb.getNowPlayingMovies(page);
    }
  } catch (error) {
    console.warn("TMDB now playing failed:", error);
  }
  return getDemoResults(page);
};

// Enhanced Upcoming Movies
export const enhancedUpcoming = async (page = 1) => {
  try {
    if (hasTmdbKey()) {
      return await tmdb.getUpcomingMovies(page);
    }
  } catch (error) {
    console.warn("TMDB upcoming failed:", error);
  }
  return getDemoResults(page);
};

// Enhanced Top Rated
export const enhancedTopRated = async (page = 1) => {
  try {
    if (hasTmdbKey()) {
      return await tmdb.getTopRatedMovies(page);
    }
  } catch (error) {
    console.warn("TMDB top rated failed:", error);
  }
  const demo = getDemoResults(page);
  demo.results = demo.results.sort((a, b) => b.vote_average - a.vote_average);
  return demo;
};

// Enhanced Movie Details
export const enhancedMovieDetails = async (movieId) => {
  try {
    if (hasTmdbKey()) {
      const tmdbData = await tmdb.getMovieDetails(movieId);
      if (tmdbData.imdb_id && hasOmdbKey()) {
        try {
          const omdbData = await omdbDetails(tmdbData.imdb_id);
          return { ...tmdbData, ...omdbData };
        } catch { }
      }
      return tmdbData;
    }
  } catch (error) {
    console.warn("TMDB details failed:", error);
  }

  // Demo fallback
  const movie = DEMO_MOVIES.find(m => m.id === parseInt(movieId));
  if (movie) return movie;

  return DEMO_MOVIES[0]; // Default to first demo movie
};

// Get Trailer Key
export const getTrailerKey = async (movieId) => {
  try {
    if (hasTmdbKey()) {
      return await tmdb.getTrailerKey(movieId);
    }
  } catch (error) {
    console.warn("Failed to get trailer:", error);
  }
  return null;
};

// Get Genres
export const enhancedGenres = async () => {
  try {
    if (hasTmdbKey()) {
      return await tmdb.getGenres();
    }
  } catch (error) {
    console.warn("TMDB genres failed:", error);
  }

  // Fallback genres
  return [
    { id: 28, name: "Action" },
    { id: 35, name: "Comedy" },
    { id: 18, name: "Drama" },
    { id: 27, name: "Horror" },
    { id: 878, name: "Science Fiction" },
    { id: 53, name: "Thriller" },
    { id: 10749, name: "Romance" },
    { id: 12, name: "Adventure" },
    { id: 16, name: "Animation" },
    { id: 80, name: "Crime" },
    { id: 14, name: "Fantasy" },
    { id: 9648, name: "Mystery" },
  ];
};

// Era Browsing
export const discoverByEra = async (era, page = 1) => {
  try {
    if (hasTmdbKey()) {
      return await tmdb.discoverByEra(era, page);
    }
  } catch (error) {
    console.warn("TMDB era browse failed:", error);
  }

  // Filter demo by era
  const eraRanges = {
    "80s": ["1980", "1981", "1982", "1983", "1984", "1985", "1986", "1987", "1988", "1989"],
    "90s": ["1990", "1991", "1992", "1993", "1994", "1995", "1996", "1997", "1998", "1999"],
    "2000s": ["2000", "2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008", "2009"],
    "2010s": ["2010", "2011", "2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019"],
    "2020s": ["2020", "2021", "2022", "2023", "2024", "2025"],
  };

  const years = eraRanges[era] || [];
  const movies = DEMO_MOVIES.filter(m => years.some(y => m.release_date?.startsWith(y)));

  return {
    results: movies.length > 0 ? movies : DEMO_MOVIES.slice(0, 6),
    page: 1,
    total_results: movies.length || 6,
    total_pages: 1,
  };
};

// Award Winners
export const getAwardWinners = async (category = "oscar", page = 1) => {
  try {
    if (hasTmdbKey()) {
      return await tmdb.getAwardWinners(category, page);
    }
  } catch (error) {
    console.warn("TMDB award winners failed:", error);
  }

  // Return highest rated demos
  const sorted = [...DEMO_MOVIES].sort((a, b) => b.vote_average - a.vote_average);
  return { results: sorted.slice(0, 8), page: 1, total_results: 8, total_pages: 1 };
};

// Random Movie Picker
export const getRandomMovie = async (filters = {}) => {
  try {
    if (hasTmdbKey()) {
      return await tmdb.getRandomMovie(filters);
    }
  } catch (error) {
    console.warn("Random movie failed:", error);
  }

  // Demo fallback - filter and pick random
  let movies = [...DEMO_MOVIES];

  if (filters.genreId) {
    movies = movies.filter(m => m.genres.some(g => g.id === parseInt(filters.genreId)));
  }
  if (filters.minRating) {
    movies = movies.filter(m => m.vote_average >= parseFloat(filters.minRating));
  }

  if (movies.length === 0) movies = DEMO_MOVIES;

  return movies[Math.floor(Math.random() * movies.length)];
};

// Get Collection
export const getCollection = async (collectionId) => {
  try {
    if (hasTmdbKey()) {
      return await tmdb.getCollection(collectionId);
    }
  } catch (error) {
    console.warn("TMDB collection failed:", error);
  }
  return null;
};

// Popular Collections
export const getPopularCollections = () => tmdb.POPULAR_COLLECTIONS;

// Similar Movies
export const enhancedSimilarMovies = async (movieId, page = 1) => {
  try {
    if (hasTmdbKey()) {
      return await tmdb.getSimilarMovies(movieId, page);
    }
  } catch (error) {
    console.warn("TMDB similar failed:", error);
  }

  // Demo fallback - return other demo movies
  return { results: DEMO_MOVIES.slice(0, 6), page: 1, total_results: 6, total_pages: 1 };
};

// Movie Reviews
export const getMovieReviews = async (movieId, page = 1) => {
  try {
    if (hasTmdbKey()) {
      return await tmdb.getMovieReviews(movieId, page);
    }
  } catch (error) {
    console.warn("TMDB reviews failed:", error);
  }
  return { results: [], page: 1, total_results: 0, total_pages: 0 };
};

export { getSimilarTvShows };
