"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Play, Info, Plus, Check, ChevronLeft, ChevronRight, Pause } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useCallback, useContext } from "react";
import { getTrendingMovies, getPopularMovies, getTopRatedMovies, getMovieVideos } from "@/api/tmdb";
import Link from "next/link";
import { useClerk, useUser } from "@clerk/nextjs";
import { WatchlistContext } from "@/context/watchlist-context";
import { TrailerDialog } from "./TrailerDialog";
import clsx from "clsx";

export function Hero() {
    const reducedMotion = useReducedMotion();
    const [interacting, setInteracting] = useState(false);
    const [paused, setPaused] = useState(false);
    const [movies, setMovies] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [attempt, setAttempt] = useState(0);
    const [loading, setLoading] = useState(true);
    const [direction, setDirection] = useState(1);
    const [showTrailer, setShowTrailer] = useState(false);
    const [trailerKey, setTrailerKey] = useState<string | null>(null);
    const [loadingTrailer, setLoadingTrailer] = useState(false);
    const { isSignedIn } = useUser();
    const { openSignIn } = useClerk();
    const { has, add, remove } = useContext(WatchlistContext) as any;

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        async function loadHero() {
            const options = { signal: controller.signal, throwOnError: true };
            const results = await Promise.allSettled([getTrendingMovies("day", options), getPopularMovies(1, options), getTopRatedMovies(1, options)]);
            if (controller.signal.aborted) return;
            const candidates = results.flatMap(result => result.status === 'fulfilled' ? (result.value?.results || []).slice(0, 10) : []);
            const unique = candidates.filter((movie, index, all) => index === all.findIndex(item => item.id === movie.id));
            setMovies(unique.slice(0, 5));
            setCurrentIndex(0);
            setLoading(false);
        }
        void loadHero();
        return () => controller.abort();
    }, [attempt]);

    useEffect(() => {
        if (loading || movies.length < 2 || showTrailer || paused || reducedMotion || loadingTrailer || interacting) return;
        const interval = setInterval(() => {
            setDirection(1);
            setCurrentIndex((prev) => (prev + 1) % movies.length);
        }, 10000); 
        return () => clearInterval(interval);
    }, [loading, movies.length, showTrailer, paused, reducedMotion, loadingTrailer, interacting]);

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

    if (loading) return <div className="h-[65svh] min-h-[480px] sm:h-[75svh] w-full bg-bg-main animate-pulse" />;
    if (!movie) return <section className="px-6 pt-28 pb-8 text-text-secondary"><h1 className="text-2xl font-display text-white">Find your next favourite</h1><p className="mt-2">Featured movies are unavailable right now. You can still browse the sections below.</p><button type="button" className="mt-3 min-h-11 text-accent-primary underline" onClick={() => setAttempt(value => value + 1)}>Retry featured movies</button></section>;

    return (
        <section aria-label="Featured movies" aria-roledescription="carousel" onPointerEnter={() => setInteracting(true)} onPointerLeave={() => setInteracting(false)} onFocusCapture={() => setInteracting(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setInteracting(false); }} className="relative min-h-[480px] h-auto sm:h-[75svh] sm:min-h-[560px] w-full overflow-hidden group">
            {showTrailer && trailerKey && <TrailerDialog videoKey={trailerKey} title={movie.title} onClose={() => { setShowTrailer(false); setTrailerKey(null); }} />}

            {/* Background Image */}
            <AnimatePresence initial={false} mode="wait" custom={direction}>
                <motion.div
                    key={currentIndex}
                    custom={direction}
                    initial={reducedMotion ? false : { opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reducedMotion ? 0 : 1.5, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0"
                >
                    {movie.backdrop_path && (
                        <Image
                            src={`https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`}
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
                aria-label="Previous featured movie"
                onClick={goToPrev}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-30 p-4 bg-glass border border-border text-white rounded-full backdrop-blur-md opacity-80 hover:opacity-100 focus-visible:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-white/10 hidden sm:block"
            >
                <ChevronLeft size={28} />
            </button>
            <button
                aria-label="Next featured movie"
                onClick={goToNext}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-30 p-4 bg-glass border border-border text-white rounded-full backdrop-blur-md opacity-80 hover:opacity-100 focus-visible:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-white/10 hidden sm:block"
            >
                <ChevronRight size={28} />
            </button>

            {/* Content */}
            <div className="relative z-20 min-h-[65svh] sm:min-h-0 sm:h-full container flex flex-col justify-end pt-24 pb-20 sm:pb-24 px-6 sm:px-12 lg:px-20 mx-auto max-w-7xl">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={reducedMotion ? false : { opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: reducedMotion ? 0 : -40 }}
                        transition={{ duration: reducedMotion ? 0 : 0.8, delay: reducedMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="max-w-3xl"
                    >
                        {movie && (
                            <>
                                {/* Metadata */}
                                <div className="flex flex-wrap items-center gap-4 mb-6">
                                    <span className="px-3 py-1 bg-accent-primary/20 text-accent-primary border border-accent-primary/30 backdrop-blur-md rounded-full text-xs font-bold tracking-widest uppercase shadow-cinematic-glow">
                                        Featured
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
                                <h1 className="font-display font-bold text-3xl sm:text-5xl lg:text-6xl text-white leading-tight tracking-tight mb-4 drop-shadow-2xl max-w-4xl">
                                    {movie.title}
                                </h1>

                                {/* Description */}
                                <p className="text-text-secondary text-base sm:text-lg md:text-xl line-clamp-2 sm:line-clamp-3 mb-5 max-w-2xl leading-relaxed font-sans drop-shadow-md">
                                    {movie.overview}
                                </p>

                                {/* Actions */}
                                <div className="flex flex-wrap items-center gap-4">
                                    <button
                                        onClick={handleWatchTrailer}
                                        disabled={loadingTrailer}
                                        className="group relative overflow-hidden flex items-center justify-center gap-3 px-5 py-3 bg-white text-bg-main font-bold rounded-full transition-transform transform hover:scale-105 disabled:opacity-50"
                                    >
                                        <Play fill="currentColor" size={20} className="relative z-10 group-hover:scale-110 transition-transform" />
                                        <span className="relative z-10 text-base">{loadingTrailer ? "Loading..." : "Watch Trailer"}</span>
                                        <div className="absolute inset-0 bg-white/80 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                    </button>

                                    <Link
                                        href={`/movie/${movie.id}`}
                                        className="flex items-center justify-center gap-3 px-5 py-3 bg-glass border border-border backdrop-blur-xl text-white font-medium rounded-full transition-all hover:bg-white/10 hover:border-white/20 hover:scale-105"
                                    >
                                        <Info size={20} />
                                        <span className="text-base">Details</span>
                                    </Link>

                                    <button
                                        aria-label={isWatchlisted ? "Remove from watchlist" : "Add to watchlist"}
                                        aria-pressed={isWatchlisted}
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
                <div className="absolute bottom-3 left-4 right-4 sm:left-auto sm:right-12 z-30 flex items-center justify-end gap-2 sm:gap-3">
                    <button type="button" aria-pressed={paused || Boolean(reducedMotion)} disabled={Boolean(reducedMotion)} onClick={() => setPaused(value => !value)} className="flex min-h-11 items-center gap-2 rounded-full bg-black/40 px-3 text-xs text-white">
                        {paused || reducedMotion ? <Play size={14} /> : <Pause size={14} />}{reducedMotion ? "Motion paused" : paused ? "Resume" : "Pause"}
                    </button>
                    {movies.slice(0, 5).map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setDirection(idx > currentIndex ? 1 : -1);
                                setCurrentIndex(idx);
                            }}
                            className={clsx(
                                "flex min-h-11 min-w-6 items-center justify-center rounded-full",
                                idx === currentIndex ? "w-8 sm:w-12" : "w-6"
                            )}
                            aria-pressed={idx === currentIndex}
                            aria-label={`Show ${movies[idx].title}`}
                        ><span aria-hidden="true" className={clsx("block h-1.5 rounded-full", idx === currentIndex ? "w-full bg-white" : "w-3 bg-white/30")} /></button>
                    ))}
                </div>
            </div>
        </section>
    );
}
