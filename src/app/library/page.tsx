"use client";

import { Suspense, useContext, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { LibraryNav } from "@/components/LibraryNav";
import { MovieCard } from "@/components/MovieCard";
import { WatchlistContext } from "@/context/watchlist-context";
import { WatchedContext } from "@/context/WatchedContext";
import { useTVWatchProgress } from "@/context/TVWatchProgressContext";
import { getTVDetails } from "@/api/tmdb";

function ProgressCard({ id, count }: { id: string; count: number }) {
    const [show, setShow] = useState<any>(null);
    useEffect(() => {
        let active = true;
        getTVDetails(id).then(data => { if (active && data?.id) setShow(data); }).catch(() => {});
        return () => { active = false; };
    }, [id]);
    return <Link href={`/tv/${id}`} className="rounded-2xl border border-white/10 bg-bg-card p-5 hover:border-accent-primary/50">
        <h2 className="font-semibold text-white">{show?.name || `Tracked series #${id}`}</h2>
        <p className="mt-2 text-sm text-text-secondary">{count} episode{count === 1 ? '' : 's'} watched{show?.number_of_episodes ? ` of ${show.number_of_episodes}` : ''}</p>
        {show?.number_of_episodes > 0 && <progress aria-label={`${show.name} watched episodes`} value={Math.min(count, show.number_of_episodes)} max={show.number_of_episodes} className="mt-3 w-full accent-accent-primary" />}
        <span className="mt-3 inline-flex min-h-11 items-center text-sm text-accent-primary">Open episode tracker →</span>
    </Link>;
}

function LibraryContent() {
    const params = useSearchParams();
    const view = ['watched', 'tv'].includes(params.get('view') || '') ? params.get('view')! : 'watchlist';
    const { items, loading: watchlistLoading } = useContext(WatchlistContext) as any;
    const { watched, loading: watchedLoading } = useContext(WatchedContext) as any;
    const { progress, isLoaded } = useTVWatchProgress();
    const [filter, setFilter] = useState('all');
    const [query, setQuery] = useState('');
    const [showLimit, setShowLimit] = useState(20);
    const source: any[] = view === 'watched' ? watched : items;
    const titles = source.filter(item => (filter === 'all' || item.type === filter) && String(item.title || item.name || '').toLowerCase().includes(query.trim().toLowerCase()));
    const tracked = Object.entries(progress as Record<string, Record<string, Record<string, boolean>>>).map(([id, seasons]) => ({ id, count: Object.values(seasons).reduce((sum, episodes) => sum + Object.values(episodes).filter(Boolean).length, 0) })).filter(show => show.count > 0);
    const loading = view === 'tv' ? !isLoaded : view === 'watched' ? watchedLoading : watchlistLoading;
    return <main className="min-h-screen bg-bg-main pb-28 pt-24 sm:pt-32">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-20">
            <header className="mb-6"><h1 className="text-3xl font-display font-bold text-white">Your Library</h1><p className="mt-2 text-text-secondary">Your saved titles, viewing history, lists and episode progress.</p></header>
            <LibraryNav active={view} />
            <div className="mb-6 flex flex-wrap items-center gap-3">
                {view !== 'tv' && <>
                    <input aria-label="Search your library" value={query} onChange={event => setQuery(event.target.value)} placeholder="Find a saved title…" className="min-h-11 min-w-0 flex-1 rounded-xl border border-white/15 bg-bg-card px-4 text-white" />
                    <select aria-label="Filter library by media type" value={filter} onChange={event => setFilter(event.target.value)} className="min-h-11 rounded-xl border border-white/15 bg-bg-card px-3 text-white"><option value="all">Movies & TV</option><option value="movie">Movies</option><option value="tv">TV shows</option></select>
                </>}
                <Link href="/movies" className="inline-flex min-h-11 items-center px-2 text-sm text-accent-primary">Browse movies</Link>
                <Link href="/tv" className="inline-flex min-h-11 items-center px-2 text-sm text-accent-primary">Browse TV</Link>
            </div>
            {loading ? <p role="status" className="text-text-secondary">Loading your library…</p> : view === 'tv' ? <>
                <div className="grid gap-4 sm:grid-cols-2">{tracked.slice(0, showLimit).map(show => <ProgressCard key={show.id} {...show} />)}</div>
                {tracked.length > showLimit && <button className="mt-4 min-h-11 text-accent-primary" onClick={() => setShowLimit(value => value + 20)}>Show more tracked series</button>}
                {!tracked.length && <p className="rounded-xl border border-white/10 p-6 text-text-secondary">No episodes tracked yet. Open a TV show and mark an episode watched to start.</p>}
            </> : titles.length ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">{titles.map(item => <MovieCard key={`${item.type || 'movie'}-${item.id}`} movie={item} />)}</div> : <div className="rounded-xl border border-white/10 p-6 text-text-secondary">
                <p>{source.length ? 'No titles match your filters.' : view === 'watched' ? 'Your watched titles will appear here when you mark them watched.' : 'Save a movie or show to start your watchlist.'}</p>
                <Link href="/discover" className="mt-3 inline-flex min-h-11 items-center text-accent-primary">Discover something to watch →</Link>
            </div>}
        </div>
    </main>;
}

export default function LibraryPage() {
    const { user } = useUser();
    return <Suspense fallback={<main className="min-h-screen bg-bg-main px-6 pt-32 text-white">Loading library…</main>}><LibraryContent key={user?.id || 'guest'} /></Suspense>;
}
