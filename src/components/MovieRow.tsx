"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MovieCard } from "./MovieCard";
import { motion } from "framer-motion";

interface MovieRowProps {
    title: string;
    movies: any[];
}

export function MovieRow({ title, movies }: MovieRowProps) {
    const rowRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (rowRef.current) {
            const { current } = rowRef;
            const scrollAmount = direction === "left" ? -current.offsetWidth : current.offsetWidth;
            current.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
    };

    if (!movies || movies.length === 0) return null;

    return (
        <div className="py-6 sm:py-8 space-y-3 sm:space-y-4">
            <div className="container mx-auto px-4 sm:px-6 lg:px-20 flex items-center justify-between">
                <h2 className="text-lg sm:text-xl md:text-2xl font-display font-semibold text-white">{title}</h2>
                <div className="flex items-center gap-1 sm:gap-2">
                    <button onClick={() => scroll("left")} className="p-1.5 sm:p-2 rounded-full bg-white/5 hover:bg-white/20 transition-colors">
                        <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
                    </button>
                    <button onClick={() => scroll("right")} className="p-1.5 sm:p-2 rounded-full bg-white/5 hover:bg-white/20 transition-colors">
                        <ChevronRight size={18} className="sm:w-5 sm:h-5" />
                    </button>
                </div>
            </div>

            <div
                ref={rowRef}
                className="flex gap-3 sm:gap-4 overflow-x-auto hide-scrollbar px-4 sm:px-6 lg:px-20"
            >
                {movies.map((movie) => (
                    <div key={movie.id} className="min-w-[140px] sm:min-w-[160px] md:min-w-[200px] lg:min-w-[240px]">
                        <MovieCard movie={movie} />
                    </div>
                ))}
            </div>
        </div>
    );
}
