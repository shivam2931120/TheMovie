"use client";

import { useContext, useMemo, useState } from "react";
import { useTVWatchProgress } from "@/context/TVWatchProgressContext";
import { useProfilePreferences } from "@/context/ProfilePreferencesContext";
import { WatchlistContext } from "@/context/watchlist-context";
import { WatchedContext } from "@/context/WatchedContext";
import { RecentlyViewedContext } from "@/context/RecentlyViewedContext";
import { useRatings } from "@/context/ReviewContext";
import { useDiary } from "@/context/DiaryContext";
import { useLists } from "@/context/ListsContext";
import { useRecommendationPreferences } from "@/context/RecommendationPreferencesContext";

export function useRecommendationProfile(mediaType: "movie" | "tv" = "movie") {
    const { items } = useContext(WatchlistContext) as any;
    const { watched } = useContext(WatchedContext) as any;
    const { recentlyViewed } = useContext(RecentlyViewedContext) as any;
    const { ratings } = useRatings() as any;
    const { entries } = useDiary();
    const { progress } = useTVWatchProgress();
    const { lists } = useLists() as any;
    const { preferences: profilePreferences } = useProfilePreferences();
    const { preferences } = useRecommendationPreferences();
    const [now] = useState(() => Date.now());
    return useMemo(() => {
        const seeds: any[] = [];
        const negatives: any[] = [];
        const add = (item: any, weight: number, source: string, date?: string) => {
            if (!item?.id || (item.type || (item.name && !item.title ? "tv" : "movie")) !== mediaType) return;
            const days = date ? Math.max(0, (now - new Date(date).getTime()) / 86400000) : 0;
            const decay = Number.isFinite(days) ? Math.round(Math.max(0.3, Math.exp(-days / 180)) * 1000) / 1000 : 1;
            seeds.push({ id: Number(item.id), weight: weight * decay, source, label: item.title || item.name });
        };
        const feedback = new Map<number, { item: any; rating: number; date: string; source: string }>();
        const recordFeedback = (item: any, rating: number, date: string, source: string) => {
            const previous = feedback.get(item.id);
            if (rating > 0 && (!previous || date >= previous.date)) feedback.set(item.id, { item, rating, date, source });
        };
        for (const rating of ratings || []) {
            if (rating.type !== mediaType) continue;
            const item = { ...rating.item, id: Number(rating.itemId), type: mediaType };
            recordFeedback(item, rating.rating, rating.updatedAt || rating.createdAt || "", "rated");
        }
        for (const entry of entries) {
            if (entry.item.type !== mediaType) continue;
            recordFeedback(entry.item, entry.rating, entry.updatedAt || entry.watchedOn, "diary");
            add(entry.item, 0.8, "diary", entry.watchedOn);
        }
        for (const signal of feedback.values()) {
            if (signal.rating <= 4) negatives.push({ id: signal.item.id, weight: (5 - signal.rating) / 2 });
            else if (signal.rating >= 7) add(signal.item, 1.5 + (signal.rating - 7) * 0.5, signal.source, signal.date);
        }
        for (const item of (watched || []).slice(0, 20)) add(item, 0.8, "watched",item.watchedAt);
        for (const item of (items || []).slice(0, 15)) add(item, 1.1, "watchlist",item.addedAt);
        for (const item of (recentlyViewed || []).slice(0, 8)) add(item, 0.35, "viewed", item.viewedAt);
        for (const list of lists || []) for (const item of (list.movies || []).slice(0, 4)) add(item, 0.7, "saved");
        for (const item of preferences.dismissed) if (item.type === mediaType) negatives.push({ id: item.id, weight: 1.25 });
        if (mediaType === "tv") for (const [id,seasons] of Object.entries(progress)) {
            const count = Object.values(seasons as any).reduce((sum:number,episodes:any)=>sum+Object.values(episodes||{}).filter(Boolean).length,0);
            if (count) add({id:Number(id),type:"tv"}, Math.min(2,0.5+Number(count)/20),"episode");
        }
        const genres = profilePreferences.favoriteGenres;
        const seedMap = new Map<number, any>();
        for (const seed of seeds) if ((seedMap.get(seed.id)?.weight || 0) < seed.weight) seedMap.set(seed.id, seed);
        const negativeMap = new Map<number, any>();
        for (const seed of negatives) if ((negativeMap.get(seed.id)?.weight || 0) < seed.weight) negativeMap.set(seed.id, seed);
        return {
            seeds: [...seedMap.values()].sort((a, b) => b.weight - a.weight).slice(0, 40), negatives: [...negativeMap.values()].slice(0, 40), favoriteGenres: Array.isArray(genres) ? genres.slice(0, 5) : [],
            exclude: [...new Set([
                ...preferences.dismissed.filter((item) => item.type === mediaType).map((item) => item.id),
                ...negatives.map((item) => item.id),
                ...(preferences.hideWatched ? (watched || []).filter((item: any) => (item.type || "movie") === mediaType).map((item: any) => Number(item.id)) : []),
            ])].slice(0, 2000), exploration: preferences.exploration,
        };
    }, [items, watched, recentlyViewed, ratings, entries, lists, profilePreferences, preferences, now, mediaType, progress]);
}
