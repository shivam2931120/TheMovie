"use client";

import { MovieCard } from "./MovieCard";
import { useEffect, useState, useRef } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { getTrendingMovies } from "@/api/tmdb";
import { MovieCardSkeleton } from "./Skeletons";
import Link from "next/link";

export function TrendingSection() {
    const [movies, setMovies] = useState<any[]>([]);
    const [error, setError] = useState(false);
    const [attempt, setAttempt] = useState(0);
    const [loading, setLoading] = useState(true);
    const rowRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true); setError(false);
        getTrendingMovies("week", { signal: controller.signal, throwOnError: true }).then(data => {
            if (!controller.signal.aborted) setMovies((data?.results || []).slice(0, 10));
        }).catch(() => { if (!controller.signal.aborted) setError(true); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => controller.abort();
    }, [attempt]);

    const checkScrollability = () => {
        if (rowRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
        }
    };

    const scroll = (direction: "left" | "right") => {
        if (rowRef.current) {
            const { current } = rowRef;
            const scrollAmount = direction === "left" ? -current.offsetWidth + 100 : current.offsetWidth - 100;
            current.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
    };

    if (!loading && (error || !movies.length)) return <section className="container mx-auto px-6 py-8 lg:px-20"><h2 className="text-2xl font-display font-bold text-white">Trending Now</h2><p role="status" className="mt-2 text-text-secondary">{error ? 'Trending titles could not load.' : 'No trending titles are available right now.'}</p><button type="button" className="mt-3 min-h-11 text-accent-primary underline" onClick={() => setAttempt(value => value + 1)}>Retry trending</button></section>;
    return (
        <section className="relative py-8 sm:py-12 group/row overflow-hidden bg-gradient-to-b from-transparent via-bg-surface/30 to-transparent border-y border-white/5">
            <div className="container px-6 lg:px-20 mx-auto">
                <div className="flex items-end justify-between mb-12 relative z-20">
                    <div>
                        <span className="text-accent-primary font-bold text-sm tracking-widest uppercase mb-2 block">Top 10 This Week</span>
                        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">Trending Now</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/movies" className="hidden sm:flex items-center gap-1 text-sm font-bold text-text-secondary hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-accent-primary outline-none">
                            View All <ChevronRight size={16} />
                        </Link>
                        
                        {/* Desktop Controls */}
                        <div className="hidden sm:flex items-center gap-2 opacity-80 group-hover/row:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
                            <button aria-label="Scroll trending titles left" onClick={() => scroll("left")} disabled={!canScrollLeft} className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                                <ChevronLeft size={20} />
                            </button>
                            <button aria-label="Scroll trending titles right" onClick={() => scroll("right")} disabled={!canScrollRight} className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative">
                {/* Left Gradient */}
                <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-bg-main to-transparent z-20 pointer-events-none opacity-0 transition-opacity duration-300" style={{ opacity: canScrollLeft ? 1 : 0 }} />

                <div 
                    ref={rowRef} 
                    onScroll={checkScrollability}
                    className="flex gap-16 sm:gap-24 overflow-x-auto horizontal-scroll px-6 lg:px-20 snap-x snap-mandatory pb-12 pt-8"
                >
                    {loading ? (
                        [...Array(5)].map((_, i) => (
                            <div key={i} className="snap-start shrink-0 relative w-[160px] md:w-[220px]">
                                <MovieCardSkeleton />
                            </div>
                        ))
                    ) : (
                        movies.map((movie, index) => (
                            <div key={movie.id} className="snap-start shrink-0 relative w-[160px] sm:w-[200px] md:w-[240px] will-change-transform flex items-center justify-end">
                                {/* Large Editorial Number Overlay */}
                                <span className="absolute -left-10 sm:-left-16 bottom-8 text-[8rem] sm:text-[10rem] md:text-[12rem] font-black text-white/5 font-display select-none pointer-events-none z-0 tracking-tighter leading-none">
                                    {String(index + 1).padStart(2, '0')}
                                </span>

                                <div className="relative z-10 w-full ml-8 sm:ml-12 hover:-translate-y-4 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]">
                                    <MovieCard movie={movie} />
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Right Gradient */}
                <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-bg-main to-transparent z-20 pointer-events-none opacity-0 transition-opacity duration-300" style={{ opacity: canScrollRight ? 1 : 0 }} />
            </div>
        </section>
    );
}
