"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ListChecks, Loader2 } from "lucide-react";
import { MovieCard } from "@/components/MovieCard";

function decodeShareData(data: string) {
    try {
        const normalized = data.replace(/-/g, "+").replace(/_/g, "/");
        const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
        const json = decodeURIComponent(escape(atob(padded)));
        const payload = JSON.parse(json);
        if (typeof payload?.userId !== "string" || typeof payload?.listId !== "string") return null;
        return { userId: payload.userId, listId: payload.listId };
    } catch {
        return null;
    }
}

export default function SharedListPage() {
    const params = useParams();
    const identity = useMemo(() => decodeShareData(String(params.data || "")), [params.data]);
    const [list, setList] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        setList(null);
        setLoading(true);
        if (!identity) {
            setLoading(false);
            return () => { active = false; };
        }

        const query = new URLSearchParams(identity);
        fetch(`/api/shared-list?${query}`, { cache: "no-store" })
            .then(async (response) => response.ok ? response.json() : null)
            .then((data) => { if (active) setList(data?.list || null); })
            .catch(() => { if (active) setList(null); })
            .finally(() => { if (active) setLoading(false); });

        return () => { active = false; };
    }, [identity]);

    const movies = Array.isArray(list?.movies) ? list.movies : [];

    return (
        <main className="min-h-screen pt-32 sm:pt-36 pb-20 bg-bg-main">
            <div className="container mx-auto px-4 sm:px-6 lg:px-20">
                {loading ? (
                    <div className="flex justify-center py-16 text-accent-primary"><Loader2 className="animate-spin" size={32} /></div>
                ) : !list ? (
                    <div className="mx-auto max-w-xl rounded-xl border border-white/10 bg-white/5 p-8 text-center">
                        <ListChecks className="mx-auto mb-4 text-accent-primary" size={36} />
                        <h1 className="text-2xl font-bold text-white mb-2">Shared List Unavailable</h1>
                        <p className="text-text-secondary mb-6">This list is private, was removed, or its link is invalid.</p>
                        <Link href="/lists" className="inline-flex rounded-lg bg-accent-surface px-4 py-2 text-sm font-bold text-white">
                            Go to Lists
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="mb-8">
                            <p className="text-sm font-medium uppercase text-accent-primary mb-2">Shared List</p>
                            <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-2">{list.name}</h1>
                            {list.description && <p className="mb-3 text-text-secondary">{list.description}</p>}
                            <p className="text-text-secondary">{movies.length} saved titles</p>
                        </div>
                        {movies.length ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-10 sm:gap-y-12 gap-x-3 sm:gap-x-6">
                                {movies.map((movie: any) => <MovieCard key={`${movie.type || "movie"}-${movie.id}`} movie={movie} />)}
                            </div>
                        ) : (
                            <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-text-secondary">This shared list has no titles.</div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}
