"use client";

import { useRef, useEffect, useState, useContext } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MovieCard } from "./MovieCard";
import clsx from "clsx";
import { useRecommendationPreferences } from "@/context/RecommendationPreferencesContext";
import { WatchedContext } from "@/context/WatchedContext";

interface MovieRowProps {
    title: string;
    movies: any[];
    recommendations?: boolean;
}

export function MovieRow({ title, movies, recommendations = false }: MovieRowProps) {
    const rowRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const { isAllowed } = useRecommendationPreferences();
    const { watched } = useContext(WatchedContext) as any;

    const checkScrollability = () => {
        if (rowRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
        }
    };

    useEffect(() => {
        checkScrollability();
        window.addEventListener("resize", checkScrollability);
        return () => window.removeEventListener("resize", checkScrollability);
    }, [movies]);

    const scroll = (direction: "left" | "right") => {
        if (rowRef.current) {
            const { current } = rowRef;
            const scrollAmount = direction === "left" ? -current.offsetWidth + 100 : current.offsetWidth - 100;
            current.scrollBy({ left: scrollAmount, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? "auto" : "smooth" });
        }
    };

    const displayMovies = (movies || []).filter((movie) => !recommendations || isAllowed(movie, watched)).slice(0, 20);
    if (displayMovies.length === 0) return null;

    return (
        <div className="relative py-8 sm:py-12 group/row">
            <div className="container mx-auto px-6 lg:px-20 mb-6 flex items-end justify-between">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-semibold text-white tracking-tight">{title}</h2>
                {/* Controls are available to touch and keyboard users. */}
                <div className="flex items-center gap-2 shrink-0 ml-3">
                    <button
                        onClick={() => scroll("left")}
                        disabled={!canScrollLeft}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={() => scroll("right")}
                        disabled={!canScrollRight}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                        aria-label="Scroll right"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="relative">
                {/* Left Gradient */}
                <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-bg-main to-transparent z-10 pointer-events-none opacity-0 transition-opacity duration-300" 
                     style={{ opacity: canScrollLeft ? 1 : 0 }} 
                />

                <div
                    ref={rowRef}
                    onScroll={checkScrollability}
                    className="flex gap-4 sm:gap-6 overflow-x-auto horizontal-scroll px-6 lg:px-20 snap-x snap-mandatory pb-8 pt-4"
                >
                    {displayMovies.map((movie) => (
                        <div 
                            key={`${movie.type || (movie.name ? "tv" : "movie")}-${movie.id}`}
                            className="snap-start shrink-0 w-[140px] sm:w-[180px] md:w-[220px] lg:w-[260px] will-change-transform"
                        >
                            <MovieCard movie={movie} recommendation={recommendations} reason={movie.recommendationReason || title} />
                        </div>
                    ))}
                </div>

                {/* Right Gradient */}
                <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-bg-main to-transparent z-10 pointer-events-none opacity-0 transition-opacity duration-300"
                     style={{ opacity: canScrollRight ? 1 : 0 }} 
                />
            </div>
        </div>
    );
}
