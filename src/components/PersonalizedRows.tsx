"use client";

import { useEffect, useState, useContext } from 'react';
import { MovieRow } from './MovieRow';
import { getDiscoverMovies, getMovieRecommendations, getTVRecommendations } from '@/api/tmdb';
import { WatchedContext } from '@/context/WatchedContext';
import { useRatings } from '@/context/ReviewContext';
import { useUser } from '@clerk/nextjs';
import { useRecommendationProfile } from '@/lib/useRecommendationProfile';
import { personalizedTV } from "@/lib/tvPersonalization";
import { useProfilePreferences } from "@/context/ProfilePreferencesContext";
import { RecommendationSettings } from './RecommendationSettings';
import { personalizedMovies } from '@/lib/moviePersonalization';
import { useRecommendationPreferences } from '@/context/RecommendationPreferencesContext';
import Link from 'next/link';

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
const tagSimilar=(items:any[])=>{
    const requestId=crypto.randomUUID();
    return items.map(item=>({...item,recommendationModel:'tmdb-similar-v1',recommendationRequestId:requestId}));
};

export function PersonalizedRows() {
    const {user,isLoaded}=useUser();
    return <PersonalizedRowsForAccount key={isLoaded?(user?.id||'guest'):'loading'}/>;
}

function PersonalizedRowsForAccount() {
    const [loading,setLoading]=useState(true);
    const [tvLoading,setTvLoading]=useState(true);
    const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
    const [tvRow,setTvRow] = useState<any[]>([]);
    const tvProfile=useRecommendationProfile("tv");
    const tvProfileJson = JSON.stringify(tvProfile);
    const [genreRow, setGenreRow] = useState<any[]>([]);
    const [genreRowTitle, setGenreRowTitle] = useState("");
    const [becauseYouWatchedRow, setBecauseYouWatchedRow] = useState<any[]>([]);
    const [becauseTitle, setBecauseTitle] = useState("");
    const [becauseYouRatedRow, setBecauseYouRatedRow] = useState<any[]>([]);
    const [becauseRatedTitle, setBecauseRatedTitle] = useState("");
    const [signalState, setSignalState] = useState<{ owner: string; entries: any[] }>({ owner: "", entries: [] });

    const { watched } = useContext(WatchedContext) as any;
    const { ratings } = useRatings() as any;
    const { user, isSignedIn, isLoaded } = useUser();
    const signalStorageKey = isSignedIn && user ? `${SEARCH_SIGNAL_STORAGE_KEY}:${user.id}` : SEARCH_SIGNAL_STORAGE_KEY;
    const searchSignals = signalState.owner === signalStorageKey ? signalState.entries : null;
    const { preferences: profilePreferences } = useProfilePreferences();
    const movieProfile=useRecommendationProfile();
    const profileJson = JSON.stringify(movieProfile);
    const {isAllowed,preferences,loading:preferencesLoading}=useRecommendationPreferences();

    useEffect(() => {
        const controller=new AbortController();
        setTvRow([]);
        if (!isLoaded) return;
        setTvLoading(true);
        void personalizedTV(JSON.parse(tvProfileJson),controller.signal).then(items=>{if(!controller.signal.aborted)setTvRow(items);}).catch(()=>{}).finally(()=>{if(!controller.signal.aborted)setTvLoading(false);});
        return ()=>controller.abort();
    },[tvProfileJson,isLoaded]);

    useEffect(() => {
        if (typeof window === "undefined" || !isLoaded) return;

        const loadSearchSignals = () => {
            try {
                const stored = JSON.parse(localStorage.getItem(signalStorageKey) || "[]");
                const entries=Array.isArray(stored)?stored:[];
                setSignalState(current=>current.owner===signalStorageKey&&JSON.stringify(current.entries)===JSON.stringify(entries)?current:{owner:signalStorageKey,entries});
            } catch {
                setSignalState({ owner: signalStorageKey, entries: [] });
            }
        };

        loadSearchSignals();
        window.addEventListener("themovie-search-signals", loadSearchSignals);
        window.addEventListener("storage", loadSearchSignals);

        return () => {
            window.removeEventListener("themovie-search-signals", loadSearchSignals);
            window.removeEventListener("storage", loadSearchSignals);
        };
    }, [signalStorageKey, isLoaded]);

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();



        const watchedItems = Array.isArray(watched) ? watched : [];
        const ratingItems = Array.isArray(ratings) ? ratings : [];

        const recentSearchSignals = Array.isArray(searchSignals) ? searchSignals : [];

        setAiRecommendations([]);
        setGenreRow([]);
        setGenreRowTitle("");
        setBecauseYouWatchedRow([]);
        setBecauseTitle("");
        setBecauseYouRatedRow([]);
        setBecauseRatedTitle("");
        if (!isLoaded || searchSignals === null) return () => { isMounted = false; controller.abort(); };

        const loadAiRecommendations = async () => {
            const profile = JSON.parse(profileJson);
            const searchIds = uniqueMovieIds(recentSearchSignals.flatMap((signal: any) => signal.movieIds || []).map(toMovieId), 5);
            return personalizedMovies({...profile,seeds:[...profile.seeds,...searchIds.map(id=>({id,weight:0.3,source:'search'}))]},controller.signal,undefined,
                recentSearchSignals.find((signal:any)=>signal?.query?.trim())?.query||'');
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
                movies:tagSimilar(movies),
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
                movies:tagSimilar(movies),
            };
        };

        const loadGenreRow = async () => {
            const savedGenres = profilePreferences.favoriteGenres;

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
                movies:tagSimilar(movies),
            };
        };

        const runTask = (loader: () => Promise<any>, apply: (result: any) => void) => {
            return loader()
                .then((result) => {
                    if (isMounted) apply(result);
                })
                .catch((error) => {
                    if (!isAbortError(error)) {
                        console.warn("Personalized recommendation row failed:", error);
                    }
                });
        };

        setLoading(true);
        const tasks=[runTask(loadAiRecommendations, setAiRecommendations),
        runTask(loadBecauseYouWatched, (row) => {
            setBecauseYouWatchedRow(row.movies);
            setBecauseTitle(row.title);
        }),
        runTask(loadBecauseYouRated, (row) => {
            setBecauseYouRatedRow(row.movies);
            setBecauseRatedTitle(row.title);
        }),
        runTask(loadGenreRow, (row) => {
            setGenreRow(row.movies);
            setGenreRowTitle(row.title);
        })];
        void Promise.allSettled(tasks).then(()=>{if(isMounted)setLoading(false);});

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [watched, ratings, searchSignals, isLoaded, profileJson, profilePreferences]);


    const seen=new Set<string>();
    const cleanRow=(items:any[],reason?:string)=>{
      let count=0;
      return items.filter(item=>{
        const type=item.type||'movie';const key=`${type}:${item.id}`;
        if(preferences.streaming.mode==='only'&&preferences.streaming.providers.length&&!item.streamingMatched)return false;
        if(count>=MAX_ROW_ITEMS||seen.has(key)||!isAllowed(item,watched)||(type==='tv'?tvProfile:movieProfile).exclude.includes(Number(item.id)))return false;
        seen.add(key);count++;return true;
      }).map(item=>reason?{...item,recommendationReason:reason,recommendationModel:item.recommendationModel||'tmdb-similar-v1'}:item);
    };
    const moviePicks=cleanRow(aiRecommendations);
    const tvPicks=cleanRow(tvRow);
    const ratedPicks=cleanRow(becauseYouRatedRow,becauseRatedTitle);
    const watchedPicks=cleanRow(becauseYouWatchedRow,becauseTitle);
    const genrePicks=cleanRow(genreRow,genreRowTitle);
    return (
        <>
            <div className="container mx-auto px-6 lg:px-20"><RecommendationSettings /></div>
            {!preferencesLoading&&!preferences.onboardingCompleted&&<div className="container mx-auto px-6 lg:px-20"><div className="rounded-xl border border-accent-primary/30 bg-white/5 p-5"><h2 className="font-bold text-white">Make these picks yours</h2><p className="mt-1 text-sm text-text-secondary">Rate 5–10 movies or shows to teach us your taste.</p><Link className="inline-flex min-h-11 items-center text-sm text-accent-primary" href="/taste">Set up your taste →</Link></div></div>}
            {!movieProfile.seeds.length&&!tvProfile.seeds.length&&<p className="container mx-auto px-6 pt-4 text-sm text-text-secondary lg:px-20">Start with popular picks. Rate a few titles or choose your favorite genres in your profile to make these more personal.</p>}
            {(loading||tvLoading)&&<p role="status" className="container mx-auto px-6 pt-4 text-sm text-text-muted lg:px-20">Updating your picks…</p>}
            {!loading&&!tvLoading&&!moviePicks.length&&!tvPicks.length&&<p className="container mx-auto px-6 py-6 text-sm text-text-muted lg:px-20">No picks are available right now. Try again later or adjust your hidden titles.</p>}
            {tvPicks.length > 0 && <MovieRow title="TV picked for you" movies={tvPicks} recommendations />}
            {moviePicks.length > 0 && (
                <MovieRow title="Movies picked for you" movies={moviePicks} recommendations />
            )}
            {becauseYouWatchedRow.length > 0 && (
                <MovieRow title={becauseTitle} movies={watchedPicks} recommendations />
            )}
            {becauseYouRatedRow.length > 0 && (
                <MovieRow title={becauseRatedTitle} movies={ratedPicks} recommendations />
            )}
            {genreRow.length > 0 && (
                <MovieRow title={genreRowTitle} movies={genrePicks} recommendations />
            )}
        </>
    );
}
