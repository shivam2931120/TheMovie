"use client";

import { Hero } from "@/components/Hero";
import { TrendingSection } from "@/components/Trending";
import { CatalogueRow } from "@/components/CatalogueRow";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { getPopularMovies, getTopRatedMovies, getUpcomingMovies, getNowPlayingMovies } from "@/api/tmdb";
import { PersonalizedRows } from "@/components/PersonalizedRows";

export default function Home() {
    return (
        <main className="min-h-screen bg-bg-main text-white selection:bg-accent-surface selection:text-white pb-24 sm:pb-28 overflow-x-hidden relative z-10">
            <Hero />

            <div className="relative z-10 mt-4 sm:mt-6 space-y-8 sm:space-y-10">
                <TrendingSection />

                <PersonalizedRows />

                <RecentlyViewed />

                <div className="space-y-4">
                    <CatalogueRow title="Now Playing" load={getNowPlayingMovies} />
                    <CatalogueRow title="Popular Movies" load={getPopularMovies} />
                    <CatalogueRow title="Top Rated" load={getTopRatedMovies} />
                    <CatalogueRow title="Upcoming" load={getUpcomingMovies} />
                </div>
            </div>
        </main>
    );
}
