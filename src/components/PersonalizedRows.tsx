"use client";

import { useEffect, useState, useContext } from 'react';
import { MovieRow } from './MovieRow';
import { getMovieDetails } from '@/api/tmdb';
import { RecentlyViewedContext } from '@/context/RecentlyViewedContext';
import { WatchlistContext } from '@/context/watchlist-context';

export function PersonalizedRows() {
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // use any to bypass context typing issues temporarily
    const { recentlyViewed } = useContext(RecentlyViewedContext) as any;
    const { items: watchlistItems } = useContext(WatchlistContext) as any;

    useEffect(() => {
        let isMounted = true;

        async function fetchPersonalized() {
            // 1. Gather Signals
            // Get last 5 recently viewed movies
            const recentIds = recentlyViewed
                ?.filter((item: any) => item.type === 'movie')
                .slice(0, 5)
                .map((item: any) => item.id) || [];

            // Get last 5 watchlist movies
            const watchlistIds = watchlistItems
                ?.filter((item: any) => item.type === 'movie')
                .slice(0, 5)
                .map((item: any) => item.id) || [];

            // Combine unique IDs
            const signalIds = [...new Set([...recentIds, ...watchlistIds])];

            if (signalIds.length === 0) {
                return; // No history, nothing to personalize
            }

            try {
                setLoading(true);

                // 2. Call Batch AI API
                const res = await fetch(`/api/ai-recommend?movieIds=${signalIds.join(',')}`);
                const data = await res.json();
                const recIds = data.recommendations || [];

                if (recIds.length === 0) {
                    setLoading(false);
                    return;
                }

                // 3. Fetch Details
                const topIds = recIds.slice(0, 15); // Get top 15
                const moviePromises = topIds.map((id: number) => getMovieDetails(id).catch(() => null));
                const movies = await Promise.all(moviePromises);

                if (isMounted) {
                    setRecommendations(movies.filter(m => m && m.id));
                }
            } catch (err) {
                console.error("Personalization failed", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchPersonalized();

        return () => { isMounted = false; };
    }, [recentlyViewed, watchlistItems]);

    if (recommendations.length === 0) return null;

    return (
        <MovieRow
            title="Recommended For You"
            movies={recommendations}
        />
    );
}
