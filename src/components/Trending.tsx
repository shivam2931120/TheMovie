"use client";

import { MovieCard } from "./MovieCard";
import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { getTrendingMovies } from "@/api/tmdb";

export function TrendingSection() {
    const [movies, setMovies] = useState<any[]>([]);

    useEffect(() => {
        async function loadTrending() {
            try {
                const data = await getTrendingMovies("week");
                if (data?.results && data.results.length > 0) {
                    setMovies(data.results);
                } else {
                    // Fallback to mock data if API fails or returns empty
                    setMovies(MOCK_MOVIES);
                }
            } catch (e) {
                console.error("Failed to load trending movies", e);
                setMovies(MOCK_MOVIES);
            }
        }
        loadTrending();
    }, []);

    const MOCK_MOVIES = [
        { id: 1, title: "Oppenheimer", poster_path: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg", vote_average: 8.1, release_date: "2023-07-19" },
        { id: 2, title: "Barbie", poster_path: "/iuFNMS8U5cb6xfzi51QaJfjBFbj.jpg", vote_average: 7.2, release_date: "2023-07-19" },
        { id: 3, title: "Avatar: The Way of Water", poster_path: "/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg", vote_average: 7.7, release_date: "2022-12-14" },
        { id: 4, title: "Guardians of the Galaxy Vol. 3", poster_path: "/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg", vote_average: 8.0, release_date: "2023-05-03" },
        { id: 5, title: "Spider-Man: Across the Spider-Verse", poster_path: "/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg", vote_average: 8.4, release_date: "2023-05-31" },
    ];

    return (
        <section className="relative py-20">
            <div className="container px-6 lg:px-20 mx-auto">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="font-display text-3xl font-bold text-white">Trending Now</h2>
                    <button className="flex items-center gap-1 text-sm font-medium text-neutral-400 hover:text-white transition-colors">
                        View All <ChevronRight className="h-4 w-4" />
                    </button>
                </div>

                <div className="relative -mx-6 px-6 lg:-mx-20 lg:px-20 overflow-x-auto hide-scrollbar">
                    <div className="flex gap-6 pb-4 w-max">
                        {movies.map((movie, index) => (
                            <div key={movie.id} className="relative w-[180px] md:w-[220px]">
                                {/* Number Overlay */}
                                <span className="absolute -left-4 -top-12 text-[8rem] font-bold text-white/5 font-display select-none z-0">
                                    {index + 1}
                                </span>

                                <div className="relative z-10">
                                    <MovieCard movie={movie} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
