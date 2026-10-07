"use client";

import { createContext, useContext, useCallback, useMemo } from "react";
import { useAccountFeature } from "@/lib/useAccountFeature";
import { mergeTVProgress } from "@/lib/guestDataMerge";

export const TVWatchProgressContext = createContext<any>(null);

type Progress = Record<string, Record<string, Record<string, boolean>>>;
const EMPTY_PROGRESS: Progress = {};
const normalizeProgress = (value: unknown): Progress => {
    const result: Progress = {};
    if (!value || typeof value !== 'object' || Array.isArray(value)) return result;
    for (const [show,seasons] of Object.entries(value)) {
        if (!/^\d+$/.test(show) || !seasons || typeof seasons !== 'object') continue;
        for (const [season,episodes] of Object.entries(seasons)) {
            if (!/^\d+$/.test(season) || !episodes || typeof episodes !== 'object') continue;
            for (const [episode,seen] of Object.entries(episodes)) if (/^\d+$/.test(episode) && Number(episode)>0 && seen === true) {
                result[show] ||= {}; result[show][season] ||= {}; result[show][season][episode] = true;
            }
        }
    }
    return result;
};
const mergeProgress = (a: Progress,b: Progress) => mergeTVProgress(a,b) as Progress;
export function TVWatchProgressProvider({ children }: { children: React.ReactNode }) {
    const {data: progress,update: setProgress,loading,status} = useAccountFeature('tvProgress',EMPTY_PROGRESS,mergeProgress,normalizeProgress);
    const ready = !loading;
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
    }, [setProgress]);

    const unmarkEpisodeWatched = useCallback((showId: number, season: number, episode: number) => {
        setProgress(prev => {
            if (!prev[showId]?.[season]?.[episode]) return prev;
            const seasonProgress = { ...prev[showId][season] };
            delete seasonProgress[episode];
            const showProgress = { ...prev[showId] };
            if (Object.keys(seasonProgress).length) showProgress[season] = seasonProgress;
            else delete showProgress[season];
            const next = { ...prev };
            if (Object.keys(showProgress).length) next[showId] = showProgress;
            else delete next[showId];
            return next;
        });
    }, [setProgress]);

    const markSeasonWatched = useCallback((showId: number, season: number, episodeNumbers: number[]) => {
        setProgress(prev => ({
            ...prev,
            [showId]: {
                ...(prev[showId] || {}),
                [season]: {
                    ...(prev[showId]?.[season] || {}),
                    ...Object.fromEntries(episodeNumbers.filter(n => Number.isInteger(n) && n > 0).map(n => [n, true]))
                }
            }
        }));
    }, [setProgress]);

    const clearSeason = useCallback((showId: number, season: number) => {
        setProgress(prev => {
            if (!prev[showId]?.[season]) return prev;
            const showProgress = { ...prev[showId] };
            delete showProgress[season];
            const next = { ...prev };
            if (Object.keys(showProgress).length) next[showId] = showProgress;
            else delete next[showId];
            return next;
        });
    }, [setProgress]);

    const isEpisodeWatched = useCallback((showId: number, season: number, episode: number) => {
        return !!progress[showId]?.[season]?.[episode];
    }, [progress]);

    const getShowProgress = useCallback((showId: number, totalEpisodes: number) => {
        const showProgress = progress[showId] || {};
        let watchedCount = 0;
        Object.values(showProgress).forEach((season: any) => {
            watchedCount += Object.values(season).filter(Boolean).length;
        });
        return {
            watched: watchedCount,
            total: totalEpisodes,
            percentage: totalEpisodes > 0 ? (Math.min(watchedCount, totalEpisodes) / totalEpisodes) * 100 : 0
        };
    }, [progress]);

    const getSeasonProgress = useCallback((showId: number, seasonNumber: number, totalEpisodes: number) => {
        const seasonData = progress[showId]?.[seasonNumber] || {};
        const watchedCount = Object.values(seasonData).filter(Boolean).length;
        return {
            watched: watchedCount,
            total: totalEpisodes,
            percentage: totalEpisodes > 0 ? (Math.min(watchedCount, totalEpisodes) / totalEpisodes) * 100 : 0
        };
    }, [progress]);

    const value = useMemo(() => ({
        markEpisodeWatched,
        unmarkEpisodeWatched,
        markSeasonWatched,
        clearSeason,
        isEpisodeWatched,
        getShowProgress,
        getSeasonProgress,
        progress,
        status,
        isLoaded: ready
    }), [markEpisodeWatched, unmarkEpisodeWatched, markSeasonWatched, clearSeason, isEpisodeWatched, getShowProgress, getSeasonProgress, progress, ready,status]);

    return (
        <TVWatchProgressContext.Provider value={value}>
            {children}
        </TVWatchProgressContext.Provider>
    );
}

export function useTVWatchProgress() {
    const context = useContext(TVWatchProgressContext);
    if (!context) throw new Error("useTVWatchProgress must be used within TVWatchProgressProvider");
    return context;
}
