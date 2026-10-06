"use client";

import { FormEvent, Suspense, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Loader2, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import {
    getDiscoverMovies,
    getDiscoverTV,
    getMovieGenres,
    getMovieDetails,
    getMovieSummaries,
    getMovieWatchProviderList,
    getTVGenres,
    getTVDetails,
    getTVWatchProviderList,
    getWatchProviders,
    searchMovies,
    searchMulti,
    searchPeople,
    searchTV,
} from "@/api/tmdb";
import { MovieCard } from "@/components/MovieCard";
import { WatchedContext } from "@/context/WatchedContext";
import { useRecommendationPreferences } from "@/context/RecommendationPreferencesContext";
import { LANGUAGES, REGIONS, readSearchState, readSearchPage, searchUrl, type SearchState, type ContentType, type PersonRole } from "@/lib/searchState";

type SearchResult = {
    id: number;
    title?: string;
    name?: string;
    poster_path?: string | null;
    backdrop_path?: string | null;
    media_type?: "movie" | "tv";
    type: "movie" | "tv";
};

const MAX_RECOMMENDATION_SEEDS = 8;
const MAX_SEARCH_RECOMMENDATIONS = 10;
const SEARCH_SIGNAL_STORAGE_KEY = "themovie_recent_search_signals";

const RECENT_SEARCHES_KEY = "themovie_recent_searches";
type RecentSearch = { label: string; url: string };

function normalizeResult(item: any, type: "movie" | "tv") {
    return {
        ...item,
        type,
    };
}

async function applyTitleSearchFilters(
    candidates: SearchResult[],
    filters: { genre: string; year: string; language: string; minRating: string; runtimeMax: string; provider: string; region: string; personId: number | null; personRole: PersonRole },
    signal?: AbortSignal
) {
    const narrowed = candidates.filter((item: any) => {
        const date = item.release_date || item.first_air_date || "";
        if (filters.genre && !(item.genre_ids || []).includes(Number(filters.genre))) return false;
        if (filters.year && date.slice(0, 4) !== filters.year) return false;
        if (filters.language && item.original_language !== filters.language) return false;
        if (filters.minRating && Number(item.vote_average || 0) < Number(filters.minRating)) return false;
        return true;
    });

    if (!filters.runtimeMax && !filters.provider && !filters.personId) return narrowed;

    const matched: SearchResult[] = [];
    let nextIndex = 0;
    const worker = async () => {
        while (nextIndex < narrowed.length && !signal?.aborted) {
            const item = narrowed[nextIndex++];
            try {
                const details = item.type === "movie"
                    ? await getMovieDetails(item.id)
                    : await getTVDetails(item.id);
                if (signal?.aborted) return;
                if (!details?.id) continue;

                if (filters.runtimeMax) {
                    const runtimes = item.type === "movie"
                        ? [Number(details.runtime)].filter((runtime) => runtime > 0)
                        : (details.episode_run_time || []).map(Number).filter((runtime: number) => runtime > 0);
                    if (!runtimes.length || !runtimes.some((runtime: number) => runtime <= Number(filters.runtimeMax))) continue;
                }

                if (filters.personId) {
                    const credits = details.credits || details.aggregate_credits || {};
                    const cast = credits.cast || [];
                    const crew = credits.crew || [];
                    const isCast = cast.some((person: any) => Number(person.id) === filters.personId);
                    const isDirector = item.type === "movie"
                        ? crew.some((person: any) => Number(person.id) === filters.personId && person.job === "Director")
                        : (details.created_by || []).some((person: any) => Number(person.id) === filters.personId)
                            || crew.some((person: any) => Number(person.id) === filters.personId);
                    if (filters.personRole === "cast" ? !isCast : !isDirector) continue;
                }

                if (filters.provider) {
                    const providerData = await getWatchProviders(item.id, item.type);
                    const regionData = providerData?.results?.[filters.region];
                    const regionProviders = ["flatrate", "free", "ads", "rent", "buy"]
                        .flatMap((group) => regionData?.[group] || []);
                    if (!regionProviders.some((available: any) => String(available.provider_id) === filters.provider)) continue;
                }
                matched.push(item);
            } catch {
                // Ignore individual titles that TMDB cannot enrich.
            }
        }
    };

    await Promise.all(Array.from({ length: Math.min(4, narrowed.length) }, worker));
    return narrowed.filter((item) => matched.some((candidate) => candidate.id === item.id && candidate.type === item.type));
}

function isAbortError(error: unknown) {
    return error instanceof DOMException && error.name === "AbortError";
}

function getMovieResultIds(results: SearchResult[]) {
    const ids: number[] = [];
    const seen = new Set<number>();

    for (const item of results) {
        if (item.type !== "movie" || !Number.isInteger(Number(item.id))) continue;
        const id = Number(item.id);
        if (seen.has(id)) continue;
        seen.add(id);
        ids.push(id);
        if (ids.length >= MAX_RECOMMENDATION_SEEDS) break;
    }

    return ids;
}

function storeSearchSignal(query: string, results: SearchResult[], storageKey: string) {
    if (typeof window === "undefined") return;

    const movieIds = getMovieResultIds(results);
    if (movieIds.length === 0 && !query.trim()) return;

    try {
        const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
        const nextSignal = {
            query: query.trim(),
            movieIds,
            searchedAt: new Date().toISOString(),
        };
        const next = [
            nextSignal,
            ...(Array.isArray(existing) ? existing : []).filter((item: any) => item?.query !== nextSignal.query),
        ].slice(0, 10);
        localStorage.setItem(storageKey, JSON.stringify(next));
        window.dispatchEvent(new Event("themovie-search-signals"));
    } catch {
        // Search history is an optional personalization signal.
    }
}

function SearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, isLoaded } = useUser();
    const owner = isLoaded ? user?.id || "guest" : null;
    const ownerRef = useRef(owner);
    useLayoutEffect(() => { ownerRef.current = owner; }, [owner]);
    const recentStorageKey = owner && owner !== "guest" ? `${RECENT_SEARCHES_KEY}:${owner}` : RECENT_SEARCHES_KEY;
    const signalStorageKey = owner && owner !== "guest" ? `${SEARCH_SIGNAL_STORAGE_KEY}:${owner}` : SEARCH_SIGNAL_STORAGE_KEY;
    const [viewOwner, setViewOwner] = useState<string | null>(null);
    const { watched } = useContext(WatchedContext) as any;
    const { isAllowed } = useRecommendationPreferences();
    const urlParams = searchParams.toString();
    const queryParam = searchParams.get("q") || "";
    const requestRef = useRef<AbortController | null>(null);
    const preserveDraftUrl = useRef<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [activeSearch, setActiveSearch] = useState<SearchState | null>(null);
    const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
    const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
    const [suggestionsOpen, setSuggestionsOpen] = useState(false);
    const [activeSuggestion, setActiveSuggestion] = useState(-1);
    const [shareStatus, setShareStatus] = useState("");
    const [query, setQuery] = useState(queryParam);
    const [contentType, setContentType] = useState<ContentType>("all");
    const [person, setPerson] = useState("");
    const [personRole, setPersonRole] = useState<PersonRole>("cast");
    const [genre, setGenre] = useState("");
    const [year, setYear] = useState("");
    const [language, setLanguage] = useState("");
    const [minRating, setMinRating] = useState("");
    const [runtimeMax, setRuntimeMax] = useState("");
    const [provider, setProvider] = useState("");
    const [region, setRegion] = useState("IN");
    const [movieGenres, setMovieGenres] = useState<any[]>([]);
    const [tvGenres, setTvGenres] = useState<any[]>([]);
    const [providers, setProviders] = useState<any[]>([]);
    const [results, setResults] = useState<any[]>([]);
    const [searchRecommendations, setSearchRecommendations] = useState<any[]>([]);
    const [recommendationsLoading, setRecommendationsLoading] = useState(false);
    const visibleRecommendations = useMemo(() => searchRecommendations.filter((item) => isAllowed(item, watched)), [searchRecommendations, isAllowed, watched]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(Boolean(queryParam));
    const [error, setError] = useState("");

    useEffect(() => {
        setRecentSearches([]);
        preserveDraftUrl.current = null;
        if (!owner) return;
        try {
            const history = JSON.parse(localStorage.getItem(recentStorageKey) || "[]");
            setRecentSearches(Array.isArray(history) ? history.filter((item) => typeof item?.label === "string" && typeof item?.url === "string" && (item.url === "/search" || item.url.startsWith("/search?"))).slice(0, 8) : []);
        } catch { /* History is optional. */ }
    }, [owner, recentStorageKey]);

    useEffect(() => {
        let cancelled = false;
        setSuggestions([]);
        setActiveSuggestion(-1);
        if (!owner || query.trim().length < 2) return;
        const timer = setTimeout(async () => {
            const data = contentType === "movie" ? await searchMovies(query.trim())
                : contentType === "tv" ? await searchTV(query.trim()) : await searchMulti(query.trim());
            if (cancelled) return;
            setSuggestions((data?.results || [])
                .filter((item: any) => contentType !== "all" || item.media_type === "movie" || item.media_type === "tv")
                .slice(0, 6).map((item: any) => normalizeResult(item, contentType === "all" ? item.media_type : contentType)));
        }, 300);
        return () => { cancelled = true; clearTimeout(timer); };
    }, [query, contentType, owner]);

    useEffect(() => {
        let isMounted = true;

        async function loadFilters() {
            const [movieGenreData, tvGenreData] = await Promise.all([
                getMovieGenres(),
                getTVGenres(),
            ]);

            if (isMounted) {
                setMovieGenres(movieGenreData?.genres || []);
                setTvGenres(tvGenreData?.genres || []);
            }
        }

        loadFilters();
        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        let isMounted = true;

        async function loadProviders() {
            const needsMovie = contentType === "all" || contentType === "movie";
            const needsTv = contentType === "all" || contentType === "tv";
            const [movieData, tvData] = await Promise.all([
                needsMovie ? getMovieWatchProviderList(region) : Promise.resolve({ results: [] }),
                needsTv ? getTVWatchProviderList(region) : Promise.resolve({ results: [] }),
            ]);

            const providerMap = new Map();
            [...(movieData?.results || []), ...(tvData?.results || [])].forEach((item) => {
                providerMap.set(item.provider_id, item);
            });

            if (isMounted) {
                setProviders([...providerMap.values()].sort((a, b) => a.provider_name.localeCompare(b.provider_name)));
            }
        }

        loadProviders();
        return () => { isMounted = false; };
    }, [contentType, region]);

    const genres = useMemo(() => {
        const source = contentType === "movie" ? movieGenres : contentType === "tv" ? tvGenres : [...movieGenres, ...tvGenres];
        const genreMap = new Map();
        source.forEach((item) => genreMap.set(item.id, item));
        return [...genreMap.values()].sort((a, b) => a.name.localeCompare(b.name));
    }, [contentType, movieGenres, tvGenres]);

    const loadSearchRecommendations = useCallback(async (
        searchQuery: string,
        sourceResults: SearchResult[],
        signal?: AbortSignal
    ) => {
        const trimmedQuery = searchQuery.trim();
        const movieIds = getMovieResultIds(sourceResults);

        if (!trimmedQuery && movieIds.length === 0) {
            setSearchRecommendations([]);
            setRecommendationsLoading(false);
            return;
        }

        setRecommendationsLoading(true);

        try {
            const params = new URLSearchParams();
            if (trimmedQuery) params.set("query", trimmedQuery);
            if (movieIds.length > 0) params.set("resultIds", movieIds.join(","));

            const response = await fetch(`/api/ai-recommend?${params.toString()}`, { signal });
            if (signal?.aborted) return;
            if (!response.ok) {
                setSearchRecommendations([]);
                return;
            }

            const data = await response.json();
            if (signal?.aborted) return;
            const recIds: number[] = Array.isArray(data.recommendations)
                ? data.recommendations
                    .map((id: number | string) => Number(id))
                    .filter((id: number) => Number.isInteger(id) && id > 0)
                : [];

            const visibleMovieIds = new Set(sourceResults.filter((item) => item.type === "movie").map((item) => item.id));
            const uniqueRecIds = [...new Set(recIds)]
                .filter((id) => !visibleMovieIds.has(id))
                .slice(0, MAX_SEARCH_RECOMMENDATIONS);

            if (uniqueRecIds.length === 0) {
                setSearchRecommendations([]);
                return;
            }

            const movies = await getMovieSummaries(uniqueRecIds, MAX_SEARCH_RECOMMENDATIONS);
            if (signal?.aborted) return;
            setSearchRecommendations(
                movies
                    .filter((movie: any) => movie?.id && movie?.poster_path && movie?.title)
                    .map((movie: any) => ({ ...movie, type: "movie" }))
            );
        } catch (recommendationError) {
            if (!signal?.aborted && !isAbortError(recommendationError)) {
                console.warn("Search recommendations failed:", recommendationError);
                setSearchRecommendations([]);
            }
        } finally {
            if (!signal?.aborted) setRecommendationsLoading(false);
        }
    }, []);

    const runSearch = useCallback(async (state: SearchState, nextPage: number, signal: AbortSignal) => {
        if (!owner || signal.aborted || ownerRef.current !== owner) return;
        const isCurrent = () => !signal.aborted && ownerRef.current === owner;
        const { q: searchQuery, type: contentType, person, role: personRole, genre, year, language,
            rating: minRating, runtime: runtimeMax, provider, region } = state;
        const trimmedQuery = searchQuery.trim();
        const hasAdvancedFilters = Boolean(person.trim() || genre || year || language || minRating || runtimeMax || provider);
        setSearchRecommendations([]);
        setRecommendationsLoading(false);
        setTotalPages(0);
        setError("");
        if (!trimmedQuery && !hasAdvancedFilters) {
            setResults([]);
            setSearched(false);
            setLoading(false);
            return;
        }
        setLoading(true);
        setSearched(true);
        try {
            let personId: number | null = null;
            if (person.trim()) {
                const personData = await searchPeople(person.trim());
                if (!isCurrent()) return;
                personId = personData?.results?.[0]?.id || null;
                if (!personId) {
                    setResults([]);
                    setError("No matching person was found.");
                    return;
                }
            }
            const types: Array<"movie" | "tv"> = contentType === "all" ? ["movie", "tv"] : [contentType];
            let nextResults: SearchResult[] = [];
            let availablePages = 0;
            if (!hasAdvancedFilters && trimmedQuery && contentType === "all") {
                const data = await searchMulti(trimmedQuery, nextPage);
                availablePages = Number(data?.total_pages || 0);
                nextResults = (data?.results || [])
                    .filter((item: any) => item.media_type === "movie" || item.media_type === "tv")
                    .map((item: any) => normalizeResult(item, item.media_type));
            } else {
                const pages = await Promise.all(types.map(async (type) => {
                    if (trimmedQuery) {
                        const data = type === "movie" ? await searchMovies(trimmedQuery, nextPage) : await searchTV(trimmedQuery, nextPage);
                        return { pages: Number(data?.total_pages || 0), items: (data?.results || []).map((item: any) => normalizeResult(item, type)) };
                    }
                    const filters: Record<string, string | number> = { sort_by: "popularity.desc", "vote_count.gte": 10 };
                    if (genre) filters.with_genres = genre;
                    if (language) filters.with_original_language = language;
                    if (minRating) filters["vote_average.gte"] = minRating;
                    if (runtimeMax) filters["with_runtime.lte"] = runtimeMax;
                    if (provider) { filters.with_watch_providers = provider; filters.watch_region = region; }
                    if (personId) filters[personRole === "director" ? "with_crew" : "with_cast"] = personId;
                    if (year) filters[type === "movie" ? "primary_release_year" : "first_air_date_year"] = year;
                    const data = type === "movie" ? await getDiscoverMovies(filters, nextPage) : await getDiscoverTV(filters, nextPage);
                    return { pages: Number(data?.total_pages || 0), items: (data?.results || []).map((item: any) => normalizeResult(item, type)) };
                }));
                availablePages = Math.max(0, ...pages.map((item) => item.pages));
                nextResults = pages.flatMap((item) => item.items);
            }
            if (!isCurrent()) return;
            if (trimmedQuery && hasAdvancedFilters) {
                nextResults = await applyTitleSearchFilters(nextResults, {
                    genre, year, language, minRating, runtimeMax, provider, region, personId, personRole,
                }, signal);
            }
            if (!isCurrent()) return;
            const deduped = [...new Map(nextResults.map((item) => [`${item.type}-${item.id}`, item])).values()];
            setResults(deduped);
            setTotalPages(Math.min(500, availablePages));
            if (nextPage === 1) {
                storeSearchSignal(trimmedQuery, deduped, signalStorageKey);
                const label = [trimmedQuery || person.trim() || "Browse", contentType === "all" ? "" : contentType === "tv" ? "TV" : "Movies", year, minRating ? `${minRating}+ rating` : ""].filter(Boolean).join(" · ");
                const entry = { label: label.length > 75 ? `${label.slice(0, 72)}…` : label, url: searchUrl(state) };
                try {
                    const saved = JSON.parse(localStorage.getItem(recentStorageKey) || "[]");
                    const history = [entry, ...(Array.isArray(saved) ? saved : []).filter((item: RecentSearch) => item.url !== entry.url)].slice(0, 8);
                    localStorage.setItem(recentStorageKey, JSON.stringify(history));
                    setRecentSearches(history);
                } catch { /* Search still works when storage is unavailable. */ }
            }
            if (contentType !== "tv") void loadSearchRecommendations(trimmedQuery, deduped, signal);
        } catch (searchError) {
            if (!isCurrent()) return;
            console.error("Advanced search failed:", searchError);
            setError("Search failed. Please try again.");
            setResults([]);
        } finally {
            if (isCurrent()) setLoading(false);
        }
    }, [loadSearchRecommendations, owner, recentStorageKey, signalStorageKey]);

    useEffect(() => {
        if (!owner) { requestRef.current?.abort(); return; }
        const params = new URLSearchParams(urlParams);
        const state = readSearchState(params);
        const nextPage = readSearchPage(params);
        // Submitting or paging can finish after further typing. Keep those drafts;
        // external links, recent searches, and browser history restore their filters.
        if (preserveDraftUrl.current !== searchUrl(state, nextPage)) {
            setQuery(state.q); setContentType(state.type); setPerson(state.person); setPersonRole(state.role);
            setGenre(state.genre); setYear(state.year); setLanguage(state.language); setMinRating(state.rating);
            setRuntimeMax(state.runtime); setProvider(state.provider); setRegion(state.region);
        }
        preserveDraftUrl.current = null;
        setPage(nextPage); setActiveSearch(state); setSuggestions([]); setSuggestionsOpen(false); setShareStatus("");
        setViewOwner(owner);
        requestRef.current?.abort();
        const controller = new AbortController();
        requestRef.current = controller;
        void runSearch(state, nextPage, controller.signal);
        return () => controller.abort();
    }, [urlParams, runSearch, owner]);

    const submitSearch = (title = query) => {
        if (!owner) return;
        setSuggestionsOpen(false);
        const state: SearchState = { q: title.trim(), type: contentType, person, role: personRole, genre, year,
            language, rating: minRating, runtime: runtimeMax, provider, region };
        const target = searchUrl(state);
        requestRef.current?.abort();
        if (target === `/search${urlParams ? `?${urlParams}` : ""}`) {
            requestRef.current?.abort();
            const controller = new AbortController();
            requestRef.current = controller;
            void runSearch(state, 1, controller.signal);
        } else {
            preserveDraftUrl.current = target;
            router.push(target, { scroll: false });
        }
    };

    const changePage = (nextPage: number) => {
        if (!activeSearch) return;
        const target = searchUrl(activeSearch, nextPage);
        preserveDraftUrl.current = target;
        requestRef.current?.abort();
        router.push(target, { scroll: false });
    };

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        submitSearch();
    };

    if (!owner || viewOwner !== owner) {
        return <main className="min-h-screen pt-32 flex items-center justify-center bg-bg-main"><Loader2 aria-label="Loading search" className="animate-spin text-accent-primary" /></main>;
    }

    return (
        <main className="min-h-screen pt-32 sm:pt-36 pb-20 bg-bg-main">
            <div className="container mx-auto px-4 sm:px-6 lg:px-20">
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-2">Advanced Search</h1>
                    <p className="text-text-secondary">Search by title, cast, director, genre, year, language, runtime, rating, and streaming provider.</p>
                </div>

                <form onSubmit={handleSubmit} className="rounded-xl border border-white/10 bg-bg-card p-5 sm:p-6 mb-10">
                    <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr_0.7fr] gap-4">
                        <label>
                            <span className="block text-xs font-semibold uppercase text-text-muted mb-2">Title</span>
                            <div className="relative">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                <input
                                    value={query}
                                    onChange={(event) => { setQuery(event.target.value); setSuggestionsOpen(true); }}
                                    onFocus={() => setSuggestionsOpen(true)}
                                    onBlur={() => setSuggestionsOpen(false)}
                                    role="combobox"
                                    aria-autocomplete="list"
                                    aria-expanded={suggestionsOpen && suggestions.length > 0}
                                    aria-controls="title-suggestions"
                                    aria-activedescendant={suggestionsOpen && activeSuggestion >= 0 ? `title-suggestion-${activeSuggestion}` : undefined}
                                    onKeyDown={(event) => {
                                        if (event.key === "Escape") { setSuggestionsOpen(false); return; }
                                        if (!suggestionsOpen || !suggestions.length) return;
                                        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                                            event.preventDefault();
                                            setActiveSuggestion((current) => (current + (event.key === "ArrowDown" ? 1 : -1) + suggestions.length) % suggestions.length);
                                        } else if (event.key === "Enter" && activeSuggestion >= 0) {
                                            event.preventDefault();
                                            const title = suggestions[activeSuggestion].title || suggestions[activeSuggestion].name || "";
                                            setQuery(title); submitSearch(title);
                                        }
                                    }}
                                    placeholder="Movie or TV title"
                                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder:text-text-muted focus:border-accent-primary focus:outline-none"
                                />
                                {suggestionsOpen && suggestions.length > 0 && (
                                    <ul id="title-suggestions" role="listbox" aria-label="Title suggestions" className="absolute z-30 mt-2 w-full rounded-xl border border-white/20 bg-bg-card shadow-xl overflow-hidden">
                                        {suggestions.map((item, index) => (
                                            <li key={`${item.type}-${item.id}`} id={`title-suggestion-${index}`} role="option" aria-selected={activeSuggestion === index}
                                                onMouseDown={(event) => { event.preventDefault(); const title = item.title || item.name || ""; setQuery(title); submitSearch(title); }}
                                                className={`cursor-pointer px-4 py-3 text-sm text-white hover:bg-white/10 ${activeSuggestion === index ? "bg-white/10" : ""}`}>
                                                {item.title || item.name} <span className="text-text-muted">· {item.type === "tv" ? "TV" : "Movie"}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </label>

                        <label>
                            <span className="block text-xs font-semibold uppercase text-text-muted mb-2">Type</span>
                            <select
                                value={contentType}
                                onChange={(event) => setContentType(event.target.value as ContentType)}
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-accent-primary focus:outline-none"
                            >
                                <option value="all" className="bg-bg-card">Movies and TV</option>
                                <option value="movie" className="bg-bg-card">Movies</option>
                                <option value="tv" className="bg-bg-card">TV Shows</option>
                            </select>
                        </label>

                        <label>
                            <span className="block text-xs font-semibold uppercase text-text-muted mb-2">Region</span>
                            <select
                                value={region}
                                onChange={(event) => setRegion(event.target.value)}
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-accent-primary focus:outline-none"
                            >
                                {REGIONS.map((item) => (
                                    <option key={item} value={item} className="bg-bg-card">{item}</option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                        <label>
                            <span className="block text-xs font-semibold uppercase text-text-muted mb-2">Cast or Director</span>
                            <input
                                value={person}
                                onChange={(event) => setPerson(event.target.value)}
                                placeholder="Person name"
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-text-muted focus:border-accent-primary focus:outline-none"
                            />
                        </label>

                        <label>
                            <span className="block text-xs font-semibold uppercase text-text-muted mb-2">Person Role</span>
                            <select
                                value={personRole}
                                onChange={(event) => setPersonRole(event.target.value as PersonRole)}
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-accent-primary focus:outline-none"
                            >
                                <option value="cast" className="bg-bg-card">Cast</option>
                                <option value="director" className="bg-bg-card">Director or Crew</option>
                            </select>
                        </label>

                        <label>
                            <span className="block text-xs font-semibold uppercase text-text-muted mb-2">Genre</span>
                            <select
                                value={genre}
                                onChange={(event) => setGenre(event.target.value)}
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-accent-primary focus:outline-none"
                            >
                                <option value="" className="bg-bg-card">Any genre</option>
                                {genres.map((item) => (
                                    <option key={item.id} value={item.id} className="bg-bg-card">{item.name}</option>
                                ))}
                            </select>
                        </label>

                        <label>
                            <span className="block text-xs font-semibold uppercase text-text-muted mb-2">Streaming Provider</span>
                            <select
                                value={provider}
                                onChange={(event) => setProvider(event.target.value)}
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-accent-primary focus:outline-none"
                            >
                                <option value="" className="bg-bg-card">Any provider</option>
                                {providers.map((item) => (
                                    <option key={item.provider_id} value={item.provider_id} className="bg-bg-card">{item.provider_name}</option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                        <label>
                            <span className="block text-xs font-semibold uppercase text-text-muted mb-2">Year</span>
                            <input
                                value={year}
                                onChange={(event) => setYear(event.target.value.replace(/\D/g, "").slice(0, 4))}
                                placeholder="2026"
                                inputMode="numeric"
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-text-muted focus:border-accent-primary focus:outline-none"
                            />
                        </label>

                        <label>
                            <span className="block text-xs font-semibold uppercase text-text-muted mb-2">Language</span>
                            <select
                                value={language}
                                onChange={(event) => setLanguage(event.target.value)}
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-accent-primary focus:outline-none"
                            >
                                {LANGUAGES.map((item) => (
                                    <option key={item.code || "any"} value={item.code} className="bg-bg-card">{item.label}</option>
                                ))}
                            </select>
                        </label>

                        <label>
                            <span className="block text-xs font-semibold uppercase text-text-muted mb-2">Minimum Rating</span>
                            <input
                                value={minRating}
                                onChange={(event) => setMinRating(event.target.value)}
                                type="number"
                                min="0"
                                max="10"
                                step="0.5"
                                placeholder="7.0"
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-text-muted focus:border-accent-primary focus:outline-none"
                            />
                        </label>

                        <label>
                            <span className="block text-xs font-semibold uppercase text-text-muted mb-2">Max Runtime</span>
                            <input
                                value={runtimeMax}
                                onChange={(event) => setRuntimeMax(event.target.value)}
                                type="number"
                                min="1"
                                placeholder="140 minutes"
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-text-muted focus:border-accent-primary focus:outline-none"
                            />
                        </label>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 rounded-xl bg-accent-surface px-5 py-3 text-sm font-bold text-white transition-all hover:bg-accent-surface/90"
                        >
                            <SlidersHorizontal size={18} />
                            Search
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                requestRef.current?.abort();
                                preserveDraftUrl.current = null;
                                router.push("/search", { scroll: false });
                                setQuery(""); setContentType("all"); setPerson(""); setPersonRole("cast");
                                setGenre(""); setYear(""); setLanguage(""); setMinRating("");
                                setRuntimeMax(""); setProvider(""); setRegion("IN"); setResults([]);
                                setSearchRecommendations([]); setRecommendationsLoading(false);
                                setSearched(false); setError(""); setLoading(false); setTotalPages(0); setSuggestionsOpen(false);
                            }}
                            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-text-secondary transition-all hover:text-white"
                        >
                            Clear
                        </button>
                    </div>
                </form>

                {searched && activeSearch && (
                    <div className="mb-5 flex flex-wrap items-center gap-3">
                        <button type="button" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/10" onClick={async () => {
                            try {
                                await navigator.clipboard.writeText(`${window.location.origin}${searchUrl(activeSearch, page)}`);
                                setShareStatus("Search link copied.");
                            } catch { setShareStatus("Copy the address from your browser to share this search."); }
                        }}>Copy search link</button>
                        <span role="status" className="text-sm text-text-secondary">{shareStatus}</span>
                    </div>
                )}

                {recentSearches.length > 0 && (
                    <section aria-label="Recent searches" className="mb-8 flex flex-wrap items-center gap-2">
                        <span className="text-sm text-text-secondary">Recent searches:</span>
                        {recentSearches.map((entry) => (
                            <button type="button" key={entry.url} onClick={() => {
                                const params = new URL(entry.url, window.location.origin).searchParams;
                                const state = readSearchState(params);
                                const target = searchUrl(state);
                                preserveDraftUrl.current = null;
                                if (target === searchUrl(readSearchState(new URLSearchParams(urlParams)), page)) {
                                    setQuery(state.q); setContentType(state.type); setPerson(state.person); setPersonRole(state.role);
                                    setGenre(state.genre); setYear(state.year); setLanguage(state.language); setMinRating(state.rating);
                                    setRuntimeMax(state.runtime); setProvider(state.provider); setRegion(state.region);
                                    requestRef.current?.abort();
                                    const controller = new AbortController(); requestRef.current = controller;
                                    void runSearch(state, 1, controller.signal);
                                } else router.push(target, { scroll: false });
                            }}
                                title={entry.url} className="rounded-full border border-white/10 px-3 py-2 text-sm text-white hover:bg-white/10">{entry.label}</button>
                        ))}
                        <button type="button" className="px-3 py-2 text-sm text-text-secondary hover:text-white" onClick={() => {
                            setRecentSearches([]);
                            try {
                                localStorage.removeItem(recentStorageKey);
                                localStorage.removeItem(signalStorageKey);
                                window.dispatchEvent(new Event("themovie-search-signals"));
                            } catch { /* Optional storage. */ }
                        }}>Clear history</button>
                    </section>
                )}

                {(recommendationsLoading || visibleRecommendations.length > 0) && (
                    <section className="mb-10">
                        <div className="mb-5 flex items-center gap-2">
                            <div className="rounded-lg bg-accent-primary/20 p-1.5">
                                <Sparkles className="text-accent-primary" size={20} />
                            </div>
                            <h2 className="text-xl font-display font-semibold text-white">Recommended from This Search</h2>
                        </div>

                        {recommendationsLoading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6">
                                {Array.from({ length: 5 }, (_, index) => (
                                    <div key={index} className="aspect-[2/3] bg-white/5 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-y-10 sm:gap-y-12 gap-x-3 sm:gap-x-6">
                                {visibleRecommendations.map((item) => (
                                    <MovieCard key={`search-rec-${item.id}`} movie={item} recommendation reason="Related to your search" />
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                        {Array.from({ length: 10 }, (_, index) => (
                            <div key={index} className="aspect-[2/3] bg-white/5 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : results.length > 0 ? (
                    <>
                        <div className="mb-5 text-sm text-text-secondary">
                            {results.length} result{results.length === 1 ? "" : "s"}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-10 sm:gap-y-12 gap-x-3 sm:gap-x-6">
                            {results.map((item) => (
                                <MovieCard key={`${item.type}-${item.id}`} movie={item} />
                            ))}
                        </div>
                    </>
                ) : searched ? (
                    <div className="text-center py-20 rounded-xl border border-white/10 bg-white/5">
                        <p className="text-white text-lg font-bold mb-1">No results found</p>
                        <p className="text-text-secondary">{error || "Try fewer filters or a different title."}</p>
                    </div>
                ) : (
                    <div className="text-center py-20 rounded-xl border border-white/10 bg-white/5">
                        <Search className="mx-auto mb-3 text-accent-primary" size={36} />
                        <p className="text-white text-lg font-bold mb-1">Start a Search</p>
                        <p className="text-text-secondary">Use a title or any advanced filter.</p>
                    </div>
                )}
                {searched && !loading && totalPages > 1 && activeSearch && (
                    <nav aria-label="Search result pages" className="mt-10 flex items-center justify-center gap-4">
                        <button type="button" disabled={page <= 1} onClick={() => changePage(page - 1)}
                            className="rounded-xl border border-white/10 px-4 py-3 text-white disabled:opacity-40">Previous</button>
                        <span className="text-sm text-text-secondary">Page {page} of {totalPages}</span>
                        <button type="button" disabled={page >= totalPages} onClick={() => changePage(page + 1)}
                            className="rounded-xl border border-white/10 px-4 py-3 text-white disabled:opacity-40">Next</button>
                    </nav>
                )}
                {searched && activeSearch?.q && Boolean(activeSearch.genre || activeSearch.year || activeSearch.language || activeSearch.rating || activeSearch.runtime || activeSearch.provider || activeSearch.person) && (
                    <p className="mt-4 text-center text-sm text-text-muted">Filters apply to each page of title matches. A later page may contain more matching titles.</p>
                )}
            </div>
        </main>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen pt-32 pb-20 bg-bg-main flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-accent-primary animate-spin" />
            </div>
        }>
            <SearchContent />
        </Suspense>
    );
}
