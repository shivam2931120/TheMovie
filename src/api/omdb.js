import axios from "axios";

const BASE_URL = "https://www.omdbapi.com";

let cachedOmdbKey = null;

async function getOmdbApiKey() {
  if (cachedOmdbKey) return cachedOmdbKey;
  const envKey = process.env.NEXT_PUBLIC_OMDB_API_KEY;
  if (envKey && typeof envKey === "string" && envKey.trim()) {
    cachedOmdbKey = envKey.trim();
    return cachedOmdbKey;
  }
  throw new Error(
    "OMDB API key is missing. Set NEXT_PUBLIC_OMDB_API_KEY in .env. Get one free at: https://www.omdbapi.com/apikey.aspx"
  );
}

export const searchMovies = async (query, page = 1) => {
  const apiKey = await getOmdbApiKey();
  const { data } = await axios.get(BASE_URL, {
    params: { apikey: apiKey, s: query, page, type: "movie" },
  });

  if (data.Response === "False") {
    return { results: [], total_results: 0, page, total_pages: 0 };
  }

  const results = (data.Search || []).map(movie => ({
    id: movie.imdbID,
    title: movie.Title,
    poster_path: movie.Poster !== "N/A" ? movie.Poster : null,
    release_date: movie.Year,
    vote_average: null, // OMDB doesn't provide this in search
  }));

  const totalResults = parseInt(data.totalResults) || 0;
  return {
    results,
    page,
    total_results: totalResults,
    total_pages: Math.ceil(totalResults / 10),
  };
};

export const getPopularMovies = async (page = 1) => {
  // OMDB doesn't have a "popular" endpoint, so we'll search for common blockbuster terms
  const searchTerms = ['marvel', 'action', 'adventure', 'batman', 'spider', 'star wars', 'avengers'];
  const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
  return searchMovies(randomTerm, page);
};


export const getMovieDetails = async (imdbId) => {
  const apiKey = await getOmdbApiKey();
  const { data } = await axios.get(BASE_URL, {
    params: { apikey: apiKey, i: imdbId, plot: "full" },
  });

  if (data.Response === "False") {
    throw new Error(data.Error || "Movie not found");
  }

  return {
    id: data.imdbID,
    title: data.Title,
    overview: data.Plot !== "N/A" ? data.Plot : "",
    poster_path: data.Poster !== "N/A" ? data.Poster : null,
    backdrop_path: data.Poster !== "N/A" ? data.Poster : null, // OMDB doesn't have backdrop
    release_date: data.Released !== "N/A" ? data.Released : data.Year,
    vote_average: data.imdbRating !== "N/A" ? parseFloat(data.imdbRating) : null,
    runtime: data.Runtime !== "N/A" ? parseInt(data.Runtime) : null,
    genres: data.Genre !== "N/A" ? data.Genre.split(", ").map((name, idx) => ({ id: idx, name })) : [],
    director: data.Director,
    actors: data.Actors,
    awards: data.Awards,
    boxOffice: data.BoxOffice,
    imdbRating: data.imdbRating,
    rottenTomatoes: data.Ratings?.find(r => r.Source === "Rotten Tomatoes")?.Value,
    metacritic: data.Ratings?.find(r => r.Source === "Metacritic")?.Value,
  };
};

export const getSimilarMovies = async (imdbId) => {
  try {
    const movie = await getMovieDetails(imdbId);
    const firstGenre = movie.genres?.[0]?.name;
    if (firstGenre) {
      const results = await searchMovies(firstGenre, 1);
      return results.results.filter(m => m.id !== imdbId).slice(0, 10);
    }
  } catch (error) {
    console.error("Failed to get similar movies:", error);
  }
  return [];
};

export const getGenres = async () => {
  return [
    { id: 1, name: "Action" },
    { id: 2, name: "Comedy" },
    { id: 3, name: "Drama" },
    { id: 4, name: "Horror" },
    { id: 5, name: "Sci-Fi" },
    { id: 6, name: "Thriller" },
    { id: 7, name: "Romance" },
    { id: 8, name: "Adventure" },
    { id: 9, name: "Animation" },
    { id: 10, name: "Crime" },
    { id: 11, name: "Fantasy" },
    { id: 12, name: "Mystery" },
  ];
};


export const discoverMovies = async ({ page = 1, genreId, year } = {}) => {
  const genres = await getGenres();
  const genre = genres.find(g => g.id === parseInt(genreId));

  let searchTerm = "movie"; // default
  if (genre) {
    searchTerm = genre.name;
  }

  const results = await searchMovies(searchTerm, page);

  let filtered = results.results;

  if (year) {
    filtered = filtered.filter(m => m.release_date?.includes(year.toString()));
  }

  return {
    results: filtered,
    page: results.page,
    total_results: results.total_results,
    total_pages: results.total_pages,
  };
};
