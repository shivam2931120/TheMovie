"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDiscoverMovies } from "@/api/tmdb";
import { MovieCard } from "@/components/MovieCard";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";

function TopRatedContent() {
    const [movies, setMovies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const router = useRouter();
    const { ref: loadMoreRef, inView } = useInView({ threshold: 0.5 });

    // Hardcoded filters for "Highest Rated"
    // Sort by vote_average descending
    // Filter by vote_count >= 500 to avoid 1-vote wonders
    const FILTERS = {
        sort_by: "vote_average.desc",
        "vote_count.gte": 500,
        "vote_average.gte": 7, // Optional: only show good movies
    };

    useEffect(() => {
        async function loadMovies() {
            setLoading(true);
            const data = await getDiscoverMovies({ ...FILTERS, page: 1 });
            if (data?.results) {
                setMovies(data.results);
                setTotalPages(Math.min(data.total_pages || 1, 500));
            }
            setLoading(false);
        }
        loadMovies();
    }, []);

    // Infinite scroll effect
    useEffect(() => {
        if (!inView || loadingMore || currentPage >= totalPages) return;

        async function loadMore() {
            setLoadingMore(true);
            const nextPage = currentPage + 1;
            const data = await getDiscoverMovies({ ...FILTERS, page: nextPage });
            if (data?.results) {
                setMovies(prev => [...prev, ...data.results]);
                setCurrentPage(nextPage);
            }
            setLoadingMore(false);
        }

        loadMore();
    }, [inView, currentPage, totalPages, loadingMore]);

    return (
        <main className="min-h-screen pt-32 sm:pt-36 pb-20 bg-bg-main">
            <div className="container mx-auto px-4 sm:px-6 lg:px-20 mb-6 sm:mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white mb-2">Highest Rated Movies</h1>
                    <p className="text-text-secondary text-sm sm:text-base">The globally acclaimed masterpieces, defined by viewers like you.</p>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-20 mt-8 sm:mt-10">
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="aspect-[2/3] bg-white/5 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-10 sm:gap-y-12 gap-x-3 sm:gap-x-6">
                            {movies.map((movie, index) => (
                                <motion.div
                                    key={`${movie.id}-${index}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: (index % 20) * 0.03 }}
                                >
                                    <MovieCard movie={movie} />
                                </motion.div>
                            ))}
                        </div>

                        {/* Infinite Scroll Loader */}
                        {currentPage < totalPages && (
                            <div ref={loadMoreRef} className="flex justify-center items-center py-12">
                                {loadingMore && (
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="animate-spin text-accent-primary" size={32} />
                                        <p className="text-text-muted text-sm">Loading more titles...</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}

export default function TopRatedPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen pt-32 pb-20 bg-bg-main flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-accent-primary animate-spin" />
            </div>
        }>
            <TopRatedContent />
        </Suspense>
    );
}
