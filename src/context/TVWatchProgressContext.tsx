"use client";

import { createContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useUser } from "@clerk/nextjs";

export const TVWatchProgressContext = createContext<any>(null);

const STORAGE_KEY = "tv_watch_progress_v1";

export function TVWatchProgressProvider({ children }: { children: React.ReactNode }) {
    const { user, isSignedIn, isLoaded } = useUser();
    const [progress, setProgress] = useState<Record<string, any>>({});
    const initialized = useRef(false);
    const saveTimeout = useRef<NodeJS.Timeout | null>(null);

    // Load from storage
    useEffect(() => {
        if (!isLoaded) return;

        if (isSignedIn && user) {
            const userProgress = user.unsafeMetadata?.tvProgress || {};
            setProgress(userProgress);
        } else {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                setProgress(raw ? JSON.parse(raw) : {});
            } catch {
                setProgress({});
            }
        }
        setTimeout(() => { initialized.current = true; }, 100);
    }, [isSignedIn, user, isLoaded]);

    // Save to storage (debounced, skip initial mount)
    useEffect(() => {
        if (!isLoaded || !initialized.current) return;
        if (saveTimeout.current) clearTimeout(saveTimeout.current);

        saveTimeout.current = setTimeout(() => {
            if (isSignedIn && user) {
                user.update({
                    unsafeMetadata: {
                        ...user.unsafeMetadata,
                        tvProgress: progress
                    }
                }).catch(() => {
                    try {
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
                    } catch { /* ignore */ }
                });
            } else {
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
                } catch { /* ignore */ }
            }
        }, 1000);

        return () => { if (saveTimeout.current) clearTimeout(saveTimeout.current); };
    }, [progress, isSignedIn, user, isLoaded]);

    const markEpisodeWatched = useCallback((showId: number, season: number, episode: number) => {
        setProgress(prev => ({
            ...prev,
            [showId]: {
                ...(prev[showId] || {}),
                [season]: {
                    ...(prev[showId]?.[season] || {}),
                    [episode]: true
                }
            }
        }));
    }, []);

    const unmarkEpisodeWatched = useCallback((showId: number, season: number, episode: number) => {
        setProgress(prev => {
            const newProgress = { ...prev };
            if (newProgress[showId]?.[season]) {
                delete newProgress[showId][season][episode];
                // Clean up empty objects
                if (Object.keys(newProgress[showId][season]).length === 0) {
                    delete newProgress[showId][season];
                }
                if (Object.keys(newProgress[showId]).length === 0) {
                    delete newProgress[showId];
                }
            }
            return newProgress;
        });
    }, []);

    const isEpisodeWatched = useCallback((showId: number, season: number, episode: number) => {
        return !!progress[showId]?.[season]?.[episode];
    }, [progress]);

    const getShowProgress = useCallback((showId: number, totalEpisodes: number) => {
        const showProgress = progress[showId] || {};
        let watchedCount = 0;
        Object.values(showProgress).forEach((season: any) => {
            watchedCount += Object.keys(season).length;
        });
        return {
            watched: watchedCount,
            total: totalEpisodes,
            percentage: totalEpisodes > 0 ? (watchedCount / totalEpisodes) * 100 : 0
        };
    }, [progress]);

    const getSeasonProgress = useCallback((showId: number, seasonNumber: number, totalEpisodes: number) => {
        const seasonData = progress[showId]?.[seasonNumber] || {};
        const watchedCount = Object.keys(seasonData).length;
        return {
            watched: watchedCount,
            total: totalEpisodes,
            percentage: totalEpisodes > 0 ? (watchedCount / totalEpisodes) * 100 : 0
        };
    }, [progress]);

    const value = useMemo(() => ({
        markEpisodeWatched,
        unmarkEpisodeWatched,
        isEpisodeWatched,
        getShowProgress,
        getSeasonProgress,
        progress
    }), [markEpisodeWatched, unmarkEpisodeWatched, isEpisodeWatched, getShowProgress, getSeasonProgress, progress]);

    return (
        <TVWatchProgressContext.Provider value={value}>
            {children}
        </TVWatchProgressContext.Provider>
    );
}
