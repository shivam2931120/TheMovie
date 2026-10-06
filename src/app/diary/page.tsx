"use client";

import { LibraryNav } from "@/components/LibraryNav";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getMovieDetails, getTVDetails, searchMulti } from "@/api/tmdb";
import { useDiary } from "@/context/DiaryContext";
import { DiaryEntryForm } from "@/components/DiaryEntryForm";
import { diaryStats } from "@/lib/diary";

export default function DiaryPage() {
    const { owner } = useDiary();
    return <DiaryContent key={owner} />;
}

function DiaryContent() {
    const { entries, loading, status, removeEntry } = useDiary();
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [selected, setSelected] = useState<any>(null);
    const [month, setMonth] = useState("");
    const [filter, setFilter] = useState("");
    const [editing, setEditing] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        let active = true;
        setSuggestions([]);
        if (query.trim().length < 2) { setSearching(false); return; }
        setSearching(true);
        const timer = setTimeout(() => {
            searchMulti(query.trim()).then((data) => {
                if (active) setSuggestions((data?.results || []).filter((item: any) => item.media_type === "movie" || item.media_type === "tv").slice(0, 8));
            }).finally(() => { if (active) setSearching(false); });
        }, 300);
        return () => { active = false; clearTimeout(timer); };
    }, [query]);

    useEffect(() => {
        if (!selected?.id || selected.enriched) return;
        let active = true;
        const getDetails = selected.type === "tv" ? getTVDetails : getMovieDetails;
        getDetails(selected.id).then((details) => {
            if (active && details?.id) setSelected({ ...details, type: selected.type, enriched: true });
        });
        return () => { active = false; };
    }, [selected]);

    const visible = useMemo(() => entries.filter((entry) => (!month || entry.watchedOn.startsWith(month)) && (!filter || entry.item.title.toLowerCase().includes(filter.toLowerCase()))), [entries, month, filter]);
    const stats = diaryStats(visible, entries);
    const months = [...new Set(entries.map((entry) => entry.watchedOn.slice(0, 7)))].sort().reverse();
    const field = "rounded-lg border border-white/15 bg-white/5 p-3 text-sm text-white";

    return (
        <main className="min-h-screen bg-bg-main pt-32 pb-20">
            <div className="container mx-auto space-y-8 px-4 sm:px-6 lg:px-20">
                <LibraryNav active="diary" />
                <header><h1 className="text-3xl font-display font-bold text-white">Watch Diary</h1><p className="mt-2 text-text-secondary">Log each viewing, remember your thoughts, and keep track of rewatches. Your notes are private.</p><p role="status" className="mt-2 text-xs text-text-muted">{status}</p></header>
                <section className="rounded-xl border border-white/10 bg-bg-card p-5">
                    <h2 className="mb-3 text-lg font-bold text-white">Log a watch</h2>
                    <label className="block text-sm text-text-secondary">Find a movie or show<input className={`${field} mt-2 w-full`} value={query} onChange={(event) => { setQuery(event.target.value); setSelected(null); }} placeholder="Search by title" /></label>
                    {searching && <p role="status" className="mt-2 text-sm text-text-muted">Searching…</p>}
                    {!searching && query.trim().length >= 2 && !suggestions.length && !selected && <p className="mt-2 text-sm text-text-muted">No titles found.</p>}
                    {!selected && suggestions.length > 0 && <ul className="my-3 space-y-1">{suggestions.map((item) => <li key={`${item.media_type}-${item.id}`}><button onClick={() => { setSelected({ ...item, type: item.media_type }); setSuggestions([]); }} className="w-full rounded-lg p-2 text-left text-sm text-white hover:bg-white/10">{item.title || item.name} <span className="text-text-muted">({(item.release_date || item.first_air_date || "").slice(0, 4) || "Unknown year"}) · {item.media_type === "tv" ? "TV" : "Movie"}</span></button></li>)}</ul>}
                    {selected && <div className="mt-4"><h3 className="mb-3 font-bold text-white">{selected.title || selected.name}</h3><DiaryEntryForm key={`${selected.type}-${selected.id}`} item={selected} onSaved={() => { setSelected(null); setQuery(""); }} /></div>}
                </section>
                <div className="flex flex-wrap gap-3">
                    <label className="text-sm text-white">Month<select value={month} onChange={(event) => setMonth(event.target.value)} className={`${field} ml-2`}><option value="">All time</option>{months.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
                    <input aria-label="Filter diary by title" className={field} placeholder="Filter logged titles" value={filter} onChange={(event) => setFilter(event.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[["Viewings", stats.entries], ["Different titles", stats.unique], ["Rewatches", stats.rewatches], ["Known watch time", `${Math.round(stats.minutes / 60 * 10) / 10} hours`]].map(([label, value]) => <div key={String(label)} className="rounded-xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-text-muted">{label}</p><p className="mt-1 text-xl font-bold text-white">{value}</p></div>)}</div>
                {loading ? <p className="text-text-muted">Loading diary…</p> : !visible.length ? <p className="rounded-xl bg-white/5 p-8 text-center text-text-secondary">No watches logged for this selection. Start with a title above or log directly from its details page.</p> : <div className="space-y-4">{visible.map((entry) => <article key={entry.id} className="rounded-xl border border-white/10 bg-bg-card p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3"><div><Link className="font-bold text-white hover:text-accent-primary" href={`/${entry.item.type}/${entry.item.id}`}>{entry.item.title}</Link><p className="mt-1 text-sm text-text-muted">{entry.watchedOn} · {entry.item.type === "tv" ? "TV" : "Movie"}{entry.rating ? ` · ${entry.rating}/10` : ""}</p></div><div className="flex gap-3"><button className="text-sm text-accent-primary" onClick={() => setEditing(editing === entry.id ? null : entry.id)}>{editing === entry.id ? "Cancel editing" : "Edit"}</button><button className="text-sm text-text-muted" onClick={() => setDeleting(entry.id)}>Remove</button></div></div>
                    {entry.notes && editing !== entry.id && <p className="mt-3 whitespace-pre-wrap text-sm text-text-secondary">{entry.notes}</p>}
                    {editing === entry.id && <div className="mt-4"><DiaryEntryForm item={entry.item} entry={entry} onSaved={() => setEditing(null)} /></div>}
                    {deleting === entry.id && <div role="alert" className="mt-3 flex flex-wrap items-center gap-4 text-sm text-white"><span>Remove this diary entry?</span><button onClick={() => { removeEntry(entry.id); setDeleting(null); }} className="text-red-400">Remove entry</button><button onClick={() => setDeleting(null)}>Keep it</button></div>}
                </article>)}</div>}
            </div>
        </main>
    );
}
