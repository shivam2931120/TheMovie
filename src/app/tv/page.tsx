"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getDiscoverTV } from "@/api/tmdb";
import { MovieCard } from "@/components/MovieCard";
import { Filters } from "@/components/Filters";
import { AdvancedFilters } from "@/components/AdvancedFilters";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";
import clsx from "clsx";

function TVContent() {
    const [shows, setShows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [infiniteScrollEnabled, setInfiniteScrollEnabled] = useState(true);
    const searchParams = useSearchParams();
    const router = useRouter();
    const { ref: loadMoreRef, inView } = useInView({ threshold: 0.5 });

    useEffect(() => {
        async function loadTV() {
            setLoading(true);
            setShows([]);
            setCurrentPage(1);
            const genre = searchParams.get("with_genres");
            const sortBy = searchParams.get("sort_by") || "popularity.desc";
            const yearMin = searchParams.get("year_min");
            const yearMax = searchParams.get("year_max");
            const runtime = searchParams.get("runtime");
            const language = searchParams.get("language");
            
            const filters: any = { sort_by: sortBy, page: 1 };
            if (genre) filters.with_genres = genre;
            if (yearMin) filters["first_air_date.gte"] = `${yearMin}-01-01`;
            if (yearMax) filters["first_air_date.lte"] = `${yearMax}-12-31`;
            if (runtime) {
                const [min, max] = runtime.split("-").map(Number);
                filters["with_runtime.gte"] = min;
                filters["with_runtime.lte"] = max;
            }
            if (language) filters.with_original_language = language;
            
            const data = await getDiscoverTV(filters);
            if (data?.results) {
                setShows(data.results);
                setTotalPages(Math.min(data.total_pages || 1, 500));
            }
            setLoading(false);
        }
        loadTV();
    }, [searchParams]);

    // Infinite scroll effect
    useEffect(() => {
        if (!inView || loadingMore || !infiniteScrollEnabled || currentPage >= totalPages) return;
        
        async function loadMore() {
            setLoadingMore(true);
            const genre = searchParams.get("with_genres");
            const sortBy = searchParams.get("sort_by") || "popularity.desc";
            const yearMin = searchParams.get("year_min");
            const yearMax = searchParams.get("year_max");
            const runtime = searchParams.get("runtime");
            const language = searchParams.get("language");
            
            const nextPage = currentPage + 1;
            const filters: any = { sort_by: sortBy, page: nextPage };
            if (genre) filters.with_genres = genre;
            if (yearMin) filters["first_air_date.gte"] = `${yearMin}-01-01`;
            if (yearMax) filters["first_air_date.lte"] = `${yearMax}-12-31`;
            if (runtime) {
                const [min, max] = runtime.split("-").map(Number);
                filters["with_runtime.gte"] = min;
                filters["with_runtime.lte"] = max;
            }
            if (language) filters.with_original_language = language;
            
            const data = await getDiscoverTV(filters);
            if (data?.results) {
                setShows(prev => [...prev, ...data.results]);
                setCurrentPage(nextPage);
            }
            setLoadingMore(false);
        }
        
        loadMore();
    }, [inView, currentPage, totalPages, searchParams, loadingMore, infiniteScrollEnabled]);

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages || loading) return;
        setLoading(true);
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", newPage.toString());
        router.push(`/tv?${params.toString()}`);
        window.scrollTo({ top: 0 });
    };

    return (
        <main className="min-h-screen pt-32 sm:pt-36 pb-20 bg-bg-main">
            <div className="container mx-auto px-4 sm:px-6 lg:px-20 mb-6 sm:mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white mb-2">TV Shows</h1>
                        <p className="text-text-secondary text-sm sm:text-base">Explore the latest trending TV series.</p>
                    </div>
                    <AdvancedFilters />
                </div>
            </div>

            <Filters />

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
                            {shows.map((show, index) => (
                                <motion.div
                                    key={`${show.id}-${index}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: (index % 20) * 0.03 }}
                                >
                                    <MovieCard movie={show} />
                                </motion.div>
                            ))}
                        </div>

                        {/* Infinite Scroll Loader */}
                        {infiniteScrollEnabled && currentPage < totalPages && (
                            <div ref={loadMoreRef} className="flex justify-center items-center py-12">
                                {loadingMore && (
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="animate-spin text-accent-primary" size={32} />
                                        <p className="text-text-muted text-sm">Loading more shows...</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Toggle Infinite Scroll */}
                        <div className="flex justify-center mt-8">
                            <button
                                onClick={() => setInfiniteScrollEnabled(!infiniteScrollEnabled)}
                                className="px-4 py-2 text-sm text-text-muted hover:text-white border border-white/10 rounded-lg hover:bg-white/5 transition-all"
                            >
                                {infiniteScrollEnabled ? "Disable" : "Enable"} Infinite Scroll
                            </button>
                        </div>

                        {/* Manual Pagination (fallback) */}
                        {!infiniteScrollEnabled && totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-16 mb-8">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                <span className="text-white px-4 py-2">
                                    Page {currentPage} of {totalPages}
                                </span>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}

export default function TVPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen pt-32 pb-20 bg-bg-main flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-accent-primary animate-spin" />
            </div>
        }>
            <TVContent />
        </Suspense>
    );
}
