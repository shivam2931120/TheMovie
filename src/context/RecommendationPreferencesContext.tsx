"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { useAccountFeature } from "@/lib/useAccountFeature";
import { INITIAL_PREFERENCES as INITIAL, normalizePreferences, isHidden, type Preferences, type FeedbackReason } from '@/lib/recommendationPreferences';

function mergePreferences(account: Preferences, guest: Preferences): Preferences {
    const defaultStreaming=JSON.stringify(account.streaming)===JSON.stringify(INITIAL.streaming);
    return { ...INITIAL, ...account, streaming:defaultStreaming?guest.streaming:account.streaming,onboardingCompleted:account.onboardingCompleted||guest.onboardingCompleted,
        dismissed: [...new Map([...(guest.dismissed || []), ...(account.dismissed || [])].map((item) => [`${item.type}:${item.id}`, item])).values()] };
}
type Actions = { preferences: Preferences; loading: boolean; status: string; setPreferences: (patch: Partial<Preferences>) => void; dismiss: (item: any, reason?: FeedbackReason) => void; restore: (id: number, type: string) => void; isAllowed: (item: any, watched?: any[]) => boolean };
const Context = createContext<Actions | null>(null);

export function RecommendationPreferencesProvider({ children }: { children: React.ReactNode }) {
    const { data, update, status, loading } = useAccountFeature("recommendationPreferences", INITIAL, mergePreferences, normalizePreferences);
    const preferences = useMemo(() => ({ ...INITIAL, ...data, dismissed: Array.isArray(data.dismissed) ? data.dismissed : [] }), [data]);
    const setPreferences = useCallback((patch: Partial<Preferences>) => update((current) => ({ ...current, ...patch })), [update]);
    const dismiss = useCallback((item: any, reason:FeedbackReason='dislike') => {
        const type = item.type || (item.name && !item.title ? "tv" : "movie");
        update((current) => ({ ...current, dismissed: [...current.dismissed.filter((hidden) => hidden.id !== Number(item.id) || hidden.type !== type), { id: Number(item.id), type, title: String(item.title || item.name || "Title").slice(0, 120),reason,until:reason==='later'?new Date(Date.now()+7*86400000).toISOString():undefined }] }));
    }, [update]);
    const restore = useCallback((id: number, type: string) => update((current) => ({ ...current, dismissed: current.dismissed.filter((hidden) => hidden.id !== id || hidden.type !== type) })), [update]);
    const isAllowed = useCallback((item: any, watched: any[] = []) => {
        const type = item.type || (item.name && !item.title ? "tv" : "movie");
        if (preferences.dismissed.some((hidden) => Number(hidden.id) === Number(item.id) && hidden.type === type && isHidden(hidden))) return false;
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
