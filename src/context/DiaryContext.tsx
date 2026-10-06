"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { useAccountFeature } from "@/lib/useAccountFeature";
import { DiaryEntry, DiaryItem, isValidDiaryDate, mergeDiary, normalizeDiary } from "@/lib/diary";
import { WatchedContext } from "@/context/WatchedContext";

const EMPTY: DiaryEntry[] = [];
type DiaryActions = { entries: DiaryEntry[]; loading: boolean; status: string; owner: string; saveEntry: (item: any, watchedOn: string, rating: number, notes: string, entryId?: string) => void; removeEntry: (id: string) => void };
const DiaryContext = createContext<DiaryActions | null>(null);

export function DiaryProvider({ children }: { children: React.ReactNode }) {
    const { data, update, loading, status, owner } = useAccountFeature("watchDiary", EMPTY, mergeDiary, normalizeDiary);
    const { addWatched } = useContext(WatchedContext) as any;
    const entries = Array.isArray(data) ? data : EMPTY;
    const saveEntry = useCallback((item: any, watchedOn: string, rating: number, notes: string, entryId?: string) => {
        if (!Number.isInteger(Number(item?.id)) || Number(item.id) <= 0 || !isValidDiaryDate(watchedOn)) {
            throw new Error("Choose a title and a valid date that is not in the future.");
        }
        const savedItem: DiaryItem = {
            id: Number(item.id), type: item.type === "tv" || (!item.type && item.name && !item.title) ? "tv" : "movie",
            title: String(item.title || item.name || "Untitled").slice(0, 200), poster_path: item.poster_path,
            runtime: Math.max(0, Number(item.runtime) || 0),
            genre_ids: Array.isArray(item.genre_ids) ? item.genre_ids : (item.genres || []).map((genre: any) => genre.id),
        };
        const timestamp = new Date().toISOString();
        const id = entryId || crypto.randomUUID();
        update((current) => {
            const existing = current.find((entry) => entry.id === id);
            const next: DiaryEntry = { id, item: savedItem, watchedOn, rating: Math.max(0, Math.min(10, Number(rating) || 0)), notes: notes.slice(0, 1000), createdAt: existing?.createdAt || timestamp, updatedAt: timestamp };
            return mergeDiary(current.filter((entry) => entry.id !== id), [next]);
        });
        addWatched?.({ ...savedItem, type: savedItem.type });
    }, [addWatched, update]);
    const removeEntry = useCallback((id: string) => update((current) => current.filter((entry) => entry.id !== id)), [update]);
    const value = useMemo(() => ({ entries, loading, status, owner, saveEntry, removeEntry }), [entries, loading, status, owner, saveEntry, removeEntry]);
    return <DiaryContext.Provider value={value}>{children}</DiaryContext.Provider>;
}

export function useDiary() {
    const context = useContext(DiaryContext);
    if (!context) throw new Error("useDiary must be used within DiaryProvider");
    return context;
}
