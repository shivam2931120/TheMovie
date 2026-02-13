"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Play, Info, Plus, ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { getTrendingMovies, getPopularMovies, getTopRatedMovies, getMovieVideos } from "@/api/tmdb";
import Link from "next/link";

export function Hero() {
    const [movies, setMovies] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [direction, setDirection] = useState(1);
    const [showTrailer, setShowTrailer] = useState(false);
    const [trailerKey, setTrailerKey] = useState<string | null>(null);
    const [loadingTrailer, setLoadingTrailer] = useState(false);

    useEffect(() => {
        async function loadHero() {
            try {
                // Fetch multiple sources for variety
                const [trending, popular, topRated] = await Promise.all([
                    getTrendingMovies("day"),
                    getPopularMovies(),
                    getTopRatedMovies()
                ]);
                
                // Combine and shuffle movies
                const allMovies = [
                    ...(trending?.results || []).slice(0, 10),
                    ...(popular?.results || []).slice(0, 10),
                    ...(topRated?.results || []).slice(0, 10)
                ];
                
                // Remove duplicates based on ID
                const uniqueMovies = allMovies.filter((movie, index, self) => 
                    index === self.findIndex((m) => m.id === movie.id)
                );
                
                // Shuffle array
                const shuffled = uniqueMovies.sort(() => Math.random() - 0.5);
                setMovies(shuffled.slice(0, 20)); // Keep 20 random movies
            } catch (e) {
                console.error("Hero load error:", e);
            } finally {
                setLoading(false);
            }
        }
        loadHero();
    }, []);

    // Auto-rotate through movies
    useEffect(() => {
        if (movies.length === 0 || showTrailer) return;
        
        const interval = setInterval(() => {
            setDirection(1);
            setCurrentIndex((prev) => (prev + 1) % movies.length);
        }, 8000); // Change every 8 seconds
        
        return () => clearInterval(interval);
    }, [movies.length, showTrailer]);

    const goToNext = useCallback(() => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, [movies.length]);

    const goToPrev = useCallback(() => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
    }, [movies.length]);

    const handleWatchTrailer = useCallback(async () => {
        const movie = movies[currentIndex];
        if (!movie) return;
        
        setLoadingTrailer(true);
        try {
            const data = await getMovieVideos(movie.id);
            const trailer = data?.results?.find(
                (v: any) => v.type === "Trailer" && v.site === "YouTube"
            ) || data?.results?.find(
                (v: any) => v.site === "YouTube"
            );
            
            if (trailer) {
                setTrailerKey(trailer.key);
                setShowTrailer(true);
            } else {
                // Fallback: open YouTube search
                window.open(
                    `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + " official trailer")}`,
                    "_blank"
                );
            }
        } catch {
            window.open(
                `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + " official trailer")}`,
                "_blank"
            );
        } finally {
            setLoadingTrailer(false);
        }
    }, [movies, currentIndex]);

    const movie = movies[currentIndex];

    if (loading) return <div className="h-[85vh] w-full bg-bg-main animate-pulse" />;
    if (!movie) return null;

    return (
        <section className="relative h-[70vh] sm:h-[85vh] w-full overflow-hidden mt-20 sm:mt-24 z-0 group">
            {/* Trailer Modal */}
            <AnimatePresence>
                {showTrailer && trailerKey && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => { setShowTrailer(false); setTrailerKey(null); }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-5xl aspect-video"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => { setShowTrailer(false); setTrailerKey(null); }}
                                className="absolute -top-12 right-0 p-2 text-white hover:text-accent-primary transition-colors"
                                aria-label="Close trailer"
                            >
                                <X size={28} />
                            </button>
                            <iframe
                                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`}
                                title="Movie Trailer"
                                className="w-full h-full rounded-xl"
                                allow="autoplay; encrypted-media"
                                allowFullScreen
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Background Image with Animation */}
            <AnimatePresence initial={false} mode="wait" custom={direction}>
                <motion.div
                    key={currentIndex}
                    custom={direction}
                    initial={{ opacity: 0, x: direction * 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction * -100 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="absolute inset-0"
                >
                    {movie.backdrop_path && (
                        <Image
                            src={`https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`}
                            alt={movie.title || "Movie backdrop"}
                            fill
                            sizes="100vw"
                            priority={currentIndex === 0}
                            className="object-cover object-center"
                        />
                    )}
                    {/* Grain Overlay */}
                    <div className="film-grain absolute inset-0 z-10" />

                    {/* Gradients */}
                    <div className="absolute inset-0 bg-gradient-to-r from-bg-main via-bg-main/50 to-transparent z-10 opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-main via-transparent to-transparent z-10" />
                </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows - visible on mobile, hover on desktop */}
            <button
                onClick={goToPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-sm opacity-60 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 hover:scale-110 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-accent-primary"
                aria-label="Previous movie"
            >
                <ChevronLeft size={24} />
            </button>
            <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-sm opacity-60 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 hover:scale-110 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-accent-primary"
                aria-label="Next movie"
            >
                <ChevronRight size={24} />
            </button>

            {/* Progress Indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                {movies.slice(0, 10).map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => {
                            setDirection(idx > currentIndex ? 1 : -1);
                            setCurrentIndex(idx);
                        }}
                        className={`h-1 rounded-full transition-all duration-300 ${
                            idx === currentIndex % 10 ? "w-8 bg-accent-primary" : "w-2 bg-white/30 hover:bg-white/50"
                        }`}
                        aria-label={`Go to movie ${idx + 1}`}
                    />
                ))}
            </div>

            {/* Content */}
            <div className="relative z-20 h-full container mx-auto px-4 sm:px-6 lg:px-20 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="max-w-2xl"
                    >
                    {movie && (
                        <>
                        {/* Metadata Badges */}
                        <div className="flex items-center gap-3 mb-3 sm:mb-4">
                            <span className="px-2 py-1 bg-white/10 backdrop-blur-md rounded text-xs font-medium text-white border border-white/10">
                                TMDB {movie.vote_average?.toFixed(1)}
                            </span>
                            <span className="text-text-secondary text-xs sm:text-sm font-medium">
                                {movie.release_date?.split("-")[0]}
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[0.9] mb-3 sm:mb-4 drop-shadow-2xl">
                            {movie.title}
                    </h1>

                    {/* Description */}
                    <p className="text-text-muted text-sm sm:text-base md:text-lg line-clamp-2 sm:line-clamp-3 mb-6 sm:mb-8 max-w-lg leading-relaxed">
                        {movie.overview}
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                        <button
                            onClick={handleWatchTrailer}
                            disabled={loadingTrailer}
                            className="flex items-center gap-2 px-5 sm:px-8 py-2.5 sm:py-3.5 bg-accent-primary hover:bg-accent-primary/90 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(229,9,20,0.4)] text-sm sm:text-base focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-60"
                            aria-label={`Watch trailer for ${movie.title}`}
                        >
                            <Play fill="currentColor" size={18} />
                            <span className="hidden xs:inline">{loadingTrailer ? "Loading..." : "Watch Trailer"}</span>
                            <span className="xs:hidden">{loadingTrailer ? "..." : "Trailer"}</span>
                        </button>

                        <Link
                            href={`/movie/${movie.id}`}
                            className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3.5 bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md text-white font-medium rounded-lg transition-all text-sm sm:text-base focus-visible:ring-2 focus-visible:ring-accent-primary"
                            aria-label={`More info about ${movie.title}`}
                        >
                            <Info size={18} />
                            <span className="hidden xs:inline">More Info</span>
                            <span className="xs:hidden">Info</span>
                        </Link>

                        <button
                            className="p-2.5 sm:p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-text-secondary hover:text-white transition-all focus-visible:ring-2 focus-visible:ring-accent-primary"
                            aria-label={`Add ${movie.title} to your list`}
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                    </>
                    )}
                </motion.div>
                </AnimatePresence>
            </div>
        </section>
    );
}
