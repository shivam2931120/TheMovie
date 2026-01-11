import axios from "axios";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

let cachedTmdbKey = null;

async function getTmdbApiKey() {
    if (cachedTmdbKey) return cachedTmdbKey;
    const envKey = import.meta.env.VITE_TMDB_API_KEY;
    if (envKey && typeof envKey === "string" && envKey.trim()) {
        cachedTmdbKey = envKey.trim();
        return cachedTmdbKey;
    }
    throw new Error(
        "TMDB API key is missing. Set VITE_TMDB_API_KEY in .env. Get one free at: https://www.themoviedb.org/settings/api"
    );
}

// Helper to build image URLs
export const getImageUrl = (path, size = "w500") => {
    if (!path) return "/placeholder.png";
    if (path.startsWith("http")) return path;
    return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

export const getBackdropUrl = (path) => getImageUrl(path, "original");

// Movie Search
export const searchMovies = async (query, page = 1) => {
    const apiKey = await getTmdbApiKey();
    const { data } = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
        params: { api_key: apiKey, query, page, include_adult: false },
    });
    return {
        results: data.results || [],
        page: data.page,
        total_results: data.total_results,
        total_pages: data.total_pages,
    };
};

// Trending Movies (weekly)
export const getTrendingMovies = async (timeWindow = "week", page = 1) => {
    const apiKey = await getTmdbApiKey();
    const { data } = await axios.get(`${TMDB_BASE_URL}/trending/movie/${timeWindow}`, {
        params: { api_key: apiKey, page },
    });
    return {
        results: data.results || [],
        page: data.page,
        total_results: data.total_results,
        total_pages: data.total_pages,
    };
};

// Popular Movies
export const getPopularMovies = async (page = 1) => {
    const apiKey = await getTmdbApiKey();
    const { data } = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
        params: { api_key: apiKey, page },
    });
    return {
        results: data.results || [],
        page: data.page,
        total_results: data.total_results,
        total_pages: data.total_pages,
    };
};

// Now Playing Movies
export const getNowPlayingMovies = async (page = 1) => {
    const apiKey = await getTmdbApiKey();
    const { data } = await axios.get(`${TMDB_BASE_URL}/movie/now_playing`, {
        params: { api_key: apiKey, page },
    });
    return {
        results: data.results || [],
        page: data.page,
        total_results: data.total_results,
        total_pages: data.total_pages,
    };
};

// Upcoming Movies
export const getUpcomingMovies = async (page = 1) => {
    const apiKey = await getTmdbApiKey();
    const { data } = await axios.get(`${TMDB_BASE_URL}/movie/upcoming`, {
        params: { api_key: apiKey, page },
    });
    return {
        results: data.results || [],
        page: data.page,
        total_results: data.total_results,
        total_pages: data.total_pages,
        dates: data.dates,
    };
};

// Top Rated Movies
export const getTopRatedMovies = async (page = 1) => {
    const apiKey = await getTmdbApiKey();
    const { data } = await axios.get(`${TMDB_BASE_URL}/movie/top_rated`, {
        params: { api_key: apiKey, page },
    });
    return {
        results: data.results || [],
        page: data.page,
        total_results: data.total_results,
        total_pages: data.total_pages,
    };
};

// Movie Details
export const getMovieDetails = async (movieId) => {
    const apiKey = await getTmdbApiKey();
    const { data } = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
        params: { api_key: apiKey, append_to_response: "credits,videos,reviews,similar,recommendations" },
    });
    return data;
};

// Movie Videos (Trailers)
export const getMovieVideos = async (movieId) => {
    const apiKey = await getTmdbApiKey();
    const { data } = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}/videos`, {
        params: { api_key: apiKey },
    });
    return data.results || [];
};

// Get YouTube Trailer Key
export const getTrailerKey = async (movieId) => {
    const videos = await getMovieVideos(movieId);
    const trailer = videos.find(
        (v) => v.type === "Trailer" && v.site === "YouTube"
    ) || videos.find((v) => v.site === "YouTube");
    return trailer?.key || null;
};

// Similar Movies
export const getSimilarMovies = async (movieId, page = 1) => {
    const apiKey = await getTmdbApiKey();
    const { data } = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}/similar`, {
        params: { api_key: apiKey, page },
    });
    return {
        results: data.results || [],
        page: data.page,
        total_results: data.total_results,
        total_pages: data.total_pages,
    };
};

// Recommended Movies
export const getRecommendedMovies = async (movieId, page = 1) => {
    const apiKey = await getTmdbApiKey();
    const { data } = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}/recommendations`, {
        params: { api_key: apiKey, page },
    });
    return {
        results: data.results || [],
        page: data.page,
        total_results: data.total_results,
        total_pages: data.total_pages,
    };
};

// Movie Reviews from TMDB
export const getMovieReviews = async (movieId, page = 1) => {
    const apiKey = await getTmdbApiKey();
    const { data } = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}/reviews`, {
        params: { api_key: apiKey, page },
    });
    return {
        results: data.results || [],
        page: data.page,
        total_results: data.total_results,
        total_pages: data.total_pages,
    };
};

// Get Genres
export const getGenres = async () => {
    const apiKey = await getTmdbApiKey();
    const { data } = await axios.get(`${TMDB_BASE_URL}/genre/movie/list`, {
        params: { api_key: apiKey },
    });
    return data.genres || [];
};

// Discover Movies with Filters
export const discoverMovies = async ({
    page = 1,
    genreId,
    year,
    minRating,
    maxRating,
    sortBy = "popularity.desc",
    primaryReleaseDateGte,
    primaryReleaseDateLte,
} = {}) => {
    const apiKey = await getTmdbApiKey();
    const params = {
        api_key: apiKey,
        page,
        sort_by: sortBy,
        include_adult: false,
    };

    if (genreId) params.with_genres = genreId;
    if (year) params.primary_release_year = year;
    if (minRating) params["vote_average.gte"] = minRating;
    if (maxRating) params["vote_average.lte"] = maxRating;
    if (primaryReleaseDateGte) params["primary_release_date.gte"] = primaryReleaseDateGte;
    if (primaryReleaseDateLte) params["primary_release_date.lte"] = primaryReleaseDateLte;

    const { data } = await axios.get(`${TMDB_BASE_URL}/discover/movie`, { params });
    return {
        results: data.results || [],
        page: data.page,
        total_results: data.total_results,
        total_pages: data.total_pages,
    };
};

// Discover by Era
export const discoverByEra = async (era, page = 1) => {
    const eras = {
        "80s": { start: "1980-01-01", end: "1989-12-31" },
        "90s": { start: "1990-01-01", end: "1999-12-31" },
        "2000s": { start: "2000-01-01", end: "2009-12-31" },
        "2010s": { start: "2010-01-01", end: "2019-12-31" },
        "2020s": { start: "2020-01-01", end: "2029-12-31" },
    };
    const range = eras[era] || eras["2020s"];
    return discoverMovies({
        page,
        primaryReleaseDateGte: range.start,
        primaryReleaseDateLte: range.end,
        sortBy: "vote_count.desc",
    });
};

// Get Collection Details (MCU, etc.)
export const getCollection = async (collectionId) => {
    const apiKey = await getTmdbApiKey();
    const { data } = await axios.get(`${TMDB_BASE_URL}/collection/${collectionId}`, {
        params: { api_key: apiKey },
    });
    return data;
};

// Pre-defined popular collections
export const POPULAR_COLLECTIONS = [
    { id: 529892, name: "Marvel Cinematic Universe", poster: "/yFSIUVTCvgYrpalUktulvk3Gi5Y.jpg" },
    { id: 263, name: "The Dark Knight Collection", poster: "/bqS2lMgGkuodIXtDILFWTSWDDpa.jpg" },
    { id: 10, name: "Star Wars Collection", poster: "/r8Ph5MYXL04Qzu4QBbq2KjqwtkQ.jpg" },
    { id: 1241, name: "Harry Potter Collection", poster: "/eVPs2Y0LyvTLZn6AP5Z6O2rtiGB.jpg" },
    { id: 9485, name: "The Fast and the Furious Collection", poster: "/z4ROnCrL77ZMzT0MsNXY5j25wS2.jpg" },
    { id: 87359, name: "Mission: Impossible Collection", poster: "/geEjCGwdHjrjpAIM4vPwmDvPPsW.jpg" },
    { id: 748, name: "X-Men Collection", poster: "/bRm2DEgUiYciDw3myHuYFInD7la.jpg" },
    { id: 295, name: "Pirates of the Caribbean Collection", poster: "/q4X89PI7BEhjVvyHeZwrdxDVinV.jpg" },
    { id: 656, name: "Saw Collection", poster: "/pRsmPMtOqADoMSsOAHS9j4r8FOT.jpg" },
    { id: 2344, name: "The Matrix Collection", poster: "/bV9qTVHTVf0gkW0j7p7M0ILD4pG.jpg" },
];

// Tarantino Movies (by keyword search - approximate)
export const getTarantinoMovies = async (page = 1) => {
    const apiKey = await getTmdbApiKey();
    const { data } = await axios.get(`${TMDB_BASE_URL}/discover/movie`, {
        params: {
            api_key: apiKey,
            page,
            with_crew: "138", // Quentin Tarantino's person ID
            sort_by: "release_date.desc",
        },
    });
    return {
        results: data.results || [],
        page: data.page,
        total_results: data.total_results,
        total_pages: data.total_pages,
    };
};

// Oscar Best Picture Winners - using keyword/certification filters
export const getAwardWinners = async (category = "oscar", page = 1) => {
    // For Oscar winners, we filter by high vote count and rating
    const apiKey = await getTmdbApiKey();
    const params = {
        api_key: apiKey,
        page,
        sort_by: "vote_count.desc",
        "vote_average.gte": 7.5,
        "vote_count.gte": 5000,
    };

    const { data } = await axios.get(`${TMDB_BASE_URL}/discover/movie`, { params });
    return {
        results: data.results || [],
        page: data.page,
        total_results: data.total_results,
        total_pages: data.total_pages,
    };
};

// Random Movie with Filters
export const getRandomMovie = async (filters = {}) => {
    const randomPage = Math.floor(Math.random() * 10) + 1;
    const result = await discoverMovies({ ...filters, page: randomPage });
    if (result.results.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * result.results.length);
    return result.results[randomIndex];
};

// Person Search (for director filtering)
export const searchPerson = async (query) => {
    const apiKey = await getTmdbApiKey();
    const { data } = await axios.get(`${TMDB_BASE_URL}/search/person`, {
        params: { api_key: apiKey, query },
    });
    return data.results || [];
};

// Get Person Details
export const getPersonDetails = async (personId) => {
    const apiKey = await getTmdbApiKey();
    const { data } = await axios.get(`${TMDB_BASE_URL}/person/${personId}`, {
        params: { api_key: apiKey, append_to_response: "movie_credits" },
    });
    return data;
};
