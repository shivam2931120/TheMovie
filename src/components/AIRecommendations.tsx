"use client";

import { useContext, useEffect, useState } from "react";
import { MovieCard } from "./MovieCard";
import { getMovieRecommendations, getTVRecommendations } from "@/api/tmdb";
import { personalizedMovies } from "@/lib/moviePersonalization";
import { personalizedTV } from "@/lib/tvPersonalization";
import { Sparkles } from "lucide-react";
import { WatchedContext } from "@/context/WatchedContext";
import { useRecommendationPreferences } from "@/context/RecommendationPreferencesContext";
import { useRecommendationProfile } from "@/lib/useRecommendationProfile";

const hasCardData = (item: any) => item?.id && item?.poster_path && (item.title || item.name);

export function AIRecommendations({ id, type = "movie" }: { id: number; type?: "movie" | "tv" }) {
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFallback, setIsFallback] = useState(false);
    const { watched } = useContext(WatchedContext) as any;
    const { isAllowed } = useRecommendationPreferences();
    const profile = useRecommendationProfile(type);
    const profileJson = JSON.stringify(profile);

    useEffect(() => {
        let active = true;
        const controller = new AbortController();
        setLoading(true);
        setRecommendations([]);
        setIsFallback(false);
        async function load() {
            let items: any[] = [];
            const currentProfile = JSON.parse(profileJson);
            if (type === "movie") {
                items=await personalizedMovies(currentProfile,controller.signal,id);
            }
            if (type === "tv") items = await personalizedTV(currentProfile, controller.signal, id);
            if (!active) return;
            if (!items.length) {
                setIsFallback(true);
                const data = type === "tv" ? await getTVRecommendations(id) : await getMovieRecommendations(id);
                const requestId=crypto.randomUUID();
                items = (data?.results || []).filter(hasCardData).map((item: any) => ({ ...item, type, recommendationReason: "Similar titles suggested by TMDB",recommendationModel:'tmdb-similar-v1',recommendationRequestId:requestId }));
            }
            if (active) setRecommendations(items.filter((item) => item.id !== id && !currentProfile.exclude.includes(item.id)));
        }
        void load().catch(() => { if (active) setRecommendations([]); }).finally(() => { if (active) setLoading(false); });
        return () => { active = false; controller.abort(); };
    }, [id, type, profileJson]);

    const visible = recommendations.filter((item) => isAllowed(item, watched)).slice(0, 6);
    if (loading) return <div className="py-8"><div className="mb-4 h-6 w-48 animate-pulse rounded bg-white/5" /><div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">{Array.from({ length: 6 }, (_, index) => <div key={index} className="aspect-[2/3] animate-pulse rounded-xl bg-white/5" />)}</div></div>;
    if (!visible.length) return <p className="py-8 text-sm text-text-muted">No recommendations match your current preferences.</p>;
    return (
        <section className="space-y-4 py-8">
            <div className="flex items-center gap-2"><Sparkles className="text-accent-primary" size={22} /><div><h2 className="text-xl font-bold text-white">Recommended for You</h2><p className="text-xs text-text-muted">{isFallback ? "Similar titles, filtered by your preferences" : "A mix of similar titles and your personal taste"}</p></div></div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">{visible.map((item) => <MovieCard key={`${type}-${item.id}`} movie={item} recommendation reason={item.recommendationReason} />)}</div>
        </section>
    );
}
