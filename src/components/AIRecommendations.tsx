"use client";

import { useEffect, useState } from 'react';
import { MovieCard } from './MovieCard';
import { getMovieDetails, getMovieRecommendations } from '@/api/tmdb';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface AIRecommendationsProps {
    movieId: number;
}

export function AIRecommendations({ id, type = 'movie' }: { id: number, type?: 'movie' | 'tv' }) {
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFallback, setIsFallback] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function fetchRecommendations() {
            try {
                setLoading(true);
                setIsFallback(false);
                let items: any[] = [];

                // 1. Try Custom AI Model (Movies Only)
                if (type === 'movie') {
                    try {
                        const res = await fetch(`/api/ai-recommend?movieId=${id}`);
                        if (res.ok) {
                            const data = await res.json();
                            const recIds = data.recommendations || [];

                            if (recIds.length > 0) {
                                const topIds = recIds.slice(0, 6);
                                const promises = topIds.map((mid: number) => getMovieDetails(mid).catch(() => null));
                                const results = await Promise.all(promises);
                                items = results.filter(m => m && m.id && m.poster_path);
                            }
                        }
                    } catch (e) {
                        console.warn("AI fetch failed", e);
                    }
                }

                // 2. Fallback / TV Handling
                if (items.length === 0) {
                    setIsFallback(true);
                    try {
                        let tmdbRecs;
                        if (type === 'movie') {
                            tmdbRecs = await getMovieRecommendations(id);
                        } else {
                            // Using dynamic import or assuming getTVRecommendations is available
                            const { getTVRecommendations } = await import('@/api/tmdb');
                            tmdbRecs = await getTVRecommendations(id);
                        }

                        if (tmdbRecs && tmdbRecs.results) {
                            // Filter valid items (ensure poster and name/title)
                            items = tmdbRecs.results
                                .filter((m: any) => m.poster_path && (m.title || m.name))
                                .slice(0, 6);
                        }
                    } catch (tmdbErr) {
                        console.warn("TMDB Fallback failed:", tmdbErr);
                    }
                }

                if (isMounted) {
                    setRecommendations(items);
                }
            } catch (err) {
                console.error("Failed to load recommendations", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        if (id) {
            fetchRecommendations();
        }

        return () => { isMounted = false; };
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
                        key={item.id}
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
