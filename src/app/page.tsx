"use client";

import { Hero } from "@/components/Hero";
import { TrendingSection } from "@/components/Trending";
import { MovieRow } from "@/components/MovieRow";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { useEffect, useState } from "react";
import { getPopularMovies, getTopRatedMovies, getUpcomingMovies, getNowPlayingMovies } from "@/api/tmdb";
import { MovieRowSkeleton } from "@/components/Skeletons";
import { PersonalizedRows } from "@/components/PersonalizedRows";

export default function Home() {
    const [popular, setPopular] = useState([]);
    const [topRated, setTopRated] = useState([]);
    const [upcoming, setUpcoming] = useState([]);
    const [nowPlaying, setNowPlaying] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const [popData, topData, upData, nowData] = await Promise.all([
                    getPopularMovies(),
                    getTopRatedMovies(),
                    getUpcomingMovies(),
                    getNowPlayingMovies()
                ]);

                if (popData?.results) setPopular(popData.results);
                if (topData?.results) setTopRated(topData.results);
                if (upData?.results) setUpcoming(upData.results);
                if (nowData?.results) setNowPlaying(nowData.results);
            } catch (e) {
                console.error("Failed to fetch movies:", e);
                setError(true);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    return (
        <main className="min-h-screen bg-bg-main text-white selection:bg-accent-primary selection:text-white pb-12 sm:pb-20 overflow-x-hidden relative z-10">
            <Hero />

            <div className="relative z-10 -mt-16 sm:-mt-20 space-y-8 sm:space-y-10">
                <TrendingSection />

                <PersonalizedRows />

                <RecentlyViewed />

                <div className="space-y-4">
                    {loading ? (
                        <>
                            <MovieRowSkeleton />
                            <MovieRowSkeleton />
                            <MovieRowSkeleton />
                            <MovieRowSkeleton />
                        </>
                    ) : error ? (
                        <div className="container mx-auto px-4 sm:px-6 lg:px-20 py-12 text-center">
                            <p className="text-text-muted text-lg mb-4">Failed to load movies. Please try again.</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 bg-accent-primary hover:bg-accent-primary/90 text-white font-bold rounded-lg transition-all"
                            >
                                Retry
                            </button>
                        </div>
                    ) : (
                        <>
                            <MovieRow title="Now Playing" movies={nowPlaying} />
                            <MovieRow title="Popular Movies" movies={popular} />
                            <MovieRow title="Top Rated" movies={topRated} />
                            <MovieRow title="Upcoming" movies={upcoming} />
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}
