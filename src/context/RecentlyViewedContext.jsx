"use client";

import { createContext, useState, useEffect, useCallback, useMemo } from "react";
import { useUser } from "@clerk/nextjs";

export const RecentlyViewedContext = createContext();

const STORAGE_KEY = "movie_catalogue_recently_viewed_v1";
const MAX_ITEMS = 50; // Keep last 50 viewed items

export function RecentlyViewedProvider({ children }) {
    const { user, isSignedIn, isLoaded } = useUser();
    const [recentlyViewed, setRecentlyViewed] = useState([]);

    // Load from storage
    useEffect(() => {
        if (!isLoaded) return;

        if (isSignedIn && user) {
            const userRecent = user.unsafeMetadata?.recentlyViewed || [];
            setRecentlyViewed(userRecent);
        } else {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                setRecentlyViewed(raw ? JSON.parse(raw) : []);
            } catch {
                setRecentlyViewed([]);
            }
        }
    }, [isSignedIn, user, isLoaded]);

    // Save to storage
    useEffect(() => {
        if (!isLoaded) return;

        if (isSignedIn && user) {
            user.update({
                unsafeMetadata: {
                    ...user.unsafeMetadata,
                    recentlyViewed: recentlyViewed
                }
            }).catch(err => {
                console.warn("Failed to save recently viewed to Clerk, using localStorage fallback:", err.message || err);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(recentlyViewed));
            });
        } else {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(recentlyViewed));
        }
    }, [recentlyViewed, isSignedIn, user, isLoaded]);

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
    }, []);

    const clearRecentlyViewed = useCallback(() => {
        setRecentlyViewed([]);
    }, []);

    const removeFromRecentlyViewed = useCallback((id, type = 'movie') => {
        setRecentlyViewed(prev => prev.filter(item => !(item.id === id && item.type === type)));
    }, []);

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
