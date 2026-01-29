"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { searchMovies } from "@/api/tmdb";
import { MovieCard } from "@/components/MovieCard";
import { Loader2 } from "lucide-react";

function SearchContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q");
    const [movies, setMovies] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchResults() {
            if (query) {
                setLoading(true);
                const data = await searchMovies(query);
                if (data?.results) setMovies(data.results);
                setLoading(false);
            }
        }
        fetchResults();
    }, [query]);

    return (
        <main className="min-h-screen pt-32 sm:pt-36 pb-20 bg-bg-main">
            <div className="container mx-auto px-4 sm:px-6 lg:px-20">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-white mb-6 sm:mb-8">
                    Search Results for <span className="text-accent-primary">"{query}"</span>
                </h1>

                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="aspect-[2/3] bg-white/5 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : movies.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-10 sm:gap-y-12 gap-x-3 sm:gap-x-6">
                        {movies.map((movie) => (
                            <MovieCard key={movie.id} movie={movie} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-text-secondary text-lg">No movies found for "{query}".</p>
                    </div>
                )}
            </div>
        </main>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen pt-32 pb-20 bg-bg-main flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-accent-primary animate-spin" />
            </div>
        }>
            <SearchContent />
        </Suspense>
    );
}
