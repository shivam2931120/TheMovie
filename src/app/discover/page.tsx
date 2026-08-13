"use client";

import { Suspense } from "react";
import { Filters } from "@/components/Filters";
import { AdvancedFilters, getSavedSearches, type SavedSearch } from "@/components/AdvancedFilters";
import { MovieCard } from "@/components/MovieCard";
import { useEffect, useState } from "react";
import { getDiscoverMovies, getMovieGenres, getMovieWatchProviderList } from "@/api/tmdb";
import { Shuffle, Calendar, Trophy, X, Search, ChevronLeft, ChevronRight, Star, TrendingUp, Loader2, Bookmark, MonitorPlay } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";

const REGIONS = ["IN", "US", "GB", "CA", "AU", "DE", "FR", "JP", "KR"];

function DiscoverContent() {
    const [movies, setMovies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showRandomPicker, setShowRandomPicker] = useState(false);
    const [genres, setGenres] = useState<any[]>([]);
    const [activePreset, setActivePreset] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [randomGenre, setRandomGenre] = useState("");
    const [randomRating, setRandomRating] = useState("");
    const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
    const [provider, setProvider] = useState("");
    const [providerRegion, setProviderRegion] = useState("US");
    const [providers, setProviders] = useState<any[]>([]);
    
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeWatchProvider = searchParams.get("with_watch_providers") || "";
    const activeWatchRegion = searchParams.get("watch_region") || "US";

    useEffect(() => {
        setProvider(activeWatchProvider);
        setProviderRegion(activeWatchRegion);
    }, [activeWatchProvider, activeWatchRegion]);

    useEffect(() => {
        setSavedSearches(getSavedSearches());
        const onStorage = (e: StorageEvent) => { if (e.key === "themovie_saved_searches") setSavedSearches(getSavedSearches()); };
        const onSavedSearches = () => setSavedSearches(getSavedSearches());
        window.addEventListener("storage", onStorage);
        window.addEventListener("themovie-saved-searches", onSavedSearches);
        return () => {
            window.removeEventListener("storage", onStorage);
            window.removeEventListener("themovie-saved-searches", onSavedSearches);
        };
    }, []);

    const handleLoadSavedSearch = (search: SavedSearch) => {
        const params = new URLSearchParams();
        if (search.genres.length > 0) params.set("with_genres", search.genres.join(","));
        if (search.sortBy !== "popularity.desc") params.set("sort_by", search.sortBy);
        if (search.yearRange.min !== 1900) params.set("year_min", search.yearRange.min.toString());
        if (search.yearRange.max !== new Date().getFullYear()) params.set("year_max", search.yearRange.max.toString());
        if (search.runtime) params.set("runtime", search.runtime);
        if (search.language) params.set("language", search.language);
        if (search.rating) params.set("certification", search.rating);
        params.set("page", "1");
        router.push(`/discover?${params.toString()}`);
    };

    useEffect(() => {
        async function loadGenres() {
            const genreData = await getMovieGenres();
            if (genreData?.genres) setGenres(genreData.genres);
        }
        loadGenres();
    }, []);

    useEffect(() => {
        let isMounted = true;
        async function loadProviders() {
            const data = await getMovieWatchProviderList(providerRegion);
            if (isMounted) setProviders((data?.results || []).sort((a: any, b: any) => a.provider_name.localeCompare(b.provider_name)));
        }
        loadProviders();
        return () => { isMounted = false; };
    }, [providerRegion]);

    useEffect(() => {
        async function loadContent() {
            setLoading(true);
            const genre = searchParams.get("with_genres");
            const preset = searchParams.get("preset");
            const page = parseInt(searchParams.get("page") || "1");
            const sortBy = searchParams.get("sort_by") || "popularity.desc";
            const yearMin = searchParams.get("year_min");
            const yearMax = searchParams.get("year_max");
            const runtime = searchParams.get("runtime");
            const language = searchParams.get("language");
            const certification = searchParams.get("certification");
            const watchProvider = searchParams.get("with_watch_providers");
            const watchRegion = searchParams.get("watch_region") || "US";
            
            setCurrentPage(page);

            const filters: any = { sort_by: sortBy, page };
            if (genre) filters.with_genres = genre;
            if (watchProvider) {
                filters.with_watch_providers = watchProvider;
                filters.watch_region = watchRegion;
            }
            if (yearMin) filters["primary_release_date.gte"] = `${yearMin}-01-01`;
            if (yearMax) filters["primary_release_date.lte"] = `${yearMax}-12-31`;
            if (runtime) {
                const [min, max] = runtime.split("-").map(Number);
                filters["with_runtime.gte"] = min;
                filters["with_runtime.lte"] = max;
            }
            if (language) filters.with_original_language = language;
            if (certification) {
                filters.certification_country = "US";
                filters.certification = certification;
            }

            if (preset === 'era') {
                setActivePreset('era');
                filters["primary_release_date.gte"] = "1980-01-01";
                filters["primary_release_date.lte"] = "1999-12-31";
                filters["sort_by"] = "vote_average.desc";
                filters["vote_count.gte"] = 1000;
            } else if (preset === 'awards') {
                setActivePreset('awards');
                filters["vote_average.gte"] = 8.0;
                filters["vote_count.gte"] = 2000;
                filters["sort_by"] = "vote_average.desc";
            } else if (preset === 'recent') {
                setActivePreset('recent');
                const year = new Date().getFullYear();
                filters["primary_release_date.gte"] = `${year}-01-01`;
                filters["sort_by"] = "popularity.desc";
            } else if (preset === 'hidden') {
                setActivePreset('hidden');
                filters["vote_count.gte"] = 100;
                filters["vote_count.lte"] = 500;
                filters["vote_average.gte"] = 7.5;
                filters["sort_by"] = "vote_average.desc";
            } else {
                setActivePreset(null);
            }

            const data = await getDiscoverMovies(filters);
            if (data?.results) {
                setMovies(data.results);
                setTotalPages(Math.min(data.total_pages || 1, 500));
            }
            setLoading(false);
        }
        loadContent();
    }, [searchParams]);

    const handleRandomPick = async () => {
        setLoading(true);
        const page = Math.floor(Math.random() * 20) + 1;
        const filters: any = { page };
        if (randomGenre) filters.with_genres = randomGenre;
        if (randomRating) filters["vote_average.gte"] = randomRating;

        const data = await getDiscoverMovies(filters);
        if (data?.results && data.results.length > 0) {
            const randomMovie = data.results[Math.floor(Math.random() * data.results.length)];
            router.push(`/movie/${randomMovie.id}`);
        }
        setLoading(false);
    };

    const handlePreset = (preset: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (activePreset === preset) params.delete("preset");
        else {
            params.set("preset", preset);
            params.delete("with_genres");
        }
        params.set("page", "1");
        router.push(`/discover?${params.toString()}`);
    };

    const applyProviderFilter = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (provider) {
            params.set("with_watch_providers", provider);
            params.set("watch_region", providerRegion);
        } else {
            params.delete("with_watch_providers");
            params.delete("watch_region");
        }
        params.set("page", "1");
        router.push(`/discover?${params.toString()}`);
    };

    const clearProviderFilter = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("with_watch_providers");
        params.delete("watch_region");
        params.set("page", "1");
        setProvider("");
        router.push(`/discover?${params.toString()}`);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages || loading) return;
        setLoading(true);
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", newPage.toString());
        router.push(`/discover?${params.toString()}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <main className="min-h-screen pt-32 sm:pt-40 pb-20 bg-bg-main relative">
            {/* Cinematic Gradient Background */}
            <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-accent-primary/5 via-bg-main to-bg-main pointer-events-none" />

            <div className="container relative mx-auto px-6 lg:px-20 mb-12">
                <div className="mb-12">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white mb-4 tracking-tight flex items-center gap-4">
                        Discover
                    </h1>
                    <p className="text-lg text-text-secondary max-w-2xl">Find your next cinematic journey.</p>
                </div>

                <div className="flex flex-wrap gap-4 mb-10 items-center">
                    <button onClick={() => handlePreset('era')} className={clsx("flex items-center gap-2 px-6 py-3 rounded-full border transition-all shadow-glass font-medium text-sm", activePreset === 'era' ? "bg-accent-primary border-accent-primary text-white" : "bg-white/5 border-white/10 text-white hover:bg-white/10")}>
                        <Calendar size={18} /> 80s & 90s Classics
                    </button>
                    <button onClick={() => handlePreset('awards')} className={clsx("flex items-center gap-2 px-6 py-3 rounded-full border transition-all shadow-glass font-medium text-sm", activePreset === 'awards' ? "bg-accent-primary border-accent-primary text-white" : "bg-white/5 border-white/10 text-white hover:bg-white/10")}>
                        <Trophy size={18} /> Top Rated
                    </button>
                    <button onClick={() => handlePreset('recent')} className={clsx("flex items-center gap-2 px-6 py-3 rounded-full border transition-all shadow-glass font-medium text-sm", activePreset === 'recent' ? "bg-accent-primary border-accent-primary text-white" : "bg-white/5 border-white/10 text-white hover:bg-white/10")}>
                        <TrendingUp size={18} /> This Year
                    </button>
                    <button onClick={() => handlePreset('hidden')} className={clsx("flex items-center gap-2 px-6 py-3 rounded-full border transition-all shadow-glass font-medium text-sm", activePreset === 'hidden' ? "bg-accent-primary border-accent-primary text-white" : "bg-white/5 border-white/10 text-white hover:bg-white/10")}>
                        <Star size={18} /> Hidden Gems
                    </button>
                    <button onClick={() => setShowRandomPicker(!showRandomPicker)} className={clsx("flex items-center gap-2 px-6 py-3 rounded-full border transition-all shadow-glass font-medium text-sm", showRandomPicker ? "bg-accent-secondary border-accent-secondary text-white" : "bg-white/5 border-white/10 text-white hover:bg-white/10")}>
                        {showRandomPicker ? <X size={18} /> : <Shuffle size={18} />} Random Pick
                    </button>
                    <div className="ml-auto">
                        <AdvancedFilters />
                    </div>
                </div>

                <div className="rounded-3xl border border-white/5 bg-bg-surface/50 backdrop-blur-xl p-6 mb-8 shadow-elevated">
                    <div className="flex flex-col lg:flex-row lg:items-end gap-6">
                        <div className="flex items-center gap-3 text-white lg:w-48">
                            <div className="p-3 bg-accent-primary/10 text-accent-primary rounded-xl">
                                <MonitorPlay size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-bold tracking-wide">Streaming</p>
                                <p className="text-xs text-text-muted">Filter by provider</p>
                            </div>
                        </div>

                        <label className="flex-1">
                            <span className="block text-xs font-bold tracking-wider uppercase text-text-muted mb-2">Region</span>
                            <select value={providerRegion} onChange={(event) => setProviderRegion(event.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-accent-primary outline-none transition-colors">
                                {REGIONS.map((item) => <option key={item} value={item} className="bg-bg-main">{item}</option>)}
                            </select>
                        </label>

                        <label className="flex-[2]">
                            <span className="block text-xs font-bold tracking-wider uppercase text-text-muted mb-2">Provider</span>
                            <select value={provider} onChange={(event) => setProvider(event.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-accent-primary outline-none transition-colors">
                                <option value="" className="bg-bg-main">Any provider</option>
                                {providers.map((item) => <option key={item.provider_id} value={item.provider_id} className="bg-bg-main">{item.provider_name}</option>)}
                            </select>
                        </label>

                        <div className="flex gap-3">
                            <button onClick={applyProviderFilter} className="rounded-xl bg-accent-primary px-6 py-3 text-sm font-bold text-white transition-all hover:scale-105 shadow-cinematic-glow">Apply</button>
                            {activeWatchProvider && (
                                <button onClick={clearProviderFilter} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-white/10" aria-label="Clear"><X size={18} /></button>
                            )}
                        </div>
                    </div>
                </div>

                {savedSearches.length > 0 && (
                    <div className="flex flex-wrap items-center gap-3 mb-8">
                        <span className="text-xs text-text-muted font-bold uppercase tracking-wider flex items-center gap-1.5"><Bookmark size={14} /> Saved Filters</span>
                        {savedSearches.map(s => (
                            <button key={s.id} onClick={() => handleLoadSavedSearch(s)} className="px-4 py-2 rounded-full text-xs font-bold bg-accent-primary/10 text-accent-primary border border-accent-primary/20 hover:bg-accent-primary/20 transition-all">
                                {s.name}
                            </button>
                        ))}
                    </div>
                )}

                {showRandomPicker && (
                    <div className="bg-gradient-to-br from-bg-surface to-bg-main border border-white/10 rounded-3xl p-10 mb-12 text-center relative overflow-hidden shadow-elevated">
                        <div className="relative z-10 max-w-lg mx-auto">
                            <div className="mx-auto w-16 h-16 bg-accent-secondary/20 rounded-2xl flex items-center justify-center text-accent-secondary mb-6 shadow-cinematic-glow">
                                <Shuffle size={32} />
                            </div>
                            <h3 className="text-3xl font-display font-bold text-white mb-3 tracking-tight">Fate's Pick</h3>
                            <p className="text-text-secondary mb-10 text-lg">Can't decide what to watch? Let the cinematic gods choose for you.</p>

                            <div className="flex gap-4 mb-10">
                                <select className="flex-1 bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-accent-primary appearance-none transition-colors" value={randomGenre} onChange={(e) => setRandomGenre(e.target.value)}>
                                    <option value="" className="text-black">Any Genre</option>
                                    {genres.map(g => <option key={g.id} value={g.id} className="text-black">{g.name}</option>)}
                                </select>
                                <select className="flex-1 bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-accent-primary appearance-none transition-colors" value={randomRating} onChange={(e) => setRandomRating(e.target.value)}>
                                    <option value="" className="text-black">Any Rating</option>
                                    <option value="7" className="text-black">7+ Good</option>
                                    <option value="8" className="text-black">8+ Great</option>
                                    <option value="9" className="text-black">9+ Masterpiece</option>
                                </select>
                            </div>

                            <button onClick={handleRandomPick} disabled={loading && showRandomPicker} className="w-full py-5 bg-white text-bg-main font-bold text-lg rounded-xl transition-transform hover:scale-105 disabled:opacity-50">
                                {loading && showRandomPicker ? "Consulting the oracle..." : "Pick Random Movie"}
                            </button>
                        </div>
                    </div>
                )}

                <Filters />
            </div>

            <div className="container px-6 lg:px-20 mx-auto">
                {loading && !showRandomPicker ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="aspect-[2/3] bg-bg-surface rounded-xl animate-pulse border border-white/5" />
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 sm:gap-x-6 gap-y-12">
                            {movies.map((movie) => (
                                <MovieCard key={movie.id} movie={movie} />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-3 mt-20 mb-8">
                                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                                    <ChevronLeft size={20} />
                                </button>

                                <div className="flex items-center gap-2">
                                    {currentPage > 2 && (
                                        <>
                                            <button onClick={() => handlePageChange(1)} className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all font-medium">1</button>
                                            {currentPage > 3 && <span className="text-text-muted px-2">...</span>}
                                        </>
                                    )}

                                    {currentPage > 1 && <button onClick={() => handlePageChange(currentPage - 1)} className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all font-medium">{currentPage - 1}</button>}
                                    <button className="px-5 py-2 rounded-full bg-accent-primary border border-accent-primary text-white font-bold">{currentPage}</button>
                                    {currentPage < totalPages && <button onClick={() => handlePageChange(currentPage + 1)} className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all font-medium">{currentPage + 1}</button>}

                                    {currentPage < totalPages - 1 && (
                                        <>
                                            {currentPage < totalPages - 2 && <span className="text-text-muted px-2">...</span>}
                                            <button onClick={() => handlePageChange(totalPages)} className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all font-medium">{totalPages}</button>
                                        </>
                                    )}
                                </div>

                                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}

export default function DiscoverPage() {
    return (
        <Suspense fallback={<div className="min-h-screen pt-32 pb-20 bg-bg-main flex items-center justify-center"><Loader2 className="w-12 h-12 text-accent-primary animate-spin" /></div>}>
            <DiscoverContent />
        </Suspense>
    );
}
