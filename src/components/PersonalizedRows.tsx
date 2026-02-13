"use client";

import { useEffect, useState, useContext } from 'react';
import { MovieRow } from './MovieRow';
import { getMovieDetails, getDiscoverMovies, getMovieRecommendations } from '@/api/tmdb';
import { RecentlyViewedContext } from '@/context/RecentlyViewedContext';
import { WatchlistContext } from '@/context/watchlist-context';
import { WatchedContext } from '@/context/WatchedContext';

// GENRE_MAP for profile favourite-genre → TMDB genre ID
const GENRE_ID_MAP: Record<string, number> = {
    "Action": 28, "Adventure": 12, "Animation": 16, "Comedy": 35, "Crime": 80,
    "Documentary": 99, "Drama": 18, "Family": 10751, "Fantasy": 14, "History": 36,
    "Horror": 27, "Music": 10402, "Mystery": 9648, "Romance": 10749, "Sci-Fi": 878,
    "TV Movie": 10770, "Thriller": 53, "War": 10752, "Western": 37,
};

export function PersonalizedRows() {
    const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
    const [genreRow, setGenreRow] = useState<any[]>([]);
    const [genreRowTitle, setGenreRowTitle] = useState("");
    const [becauseYouWatchedRow, setBecauseYouWatchedRow] = useState<any[]>([]);
    const [becauseTitle, setBecauseTitle] = useState("");
    const [loading, setLoading] = useState(false);

    const { recentlyViewed } = useContext(RecentlyViewedContext) as any;
    const { items: watchlistItems } = useContext(WatchlistContext) as any;
    const { watched } = useContext(WatchedContext) as any;

    useEffect(() => {
        let isMounted = true;

        async function fetchPersonalized() {
            // 1. AI-based recommendations from watch/watchlist signals
            const recentIds = recentlyViewed
                ?.filter((item: any) => item.type === 'movie')
                .slice(0, 5)
                .map((item: any) => item.id) || [];

            const watchlistIds = watchlistItems
                ?.filter((item: any) => item.type === 'movie')
                .slice(0, 5)
                .map((item: any) => item.id) || [];

            const signalIds = [...new Set([...recentIds, ...watchlistIds])];

            if (signalIds.length > 0) {
                try {
                    setLoading(true);
                    const res = await fetch(`/api/ai-recommend?movieIds=${signalIds.join(',')}`);
                    const data = await res.json();
                    const recIds = data.recommendations || [];

                    if (recIds.length > 0) {
                        const topIds = recIds.slice(0, 15);
                        const moviePromises = topIds.map((id: number) => getMovieDetails(id).catch(() => null));
                        const movies = await Promise.all(moviePromises);
                        if (isMounted) setAiRecommendations(movies.filter(m => m && m.id));
                    }
                } catch (err) {
                    // Silently fail — not critical
                } finally {
                    if (isMounted) setLoading(false);
                }
            }

            // 2. "Because You Watched X" row — pick most recent watched movie and get similar
            const recentWatched = (watched || [])
                .filter((m: any) => m.id && (m.type !== 'tv'))
                .slice(0, 3);
            if (recentWatched.length > 0) {
                const seed = recentWatched[Math.floor(Math.random() * recentWatched.length)];
                try {
                    const recs = await getMovieRecommendations(seed.id);
                    if (recs?.results && isMounted) {
                        setBecauseYouWatchedRow(recs.results.filter((m: any) => m.poster_path).slice(0, 15));
                        setBecauseTitle(`Because You Watched "${seed.title || seed.name}"`);
                    }
                } catch {
                    // ignore
                }
            }

            // 3. Genre-based row from saved favorite genres
            try {
                const savedGenres = typeof window !== 'undefined'
                    ? JSON.parse(localStorage.getItem("user_favorite_genres") || "[]")
                    : [];
                if (savedGenres.length > 0) {
                    // Pick a random favorite genre
                    const pick = savedGenres[Math.floor(Math.random() * savedGenres.length)];
                    const genreId = GENRE_ID_MAP[pick];
                    if (genreId) {
                        const data = await getDiscoverMovies({
                            with_genres: genreId.toString(),
                            sort_by: "popularity.desc",
                            "vote_count.gte": 100,
                        });
                        if (data?.results && isMounted) {
                            setGenreRow(data.results.filter((m: any) => m.poster_path).slice(0, 15));
                            setGenreRowTitle(`Top ${pick} Movies For You`);
                        }
                    }
                }
            } catch {
                // ignore
            }
        }

        fetchPersonalized();
        return () => { isMounted = false; };
    }, [recentlyViewed, watchlistItems, watched]);

    if (aiRecommendations.length === 0 && genreRow.length === 0 && becauseYouWatchedRow.length === 0) return null;

    return (
        <>
            {aiRecommendations.length > 0 && (
                <MovieRow title="Recommended For You" movies={aiRecommendations} />
            )}
            {becauseYouWatchedRow.length > 0 && (
                <MovieRow title={becauseTitle} movies={becauseYouWatchedRow} />
            )}
            {genreRow.length > 0 && (
                <MovieRow title={genreRowTitle} movies={genreRow} />
            )}
        </>
    );
}
