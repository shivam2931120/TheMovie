"use client";

import { Hero } from "@/components/Hero";
import { TrendingSection } from "@/components/Trending";
import { MovieRow } from "@/components/MovieRow";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { useEffect, useState } from "react";
import { getPopularMovies, getTopRatedMovies, getUpcomingMovies, getNowPlayingMovies } from "@/api/tmdb";

export default function Home() {
    const [popular, setPopular] = useState([]);
    const [topRated, setTopRated] = useState([]);
    const [upcoming, setUpcoming] = useState([]);
    const [nowPlaying, setNowPlaying] = useState([]);

    useEffect(() => {
        async function fetchData() {
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
        }
        fetchData();
    }, []);

    return (
        <main className="min-h-screen bg-bg-main text-white selection:bg-accent-primary selection:text-white pb-12 sm:pb-20 overflow-x-hidden relative z-10">
            <Hero />

            <div className="relative z-10 -mt-16 sm:-mt-20 space-y-8 sm:space-y-10">
                <TrendingSection />
                
                <RecentlyViewed />

                <div className="space-y-4">
                    <MovieRow title="Now Playing" movies={nowPlaying} />
                    <MovieRow title="Popular Movies" movies={popular} />
                    <MovieRow title="Top Rated" movies={topRated} />
                    <MovieRow title="Upcoming" movies={upcoming} />
                </div>
            </div>
        </main>
    );
}
