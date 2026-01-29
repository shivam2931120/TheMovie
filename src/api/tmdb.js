import axios from "axios";

// Constants
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

// Cached API Key
let cachedTmdbKey = null;

// Helper to get API key (Priority: NEXT_PUBLIC, VITE, Process Env)
const getApiKey = () => {
    if (typeof process !== 'undefined' && process.env) {
        return process.env.NEXT_PUBLIC_TMDB_API_KEY || process.env.VITE_TMDB_API_KEY;
    }
    return null;
}

// Create Axios Instance
const api = axios.create({
    baseURL: TMDB_BASE_URL,
    timeout: 30000, // 30 second timeout
    params: {
        language: "en-US",
    },
});

// Request Interceptor to add API Key
api.interceptors.request.use((config) => {
    const apiKey = getApiKey();
    if (apiKey && apiKey !== 'your_tmdb_api_key_here') {
        config.params = { ...config.params, api_key: apiKey };
    }
    return config;
});

// Robust Error Handling Wrapper
const fetchFromApi = async (endpoint, params = {}) => {
    try {
        const apiKey = getApiKey();
        if (!apiKey || apiKey === 'your_tmdb_api_key_here') {
            console.warn(`[TMDB] Missing API Key. Returning empty data for ${endpoint}`);
            return { results: [], total_pages: 0, total_results: 0 };
        }
        const { data } = await api.get(endpoint, { params });
        return data || { results: [], total_pages: 0, total_results: 0 };
    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            console.error(`[TMDB] Timeout fetching ${endpoint}`);
        } else {
            console.error(`[TMDB] Error fetching ${endpoint}:`, error.message);
        }
        return { results: [], total_pages: 0, total_results: 0 }; // Return empty structure instead of null
    }
};

// --- API Functions ---

export const getTrendingMovies = (timeWindow = "day") =>
    fetchFromApi(`/trending/movie/${timeWindow}`);

export const getPopularMovies = (page = 1) =>
    fetchFromApi("/movie/popular", { page });

export const getNowPlayingMovies = (page = 1) =>
    fetchFromApi("/movie/now_playing", { page });

export const getUpcomingMovies = (page = 1) =>
    fetchFromApi("/movie/upcoming", { page });

export const getTopRatedMovies = (page = 1) =>
    fetchFromApi("/movie/top_rated", { page });

export const getMovieDetails = (id) =>
    fetchFromApi(`/movie/${id}`, { append_to_response: "videos,credits,similar,images,reviews,keywords,alternative_titles,release_dates" });

export const searchMovies = (query, page = 1) =>
    fetchFromApi("/search/movie", { query, page });

export const getMovieGenres = () =>
    fetchFromApi("/genre/movie/list");

export const getDiscoverMovies = (filters = {}, page = 1) =>
    fetchFromApi("/discover/movie", { ...filters, page });

export const getDiscoverTV = (filters = {}, page = 1) =>
    fetchFromApi("/discover/tv", { ...filters, page });

export const getTVDetails = (id) =>
    fetchFromApi(`/tv/${id}`, { append_to_response: "videos,credits,similar,images,reviews,keywords,alternative_titles,content_ratings,aggregate_credits" });

export const getWatchProviders = (id, type = 'movie') =>
    fetchFromApi(`/${type}/${id}/watch/providers`);

export const getTVGenres = () =>
    fetchFromApi("/genre/tv/list");

export const getTrendingTV = (timeWindow = "day") =>
    fetchFromApi(`/trending/tv/${timeWindow}`);

export const getPopularTV = (page = 1) =>
    fetchFromApi("/tv/popular", { page });

export const getTopRatedTV = (page = 1) =>
    fetchFromApi("/tv/top_rated", { page });

export const getPersonDetails = (id) =>
    fetchFromApi(`/person/${id}`, { append_to_response: "movie_credits,tv_credits,images" });

export const getMovieRecommendations = (id, page = 1) =>
    fetchFromApi(`/movie/${id}/recommendations`, { page });

export const getTVRecommendations = (id, page = 1) =>
    fetchFromApi(`/tv/${id}/recommendations`, { page });

export const getMovieVideos = (id) =>
    fetchFromApi(`/movie/${id}/videos`);

export const getTVVideos = (id) =>
    fetchFromApi(`/tv/${id}/videos`);

export const getMovieKeywords = (id) =>
    fetchFromApi(`/movie/${id}/keywords`);

export const getTVKeywords = (id) =>
    fetchFromApi(`/tv/${id}/keywords`);

export const getMovieReviews = (id, page = 1) =>
    fetchFromApi(`/movie/${id}/reviews`, { page });

export const getTVReviews = (id, page = 1) =>
    fetchFromApi(`/tv/${id}/reviews`, { page });

export const getCollection = (id) =>
    fetchFromApi(`/collection/${id}`);

export const getTVSeasonDetails = (tvId, seasonNumber) =>
    fetchFromApi(`/tv/${tvId}/season/${seasonNumber}`);

export const getTVEpisodeDetails = (tvId, seasonNumber, episodeNumber) =>
    fetchFromApi(`/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`);

export const getMovieAlternativeTitles = (id) =>
    fetchFromApi(`/movie/${id}/alternative_titles`);

export const getTVAlternativeTitles = (id) =>
    fetchFromApi(`/tv/${id}/alternative_titles`);

export const getMovieCertifications = (id) =>
    fetchFromApi(`/movie/${id}/release_dates`);

export const getTVContentRatings = (id) =>
    fetchFromApi(`/tv/${id}/content_ratings`);

export const getPersonMovieCredits = (id) =>
    fetchFromApi(`/person/${id}/movie_credits`);

export const getPersonTVCredits = (id) =>
    fetchFromApi(`/person/${id}/tv_credits`);

export const getPersonCombinedCredits = (id) =>
    fetchFromApi(`/person/${id}/combined_credits`);

export const getPersonExternalIds = (id) =>
    fetchFromApi(`/person/${id}/external_ids`);

// Helper to get image URL
export const getImageUrl = (path, size = "original") => {
    if (!path) return null;
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

// Helper to get backdrop URL
export const getBackdropUrl = (path) => getImageUrl(path, "original");

// Helper to get poster URL
export const getPosterUrl = (path, size = "w500") => getImageUrl(path, size);



