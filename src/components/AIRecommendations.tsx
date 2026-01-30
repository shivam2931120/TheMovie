"use client";

import { useEffect, useState } from 'react';
import { MovieCard } from './MovieCard';
import { getMovieDetails, getMovieRecommendations } from '@/api/tmdb';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface AIRecommendationsProps {
    movieId: number;
}

export function AIRecommendations({ movieId }: AIRecommendationsProps) {
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFallback, setIsFallback] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function fetchRecommendations() {
            try {
                setLoading(true);
                setIsFallback(false); // Reset fallback status on new fetch
                let movies: any[] = [];

                // 1. Try Custom AI Model first
                try {
                    const res = await fetch(`/api/ai-recommend?movieId=${movieId}`);
                    if (res.ok) {
                        const data = await res.json();
                        const ids = data.recommendations || [];

                        if (ids.length > 0) {
                            // Fetch details for AI recommendations
                            const topIds = ids.slice(0, 6);
                            const moviePromises = topIds.map((id: number) => getMovieDetails(id).catch(() => null));
                            const params = await Promise.all(moviePromises);
                            movies = params.filter(m => m && m.id);
                        }
                    }
                } catch (e) {
                    console.warn("AI fetch failed, using fallback", e);
                }

                // 2. Fallback to TMDB Logic if AI returned nothing (e.g. new movie not in training set)
                if (movies.length === 0) {
                    console.log("No AI results, fetching TMDB fallback");
                    setIsFallback(true);
                    const tmdbRecs = await getMovieRecommendations(movieId);
                    if (tmdbRecs && tmdbRecs.results) {
                        movies = tmdbRecs.results.slice(0, 6);
                    }
                }

                if (isMounted) {
                    setRecommendations(movies);
                }
            } catch (err) {
                console.error("Failed to load recommendations", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        if (movieId) {
            fetchRecommendations();
        }

        return () => { isMounted = false; };
    }, [movieId]);

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
                        AI Recommendation
                    </h2>
                    <p className="text-xs text-text-muted">
                        {isFallback ? "Recommended based on similar content" : "Based on content analysis & machine learning"}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {recommendations.map((movie, index) => (
                    <motion.div
                        key={movie.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <MovieCard movie={movie} />
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
