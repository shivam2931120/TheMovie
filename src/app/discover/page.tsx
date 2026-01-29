"use client";

import { Suspense } from "react";
import { Filters } from "@/components/Filters";
import { AdvancedFilters } from "@/components/AdvancedFilters";
import { MovieCard } from "@/components/MovieCard";
import { useEffect, useState } from "react";
import { getDiscoverMovies, getMovieGenres } from "@/api/tmdb";
import { Shuffle, Calendar, Trophy, X, Search, ChevronLeft, ChevronRight, Star, TrendingUp, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";

function DiscoverContent() {
    const [movies, setMovies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showRandomPicker, setShowRandomPicker] = useState(false);
    const [genres, setGenres] = useState<any[]>([]);
    const [activePreset, setActivePreset] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Random Picker State
    const [randomGenre, setRandomGenre] = useState("");
    const [randomRating, setRandomRating] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();

    // Fetch initial genres for random picker
    useEffect(() => {
        async function loadGenres() {
            const genreData = await getMovieGenres();
            if (genreData?.genres) setGenres(genreData.genres);
        }
        loadGenres();
    }, []);

    // Fetch Content based on URL Params (Filters)
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
            
            setCurrentPage(page);

            const filters: any = { sort_by: sortBy, page };
            if (genre) filters.with_genres = genre;
            
            // Apply advanced filters
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

            // Handle Presets (override advanced filters if present)
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
                setTotalPages(Math.min(data.total_pages || 1, 500)); // TMDB limits to 500 pages
            }
            setLoading(false);
        }
        loadContent();
    }, [searchParams]);

    const handleRandomPick = async () => {
        setLoading(true);
        // Fetch a random page of movies based on filters
        const page = Math.floor(Math.random() * 20) + 1; // Random page 1-20
        const filters: any = { page };
        if (randomGenre) filters.with_genres = randomGenre;
        if (randomRating) filters["vote_average.gte"] = randomRating;

        const data = await getDiscoverMovies(filters);
        if (data?.results && data.results.length > 0) {
            const randomMovie = data.results[Math.floor(Math.random() * data.results.length)];
            // Navigate to the movie
            router.push(`/movie/${randomMovie.id}`);
        }
        setLoading(false);
    };

    const handlePreset = (preset: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (activePreset === preset) {
            params.delete("preset");
        } else {
            params.set("preset", preset);
            params.delete("genre"); // Clear genre when selecting preset for clarity
        }
        params.set("page", "1"); // Reset to first page
        router.push(`/discover?${params.toString()}`);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages || loading) return;
        setLoading(true);
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", newPage.toString());
        router.push(`/discover?${params.toString()}`);
        window.scrollTo({ top: 0 });
    };

    return (
        <main className="min-h-screen pt-32 sm:pt-36 pb-20 bg-bg-main relative">
            <div className="container mx-auto px-4 sm:px-6 lg:px-20 mb-8 sm:mb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-4xl font-display font-bold text-white mb-2 flex items-center gap-3">
                            <span className="text-accent-primary">
                                <Search size={32} />
                            </span>
                            Discover Movies
                        </h1>
                        <p className="text-text-secondary">Explore by era, awards, or let us pick for you</p>
                    </div>
                </div>

                {/* Feature Buttons */}
                <div className="flex flex-wrap gap-4 mb-10">
                    <button
                        onClick={() => handlePreset('era')}
                        className={clsx(
                            "flex items-center gap-2 px-5 py-2.5 rounded-full border transition-colors",
                            activePreset === 'era' ? "bg-accent-secondary border-accent-secondary text-white" : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                        )}
                    >
                        <Calendar size={18} /> 80s & 90s Classics
                    </button>
                    <button
                        onClick={() => handlePreset('awards')}
                        className={clsx(
                            "flex items-center gap-2 px-5 py-2.5 rounded-full border transition-colors",
                            activePreset === 'awards' ? "bg-accent-secondary border-accent-secondary text-white" : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                        )}
                    >
                        <Trophy size={18} /> Top Rated
                    </button>
                    <button
                        onClick={() => handlePreset('recent')}
                        className={clsx(
                            "flex items-center gap-2 px-5 py-2.5 rounded-full border transition-colors",
                            activePreset === 'recent' ? "bg-accent-secondary border-accent-secondary text-white" : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                        )}
                    >
                        <TrendingUp size={18} /> This Year
                    </button>
                    <button
                        onClick={() => handlePreset('hidden')}
                        className={clsx(
                            "flex items-center gap-2 px-5 py-2.5 rounded-full border transition-colors",
                            activePreset === 'hidden' ? "bg-accent-secondary border-accent-secondary text-white" : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                        )}
                    >
                        <Star size={18} /> Hidden Gems
                    </button>
                    <button
                        onClick={() => setShowRandomPicker(!showRandomPicker)}
                        className={clsx(
                            "flex items-center gap-2 px-5 py-2.5 rounded-full border transition-colors font-medium",
                            showRandomPicker
                                ? "bg-accent-primary border-accent-primary text-white"
                                : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                        )}
                    >
                        {showRandomPicker ? <X size={18} /> : <Shuffle size={18} />}
                        {showRandomPicker ? "Close Picker" : "Random Pick"}
                    </button>
                    <AdvancedFilters />
                </div>

                {/* Random Picker Section */}
                {showRandomPicker && (
                    <div className="bg-bg-card border border-white/10 rounded-2xl p-8 mb-12 animate-fade-in-up text-center relative overflow-hidden">
                        <div className="relative z-10 max-w-lg mx-auto">
                            <div className="mx-auto w-12 h-12 bg-accent-primary/20 rounded-lg flex items-center justify-center text-accent-primary mb-4">
                                <Shuffle size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Random Movie Picker</h3>
                            <p className="text-text-secondary mb-8">Can't decide what to watch? Let fate decide!</p>

                            <div className="flex gap-4 mb-8">
                                <select
                                    className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-primary appearance-none placeholder-white"
                                    value={randomGenre}
                                    onChange={(e) => setRandomGenre(e.target.value)}
                                >
                                    <option value="" className="text-black">Any Genre</option>
                                    {genres.map(g => (
                                        <option key={g.id} value={g.id} className="text-black">{g.name}</option>
                                    ))}
                                </select>
                                <select
                                    className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-primary appearance-none"
                                    value={randomRating}
                                    onChange={(e) => setRandomRating(e.target.value)}
                                >
                                    <option value="" className="text-black">Any Rating</option>
                                    <option value="7" className="text-black">7+ Good</option>
                                    <option value="8" className="text-black">8+ Great</option>
                                    <option value="9" className="text-black">9+ Masterpiece</option>
                                </select>
                            </div>

                            <button
                                onClick={handleRandomPick}
                                disabled={loading && showRandomPicker} // Disable while picking
                                className="w-full py-4 bg-accent-primary hover:bg-accent-primary/90 text-white font-bold rounded-xl transition-transform hover:scale-[1.02 shadow-lg shadow-accent-primary/20 disabled:opacity-50"
                            >
                                <Shuffle size={20} className="inline mr-2" />
                                {loading && showRandomPicker ? "Picking..." : "Pick Random Movie"}
                            </button>
                        </div>
                        {/* Background Splashes */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                    </div>
                )}

                <Filters />
            </div>

            <div className="container px-4 sm:px-6 lg:px-20 mx-auto">
                {loading && !showRandomPicker ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="aspect-[2/3] bg-white/5 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-10 sm:gap-y-12 gap-x-3 sm:gap-x-6">
                            {movies.map((movie) => (
                                <MovieCard key={movie.id} movie={movie} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-16 mb-8">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                <div className="flex items-center gap-2">
                                    {currentPage > 2 && (
                                        <>
                                            <button
                                                onClick={() => handlePageChange(1)}
                                                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                                            >
                                                1
                                            </button>
                                            {currentPage > 3 && <span className="text-text-muted">...</span>}
                                        </>
                                    )}

                                    {currentPage > 1 && (
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                                        >
                                            {currentPage - 1}
                                        </button>
                                    )}

                                    <button
                                        className="px-4 py-2 rounded-lg bg-accent-primary border border-accent-primary text-white font-bold"
                                    >
                                        {currentPage}
                                    </button>

                                    {currentPage < totalPages && (
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                                        >
                                            {currentPage + 1}
                                        </button>
                                    )}

                                    {currentPage < totalPages - 1 && (
                                        <>
                                            {currentPage < totalPages - 2 && <span className="text-text-muted">...</span>}
                                            <button
                                                onClick={() => handlePageChange(totalPages)}
                                                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                                            >
                                                {totalPages}
                                            </button>
                                        </>
                                    )}
                                </div>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
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
        <Suspense fallback={
            <div className="min-h-screen pt-32 pb-20 bg-bg-main flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-accent-primary animate-spin" />
            </div>
        }>
            <DiscoverContent />
        </Suspense>
    );
}
