"use client";

import { useEffect, useState } from 'react';
import { MovieCard } from './MovieCard';
import { getMovieRecommendations, getMovieSummaries, getTVRecommendations } from '@/api/tmdb';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const isAbortError = (error: unknown) => error instanceof DOMException && error.name === "AbortError";
const hasCardData = (item: any) => item?.id && item?.poster_path && (item.title || item.name);

export function AIRecommendations({ id, type = 'movie' }: { id: number, type?: 'movie' | 'tv' }) {
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFallback, setIsFallback] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        async function fetchRecommendations() {
            try {
                setLoading(true);
                setIsFallback(false);
                let items: any[] = [];

                // 1. Try Custom AI Model (Movies Only)
                if (type === 'movie') {
                    try {
                        const params = new URLSearchParams({ movieId: String(id) });
                        const res = await fetch(`/api/ai-recommend?${params.toString()}`, {
                            signal: controller.signal,
                        });
                        if (res.ok) {
                            const data = await res.json();
                            const recIds = Array.isArray(data.recommendations) ? data.recommendations : [];

                            if (recIds.length > 0) {
                                const topIds = recIds
                                    .map((mid: number | string) => Number(mid))
                                    .filter((mid: number) => Number.isInteger(mid) && mid > 0 && mid !== id)
                                    .slice(0, 6);
                                const results = await getMovieSummaries(topIds, 6);
                                items = results
                                    .filter(hasCardData)
                                    .map((movie: any) => ({ ...movie, type: 'movie' }));
                            }
                        }
                    } catch (e) {
                        if (!isAbortError(e)) console.warn("AI fetch failed", e);
                    }
                }

                // 2. Fallback / TV Handling
                if (items.length === 0) {
                    if (isMounted) setIsFallback(true);
                    try {
                        const tmdbRecs = type === 'movie'
                            ? await getMovieRecommendations(id)
                            : await getTVRecommendations(id);

                        if (tmdbRecs && tmdbRecs.results) {
                            items = tmdbRecs.results
                                .filter(hasCardData)
                                .slice(0, 6)
                                .map((item: any) => ({ ...item, type }));
                        }
                    } catch (tmdbErr) {
                        console.warn("TMDB Fallback failed:", tmdbErr);
                    }
                }

                if (isMounted) {
                    setRecommendations(items);
                }
            } catch (err) {
                if (!isAbortError(err)) console.error("Failed to load recommendations", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        if (id) {
            fetchRecommendations();
        }

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [id, type]);

    if (loading) return (
        <div className="py-8">
            <div className="h-6 w-48 bg-white/5 rounded animate-pulse mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-[2/3] rounded-xl bg-white/5 animate-pulse" />
                ))}
            </div>
        </div>
    );

    if (recommendations.length === 0) return null;

    return (
        <section className="py-8 space-y-4">
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-accent-primary/20 rounded-lg">
                    <Sparkles className="text-accent-primary" size={20} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">
                        {type === 'movie' && !isFallback ? "AI Recommendations" : "Recommended for You"}
                    </h2>
                    <p className="text-xs text-text-muted">
                        {type === 'movie' && !isFallback
                            ? "Curated by our AI based on your viewing habits"
                            : `Similar ${type === 'tv' ? 'TV Shows' : 'Movies'} you might like`}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {recommendations.map((item, index) => (
                    <motion.div
                        key={`${type}-${item.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <MovieCard movie={item} />
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
