"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Play, Info, Plus, Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useCallback, useContext } from "react";
import { getTrendingMovies, getPopularMovies, getTopRatedMovies, getMovieVideos } from "@/api/tmdb";
import Link from "next/link";
import { useClerk, useUser } from "@clerk/nextjs";
import { WatchlistContext } from "@/context/watchlist-context";
import clsx from "clsx";

export function Hero() {
    const [movies, setMovies] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [direction, setDirection] = useState(1);
    const [showTrailer, setShowTrailer] = useState(false);
    const [trailerKey, setTrailerKey] = useState<string | null>(null);
    const [loadingTrailer, setLoadingTrailer] = useState(false);
    const { isSignedIn } = useUser();
    const { openSignIn } = useClerk();
    const { has, add, remove } = useContext(WatchlistContext) as any;

    useEffect(() => {
        async function loadHero() {
            try {
                const [trending, popular, topRated] = await Promise.all([
                    getTrendingMovies("day"),
                    getPopularMovies(),
                    getTopRatedMovies()
                ]);
                const allMovies = [
                    ...(trending?.results || []).slice(0, 10),
                    ...(popular?.results || []).slice(0, 10),
                    ...(topRated?.results || []).slice(0, 10)
                ];
                const uniqueMovies = allMovies.filter((movie, index, self) => 
                    index === self.findIndex((m) => m.id === movie.id)
                );
                const shuffled = uniqueMovies.sort(() => Math.random() - 0.5);
                setMovies(shuffled.slice(0, 15));
            } catch (e) {
                console.error("Hero load error:", e);
            } finally {
                setLoading(false);
            }
        }
        loadHero();
    }, []);

    useEffect(() => {
        if (movies.length === 0 || showTrailer) return;
        const interval = setInterval(() => {
            setDirection(1);
            setCurrentIndex((prev) => (prev + 1) % movies.length);
        }, 10000); 
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
                window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + " official trailer")}`, "_blank");
            }
        } catch {
            window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + " official trailer")}`, "_blank");
        } finally {
            setLoadingTrailer(false);
        }
    }, [movies, currentIndex]);

    const movie = movies[currentIndex];
    const isWatchlisted = movie ? has(movie.id, "movie") : false;

    const handleWatchlist = useCallback(() => {
        if (!movie) return;
        if (!isSignedIn) {
            openSignIn();
            return;
        }
        if (isWatchlisted) {
            remove(movie.id, "movie");
        } else {
            add({ ...movie, type: "movie" });
        }
    }, [movie, isSignedIn, isWatchlisted, openSignIn, add, remove]);

    if (loading) return <div className="h-[100vh] w-full bg-bg-main animate-pulse" />;
    if (!movie) return null;

    return (
        <section className="relative h-[100vh] min-h-[600px] w-full overflow-hidden group">
            {/* Trailer Modal */}
            <AnimatePresence>
                {showTrailer && trailerKey && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4"
                        onClick={() => { setShowTrailer(false); setTrailerKey(null); }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative w-full max-w-6xl aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-accent-primary/20"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => { setShowTrailer(false); setTrailerKey(null); }}
                                className="absolute top-4 right-4 z-50 p-3 bg-black/50 hover:bg-accent-primary text-white rounded-full transition-colors backdrop-blur-md"
                            >
                                <X size={24} />
                            </button>
                            <iframe
                                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`}
                                title="Trailer"
                                className="w-full h-full"
                                allow="autoplay; encrypted-media"
                                allowFullScreen
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Background Image */}
            <AnimatePresence initial={false} mode="wait" custom={direction}>
                <motion.div
                    key={currentIndex}
                    custom={direction}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0"
                >
                    {movie.backdrop_path && (
                        <Image
                            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                            alt={movie.title || "Movie backdrop"}
                            fill
                            priority={currentIndex === 0}
                            className="object-cover object-center"
                        />
                    )}
                    
                    {/* Cinematic Lighting & Gradients */}
                    <div className="absolute inset-0 bg-gradient-to-r from-bg-main via-bg-main/60 to-transparent z-10" />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-main via-transparent to-bg-main/30 z-10" />
                    
                    {/* Radial Vignette */}
                    <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(3,3,5,0.8)_100%)]" />
                </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <button
                onClick={goToPrev}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-30 p-4 bg-glass border border-border text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-white/10 hidden sm:block"
            >
                <ChevronLeft size={28} />
            </button>
            <button
                onClick={goToNext}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-30 p-4 bg-glass border border-border text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-white/10 hidden sm:block"
            >
                <ChevronRight size={28} />
            </button>

            {/* Content */}
            <div className="relative z-20 h-full container flex flex-col justify-end pb-24 sm:pb-32 px-6 sm:px-12 lg:px-20 mx-auto max-w-7xl">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -40 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="max-w-3xl"
                    >
                        {movie && (
                            <>
                                {/* Metadata */}
                                <div className="flex flex-wrap items-center gap-4 mb-6">
                                    <span className="px-3 py-1 bg-accent-primary/20 text-accent-primary border border-accent-primary/30 backdrop-blur-md rounded-full text-xs font-bold tracking-widest uppercase shadow-cinematic-glow">
                                        Trending
                                    </span>
                                    <div className="flex items-center gap-2 text-text-secondary text-sm font-medium">
                                        <span className="flex items-center gap-1 text-white bg-glass px-2 py-0.5 rounded border border-border">
                                            ★ {movie.vote_average?.toFixed(1)}
                                        </span>
                                        <span>•</span>
                                        <span>{movie.release_date?.split("-")[0]}</span>
                                        {movie.adult && (
                                            <>
                                                <span>•</span>
                                                <span className="border border-text-muted px-1 rounded text-xs">18+</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Title */}
                                <h1 className="font-display font-bold text-5xl sm:text-7xl lg:text-[8rem] text-white leading-[0.9] tracking-tight mb-6 drop-shadow-2xl max-w-4xl">
                                    {movie.title}
                                </h1>

                                {/* Description */}
                                <p className="text-text-secondary text-base sm:text-lg md:text-xl line-clamp-3 mb-10 max-w-2xl leading-relaxed font-sans drop-shadow-md">
                                    {movie.overview}
                                </p>

                                {/* Actions */}
                                <div className="flex flex-wrap items-center gap-4">
                                    <button
                                        onClick={handleWatchTrailer}
                                        disabled={loadingTrailer}
                                        className="group relative overflow-hidden flex items-center justify-center gap-3 px-8 py-4 bg-white text-bg-main font-bold rounded-full transition-transform transform hover:scale-105 disabled:opacity-50"
                                    >
                                        <Play fill="currentColor" size={20} className="relative z-10 group-hover:scale-110 transition-transform" />
                                        <span className="relative z-10 text-base">{loadingTrailer ? "Loading..." : "Watch Trailer"}</span>
                                        <div className="absolute inset-0 bg-white/80 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                    </button>

                                    <Link
                                        href={`/movie/${movie.id}`}
                                        className="flex items-center justify-center gap-3 px-8 py-4 bg-glass border border-border backdrop-blur-xl text-white font-medium rounded-full transition-all hover:bg-white/10 hover:border-white/20 hover:scale-105"
                                    >
                                        <Info size={20} />
                                        <span className="text-base">Details</span>
                                    </Link>

                                    <button
                                        onClick={handleWatchlist}
                                        className={clsx(
                                            "flex items-center justify-center p-4 rounded-full transition-all border backdrop-blur-xl hover:scale-110",
                                            isWatchlisted
                                                ? "bg-accent-primary/20 border-accent-primary/50 text-accent-primary"
                                                : "bg-glass border-border text-white hover:bg-white/10 hover:border-white/20"
                                        )}
                                    >
                                        {isWatchlisted ? <Check size={20} /> : <Plus size={20} />}
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Progress Indicators */}
                <div className="absolute bottom-8 right-6 sm:right-12 z-30 flex items-center gap-3">
                    {movies.slice(0, 5).map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setDirection(idx > currentIndex ? 1 : -1);
                                setCurrentIndex(idx);
                            }}
                            className={clsx(
                                "h-1.5 rounded-full transition-all duration-500",
                                idx === currentIndex % 5 ? "w-12 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" : "w-3 bg-white/20 hover:bg-white/50"
                            )}
                            aria-label={`Go to movie ${idx + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
