"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useDiary } from "@/context/DiaryContext";
import { localToday, type DiaryEntry } from "@/lib/diary";

export function DiaryEntryForm({ item, entry, onSaved }: { item: any; entry?: DiaryEntry; onSaved?: () => void }) {
    const { owner } = useDiary();
    return <DiaryForm key={`${owner}:${entry?.id || "new"}`} item={item} entry={entry} onSaved={onSaved} />;
}

function DiaryForm({ item, entry, onSaved }: { item: any; entry?: DiaryEntry; onSaved?: () => void }) {
    const { saveEntry, entries, loading, status } = useDiary();
    const [date, setDate] = useState(entry?.watchedOn || localToday());
    const [rating, setRating] = useState(entry?.rating || 0);
    const [notes, setNotes] = useState(entry?.notes || "");
    const [message, setMessage] = useState("");
    const type = item.type || (item.name && !item.title ? "tv" : "movie");
    const priorCount = entries.filter((value) => value.item.id === Number(item.id) && value.item.type === type && value.id !== entry?.id).length;
    const submit = (event: FormEvent) => {
        event.preventDefault();
        try {
            saveEntry(item, date, rating, notes, entry?.id);
            setMessage(entry ? "Diary entry updated." : "Watch logged in your diary.");
            onSaved?.();
        } catch (error) { setMessage(error instanceof Error ? error.message : "Could not log this watch."); }
    };
    const field = "w-full rounded-lg border border-white/15 bg-black/30 p-2 text-sm text-white";
    return (
        <form onSubmit={submit} className="space-y-3">
            <p className="text-sm text-text-secondary">{priorCount ? `You have logged this title ${priorCount} time${priorCount === 1 ? "" : "s"} before. This can be a rewatch.` : "Record when you watched it, with an optional rating and private notes."}</p>
            <div className="grid grid-cols-2 gap-3">
                <label className="text-sm text-white">Watched on<input aria-label="Watched on" className={field} type="date" value={date} max={localToday()} required onChange={(event) => setDate(event.target.value)} /></label>
                <label className="text-sm text-white">Rating<select className={field} value={rating} onChange={(event) => setRating(Number(event.target.value))}><option value={0}>No rating</option>{Array.from({ length: 10 }, (_, index) => <option key={index} value={index + 1}>{index + 1}/10</option>)}</select></label>
            </div>
            <label className="block text-sm text-white">Private notes<textarea className={field} value={notes} maxLength={1000} rows={3} placeholder="What did you think?" onChange={(event) => setNotes(event.target.value)} /></label>
            <div className="flex items-center gap-4"><button disabled={loading} className="rounded-lg bg-accent-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{entry ? "Update entry" : "Log this watch"}</button><Link href="/diary" className="text-sm text-accent-primary">Open diary</Link></div>
            <p className="text-xs text-text-muted" role="status">{message || status}</p>
        </form>
    );
}
