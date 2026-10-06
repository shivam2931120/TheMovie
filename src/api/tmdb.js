import axios from "axios";

// Constants
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

const EMPTY_RESPONSE = { results: [], total_pages: 0, total_results: 0 };
const REQUEST_CACHE_TTL_MS = 1000 * 60 * 15;
const MAX_REQUEST_CACHE_ENTRIES = 250;
const requestCache = new Map();
const pendingRequests = new Map();
let hasWarnedMissingApiKey = false;

const emptyResponse = () => ({ ...EMPTY_RESPONSE });

const getNormalizedParams = (params = {}) => (
    Object.keys(params)
        .sort()
        .reduce((acc, key) => {
            const value = params[key];
            if (value === undefined || value === null || value === "") return acc;
            acc[key] = Array.isArray(value) ? value.join(",") : value;
            return acc;
        }, {})
);

const getCacheKey = (endpoint, params = {}) => `${endpoint}?${JSON.stringify(getNormalizedParams(params))}`;

const trimRequestCache = () => {
    if (requestCache.size <= MAX_REQUEST_CACHE_ENTRIES) return;

    const now = Date.now();
    for (const [key, entry] of requestCache) {
        if (entry.expiresAt <= now || requestCache.size > MAX_REQUEST_CACHE_ENTRIES) {
            requestCache.delete(key);
        }
        if (requestCache.size <= MAX_REQUEST_CACHE_ENTRIES) break;
    }
};

const normalizeTmdbId = (id) => {
    const numericId = Number(id);
    return Number.isInteger(numericId) && numericId > 0 ? numericId : null;
};

// Helper to get API key (Priority: NEXT_PUBLIC, VITE, Process Env)
const getApiKey = () => {
    if (typeof process !== 'undefined' && process.env) {
        const key = process.env.NEXT_PUBLIC_TMDB_API_KEY || process.env.VITE_TMDB_API_KEY;
        if (!key || key === "your_tmdb_api_key_here") return null;
        return key.trim();
    }
    return null;
};

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
    if (apiKey && apiKey !== 'your_tmdb_api_key_here' && apiKey !== '') {
        config.params = { ...config.params, api_key: apiKey };
    }
    return config;
});

// Robust Error Handling Wrapper
const fetchFromApi = async (endpoint, params = {}, options = {}) => {
    const { cache = true, cacheTtlMs = REQUEST_CACHE_TTL_MS, signal, throwOnError = false } = options;
    try {
        const apiKey = getApiKey();
        if (!apiKey) {
            if (!hasWarnedMissingApiKey) {
                console.warn("[TMDB] Missing API key. Returning an empty response.");
                hasWarnedMissingApiKey = true;
            }
            if (throwOnError) throw new Error("Movie catalogue is not configured");
            return emptyResponse();
        }

        const cacheKey = cache && !signal ? getCacheKey(endpoint, params) + (throwOnError ? ":strict" : "") : null;

        if (cacheKey) {
            const cached = requestCache.get(cacheKey);
            if (cached && cached.expiresAt > Date.now()) {
                return cached.data;
            }
            if (cached) requestCache.delete(cacheKey);

            const pending = pendingRequests.get(cacheKey);
            if (pending) return pending;
        }

        let shouldCacheResponse = true;
        const request = api.get(endpoint, { params, signal })
            .then(({ data }) => {
                if (throwOnError && (!data || data.error || ((endpoint.startsWith('/search/') || endpoint.startsWith('/trending/') || ['/movie/popular', '/movie/now_playing', '/movie/upcoming', '/movie/top_rated'].includes(endpoint)) && !Array.isArray(data.results)))) throw new Error('Invalid catalogue response');
                return data || emptyResponse();
            })
            .catch((error) => {
                shouldCacheResponse = false;
                if (throwOnError || signal?.aborted) throw error;
                if (error.code === 'ECONNABORTED') {
                    console.error(`[TMDB] Timeout fetching ${endpoint}`);
                } else {
                    console.error(`[TMDB] Error fetching ${endpoint}:`, error.message);
                }
                return emptyResponse();
            })
            .finally(() => {
                if (cacheKey) pendingRequests.delete(cacheKey);
            });

        if (cacheKey) pendingRequests.set(cacheKey, request);

        const data = await request;
        if (cacheKey && shouldCacheResponse) {
            requestCache.set(cacheKey, {
                data,
                expiresAt: Date.now() + cacheTtlMs,
            });
            trimRequestCache();
        }

        return data;
    } catch (error) {
        if (throwOnError || signal?.aborted) throw error;
        if (error.code === 'ECONNABORTED') {
            console.error(`[TMDB] Timeout fetching ${endpoint}`);
        } else {
            console.error(`[TMDB] Error fetching ${endpoint}:`, error.message);
        }
        return emptyResponse(); // Return empty structure instead of null
    }
};

// --- API Functions ---

export const getTrendingMovies = (timeWindow = "day", options = {}) =>
    fetchFromApi(`/trending/movie/${timeWindow}`, {}, options);

export const getPopularMovies = (page = 1, options = {}) =>
    fetchFromApi("/movie/popular", { page }, options);

export const getNowPlayingMovies = (page = 1, options = {}) =>
    fetchFromApi("/movie/now_playing", { page }, options);

export const getUpcomingMovies = (page = 1, options = {}) =>
    fetchFromApi("/movie/upcoming", { page }, options);

export const getTopRatedMovies = (page = 1, options = {}) =>
    fetchFromApi("/movie/top_rated", { page }, options);

export const getMovieDetails = (id) =>
    fetchFromApi(`/movie/${id}`, { append_to_response: "videos,credits,similar,images,keywords,alternative_titles,release_dates,external_ids" });

export const getMovieSummary = (id) => {
    const movieId = normalizeTmdbId(id);
    return movieId ? fetchFromApi(`/movie/${movieId}`) : Promise.resolve(emptyResponse());
};

export const getMovieSummaries = async (ids = [], limit = 15, concurrency = 4) => {
    const uniqueIds = [];
    const seen = new Set();

    for (const id of ids) {
        const movieId = normalizeTmdbId(id);
        if (!movieId || seen.has(movieId)) continue;
        seen.add(movieId);
        uniqueIds.push(movieId);
        if (uniqueIds.length >= limit) break;
    }

    if (uniqueIds.length === 0) return [];

    const results = new Array(uniqueIds.length);
    let cursor = 0;
    const workerCount = Math.min(Math.max(1, concurrency), uniqueIds.length);

    await Promise.all(Array.from({ length: workerCount }, async () => {
        while (cursor < uniqueIds.length) {
            const index = cursor;
            cursor += 1;
            results[index] = await getMovieSummary(uniqueIds[index]).catch(() => null);
        }
    }));

    return results.filter((movie) => movie && movie.id);
};

export const searchMovies = (query, page = 1) =>
    fetchFromApi("/search/movie", { query, page });

export const searchTV = (query, page = 1) =>
    fetchFromApi("/search/tv", { query, page });

export const searchMulti = (query, page = 1, options = {}) =>
    fetchFromApi("/search/multi", { query, page }, options);

export const searchPeople = (query, page = 1) =>
    fetchFromApi("/search/person", { query, page });

export const getMovieGenres = () =>
    fetchFromApi("/genre/movie/list");

export const getDiscoverMovies = (filters = {}, page = 1) => {
    const { page: filterPage, ...rest } = filters;
    return fetchFromApi("/discover/movie", { ...rest, page: filterPage ?? page });
};

export const getDiscoverTV = (filters = {}, page = 1) => {
    const { page: filterPage, ...rest } = filters;
    return fetchFromApi("/discover/tv", { ...rest, page: filterPage ?? page });
};

export const getTVDetails = (id) =>
    fetchFromApi(`/tv/${id}`, { append_to_response: "videos,credits,similar,images,keywords,alternative_titles,content_ratings,aggregate_credits,external_ids" });

export const getWatchProviders = (id, type = 'movie') =>
    fetchFromApi(`/${type}/${id}/watch/providers`);

export const getMovieWatchProviderList = (watchRegion = "US") =>
    fetchFromApi("/watch/providers/movie", { watch_region: watchRegion });

export const getTVWatchProviderList = (watchRegion = "US") =>
    fetchFromApi("/watch/providers/tv", { watch_region: watchRegion });

export const getWatchProviderRegions = () =>
    fetchFromApi("/watch/providers/regions");

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

// Strict, cancellable requests for release-calendar data.
export const getCalendarMovies = (params, options = {}) =>
    fetchFromApi('/discover/movie', params, { ...options, throwOnError: true });
export const getCalendarMovie = (id, options = {}) =>
    fetchFromApi(`/movie/${id}`, { append_to_response: 'release_dates' }, { ...options, throwOnError: true });
export const getCalendarShow = (id, options = {}) =>
    fetchFromApi(`/tv/${id}`, {}, { ...options, throwOnError: true });
export const getCalendarSeason = (id, season, options = {}) =>
    fetchFromApi(`/tv/${id}/season/${season}`, {}, { ...options, throwOnError: true });
export const getCalendarCountries = (options = {}) =>
    fetchFromApi('/configuration/countries', {}, { ...options, throwOnError: true });
