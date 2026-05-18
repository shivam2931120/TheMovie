"use client";

import { useEffect, useState, useContext } from 'react';
import { MovieRow } from './MovieRow';
import { getDiscoverMovies, getMovieRecommendations, getMovieSummaries, getTVRecommendations } from '@/api/tmdb';
import { RecentlyViewedContext } from '@/context/RecentlyViewedContext';
import { WatchlistContext } from '@/context/watchlist-context';
import { WatchedContext } from '@/context/WatchedContext';
import { useLists } from '@/context/ListsContext';
import { useRatings } from '@/context/ReviewContext';
import { useUser } from '@clerk/nextjs';

// GENRE_MAP for profile favourite-genre → TMDB genre ID
const GENRE_ID_MAP: Record<string, number> = {
    "Action": 28, "Adventure": 12, "Animation": 16, "Comedy": 35, "Crime": 80,
    "Documentary": 99, "Drama": 18, "Family": 10751, "Fantasy": 14, "History": 36,
    "Horror": 27, "Music": 10402, "Mystery": 9648, "Romance": 10749, "Sci-Fi": 878,
    "TV Movie": 10770, "Thriller": 53, "War": 10752, "Western": 37,
};

const MAX_SIGNAL_IDS = 20;
const MAX_ROW_ITEMS = 15;
const SEARCH_SIGNAL_STORAGE_KEY = "themovie_recent_search_signals";

const toMovieId = (value: unknown) => {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
};

const uniqueMovieIds = (ids: Array<number | null>, limit = MAX_SIGNAL_IDS) => {
    const unique: number[] = [];
    const seen = new Set<number>();

    for (const id of ids) {
        if (!id || seen.has(id)) continue;
        seen.add(id);
        unique.push(id);
        if (unique.length >= limit) break;
    }

    return unique;
};

const isMovieItem = (item: any) => item?.type === 'movie' || (!item?.type && !item?.name);
const hasCardData = (item: any) => item?.id && item?.poster_path && (item.title || item.name);
const isAbortError = (error: unknown) => error instanceof DOMException && error.name === "AbortError";

export function PersonalizedRows() {
    const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
    const [genreRow, setGenreRow] = useState<any[]>([]);
    const [genreRowTitle, setGenreRowTitle] = useState("");
    const [becauseYouWatchedRow, setBecauseYouWatchedRow] = useState<any[]>([]);
    const [becauseTitle, setBecauseTitle] = useState("");
    const [becauseYouRatedRow, setBecauseYouRatedRow] = useState<any[]>([]);
    const [becauseRatedTitle, setBecauseRatedTitle] = useState("");
    const [searchSignals, setSearchSignals] = useState<any[]>([]);

    const { recentlyViewed } = useContext(RecentlyViewedContext) as any;
    const { items: watchlistItems } = useContext(WatchlistContext) as any;
    const { watched } = useContext(WatchedContext) as any;
    const { ratings } = useRatings() as any;
    const { lists } = useLists() as any;
    const { user, isSignedIn } = useUser();

    useEffect(() => {
        if (typeof window === "undefined") return;

        const loadSearchSignals = () => {
            try {
                const stored = JSON.parse(localStorage.getItem(SEARCH_SIGNAL_STORAGE_KEY) || "[]");
                setSearchSignals(Array.isArray(stored) ? stored : []);
            } catch {
                setSearchSignals([]);
            }
        };

        loadSearchSignals();
        window.addEventListener("themovie-search-signals", loadSearchSignals);
        window.addEventListener("storage", loadSearchSignals);

        return () => {
            window.removeEventListener("themovie-search-signals", loadSearchSignals);
            window.removeEventListener("storage", loadSearchSignals);
        };
    }, []);

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const recentItems = Array.isArray(recentlyViewed) ? recentlyViewed : [];
        const watchlist = Array.isArray(watchlistItems) ? watchlistItems : [];
        const watchedItems = Array.isArray(watched) ? watched : [];
        const ratingItems = Array.isArray(ratings) ? ratings : [];
        const customLists = Array.isArray(lists) ? lists : [];
        const recentSearchSignals = Array.isArray(searchSignals) ? searchSignals : [];

        setAiRecommendations([]);
        setGenreRow([]);
        setGenreRowTitle("");
        setBecauseYouWatchedRow([]);
        setBecauseTitle("");
        setBecauseYouRatedRow([]);
        setBecauseRatedTitle("");

        const buildSignalIds = () => {
            const recentIds = recentItems
                .filter(isMovieItem)
                .slice(0, 5)
                .map((item: any) => toMovieId(item.id));

            const watchlistIds = watchlist
                .filter(isMovieItem)
                .slice(0, 5)
                .map((item: any) => toMovieId(item.id));

            const ratedMovieIds = ratingItems
                .filter((rating: any) => rating.type === 'movie' && rating.rating >= 7)
                .slice(0, 5)
                .map((rating: any) => toMovieId(rating.itemId));

            const listedMovieIds = customLists
                .flatMap((list: any) => Array.isArray(list.movies) ? list.movies : [])
                .filter(isMovieItem)
                .slice(0, 5)
                .map((item: any) => toMovieId(item.id));

            const searchMovieIds = recentSearchSignals
                .flatMap((signal: any) => Array.isArray(signal.movieIds) ? signal.movieIds : [])
                .slice(0, 5)
                .map((id: any) => toMovieId(id));

            return uniqueMovieIds([...recentIds, ...searchMovieIds, ...watchlistIds, ...ratedMovieIds, ...listedMovieIds]);
        };

        const loadAiRecommendations = async () => {
            const signalIds = buildSignalIds();
            const latestSearchQuery = recentSearchSignals.find((signal: any) => typeof signal?.query === "string" && signal.query.trim())?.query || "";
            if (signalIds.length === 0 && !latestSearchQuery) return [];

            const signalSet = new Set(signalIds);
            const params = new URLSearchParams();
            if (signalIds.length > 0) params.set("movieIds", signalIds.join(','));
            if (latestSearchQuery) params.set("query", latestSearchQuery);
            const res = await fetch(`/api/ai-recommend?${params.toString()}`, {
                signal: controller.signal,
            });

            if (!res.ok) return [];

            const data = await res.json();
            const recIds = uniqueMovieIds(
                (Array.isArray(data.recommendations) ? data.recommendations : [])
                    .map((id: number | string) => toMovieId(id)),
                MAX_ROW_ITEMS
            ).filter((id) => !signalSet.has(id));

            if (recIds.length === 0) return [];

            const movies = await getMovieSummaries(recIds, MAX_ROW_ITEMS);
            return movies
                .filter(hasCardData)
                .map((movie: any) => ({ ...movie, type: 'movie' }));
        };

        const loadBecauseYouWatched = async () => {
            const seed = watchedItems.find((item: any) => toMovieId(item.id) && isMovieItem(item));
            if (!seed) return { title: "", movies: [] };

            const recs = await getMovieRecommendations(seed.id);
            const movies = Array.isArray(recs?.results)
                ? recs.results
                    .filter(hasCardData)
                    .slice(0, MAX_ROW_ITEMS)
                    .map((movie: any) => ({ ...movie, type: 'movie' }))
                : [];

            return {
                title: movies.length > 0 ? `Because You Watched "${seed.title || seed.name}"` : "",
                movies,
            };
        };

        const loadBecauseYouRated = async () => {
            const topRating = [...ratingItems]
                .filter((rating: any) => rating.rating >= 7 && toMovieId(rating.itemId))
                .sort((a: any, b: any) => b.rating - a.rating)[0];

            if (!topRating) return { title: "", movies: [] };

            const type = topRating.type === 'tv' ? 'tv' : 'movie';
            const recs = type === 'tv'
                ? await getTVRecommendations(topRating.itemId)
                : await getMovieRecommendations(topRating.itemId);

            const movies = Array.isArray(recs?.results)
                ? recs.results
                    .filter(hasCardData)
                    .slice(0, MAX_ROW_ITEMS)
                    .map((item: any) => ({ ...item, type }))
                : [];

            const title = topRating.item?.title || topRating.item?.name || topRating.movieTitle || "a title";

            return {
                title: movies.length > 0 ? `Because You Rated "${title}" ${topRating.rating}/10` : "",
                movies,
            };
        };

        const loadGenreRow = async () => {
            const metadataPreferences = user?.unsafeMetadata?.profilePreferences as { favoriteGenres?: string[] } | undefined;
            let savedGenres: string[] = [];

            if (isSignedIn && Array.isArray(metadataPreferences?.favoriteGenres)) {
                savedGenres = metadataPreferences.favoriteGenres;
            } else if (typeof window !== 'undefined') {
                try {
                    const parsed = JSON.parse(localStorage.getItem("user_favorite_genres") || "[]");
                    savedGenres = Array.isArray(parsed) ? parsed : [];
                } catch {
                    savedGenres = [];
                }
            }

            const pick = savedGenres.find((genre) => typeof genre === "string" && GENRE_ID_MAP[genre]);
            const genreId = pick ? GENRE_ID_MAP[pick] : null;

            if (!pick || !genreId) return { title: "", movies: [] };

            const data = await getDiscoverMovies({
                with_genres: genreId.toString(),
                sort_by: "popularity.desc",
                "vote_count.gte": 100,
            });

            const movies = Array.isArray(data?.results)
                ? data.results
                    .filter(hasCardData)
                    .slice(0, MAX_ROW_ITEMS)
                    .map((movie: any) => ({ ...movie, type: 'movie' }))
                : [];

            return {
                title: movies.length > 0 ? `Top ${pick} Movies For You` : "",
                movies,
            };
        };

        const runTask = (loader: () => Promise<any>, apply: (result: any) => void) => {
            void loader()
                .then((result) => {
                    if (isMounted) apply(result);
                })
                .catch((error) => {
                    if (!isAbortError(error)) {
                        console.warn("Personalized recommendation row failed:", error);
                    }
                });
        };

        runTask(loadAiRecommendations, setAiRecommendations);
        runTask(loadBecauseYouWatched, (row) => {
            setBecauseYouWatchedRow(row.movies);
            setBecauseTitle(row.title);
        });
        runTask(loadBecauseYouRated, (row) => {
            setBecauseYouRatedRow(row.movies);
            setBecauseRatedTitle(row.title);
        });
        runTask(loadGenreRow, (row) => {
            setGenreRow(row.movies);
            setGenreRowTitle(row.title);
        });

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [recentlyViewed, watchlistItems, watched, ratings, lists, searchSignals, user, isSignedIn]);

    if (aiRecommendations.length === 0 && genreRow.length === 0 && becauseYouWatchedRow.length === 0 && becauseYouRatedRow.length === 0) return null;

    return (
        <>
            {aiRecommendations.length > 0 && (
                <MovieRow title="Recommended For You" movies={aiRecommendations} />
            )}
            {becauseYouWatchedRow.length > 0 && (
                <MovieRow title={becauseTitle} movies={becauseYouWatchedRow} />
            )}
            {becauseYouRatedRow.length > 0 && (
                <MovieRow title={becauseRatedTitle} movies={becauseYouRatedRow} />
            )}
            {genreRow.length > 0 && (
                <MovieRow title={genreRowTitle} movies={genreRow} />
            )}
        </>
    );
}
