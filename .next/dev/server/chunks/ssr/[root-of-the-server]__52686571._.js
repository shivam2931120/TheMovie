module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/assert [external] (assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("assert", () => require("assert"));

module.exports = mod;
}),
"[externals]/tty [external] (tty, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tty", () => require("tty"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[project]/src/api/tmdb.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getBackdropUrl",
    ()=>getBackdropUrl,
    "getCollection",
    ()=>getCollection,
    "getDiscoverMovies",
    ()=>getDiscoverMovies,
    "getDiscoverTV",
    ()=>getDiscoverTV,
    "getImageUrl",
    ()=>getImageUrl,
    "getMovieAlternativeTitles",
    ()=>getMovieAlternativeTitles,
    "getMovieCertifications",
    ()=>getMovieCertifications,
    "getMovieDetails",
    ()=>getMovieDetails,
    "getMovieGenres",
    ()=>getMovieGenres,
    "getMovieKeywords",
    ()=>getMovieKeywords,
    "getMovieRecommendations",
    ()=>getMovieRecommendations,
    "getMovieReviews",
    ()=>getMovieReviews,
    "getMovieVideos",
    ()=>getMovieVideos,
    "getNowPlayingMovies",
    ()=>getNowPlayingMovies,
    "getPersonCombinedCredits",
    ()=>getPersonCombinedCredits,
    "getPersonDetails",
    ()=>getPersonDetails,
    "getPersonExternalIds",
    ()=>getPersonExternalIds,
    "getPersonMovieCredits",
    ()=>getPersonMovieCredits,
    "getPersonTVCredits",
    ()=>getPersonTVCredits,
    "getPopularMovies",
    ()=>getPopularMovies,
    "getPopularTV",
    ()=>getPopularTV,
    "getPosterUrl",
    ()=>getPosterUrl,
    "getTVAlternativeTitles",
    ()=>getTVAlternativeTitles,
    "getTVContentRatings",
    ()=>getTVContentRatings,
    "getTVDetails",
    ()=>getTVDetails,
    "getTVEpisodeDetails",
    ()=>getTVEpisodeDetails,
    "getTVGenres",
    ()=>getTVGenres,
    "getTVKeywords",
    ()=>getTVKeywords,
    "getTVRecommendations",
    ()=>getTVRecommendations,
    "getTVReviews",
    ()=>getTVReviews,
    "getTVSeasonDetails",
    ()=>getTVSeasonDetails,
    "getTVVideos",
    ()=>getTVVideos,
    "getTopRatedMovies",
    ()=>getTopRatedMovies,
    "getTopRatedTV",
    ()=>getTopRatedTV,
    "getTrendingMovies",
    ()=>getTrendingMovies,
    "getTrendingTV",
    ()=>getTrendingTV,
    "getUpcomingMovies",
    ()=>getUpcomingMovies,
    "getWatchProviders",
    ()=>getWatchProviders,
    "searchMovies",
    ()=>searchMovies
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/axios/lib/axios.js [app-ssr] (ecmascript)");
;
// Constants
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
// Cached API Key
let cachedTmdbKey = null;
// Helper to get API key (Priority: NEXT_PUBLIC, VITE, Process Env)
const getApiKey = ()=>{
    if (typeof process !== 'undefined' && process.env) {
        return ("TURBOPACK compile-time value", "1724edd7d92e318e2935618c376fe22d") || process.env.VITE_TMDB_API_KEY;
    }
    return null;
};
// Create Axios Instance
const api = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].create({
    baseURL: TMDB_BASE_URL,
    params: {
        language: "en-US"
    }
});
// Request Interceptor to add API Key
api.interceptors.request.use((config)=>{
    const apiKey = getApiKey();
    if (apiKey && apiKey !== 'your_tmdb_api_key_here') {
        config.params = {
            ...config.params,
            api_key: apiKey
        };
    }
    return config;
});
// Robust Error Handling Wrapper
const fetchFromApi = async (endpoint, params = {})=>{
    try {
        const apiKey = getApiKey();
        if (!apiKey || apiKey === 'your_tmdb_api_key_here') {
            console.warn(`[TMDB] Missing API Key. Returning mock for ${endpoint}`);
            return null;
        }
        const { data } = await api.get(endpoint, {
            params
        });
        return data;
    } catch (error) {
        console.error(`[TMDB] Error fetching ${endpoint}:`, error.message);
        return null; // Return null to trigger fallback in components
    }
};
const getTrendingMovies = (timeWindow = "day")=>fetchFromApi(`/trending/movie/${timeWindow}`);
const getPopularMovies = (page = 1)=>fetchFromApi("/movie/popular", {
        page
    });
const getNowPlayingMovies = (page = 1)=>fetchFromApi("/movie/now_playing", {
        page
    });
const getUpcomingMovies = (page = 1)=>fetchFromApi("/movie/upcoming", {
        page
    });
const getTopRatedMovies = (page = 1)=>fetchFromApi("/movie/top_rated", {
        page
    });
const getMovieDetails = (id)=>fetchFromApi(`/movie/${id}`, {
        append_to_response: "videos,credits,similar,images,reviews,keywords,alternative_titles,release_dates"
    });
const searchMovies = (query, page = 1)=>fetchFromApi("/search/movie", {
        query,
        page
    });
const getMovieGenres = ()=>fetchFromApi("/genre/movie/list");
const getDiscoverMovies = (filters = {}, page = 1)=>fetchFromApi("/discover/movie", {
        ...filters,
        page
    });
const getDiscoverTV = (filters = {}, page = 1)=>fetchFromApi("/discover/tv", {
        ...filters,
        page
    });
const getTVDetails = (id)=>fetchFromApi(`/tv/${id}`, {
        append_to_response: "videos,credits,similar,images,reviews,keywords,alternative_titles,content_ratings,aggregate_credits"
    });
const getWatchProviders = (id, type = 'movie')=>fetchFromApi(`/${type}/${id}/watch/providers`);
const getTVGenres = ()=>fetchFromApi("/genre/tv/list");
const getTrendingTV = (timeWindow = "day")=>fetchFromApi(`/trending/tv/${timeWindow}`);
const getPopularTV = (page = 1)=>fetchFromApi("/tv/popular", {
        page
    });
const getTopRatedTV = (page = 1)=>fetchFromApi("/tv/top_rated", {
        page
    });
const getPersonDetails = (id)=>fetchFromApi(`/person/${id}`, {
        append_to_response: "movie_credits,tv_credits,images"
    });
const getMovieRecommendations = (id, page = 1)=>fetchFromApi(`/movie/${id}/recommendations`, {
        page
    });
const getTVRecommendations = (id, page = 1)=>fetchFromApi(`/tv/${id}/recommendations`, {
        page
    });
const getMovieVideos = (id)=>fetchFromApi(`/movie/${id}/videos`);
const getTVVideos = (id)=>fetchFromApi(`/tv/${id}/videos`);
const getMovieKeywords = (id)=>fetchFromApi(`/movie/${id}/keywords`);
const getTVKeywords = (id)=>fetchFromApi(`/tv/${id}/keywords`);
const getMovieReviews = (id, page = 1)=>fetchFromApi(`/movie/${id}/reviews`, {
        page
    });
const getTVReviews = (id, page = 1)=>fetchFromApi(`/tv/${id}/reviews`, {
        page
    });
const getCollection = (id)=>fetchFromApi(`/collection/${id}`);
const getTVSeasonDetails = (tvId, seasonNumber)=>fetchFromApi(`/tv/${tvId}/season/${seasonNumber}`);
const getTVEpisodeDetails = (tvId, seasonNumber, episodeNumber)=>fetchFromApi(`/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`);
const getMovieAlternativeTitles = (id)=>fetchFromApi(`/movie/${id}/alternative_titles`);
const getTVAlternativeTitles = (id)=>fetchFromApi(`/tv/${id}/alternative_titles`);
const getMovieCertifications = (id)=>fetchFromApi(`/movie/${id}/release_dates`);
const getTVContentRatings = (id)=>fetchFromApi(`/tv/${id}/content_ratings`);
const getPersonMovieCredits = (id)=>fetchFromApi(`/person/${id}/movie_credits`);
const getPersonTVCredits = (id)=>fetchFromApi(`/person/${id}/tv_credits`);
const getPersonCombinedCredits = (id)=>fetchFromApi(`/person/${id}/combined_credits`);
const getPersonExternalIds = (id)=>fetchFromApi(`/person/${id}/external_ids`);
const getImageUrl = (path, size = "original")=>{
    if (!path) return null;
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};
const getBackdropUrl = (path)=>getImageUrl(path, "original");
const getPosterUrl = (path, size = "w500")=>getImageUrl(path, size);
}),
"[project]/src/components/Navbar.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Navbar",
    ()=>Navbar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-ssr] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user.js [app-ssr] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$nextjs$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@clerk/nextjs/dist/esm/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2f$tmdb$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/api/tmdb.js [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
;
;
const NAV_LINKS = [
    {
        name: "Movies",
        href: "/movies"
    },
    {
        name: "TV Shows",
        href: "/tv"
    },
    {
        name: "Discover",
        href: "/discover"
    },
    {
        name: "Lists",
        href: "/lists"
    }
];
function Navbar() {
    const [isScrolled, setIsScrolled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showSearch, setShowSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [searchQuery, setSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [suggestions, setSuggestions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [hideNavbar, setHideNavbar] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const wrapperRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const lastScrollY = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    // Check if we're on a detail page
    const isDetailPage = pathname?.startsWith("/movie/") || pathname?.startsWith("/tv/");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handleScroll = ()=>{
            const currentScrollY = window.scrollY;
            if (isDetailPage) {
                // On detail pages: hide navbar at top, show when scrolling
                if (currentScrollY < 100) {
                    setHideNavbar(true);
                    setIsScrolled(false);
                } else {
                    setHideNavbar(false);
                    setIsScrolled(true);
                }
            } else {
                // On other pages: normal behavior
                setHideNavbar(false);
                setIsScrolled(currentScrollY > 0);
            }
            lastScrollY.current = currentScrollY;
        };
        handleScroll(); // Run on mount
        window.addEventListener("scroll", handleScroll);
        return ()=>window.removeEventListener("scroll", handleScroll);
    }, [
        isDetailPage
    ]);
    // Fetch suggestions when query changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const fetchSuggestions = async ()=>{
            if (searchQuery.length > 2) {
                const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2f$tmdb$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["searchMovies"])(searchQuery);
                if (data?.results) {
                    setSuggestions(data.results.slice(0, 5));
                }
            } else {
                setSuggestions([]);
            }
        };
        const timeoutId = setTimeout(fetchSuggestions, 300); // Debounce
        return ()=>clearTimeout(timeoutId);
    }, [
        searchQuery
    ]);
    // Close on click outside
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setSuggestions([]);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return ()=>document.removeEventListener("mousedown", handleClickOutside);
    }, [
        wrapperRef
    ]);
    const handleSearchCheck = (e)=>{
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
            setShowSearch(false);
            setSuggestions([]);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("fixed left-0 right-0 z-40 transition-all duration-500", hideNavbar ? "-top-32" : "top-0", isScrolled ? "bg-black/95 backdrop-blur-2xl shadow-2xl shadow-black/50" : "bg-gradient-to-b from-black via-black/80 to-transparent"),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "border-b border-white/10",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "container mx-auto px-4 sm:px-6 lg:px-20",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between h-16 sm:h-20",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/",
                                className: "flex items-center gap-3 relative z-50 group",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                src: "/movie.png",
                                                alt: "TheMovie Logo",
                                                width: 48,
                                                height: 48,
                                                className: "w-10 h-10 sm:w-12 sm:h-12 object-contain transition-transform group-hover:scale-110"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Navbar.tsx",
                                                lineNumber: 116,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "absolute inset-0 bg-accent-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Navbar.tsx",
                                                lineNumber: 123,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/Navbar.tsx",
                                        lineNumber: 115,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-display font-bold text-xl sm:text-3xl tracking-tight text-white",
                                        children: [
                                            "The",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-accent-primary",
                                                children: "Movie"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Navbar.tsx",
                                                lineNumber: 126,
                                                columnNumber: 36
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/Navbar.tsx",
                                        lineNumber: 125,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/Navbar.tsx",
                                lineNumber: 114,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "hidden lg:flex items-center gap-1 absolute left-1/2 transform -translate-x-1/2",
                                children: NAV_LINKS.map((link)=>{
                                    const isActive = pathname === link.href;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        href: link.href,
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("relative px-5 py-2 text-sm font-semibold transition-all duration-300 rounded-lg group", isActive ? "text-white bg-white/10" : "text-text-secondary hover:text-white hover:bg-white/5"),
                                        children: [
                                            link.name,
                                            isActive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                                layoutId: "activeNav",
                                                className: "absolute bottom-0 left-2 right-2 h-0.5 bg-accent-primary rounded-full",
                                                transition: {
                                                    type: "spring",
                                                    bounce: 0.2,
                                                    duration: 0.6
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Navbar.tsx",
                                                lineNumber: 147,
                                                columnNumber: 45
                                            }, this)
                                        ]
                                    }, link.name, true, {
                                        fileName: "[project]/src/components/Navbar.tsx",
                                        lineNumber: 135,
                                        columnNumber: 37
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/src/components/Navbar.tsx",
                                lineNumber: 131,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        ref: wrapperRef,
                                        className: "relative flex items-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                                children: showSearch && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].form, {
                                                    initial: {
                                                        width: 0,
                                                        opacity: 0
                                                    },
                                                    animate: {
                                                        width: window.innerWidth < 640 ? 200 : 280,
                                                        opacity: 1
                                                    },
                                                    exit: {
                                                        width: 0,
                                                        opacity: 0
                                                    },
                                                    onSubmit: handleSearchCheck,
                                                    className: "overflow-visible mr-2 relative",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "text",
                                                            placeholder: "Search movies, shows...",
                                                            className: "w-full bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-accent-primary focus:bg-white/15 transition-all",
                                                            autoFocus: true,
                                                            value: searchQuery,
                                                            onChange: (e)=>setSearchQuery(e.target.value)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/Navbar.tsx",
                                                            lineNumber: 171,
                                                            columnNumber: 45
                                                        }, this),
                                                        suggestions.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                                            initial: {
                                                                opacity: 0,
                                                                y: -10
                                                            },
                                                            animate: {
                                                                opacity: 1,
                                                                y: 0
                                                            },
                                                            className: "absolute top-full text-start left-0 sm:left-auto sm:right-0 w-[90vw] sm:w-96 mt-2 bg-bg-card/95 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-2xl z-50 max-h-[60vh] overflow-y-auto",
                                                            children: suggestions.map((movie)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                                    href: `/movie/${movie.id}`,
                                                                    onClick: ()=>{
                                                                        setShowSearch(false);
                                                                        setSuggestions([]);
                                                                        setSearchQuery("");
                                                                    },
                                                                    className: "flex items-start gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-white/10 transition-all border-b border-white/5 last:border-0 group",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "w-12 h-16 sm:w-14 sm:h-20 relative bg-neutral-800 rounded-lg overflow-hidden shrink-0 ring-2 ring-white/0 group-hover:ring-white/20 transition-all",
                                                                            children: movie.poster_path && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                                                src: `https://image.tmdb.org/t/p/w92${movie.poster_path}`,
                                                                                alt: movie.title,
                                                                                fill: true,
                                                                                className: "object-cover"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/components/Navbar.tsx",
                                                                                lineNumber: 199,
                                                                                columnNumber: 69
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/Navbar.tsx",
                                                                            lineNumber: 197,
                                                                            columnNumber: 61
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "flex-1 min-w-0",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                    className: "text-sm font-bold text-white leading-tight mb-1 line-clamp-2 group-hover:text-accent-primary transition-colors",
                                                                                    children: movie.title
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/Navbar.tsx",
                                                                                    lineNumber: 208,
                                                                                    columnNumber: 65
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                    className: "text-xs text-text-muted",
                                                                                    children: movie.release_date?.split("-")[0]
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/Navbar.tsx",
                                                                                    lineNumber: 209,
                                                                                    columnNumber: 65
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "flex items-center gap-2 mt-1",
                                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "text-xs text-yellow-500",
                                                                                        children: [
                                                                                            "★ ",
                                                                                            movie.vote_average?.toFixed(1)
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/src/components/Navbar.tsx",
                                                                                        lineNumber: 211,
                                                                                        columnNumber: 69
                                                                                    }, this)
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/Navbar.tsx",
                                                                                    lineNumber: 210,
                                                                                    columnNumber: 65
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/Navbar.tsx",
                                                                            lineNumber: 207,
                                                                            columnNumber: 61
                                                                        }, this)
                                                                    ]
                                                                }, movie.id, true, {
                                                                    fileName: "[project]/src/components/Navbar.tsx",
                                                                    lineNumber: 187,
                                                                    columnNumber: 57
                                                                }, this))
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/Navbar.tsx",
                                                            lineNumber: 181,
                                                            columnNumber: 49
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/Navbar.tsx",
                                                    lineNumber: 164,
                                                    columnNumber: 41
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Navbar.tsx",
                                                lineNumber: 162,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setShowSearch(!showSearch),
                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("p-2.5 rounded-full transition-all", showSearch ? "bg-accent-primary text-white" : "bg-white/5 text-text-secondary hover:text-white hover:bg-white/10"),
                                                children: showSearch ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                    size: 20
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/Navbar.tsx",
                                                    lineNumber: 230,
                                                    columnNumber: 51
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                                    size: 20
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/Navbar.tsx",
                                                    lineNumber: 230,
                                                    columnNumber: 69
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Navbar.tsx",
                                                lineNumber: 221,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/Navbar.tsx",
                                        lineNumber: 161,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$nextjs$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["SignedIn"], {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            href: "/profile",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: "p-2.5 rounded-full bg-white/5 text-text-secondary hover:text-white hover:bg-white/10 transition-all",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                                                    size: 20
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/Navbar.tsx",
                                                    lineNumber: 237,
                                                    columnNumber: 41
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Navbar.tsx",
                                                lineNumber: 236,
                                                columnNumber: 37
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/Navbar.tsx",
                                            lineNumber: 235,
                                            columnNumber: 33
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Navbar.tsx",
                                        lineNumber: 234,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$nextjs$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["SignedOut"], {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            href: "/sign-in",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: "px-4 py-2 rounded-full bg-accent-primary hover:bg-accent-primary/90 text-white text-sm font-bold transition-all shadow-lg shadow-accent-primary/20",
                                                children: "Sign In"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Navbar.tsx",
                                                lineNumber: 243,
                                                columnNumber: 37
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/Navbar.tsx",
                                            lineNumber: 242,
                                            columnNumber: 33
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Navbar.tsx",
                                        lineNumber: 241,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/Navbar.tsx",
                                lineNumber: 159,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Navbar.tsx",
                        lineNumber: 112,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/Navbar.tsx",
                    lineNumber: 111,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/Navbar.tsx",
                lineNumber: 110,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "lg:hidden bg-black/50 backdrop-blur-xl border-b border-white/10",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "container mx-auto px-4 sm:px-6",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-around py-3",
                        children: NAV_LINKS.map((link)=>{
                            const isActive = pathname === link.href;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: link.href,
                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("relative text-xs font-semibold transition-all px-3 py-2 rounded-lg", isActive ? "text-white bg-white/10" : "text-text-secondary hover:text-white"),
                                children: [
                                    link.name,
                                    isActive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                        layoutId: "activeMobileNav",
                                        className: "absolute bottom-0 left-2 right-2 h-0.5 bg-accent-primary rounded-full",
                                        transition: {
                                            type: "spring",
                                            bounce: 0.2,
                                            duration: 0.6
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Navbar.tsx",
                                        lineNumber: 272,
                                        columnNumber: 41
                                    }, this)
                                ]
                            }, link.name, true, {
                                fileName: "[project]/src/components/Navbar.tsx",
                                lineNumber: 260,
                                columnNumber: 33
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/src/components/Navbar.tsx",
                        lineNumber: 256,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/Navbar.tsx",
                    lineNumber: 255,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/Navbar.tsx",
                lineNumber: 254,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Navbar.tsx",
        lineNumber: 100,
        columnNumber: 9
    }, this);
}
}),
"[project]/src/lib/queryClient.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "queryClient",
    ()=>queryClient,
    "queryKeys",
    ()=>queryKeys
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/query-core/build/modern/queryClient.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-ssr] (ecmascript)");
;
const queryClient = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["QueryClient"]({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 30,
            refetchOnWindowFocus: false,
            retry: 2,
            retryDelay: (attemptIndex)=>Math.min(1000 * 2 ** attemptIndex, 30000)
        }
    }
});
;
const queryKeys = {
    movies: {
        all: [
            "movies"
        ],
        popular: (page)=>[
                "movies",
                "popular",
                page
            ],
        trending: (timeWindow, page)=>[
                "movies",
                "trending",
                timeWindow,
                page
            ],
        nowPlaying: (page)=>[
                "movies",
                "nowPlaying",
                page
            ],
        upcoming: (page)=>[
                "movies",
                "upcoming",
                page
            ],
        topRated: (page)=>[
                "movies",
                "topRated",
                page
            ],
        search: (query, page)=>[
                "movies",
                "search",
                query,
                page
            ],
        discover: (filters)=>[
                "movies",
                "discover",
                filters
            ],
        details: (id)=>[
                "movies",
                "details",
                id
            ],
        similar: (id, page)=>[
                "movies",
                "similar",
                id,
                page
            ],
        reviews: (id, page)=>[
                "movies",
                "reviews",
                id,
                page
            ],
        trailer: (id)=>[
                "movies",
                "trailer",
                id
            ]
    },
    collections: {
        all: [
            "collections"
        ],
        details: (id)=>[
                "collections",
                id
            ]
    },
    genres: [
        "genres"
    ],
    era: (era, page)=>[
            "era",
            era,
            page
        ],
    awards: (category, page)=>[
            "awards",
            category,
            page
        ]
};
}),
"[project]/src/context/watchlist-context.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WatchlistContext",
    ()=>WatchlistContext,
    "useWatchlist",
    ()=>useWatchlist
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
;
const WatchlistContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(null);
function useWatchlist() {
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(WatchlistContext);
    if (!ctx) {
        return {
            items: [],
            movies: [],
            tvShows: [],
            count: 0,
            add: ()=>console.warn('Watchlist context not available'),
            remove: ()=>console.warn('Watchlist context not available'),
            toggle: ()=>console.warn('Watchlist context not available'),
            has: ()=>false
        };
    }
    return ctx;
}
}),
"[project]/src/context/WatchlistContext.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WatchlistProvider",
    ()=>WatchlistProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$runtime$2f$react$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@clerk/shared/dist/runtime/react/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$watchlist$2d$context$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/watchlist-context.js [app-ssr] (ecmascript)");
"use client";
;
;
;
;
const STORAGE_KEY = "movie_catalogue_watchlist_v1";
function WatchlistProvider({ children }) {
    const { user, isSignedIn, isLoaded } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$runtime$2f$react$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useUser"])();
    const [items, setItems] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!isLoaded) return;
        if (isSignedIn && user) {
            const userWatchlist = user.unsafeMetadata?.watchlist || [];
            const migratedItems = userWatchlist.map((item)=>{
                if (item.type) return item; // Already has type
                const isTv = item.name && !item.title || item.image?.medium || item.premiered;
                return {
                    ...item,
                    type: isTv ? 'tv' : 'movie'
                };
            });
            console.log('Loaded watchlist items (migrated):', migratedItems); // Debug
            setItems(migratedItems);
        } else {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                const storedItems = raw ? JSON.parse(raw) : [];
                const migratedItems = storedItems.map((item)=>{
                    if (item.type) return item; // Already has type
                    const isTv = item.name && !item.title || item.image?.medium || item.premiered;
                    return {
                        ...item,
                        type: isTv ? 'tv' : 'movie'
                    };
                });
                console.log('Loaded watchlist items from localStorage (migrated):', migratedItems); // Debug
                setItems(migratedItems);
            } catch  {
                setItems([]);
            }
        }
    }, [
        isSignedIn,
        user,
        isLoaded
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!isLoaded) return;
        if (isSignedIn && user) {
            user.update({
                unsafeMetadata: {
                    ...user.unsafeMetadata,
                    watchlist: items
                }
            }).catch((err)=>{
                console.error("Failed to save watchlist:", err);
                // Fallback to localStorage on Clerk API errors (e.g., 429 rate limit)
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
                } catch (e) {
                    console.error("Failed to save to localStorage:", e);
                }
            });
        } else {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
            } catch  {}
        }
    }, [
        items,
        isSignedIn,
        user,
        isLoaded
    ]);
    const add = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((item)=>{
        // Minify for 8KB limit
        const minItem = {
            id: item.id,
            title: item.title || item.name,
            poster_path: item.poster_path,
            vote_average: item.vote_average,
            release_date: item.release_date || item.first_air_date,
            type: item.type || (item.name ? 'tv' : 'movie')
        };
        setItems((prev)=>prev.find((m)=>m.id === item.id && m.type === minItem.type) ? prev : [
                minItem,
                ...prev
            ]);
    }, []);
    const remove = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((id, type = 'movie')=>setItems((prev)=>prev.filter((m)=>!(m.id === id && m.type === type))), []);
    const toggle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((item)=>{
        // Minify for 8KB limit
        const minItem = {
            id: item.id,
            title: item.title || item.name,
            poster_path: item.poster_path,
            vote_average: item.vote_average,
            release_date: item.release_date || item.first_air_date,
            type: item.type || (item.name ? 'tv' : 'movie')
        };
        setItems((prev)=>prev.find((m)=>m.id === item.id && m.type === minItem.type) ? prev.filter((m)=>!(m.id === item.id && m.type === minItem.type)) : [
                minItem,
                ...prev
            ]);
    }, []);
    const has = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((id, type = 'movie')=>items.some((m)=>m.id === id && m.type === type), [
        items
    ]);
    const movies = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>items.filter((i)=>i.type === 'movie' || !i.type), [
        items
    ]);
    const tvShows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>items.filter((i)=>i.type === 'tv'), [
        items
    ]);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            items,
            movies,
            tvShows,
            add,
            remove,
            toggle,
            has,
            count: items.length
        }), [
        items,
        movies,
        tvShows,
        add,
        remove,
        toggle,
        has
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$watchlist$2d$context$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WatchlistContext"].Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/WatchlistContext.jsx",
        lineNumber: 115,
        columnNumber: 10
    }, this);
}
}),
"[project]/src/context/WatchedContext.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WatchedContext",
    ()=>WatchedContext,
    "WatchedProvider",
    ()=>WatchedProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$runtime$2f$react$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@clerk/shared/dist/runtime/react/index.mjs [app-ssr] (ecmascript)");
"use client";
;
;
;
const WatchedContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])();
const STORAGE_KEY = "movie_catalogue_watched_v1";
function WatchedProvider({ children }) {
    const { user, isSignedIn, isLoaded } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$runtime$2f$react$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useUser"])();
    const [watched, setWatched] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    // Load
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!isLoaded) return;
        if (isSignedIn && user) {
            const userWatched = user.unsafeMetadata?.watched || [];
            setWatched(userWatched);
        } else {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                setWatched(raw ? JSON.parse(raw) : []);
            } catch  {
                setWatched([]);
            }
        }
    }, [
        isSignedIn,
        user,
        isLoaded
    ]);
    // Save
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!isLoaded) return;
        if (isSignedIn && user) {
            user.update({
                unsafeMetadata: {
                    ...user.unsafeMetadata,
                    watched: watched
                }
            }).catch((err)=>{
                console.error("Failed to save watched:", err);
                // Fallback to localStorage on Clerk API errors (e.g., 429 rate limit)
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(watched));
                } catch (e) {
                    console.error("Failed to save to localStorage:", e);
                }
            });
        } else {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(watched));
        }
    }, [
        watched,
        isSignedIn,
        user,
        isLoaded
    ]);
    const addWatched = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((item)=>{
        // Minify the item to save space (Clerk has 8k limit)
        const minItem = {
            id: item.id,
            title: item.title || item.name,
            poster_path: item.poster_path,
            vote_average: item.vote_average,
            release_date: item.release_date || item.first_air_date,
            type: item.name ? 'tv' : 'movie'
        };
        setWatched((prev)=>prev.find((m)=>m.id === item.id) ? prev : [
                minItem,
                ...prev
            ]);
    }, []);
    const removeWatched = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((id)=>setWatched((prev)=>prev.filter((m)=>m.id !== id)), []);
    const hasWatched = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((id)=>watched.some((m)=>m.id === id), [
        watched
    ]);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            watched,
            addWatched,
            removeWatched,
            hasWatched
        }), [
        watched,
        addWatched,
        removeWatched,
        hasWatched
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(WatchedContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/WatchedContext.jsx",
        lineNumber: 73,
        columnNumber: 10
    }, this);
}
}),
"[project]/src/context/ReviewContext.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ReviewContext",
    ()=>ReviewContext,
    "ReviewProvider",
    ()=>ReviewProvider,
    "useReviews",
    ()=>useReviews
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$runtime$2f$react$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@clerk/shared/dist/runtime/react/index.mjs [app-ssr] (ecmascript)");
;
;
;
const ReviewContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])();
function ReviewProvider({ children }) {
    const { user, isSignedIn } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$runtime$2f$react$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useUser"])();
    const [reviews, setReviews] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    // Load reviews from user metadata or localStorage
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const loadReviews = async ()=>{
            try {
                if (isSignedIn && user) {
                    const savedReviews = user.unsafeMetadata?.reviews;
                    if (savedReviews) {
                        setReviews(savedReviews);
                    }
                } else {
                    const localReviews = localStorage.getItem("userReviews");
                    if (localReviews) {
                        setReviews(JSON.parse(localReviews));
                    }
                }
            } catch (error) {
                console.error("Failed to load reviews:", error);
            } finally{
                setLoading(false);
            }
        };
        loadReviews();
    }, [
        user,
        isSignedIn
    ]);
    // Save reviews
    const saveReviews = async (newReviews)=>{
        try {
            if (isSignedIn && user) {
                await user.update({
                    unsafeMetadata: {
                        ...user.unsafeMetadata,
                        reviews: newReviews
                    }
                });
            } else {
                localStorage.setItem("userReviews", JSON.stringify(newReviews));
            }
        } catch (error) {
            console.error("Failed to save reviews:", error);
        }
    };
    // Add a review
    const addReview = async (movieId, movieTitle, poster, rating, content)=>{
        const newReview = {
            id: `${movieId}-${Date.now()}`,
            movieId,
            movieTitle,
            poster,
            rating,
            content,
            createdAt: new Date().toISOString()
        };
        const updatedReviews = [
            newReview,
            ...reviews
        ];
        setReviews(updatedReviews);
        await saveReviews(updatedReviews);
        return newReview;
    };
    // Update a review
    const updateReview = async (reviewId, updates)=>{
        const updatedReviews = reviews.map((r)=>r.id === reviewId ? {
                ...r,
                ...updates,
                updatedAt: new Date().toISOString()
            } : r);
        setReviews(updatedReviews);
        await saveReviews(updatedReviews);
    };
    // Delete a review
    const deleteReview = async (reviewId)=>{
        const updatedReviews = reviews.filter((r)=>r.id !== reviewId);
        setReviews(updatedReviews);
        await saveReviews(updatedReviews);
    };
    // Get review for a specific movie
    const getReviewForMovie = (movieId)=>{
        return reviews.find((r)=>r.movieId === String(movieId));
    };
    // Get average rating
    const getAverageRating = ()=>{
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, r)=>acc + (r.rating || 0), 0);
        return sum / reviews.length;
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ReviewContext.Provider, {
        value: {
            reviews,
            loading,
            addReview,
            updateReview,
            deleteReview,
            getReviewForMovie,
            getAverageRating
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/ReviewContext.jsx",
        lineNumber: 100,
        columnNumber: 9
    }, this);
}
function useReviews() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(ReviewContext);
    if (!context) {
        return {
            reviews: [],
            loading: false,
            addReview: async ()=>{},
            updateReview: async ()=>{},
            deleteReview: async ()=>{},
            getReviewForMovie: ()=>null,
            getAverageRating: ()=>0
        };
    }
    return context;
}
;
}),
"[project]/src/context/ListsContext.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ListsProvider",
    ()=>ListsProvider,
    "useLists",
    ()=>useLists
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$runtime$2f$react$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@clerk/shared/dist/runtime/react/index.mjs [app-ssr] (ecmascript)");
;
;
;
;
const ListsContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])();
// Default pre-made lists
const DEFAULT_LISTS = [
    {
        id: "favorites",
        name: "My Favorites",
        icon: "Heart",
        isDefault: true,
        movies: []
    },
    {
        id: "to-rewatch",
        name: "Want to Rewatch",
        icon: "RotateCcw",
        isDefault: true,
        movies: []
    }
];
function ListsProvider({ children }) {
    const { user, isSignedIn } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$runtime$2f$react$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useUser"])();
    const [lists, setLists] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(DEFAULT_LISTS);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    // Load lists from user metadata or localStorage
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const loadLists = async ()=>{
            try {
                if (isSignedIn && user) {
                    const savedLists = user.unsafeMetadata?.customLists;
                    if (savedLists && savedLists.length > 0) {
                        setLists(savedLists);
                    }
                } else {
                    const localLists = localStorage.getItem("customLists");
                    if (localLists) {
                        setLists(JSON.parse(localLists));
                    }
                }
            } catch (error) {
                console.error("Failed to load lists:", error);
            } finally{
                setLoading(false);
            }
        };
        loadLists();
    }, [
        user,
        isSignedIn
    ]);
    // Save lists
    const saveLists = async (newLists)=>{
        try {
            if (isSignedIn && user) {
                await user.update({
                    unsafeMetadata: {
                        ...user.unsafeMetadata,
                        customLists: newLists
                    }
                });
            } else {
                localStorage.setItem("customLists", JSON.stringify(newLists));
            }
        } catch (error) {
            console.error("Failed to save lists:", error);
        }
    };
    // Create a new list
    const createList = async (name, icon = "List")=>{
        const newList = {
            id: `list-${Date.now()}`,
            name,
            icon,
            isDefault: false,
            movies: [],
            createdAt: new Date().toISOString(),
            isPublic: false
        };
        const updatedLists = [
            ...lists,
            newList
        ];
        setLists(updatedLists);
        await saveLists(updatedLists);
        return newList;
    };
    // Delete a list
    const deleteList = async (listId)=>{
        const list = lists.find((l)=>l.id === listId);
        if (list?.isDefault) return; // Can't delete default lists
        const updatedLists = lists.filter((l)=>l.id !== listId);
        setLists(updatedLists);
        await saveLists(updatedLists);
    };
    // Rename a list
    const renameList = async (listId, newName)=>{
        const updatedLists = lists.map((l)=>l.id === listId ? {
                ...l,
                name: newName
            } : l);
        setLists(updatedLists);
        await saveLists(updatedLists);
    };
    // Toggle list public/private
    const toggleListPublic = async (listId)=>{
        const updatedLists = lists.map((l)=>l.id === listId ? {
                ...l,
                isPublic: !l.isPublic
            } : l);
        setLists(updatedLists);
        await saveLists(updatedLists);
    };
    // Add movie to list
    const addToList = async (listId, movie)=>{
        const updatedLists = lists.map((l)=>{
            if (l.id !== listId) return l;
            if (l.movies.some((m)=>m.id === movie.id)) return l;
            return {
                ...l,
                movies: [
                    ...l.movies,
                    movie
                ]
            };
        });
        setLists(updatedLists);
        await saveLists(updatedLists);
    };
    // Remove movie from list
    const removeFromList = async (listId, movieId)=>{
        const updatedLists = lists.map((l)=>{
            if (l.id !== listId) return l;
            return {
                ...l,
                movies: l.movies.filter((m)=>m.id !== movieId)
            };
        });
        setLists(updatedLists);
        await saveLists(updatedLists);
    };
    // Check if movie is in list
    const isInList = (listId, movieId)=>{
        const list = lists.find((l)=>l.id === listId);
        return list?.movies.some((m)=>m.id === movieId) || false;
    };
    // Get share link for public list
    const getShareLink = (listId)=>{
        const list = lists.find((l)=>l.id === listId);
        if (!list?.isPublic) return null;
        // This would need backend support for real sharing
        // For now, create a shareable data URL
        const data = btoa(JSON.stringify({
            name: list.name,
            movies: list.movies.map((m)=>m.id)
        }));
        return `${window.location.origin}/shared-list/${data}`;
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ListsContext.Provider, {
        value: {
            lists,
            loading,
            createList,
            deleteList,
            renameList,
            toggleListPublic,
            addToList,
            removeFromList,
            isInList,
            getShareLink
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/ListsContext.jsx",
        lineNumber: 144,
        columnNumber: 9
    }, this);
}
function useLists() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(ListsContext);
    if (!context) {
        throw new Error("useLists must be used within ListsProvider");
    }
    return context;
}
}),
"[project]/src/context/SocialContext.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SocialProvider",
    ()=>SocialProvider,
    "useSocial",
    ()=>useSocial
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$runtime$2f$react$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@clerk/shared/dist/runtime/react/index.mjs [app-ssr] (ecmascript)");
;
;
;
const SocialContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])();
function SocialProvider({ children }) {
    const { user, isSignedIn } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$runtime$2f$react$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useUser"])();
    const [following, setFollowing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [followers, setFollowers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [activityFeed, setActivityFeed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    // Load social data
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const loadSocialData = async ()=>{
            try {
                if (isSignedIn && user) {
                    const socialData = user.unsafeMetadata?.social || {};
                    setFollowing(socialData.following || []);
                    setFollowers(socialData.followers || []);
                    setActivityFeed(socialData.activityFeed || []);
                } else {
                    const local = localStorage.getItem("socialData");
                    if (local) {
                        const parsed = JSON.parse(local);
                        setFollowing(parsed.following || []);
                        setActivityFeed(parsed.activityFeed || []);
                    }
                }
            } catch (error) {
                console.error("Failed to load social data:", error);
            } finally{
                setLoading(false);
            }
        };
        loadSocialData();
    }, [
        user,
        isSignedIn
    ]);
    // Save social data
    const saveSocialData = async (data)=>{
        try {
            if (isSignedIn && user) {
                await user.update({
                    unsafeMetadata: {
                        ...user.unsafeMetadata,
                        social: data
                    }
                });
            } else {
                localStorage.setItem("socialData", JSON.stringify(data));
            }
        } catch (error) {
            console.error("Failed to save social data:", error);
        }
    };
    // Follow a user
    const followUser = async (targetUser)=>{
        if (following.some((f)=>f.id === targetUser.id)) return;
        const newFollowing = [
            ...following,
            {
                id: targetUser.id,
                username: targetUser.username || targetUser.firstName || "User",
                imageUrl: targetUser.imageUrl,
                followedAt: new Date().toISOString()
            }
        ];
        setFollowing(newFollowing);
        await saveSocialData({
            following: newFollowing,
            followers,
            activityFeed
        });
        // Add activity
        addActivity({
            type: "follow",
            targetUser: targetUser.username || targetUser.firstName,
            targetUserId: targetUser.id
        });
    };
    // Unfollow a user
    const unfollowUser = async (userId)=>{
        const newFollowing = following.filter((f)=>f.id !== userId);
        setFollowing(newFollowing);
        await saveSocialData({
            following: newFollowing,
            followers,
            activityFeed
        });
    };
    // Check if following
    const isFollowing = (userId)=>{
        return following.some((f)=>f.id === userId);
    };
    // Add activity
    const addActivity = async (activity)=>{
        const newActivity = {
            id: `activity-${Date.now()}`,
            userId: user?.id || "guest",
            username: user?.username || user?.firstName || "Guest",
            userImage: user?.imageUrl,
            timestamp: new Date().toISOString(),
            ...activity
        };
        const newFeed = [
            newActivity,
            ...activityFeed
        ].slice(0, 50); // Keep last 50
        setActivityFeed(newFeed);
        await saveSocialData({
            following,
            followers,
            activityFeed: newFeed
        });
    };
    // Get user profile data
    const getProfile = ()=>{
        if (!isSignedIn || !user) return null;
        return {
            id: user.id,
            username: user.username || user.firstName || "User",
            firstName: user.firstName,
            lastName: user.lastName,
            imageUrl: user.imageUrl,
            email: user.primaryEmailAddress?.emailAddress,
            createdAt: user.createdAt,
            followingCount: following.length,
            followersCount: followers.length
        };
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SocialContext.Provider, {
        value: {
            following,
            followers,
            activityFeed,
            loading,
            followUser,
            unfollowUser,
            isFollowing,
            addActivity,
            getProfile
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/SocialContext.jsx",
        lineNumber: 125,
        columnNumber: 9
    }, this);
}
function useSocial() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(SocialContext);
    if (!context) {
        throw new Error("useSocial must be used within SocialProvider");
    }
    return context;
}
}),
"[project]/src/context/RecentlyViewedContext.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RecentlyViewedContext",
    ()=>RecentlyViewedContext,
    "RecentlyViewedProvider",
    ()=>RecentlyViewedProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$runtime$2f$react$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@clerk/shared/dist/runtime/react/index.mjs [app-ssr] (ecmascript)");
"use client";
;
;
;
const RecentlyViewedContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])();
const STORAGE_KEY = "movie_catalogue_recently_viewed_v1";
const MAX_ITEMS = 50; // Keep last 50 viewed items
function RecentlyViewedProvider({ children }) {
    const { user, isSignedIn, isLoaded } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$runtime$2f$react$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useUser"])();
    const [recentlyViewed, setRecentlyViewed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    // Load from storage
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!isLoaded) return;
        if (isSignedIn && user) {
            const userRecent = user.unsafeMetadata?.recentlyViewed || [];
            setRecentlyViewed(userRecent);
        } else {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                setRecentlyViewed(raw ? JSON.parse(raw) : []);
            } catch  {
                setRecentlyViewed([]);
            }
        }
    }, [
        isSignedIn,
        user,
        isLoaded
    ]);
    // Save to storage
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!isLoaded) return;
        if (isSignedIn && user) {
            user.update({
                unsafeMetadata: {
                    ...user.unsafeMetadata,
                    recentlyViewed: recentlyViewed
                }
            }).catch((err)=>{
                console.warn("Failed to save recently viewed to Clerk, using localStorage fallback:", err.message || err);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(recentlyViewed));
            });
        } else {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(recentlyViewed));
        }
    }, [
        recentlyViewed,
        isSignedIn,
        user,
        isLoaded
    ]);
    const addToRecentlyViewed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((item)=>{
        setRecentlyViewed((prev)=>{
            // Remove if already exists
            const filtered = prev.filter((i)=>i.id !== item.id || i.type !== (item.type || 'movie'));
            // Add to beginning
            const minItem = {
                id: item.id,
                title: item.title || item.name,
                poster_path: item.poster_path,
                vote_average: item.vote_average,
                release_date: item.release_date || item.first_air_date,
                type: item.type || (item.name ? 'tv' : 'movie'),
                viewedAt: new Date().toISOString()
            };
            // Keep only last MAX_ITEMS
            return [
                minItem,
                ...filtered
            ].slice(0, MAX_ITEMS);
        });
    }, []);
    const clearRecentlyViewed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setRecentlyViewed([]);
    }, []);
    const removeFromRecentlyViewed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((id, type = 'movie')=>{
        setRecentlyViewed((prev)=>prev.filter((item)=>!(item.id === id && item.type === type)));
    }, []);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            recentlyViewed,
            addToRecentlyViewed,
            clearRecentlyViewed,
            removeFromRecentlyViewed
        }), [
        recentlyViewed,
        addToRecentlyViewed,
        clearRecentlyViewed,
        removeFromRecentlyViewed
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(RecentlyViewedContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/RecentlyViewedContext.jsx",
        lineNumber: 88,
        columnNumber: 9
    }, this);
}
}),
"[project]/src/components/Providers.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Providers",
    ()=>Providers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$queryClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/queryClient.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$WatchlistContext$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/WatchlistContext.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$WatchedContext$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/WatchedContext.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$ReviewContext$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/ReviewContext.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$ListsContext$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/ListsContext.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$SocialContext$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/SocialContext.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$RecentlyViewedContext$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/RecentlyViewedContext.jsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
;
function Providers({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["QueryClientProvider"], {
        client: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$queryClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["queryClient"],
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$WatchlistContext$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WatchlistProvider"], {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$WatchedContext$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WatchedProvider"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$RecentlyViewedContext$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RecentlyViewedProvider"], {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$ReviewContext$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReviewProvider"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$ListsContext$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ListsProvider"], {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$SocialContext$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SocialProvider"], {
                                children: children
                            }, void 0, false, {
                                fileName: "[project]/src/components/Providers.tsx",
                                lineNumber: 20,
                                columnNumber: 33
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/Providers.tsx",
                            lineNumber: 19,
                            columnNumber: 29
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/Providers.tsx",
                        lineNumber: 18,
                        columnNumber: 25
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/Providers.tsx",
                    lineNumber: 17,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/Providers.tsx",
                lineNumber: 16,
                columnNumber: 17
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/Providers.tsx",
            lineNumber: 15,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/Providers.tsx",
        lineNumber: 14,
        columnNumber: 9
    }, this);
}
}),
"[project]/src/context/TVWatchProgressContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TVWatchProgressContext",
    ()=>TVWatchProgressContext,
    "TVWatchProgressProvider",
    ()=>TVWatchProgressProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$runtime$2f$react$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@clerk/shared/dist/runtime/react/index.mjs [app-ssr] (ecmascript)");
"use client";
;
;
;
const TVWatchProgressContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(null);
const STORAGE_KEY = "tv_watch_progress_v1";
function TVWatchProgressProvider({ children }) {
    const { user, isSignedIn, isLoaded } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$runtime$2f$react$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useUser"])();
    const [progress, setProgress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    // Load from storage
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!isLoaded) return;
        if (isSignedIn && user) {
            const userProgress = user.unsafeMetadata?.tvProgress || {};
            setProgress(userProgress);
        } else {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                setProgress(raw ? JSON.parse(raw) : {});
            } catch  {
                setProgress({});
            }
        }
    }, [
        isSignedIn,
        user,
        isLoaded
    ]);
    // Save to storage
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!isLoaded) return;
        if (isSignedIn && user) {
            user.update({
                unsafeMetadata: {
                    ...user.unsafeMetadata,
                    tvProgress: progress
                }
            }).catch((err)=>{
                console.warn("Failed to save TV progress to Clerk, using localStorage:", err.message || err);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
            });
        } else {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
        }
    }, [
        progress,
        isSignedIn,
        user,
        isLoaded
    ]);
    const markEpisodeWatched = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((showId, season, episode)=>{
        setProgress((prev)=>({
                ...prev,
                [showId]: {
                    ...prev[showId] || {},
                    [season]: {
                        ...prev[showId]?.[season] || {},
                        [episode]: true
                    }
                }
            }));
    }, []);
    const unmarkEpisodeWatched = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((showId, season, episode)=>{
        setProgress((prev)=>{
            const newProgress = {
                ...prev
            };
            if (newProgress[showId]?.[season]) {
                delete newProgress[showId][season][episode];
                // Clean up empty objects
                if (Object.keys(newProgress[showId][season]).length === 0) {
                    delete newProgress[showId][season];
                }
                if (Object.keys(newProgress[showId]).length === 0) {
                    delete newProgress[showId];
                }
            }
            return newProgress;
        });
    }, []);
    const isEpisodeWatched = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((showId, season, episode)=>{
        return !!progress[showId]?.[season]?.[episode];
    }, [
        progress
    ]);
    const getShowProgress = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((showId, totalEpisodes)=>{
        const showProgress = progress[showId] || {};
        let watchedCount = 0;
        Object.values(showProgress).forEach((season)=>{
            watchedCount += Object.keys(season).length;
        });
        return {
            watched: watchedCount,
            total: totalEpisodes,
            percentage: totalEpisodes > 0 ? watchedCount / totalEpisodes * 100 : 0
        };
    }, [
        progress
    ]);
    const getSeasonProgress = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((showId, seasonNumber, totalEpisodes)=>{
        const seasonData = progress[showId]?.[seasonNumber] || {};
        const watchedCount = Object.keys(seasonData).length;
        return {
            watched: watchedCount,
            total: totalEpisodes,
            percentage: totalEpisodes > 0 ? watchedCount / totalEpisodes * 100 : 0
        };
    }, [
        progress
    ]);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            markEpisodeWatched,
            unmarkEpisodeWatched,
            isEpisodeWatched,
            getShowProgress,
            getSeasonProgress,
            progress
        }), [
        markEpisodeWatched,
        unmarkEpisodeWatched,
        isEpisodeWatched,
        getShowProgress,
        getSeasonProgress,
        progress
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(TVWatchProgressContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/TVWatchProgressContext.tsx",
        lineNumber: 119,
        columnNumber: 9
    }, this);
}
}),
"[project]/src/components/EasterEgg.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EasterEgg",
    ()=>EasterEgg
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-ssr] (ecmascript)");
;
"use client";
;
;
;
const Confetti = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(async ()=>{}, {
    loadableGenerated: {
        modules: [
            "[project]/node_modules/react-confetti/dist/react-confetti.mjs [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
function EasterEgg() {
    const [showConfetti, setShowConfetti] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [inputSequence, setInputSequence] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    // Konami Code: Up, Up, Down, Down, Left, Right, Left, Right, B, A
    const KONAMI_CODE = [
        'ArrowUp',
        'ArrowUp',
        'ArrowDown',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'ArrowLeft',
        'ArrowRight',
        'b',
        'a'
    ];
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handleKeyDown = (e)=>{
            const key = e.key;
            setInputSequence((prev)=>{
                const updated = [
                    ...prev,
                    key
                ];
                // Check if updated sequence matches the end of Konami Code
                if (updated.length > KONAMI_CODE.length) {
                    updated.shift();
                }
                if (JSON.stringify(updated) === JSON.stringify(KONAMI_CODE)) {
                    triggerEasterEgg();
                    return [];
                }
                return updated;
            });
        };
        window.addEventListener('keydown', handleKeyDown);
        return ()=>window.removeEventListener('keydown', handleKeyDown);
    }, []);
    const triggerEasterEgg = ()=>{
        setShowConfetti(true);
        // Play sound if you have one, or just confetti
        setTimeout(()=>setShowConfetti(false), 5000);
    };
    if (!showConfetti) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 pointer-events-none z-[100]",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Confetti, {
            width: window.innerWidth,
            height: window.innerHeight
        }, void 0, false, {
            fileName: "[project]/src/components/EasterEgg.tsx",
            lineNumber: 50,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/EasterEgg.tsx",
        lineNumber: 49,
        columnNumber: 9
    }, this);
}
}),
"[project]/src/components/ScrollToTop.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ScrollToTop",
    ()=>ScrollToTop
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-up.js [app-ssr] (ecmascript) <export default as ArrowUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-ssr] (ecmascript)");
"use client";
;
;
;
;
function ScrollToTop() {
    const [isVisible, setIsVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const toggleVisibility = ()=>{
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };
        window.addEventListener("scroll", toggleVisibility);
        return ()=>window.removeEventListener("scroll", toggleVisibility);
    }, []);
    const scrollToTop = ()=>{
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimatePresence"], {
        children: isVisible && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].button, {
            initial: {
                opacity: 0,
                y: 20
            },
            animate: {
                opacity: 1,
                y: 0
            },
            exit: {
                opacity: 0,
                y: 20
            },
            onClick: scrollToTop,
            className: "fixed bottom-20 right-4 sm:bottom-8 sm:right-8 z-50 p-3 sm:p-4 bg-accent-primary hover:bg-accent-primary/90 text-white rounded-full shadow-2xl shadow-accent-primary/30 transition-all hover:scale-110",
            "aria-label": "Scroll to top",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowUp$3e$__["ArrowUp"], {
                size: 20
            }, void 0, false, {
                fileName: "[project]/src/components/ScrollToTop.tsx",
                lineNumber: 42,
                columnNumber: 21
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/ScrollToTop.tsx",
            lineNumber: 34,
            columnNumber: 17
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/ScrollToTop.tsx",
        lineNumber: 32,
        columnNumber: 9
    }, this);
}
}),
"[project]/src/components/ProgressBar.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProgressBar",
    ()=>ProgressBar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nprogress$2f$nprogress$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/nprogress/nprogress.js [app-ssr] (ecmascript)");
"use client";
;
;
;
__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nprogress$2f$nprogress$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].configure({
    showSpinner: false,
    speed: 400,
    minimum: 0.08,
    trickleSpeed: 200
});
function ProgressBar() {
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSearchParams"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nprogress$2f$nprogress$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].done();
    }, [
        pathname,
        searchParams
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nprogress$2f$nprogress$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].start();
        return ()=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nprogress$2f$nprogress$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].done();
        };
    }, [
        pathname,
        searchParams
    ]);
    return null;
}
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/dynamic-access-async-storage.external.js [external] (next/dist/server/app-render/dynamic-access-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/dynamic-access-async-storage.external.js", () => require("next/dist/server/app-render/dynamic-access-async-storage.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__52686571._.js.map