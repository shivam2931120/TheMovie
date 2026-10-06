"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { useAccountFeature } from "@/lib/useAccountFeature";

type HiddenTitle = { id: number; type: "movie" | "tv"; title: string };
type Preferences = { hideWatched: boolean; exploration: number; dismissed: HiddenTitle[] };
const INITIAL: Preferences = { hideWatched: true, exploration: 0.2, dismissed: [] };
function normalizePreferences(value: unknown): Preferences {
    const input = value && typeof value === "object" ? value as Partial<Preferences> : {};
    const dismissed = (Array.isArray(input.dismissed) ? input.dismissed : []).filter((item) => item && Number.isSafeInteger(Number(item.id)) && Number(item.id) > 0 && (item.type === "movie" || item.type === "tv"))
        .map((item) => ({ id: Number(item.id), type: item.type, title: typeof item.title === "string" ? item.title.slice(0, 120) : "Title" }));
    return { hideWatched: typeof input.hideWatched === "boolean" ? input.hideWatched : INITIAL.hideWatched,
        exploration: Number.isFinite(input.exploration) ? Math.max(0, Math.min(0.5, input.exploration!)) : INITIAL.exploration,
        dismissed: [...new Map(dismissed.map((item) => [`${item.type}:${item.id}`, item])).values()] };
}
function mergePreferences(account: Preferences, guest: Preferences): Preferences {
    return { ...INITIAL, ...account, dismissed: [...new Map([...(account.dismissed || []), ...(guest.dismissed || [])].map((item) => [`${item.type}:${item.id}`, item])).values()] };
}
type Actions = { preferences: Preferences; loading: boolean; status: string; setPreferences: (patch: Partial<Preferences>) => void; dismiss: (item: any) => void; restore: (id: number, type: string) => void; isAllowed: (item: any, watched?: any[]) => boolean };
const Context = createContext<Actions | null>(null);

export function RecommendationPreferencesProvider({ children }: { children: React.ReactNode }) {
    const { data, update, status, loading } = useAccountFeature("recommendationPreferences", INITIAL, mergePreferences, normalizePreferences);
    const preferences = useMemo(() => ({ ...INITIAL, ...data, dismissed: Array.isArray(data.dismissed) ? data.dismissed : [] }), [data]);
    const setPreferences = useCallback((patch: Partial<Preferences>) => update((current) => ({ ...current, ...patch })), [update]);
    const dismiss = useCallback((item: any) => {
        const type = item.type || (item.name && !item.title ? "tv" : "movie");
        update((current) => ({ ...current, dismissed: [...current.dismissed.filter((hidden) => hidden.id !== item.id || hidden.type !== type), { id: Number(item.id), type, title: String(item.title || item.name || "Title").slice(0, 120) }] }));
    }, [update]);
    const restore = useCallback((id: number, type: string) => update((current) => ({ ...current, dismissed: current.dismissed.filter((hidden) => hidden.id !== id || hidden.type !== type) })), [update]);
    const isAllowed = useCallback((item: any, watched: any[] = []) => {
        const type = item.type || (item.name && !item.title ? "tv" : "movie");
        if (preferences.dismissed.some((hidden) => Number(hidden.id) === Number(item.id) && hidden.type === type)) return false;
        return !preferences.hideWatched || !watched.some((seen) => Number(seen.id) === Number(item.id) && (seen.type || "movie") === type);
    }, [preferences]);
    const value = useMemo(() => ({ preferences, loading, status, setPreferences, dismiss, restore, isAllowed }), [preferences, loading, status, setPreferences, dismiss, restore, isAllowed]);
    return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useRecommendationPreferences() {
    const value = useContext(Context);
    if (!value) throw new Error("Recommendation preferences provider missing");
    return value;
}
