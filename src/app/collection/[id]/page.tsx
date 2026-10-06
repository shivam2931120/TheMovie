"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getCollection } from "@/api/tmdb";
import { MovieCard } from "@/components/MovieCard";

export default function CollectionPage() {
    const { id } = useParams<{ id: string }>();
    const [collection, setCollection] = useState<any>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setCollection(null);
        setError("");
        setLoading(true);

        getCollection(id)
            .then((data) => {
                if (cancelled) return;
                if (!data?.id) throw new Error("Collection details are unavailable.");
                setCollection(data);
            })
            .catch((loadError) => {
                if (!cancelled) setError(loadError?.message || "Could not load this collection.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [id]);

    return (
        <main className="min-h-screen bg-bg-main pt-32 sm:pt-36 pb-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-20">
                <Link href="/collections" className="text-sm text-accent-primary hover:underline">← Collections</Link>
                {loading ? (
                    <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {Array.from({ length: 10 }, (_, index) => <div key={index} className="aspect-[2/3] animate-pulse rounded-xl bg-white/5" />)}
                    </div>
                ) : collection ? (
                    <>
                        <header className="my-8">
                            <h1 className="text-3xl sm:text-4xl font-display font-bold text-white">{collection.name}</h1>
                            {collection.overview && <p className="mt-3 max-w-3xl text-text-secondary">{collection.overview}</p>}
                        </header>
                        {collection.parts?.length ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-10 gap-x-4">
                                {collection.parts.map((movie: any) => <MovieCard key={movie.id} movie={{ ...movie, type: "movie" }} />)}
                            </div>
                        ) : (
                            <p className="mt-8 text-text-secondary">No movies are listed in this collection.</p>
                        )}
                    </>
                ) : (
                    <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-8 text-center">
                        <h1 className="text-2xl font-bold text-white">Collection unavailable</h1>
                        <p className="mt-2 text-text-secondary">{error || "This collection could not be found."}</p>
                        <button onClick={() => window.location.reload()} className="mt-5 rounded-lg bg-accent-primary px-4 py-2 text-sm font-bold text-white">Retry</button>
                    </div>
                )}
            </div>
        </main>
    );
}
