"use client";

import { FormEvent, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import {
    getDiscoverMovies,
    getDiscoverTV,
    getMovieGenres,
    getMovieSummaries,
    getMovieWatchProviderList,
    getTVGenres,
    getTVWatchProviderList,
    searchMovies,
    searchMulti,
    searchPeople,
    searchTV,
} from "@/api/tmdb";
import { MovieCard } from "@/components/MovieCard";

type ContentType = "all" | "movie" | "tv";
type PersonRole = "cast" | "director";
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

const LANGUAGES = [
    { code: "", label: "Any language" },
    { code: "en", label: "English" },
    { code: "hi", label: "Hindi" },
    { code: "es", label: "Spanish" },
    { code: "fr", label: "French" },
    { code: "ja", label: "Japanese" },
    { code: "ko", label: "Korean" },
    { code: "ta", label: "Tamil" },
    { code: "te", label: "Telugu" },
];

const REGIONS = ["IN", "US", "GB", "CA", "AU", "DE", "FR", "JP", "KR"];

function normalizeResult(item: any, type: "movie" | "tv") {
    return {
        ...item,
        type,
    };
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

function storeSearchSignal(query: string, results: SearchResult[]) {
    if (typeof window === "undefined") return;

    const movieIds = getMovieResultIds(results);
    if (movieIds.length === 0 && !query.trim()) return;

    try {
        const existing = JSON.parse(localStorage.getItem(SEARCH_SIGNAL_STORAGE_KEY) || "[]");
        const nextSignal = {
            query: query.trim(),
            movieIds,
            searchedAt: new Date().toISOString(),
        };
        const next = [
            nextSignal,
            ...(Array.isArray(existing) ? existing : []).filter((item: any) => item?.query !== nextSignal.query),
        ].slice(0, 10);
        localStorage.setItem(SEARCH_SIGNAL_STORAGE_KEY, JSON.stringify(next));
        window.dispatchEvent(new Event("themovie-search-signals"));
    } catch {
        // Search history is an optional personalization signal.
    }
}

function SearchContent() {
    const searchParams = useSearchParams();
    const queryParam = searchParams.get("q") || "";
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
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(Boolean(queryParam));
    const [error, setError] = useState("");

    useEffect(() => {
        setQuery(queryParam);
    }, [queryParam]);

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

    const hasAdvancedFilters = Boolean(person.trim() || genre || year || language || minRating || runtimeMax || provider);

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

            const visibleMovieIds = new Set(movieIds);
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
            if (!isAbortError(recommendationError)) {
                console.warn("Search recommendations failed:", recommendationError);
                setSearchRecommendations([]);
            }
        } finally {
            if (!signal?.aborted) setRecommendationsLoading(false);
        }
    }, []);

    const runSearch = useCallback(async (searchQuery = query) => {
        const trimmedQuery = searchQuery.trim();
        if (!trimmedQuery && !hasAdvancedFilters) {
            setResults([]);
            setSearchRecommendations([]);
            setRecommendationsLoading(false);
            setSearched(false);
            return;
        }

        setLoading(true);
        setError("");
        setSearched(true);

        try {
            let personId: number | null = null;
            if (person.trim()) {
                const personData = await searchPeople(person.trim());
                personId = personData?.results?.[0]?.id || null;
                if (!personId) {
                    setResults([]);
                    setSearchRecommendations([]);
                    setRecommendationsLoading(false);
                    setError("No matching person was found.");
                    return;
                }
            }

            const types: Array<"movie" | "tv"> = contentType === "all" ? ["movie", "tv"] : [contentType];
            let nextResults: any[] = [];

            if (!hasAdvancedFilters && trimmedQuery && contentType === "all") {
                const data = await searchMulti(trimmedQuery);
                nextResults = (data?.results || [])
                    .filter((item: any) => item.media_type === "movie" || item.media_type === "tv")
                    .map((item: any) => normalizeResult(item, item.media_type));
            } else {
                const perTypeResults = await Promise.all(types.map(async (type) => {
                    if (!hasAdvancedFilters && trimmedQuery) {
                        const data = type === "movie" ? await searchMovies(trimmedQuery) : await searchTV(trimmedQuery);
                        return (data?.results || []).map((item: any) => normalizeResult(item, type));
                    }

                    const filters: Record<string, string | number> = {
                        sort_by: "popularity.desc",
                        "vote_count.gte": 10,
                    };

                    if (genre) filters.with_genres = genre;
                    if (language) filters.with_original_language = language;
                    if (minRating) filters["vote_average.gte"] = minRating;
                    if (runtimeMax) filters["with_runtime.lte"] = runtimeMax;
                    if (provider) {
                        filters.with_watch_providers = provider;
                        filters.watch_region = region;
                    }
                    if (personId) {
                        filters[personRole === "director" ? "with_crew" : "with_cast"] = personId;
                    }
                    if (year) {
                        if (type === "movie") {
                            filters.primary_release_year = year;
                        } else {
                            filters.first_air_date_year = year;
                        }
                    }

                    const data = type === "movie" ? await getDiscoverMovies(filters) : await getDiscoverTV(filters);
                    return (data?.results || []).map((item: any) => normalizeResult(item, type));
                }));

                nextResults = perTypeResults.flat();
            }

            if (trimmedQuery && hasAdvancedFilters) {
                const lowerQuery = trimmedQuery.toLowerCase();
                nextResults = nextResults.filter((item) => (item.title || item.name || "").toLowerCase().includes(lowerQuery));
            }

            const deduped = [...new Map(nextResults.map((item) => [`${item.type}-${item.id}`, item])).values()] as SearchResult[];
            const visibleResults = deduped.filter((item) => item.poster_path || item.backdrop_path);
            setResults(visibleResults);
            storeSearchSignal(trimmedQuery, visibleResults);
            if (contentType === "tv") {
                setSearchRecommendations([]);
                setRecommendationsLoading(false);
            } else {
                void loadSearchRecommendations(trimmedQuery, visibleResults);
            }
        } catch (searchError) {
            console.error("Advanced search failed:", searchError);
            setError("Search failed. Please try again.");
            setResults([]);
            setSearchRecommendations([]);
            setRecommendationsLoading(false);
        } finally {
            setLoading(false);
        }
    }, [contentType, genre, hasAdvancedFilters, language, loadSearchRecommendations, minRating, person, personRole, provider, query, region, runtimeMax, year]);

    useEffect(() => {
        if (!queryParam) return;
        let isMounted = true;
        const controller = new AbortController();

        async function loadInitialQuery() {
            setLoading(true);
            setError("");
            setSearched(true);
            try {
                const data = await searchMulti(queryParam);
                const items = (data?.results || [])
                    .filter((item: any) => item.media_type === "movie" || item.media_type === "tv")
                    .map((item: any) => normalizeResult(item, item.media_type));
                if (isMounted) {
                    const visibleResults = items.filter((item: any) => item.poster_path || item.backdrop_path);
                    setResults(visibleResults);
                    storeSearchSignal(queryParam, visibleResults);
                    void loadSearchRecommendations(queryParam, visibleResults, controller.signal);
                }
            } catch (initialError) {
                if (!isAbortError(initialError)) console.error("Initial search failed:", initialError);
                if (isMounted) {
                    setError("Search failed. Please try again.");
                    setResults([]);
                    setSearchRecommendations([]);
                    setRecommendationsLoading(false);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        loadInitialQuery();
        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [loadSearchRecommendations, queryParam]);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        await runSearch(query);
    };

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
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Movie or TV title"
                                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder:text-text-muted focus:border-accent-primary focus:outline-none"
                                />
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
                            className="inline-flex items-center gap-2 rounded-xl bg-accent-primary px-5 py-3 text-sm font-bold text-white transition-all hover:bg-accent-primary/90"
                        >
                            <SlidersHorizontal size={18} />
                            Search
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setQuery("");
                                setContentType("all");
                                setPerson("");
                                setPersonRole("cast");
                                setGenre("");
                                setYear("");
                                setLanguage("");
                                setMinRating("");
                                setRuntimeMax("");
                                setProvider("");
                                setResults([]);
                                setSearchRecommendations([]);
                                setRecommendationsLoading(false);
                                setSearched(false);
                                setError("");
                            }}
                            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-text-secondary transition-all hover:text-white"
                        >
                            Clear
                        </button>
                    </div>
                </form>

                {(recommendationsLoading || searchRecommendations.length > 0) && (
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
                                {searchRecommendations.map((item) => (
                                    <MovieCard key={`search-rec-${item.id}`} movie={item} />
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
