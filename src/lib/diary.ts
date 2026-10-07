export type DiaryItem = { id: number; type: "movie" | "tv"; title: string; poster_path?: string | null; runtime?: number; genre_ids?: number[] };
export type DiaryEntry = { id: string; item: DiaryItem; watchedOn: string; rating: number; notes: string; createdAt: string; updatedAt: string; rewatch?: boolean };

export function localToday() {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function isValidDiaryDate(value: string, today = localToday()) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const parsed = new Date(`${value}T00:00:00Z`);
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
        && value <= today;
}

export function mergeDiary(account: DiaryEntry[], guest: DiaryEntry[]): DiaryEntry[] {
    const entries = new Map<string, DiaryEntry>();
    for (const entry of [...(Array.isArray(account) ? account : []), ...(Array.isArray(guest) ? guest : [])]) {
        if (!entry?.id || !entry.item?.id) continue;
        const existing = entries.get(entry.id);
        if (!existing || entry.updatedAt > existing.updatedAt) entries.set(entry.id, entry);
    }
    return [...entries.values()].sort((a, b) => b.watchedOn.localeCompare(a.watchedOn) || b.createdAt.localeCompare(a.createdAt));
}

export function normalizeDiary(value: unknown): DiaryEntry[] {
    if (!Array.isArray(value)) return [];
    return mergeDiary([], value.filter((entry) => typeof entry?.id === "string" && Number.isSafeInteger(Number(entry.item?.id)) && Number(entry.item.id) > 0 && typeof entry.watchedOn === "string" && isValidDiaryDate(entry.watchedOn))
        .map((entry) => ({ ...entry, item: { ...entry.item, id: Number(entry.item.id), title: String(entry.item.title || "Untitled").slice(0, 200), type: entry.item.type === "tv" ? "tv" : "movie" },
            notes: typeof entry.notes === "string" ? entry.notes.slice(0, 1000) : "", rating: Math.max(0, Math.min(10, Number(entry.rating) || 0)),
            rewatch:typeof entry.rewatch==='boolean'?entry.rewatch:undefined,
            createdAt: typeof entry.createdAt === "string" ? entry.createdAt : entry.watchedOn,
            updatedAt: typeof entry.updatedAt === "string" ? entry.updatedAt : entry.watchedOn })));
}

export function rewatchIds(history:DiaryEntry[]) {
    const first = new Map<string, string>();
    for (const entry of [...history].sort((a, b) => a.watchedOn.localeCompare(b.watchedOn) || a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id))) {
        const key = `${entry.item.type}:${entry.item.id}`;
        if (!first.has(key)) first.set(key, entry.id);
    }
    return new Set(history.filter(entry=>entry.rewatch??first.get(`${entry.item.type}:${entry.item.id}`)!==entry.id).map(entry=>entry.id));
}
export function diaryStats(entries: DiaryEntry[], history: DiaryEntry[] = entries) {
    const counts = new Map<string, number>();
    let minutes = 0;
    for (const entry of entries) {
        const key = `${entry.item.type}:${entry.item.id}`;
        counts.set(key, (counts.get(key) || 0) + 1);
        minutes += Math.max(0, Number(entry.item.runtime) || 0);
    }
    const repeated=rewatchIds(history);
    const rewatches = entries.filter(entry=>repeated.has(entry.id)).length;
    return { entries: entries.length, unique: counts.size, rewatches, minutes };
}
