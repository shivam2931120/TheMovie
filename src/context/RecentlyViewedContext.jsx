"use client";

import { createContext, useCallback, useMemo } from "react";
import { useAccountFeature } from "@/lib/useAccountFeature";
import { mergeRecentItems } from "@/lib/guestDataMerge";

export const RecentlyViewedContext = createContext();

const MAX_ITEMS = 50;

const EMPTY = [];
const normalizeRecent = value => Array.isArray(value) ? value.filter(item => item?.id).slice(0, MAX_ITEMS) : [];
const mergeRecent = (a,b) => mergeRecentItems(a,b,MAX_ITEMS);

export function RecentlyViewedProvider({ children }) {
    const { data: recentlyViewed, update: setRecentlyViewed, loading } = useAccountFeature("recentlyViewed", EMPTY, mergeRecent, normalizeRecent);
    const addToRecentlyViewed = useCallback((item) => {
        setRecentlyViewed((prev) => {
            // Remove if already exists
            const filtered = prev.filter(i => i.id !== item.id || i.type !== (item.type || 'movie'));
            
            // Add to beginning
            const minItem = {
                id: item.id,
                title: item.title || item.name,
                poster_path: item.poster_path,
                vote_average: item.vote_average,
                release_date: item.release_date || item.first_air_date,
                type: item.type || (item.name ? 'tv' : 'movie'),
                viewedAt: new Date().toISOString()
            };
            
            // Keep only last MAX_ITEMS
            return [minItem, ...filtered].slice(0, MAX_ITEMS);
        });
    }, [setRecentlyViewed]);

    const clearRecentlyViewed = useCallback(() => {
        setRecentlyViewed(() => []);
    }, [setRecentlyViewed]);

    const removeFromRecentlyViewed = useCallback((id, type = 'movie') => {
        setRecentlyViewed(prev => prev.filter(item => !(item.id === id && item.type === type)));
    }, [setRecentlyViewed]);

    const value = useMemo(() => ({
        recentlyViewed,
        addToRecentlyViewed,
        clearRecentlyViewed,
        removeFromRecentlyViewed,
    }), [recentlyViewed, addToRecentlyViewed, clearRecentlyViewed, removeFromRecentlyViewed]);

    return (
        <RecentlyViewedContext.Provider value={value}>
            {children}
        </RecentlyViewedContext.Provider>
    );
}
