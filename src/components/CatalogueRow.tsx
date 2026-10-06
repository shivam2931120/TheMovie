"use client";
import { useEffect, useState } from "react";
import { MovieRow } from "./MovieRow";
import { MovieRowSkeleton } from "./Skeletons";

type Loader = (page?: number, options?: { signal?: AbortSignal; throwOnError?: boolean }) => Promise<any>;
export function CatalogueRow({ title, load }: { title: string; load: Loader }) {
    const [attempt, setAttempt] = useState(0);
    const [state, setState] = useState<{ status: 'loading' | 'ready' | 'error'; movies: any[] }>({ status: 'loading', movies: [] });
    useEffect(() => {
        const controller = new AbortController();
        setState({ status: 'loading', movies: [] });
        load(1, { signal: controller.signal, throwOnError: true }).then(data => {
            if (!controller.signal.aborted) setState({ status: 'ready', movies: Array.isArray(data?.results) ? data.results : [] });
        }).catch(() => { if (!controller.signal.aborted) setState({ status: 'error', movies: [] }); });
        return () => controller.abort();
    }, [load, attempt]);
    if (state.status === 'loading') return <section aria-label={`Loading ${title}`} aria-busy="true"><MovieRowSkeleton /></section>;
    if (state.status === 'ready' && state.movies.length) return <MovieRow title={title} movies={state.movies} />;
    return <section className="container mx-auto px-4 py-6 sm:px-6 lg:px-20">
        <h2 className="mb-2 text-xl font-semibold text-white">{title}</h2>
        <p role="status" className="text-sm text-text-secondary">{state.status === 'error' ? 'This section could not load. Your other sections are still available.' : 'No titles are available in this section right now.'}</p>
        <button type="button" onClick={() => setAttempt(value => value + 1)} className="mt-3 min-h-11 rounded-full border border-white/15 px-5 text-sm text-white">Retry {title}</button>
    </section>;
}
