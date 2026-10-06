"use client";

import { FormEvent, useMemo, useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import { ArrowDown, ArrowUp, Check, Copy, Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { MovieCard } from "@/components/MovieCard";
import { useLists } from "@/context/ListsContext";

const field = "max-w-full rounded-lg border border-white/10 bg-bg-card px-3 py-2 text-sm text-white focus:border-accent-primary focus:outline-none";
const button = "inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-text-secondary hover:text-white disabled:opacity-40 disabled:cursor-not-allowed";
const EMPTY_MOVIES: any[] = [];
const keyOf = (movie: any) => `${movie.type || "movie"}:${movie.id}`;

function ListSection({ list, allLists }: { list: any; allLists: any[] }) {
    const { updateListDetails, deleteList, toggleListPublic, getShareLink, removeFromList, reorderListItem, removeListItems, transferListItems } = useLists() as any;
    const { isSignedIn } = useUser();
    const { openSignIn } = useClerk();
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(list.name);
    const [description, setDescription] = useState(list.description || "");
    const [query, setQuery] = useState("");
    const [mediaType, setMediaType] = useState("all");
    const [sort, setSort] = useState("manual");
    const [selected, setSelected] = useState<string[]>([]);
    const [target, setTarget] = useState("");
    const [status, setStatus] = useState("");
    const [sharing, setSharing] = useState(false);
    const [copied, setCopied] = useState(false);
    const movies: any[] = list.movies || EMPTY_MOVIES;
    const visible = useMemo(() => {
        const filtered = movies.filter((movie) => (mediaType === "all" || (movie.type || "movie") === mediaType)
            && (movie.title || movie.name || "").toLowerCase().includes(query.trim().toLowerCase()));
        if (sort === "title") filtered.sort((a, b) => (a.title || a.name || "").localeCompare(b.title || b.name || ""));
        if (sort === "rating") filtered.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
        if (sort === "release") filtered.sort((a, b) => (b.release_date || "").localeCompare(a.release_date || ""));
        return filtered;
    }, [movies, query, mediaType, sort]);
    // Ignore selections whose titles have been removed elsewhere.
    const selectedKeys = selected.filter((key) => movies.some((movie) => keyOf(movie) === key));
    const allVisibleSelected = visible.length > 0 && visible.every((movie) => selectedKeys.includes(keyOf(movie)));
    const shareLink = getShareLink(list.id);

    const saveDetails = async (event: FormEvent) => {
        event.preventDefault();
        if (!name.trim()) return;
        await updateListDetails(list.id, name, description);
        setEditing(false);
    };
    const transfer = (move: boolean) => {
        if (!target || !selectedKeys.length || !allLists.some((item) => item.id === target)) return;
        transferListItems(list.id, target, selectedKeys, move);
        setSelected([]);
        setStatus(`${selectedKeys.length} title${selectedKeys.length === 1 ? "" : "s"} ${move ? "moved" : "copied"}.`);
    };

    return (
        <section aria-label={list.name} className="rounded-xl border border-white/10 bg-bg-card p-5 sm:p-6">
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:justify-between">
                <div className="min-w-0 flex-1">
                    {editing ? (
                        <form onSubmit={saveDetails} className="max-w-lg space-y-2">
                            <label className="block text-xs text-text-secondary">List name
                                <input value={name} maxLength={100} onChange={(event) => setName(event.target.value)} className={`${field} mt-1 w-full`} autoFocus required />
                            </label>
                            <label className="block text-xs text-text-secondary">Description
                                <textarea value={description} maxLength={1000} onChange={(event) => setDescription(event.target.value)} className={`${field} mt-1 w-full`} rows={3} />
                            </label>
                            <div className="flex gap-2"><button type="submit" disabled={!name.trim()} className={button}>Save</button><button type="button" onClick={() => setEditing(false)} className={button}>Cancel</button></div>
                        </form>
                    ) : (
                        <><h2 className="break-words text-xl font-bold text-white">{list.name} <span className="text-xs font-normal text-text-muted">{movies.length} titles{list.isPublic ? " · Public" : ""}</span></h2>
                            {list.description && <p className="mt-2 whitespace-pre-wrap break-words text-sm text-text-secondary">{list.description}</p>}</>
                    )}
                </div>
                <div className="flex flex-wrap items-start gap-2">
                    <button disabled={sharing} className={button} onClick={async () => {
                        if (!isSignedIn) { openSignIn(); return; }
                        setSharing(true); setStatus("");
                        try { await toggleListPublic(list.id); }
                        catch { setStatus("Could not update sharing. Check your connection and try again."); }
                        finally { setSharing(false); }
                    }}>{list.isPublic ? <Eye size={15} /> : <EyeOff size={15} />}{sharing ? "Updating…" : list.isPublic ? "Public" : "Private"}</button>
                    {shareLink && <button className={button} disabled={sharing} onClick={async () => {
                        try { await navigator.clipboard.writeText(shareLink); setCopied(true); window.setTimeout(() => setCopied(false), 1600); }
                        catch { setStatus("Could not copy the link. Check clipboard permissions and try again."); }
                    }}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? "Copied" : "Share"}</button>}
                    <button className={button} onClick={() => { setName(list.name); setDescription(list.description || ""); setEditing(true); }}><Pencil size={15} />Edit</button>
                    {!list.isDefault && <button className={button} onClick={() => {
                        if (window.confirm(`Delete “${list.name}” and its ${movies.length} list entries? Your watched history will remain.`)) deleteList(list.id);
                    }}><Trash2 size={15} />Delete</button>}
                </div>
            </div>

            {movies.length > 0 && <>
                <div className="mb-4 flex flex-wrap gap-2">
                    <input aria-label={`Search ${list.name}`} placeholder="Search titles in this list" value={query} onChange={(event) => setQuery(event.target.value)} className={`${field} min-w-0 flex-1`} />
                    <select aria-label={`Filter ${list.name} by type`} value={mediaType} onChange={(event) => setMediaType(event.target.value)} className={field}><option value="all">Movies & shows</option><option value="movie">Movies</option><option value="tv">TV shows</option></select>
                    <select aria-label={`Sort ${list.name}`} value={sort} onChange={(event) => setSort(event.target.value)} className={field}><option value="manual">My order</option><option value="title">Title A–Z</option><option value="rating">Highest rated</option><option value="release">Newest release</option></select>
                </div>
                <div className="mb-5 flex flex-wrap items-center gap-2">
                    <button className={button} disabled={!visible.length} onClick={() => setSelected((prev) => allVisibleSelected ? prev.filter((key) => !visible.some((movie) => keyOf(movie) === key)) : [...new Set([...prev, ...visible.map(keyOf)])])}>{allVisibleSelected ? "Deselect visible" : "Select visible"}</button>
                    <span className="text-xs text-text-secondary">{selectedKeys.length} selected · {visible.length} shown</span>
                    {selectedKeys.length > 0 && <>
                        <button className={button} onClick={() => setSelected([])}>Clear selection</button>
                        <select aria-label={`Destination for titles from ${list.name}`} value={target} onChange={(event) => setTarget(event.target.value)} className={field}><option value="">Choose destination</option>{allLists.filter((item) => item.id !== list.id).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
                        <button className={button} disabled={!target} onClick={() => transfer(false)}>Copy</button>
                        <button className={button} disabled={!target} onClick={() => transfer(true)}>Move</button>
                        <button className={button} onClick={() => {
                            if (window.confirm(`Remove ${selectedKeys.length} selected titles from “${list.name}”?`)) { removeListItems(list.id, selectedKeys); setSelected([]); }
                        }}>Remove selected</button>
                    </>}
                </div>
                {sort === "manual" && (query || mediaType !== "all") && <p className="mb-4 text-xs text-text-muted">Move controls change a title’s position in the full list.</p>}
            </>}
            {status && <p role="status" className="mb-4 text-sm text-amber-300">{status}</p>}
            {visible.length > 0 ? <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 md:grid-cols-4 lg:grid-cols-6">
                {visible.map((movie) => {
                    const key = keyOf(movie);
                    const index = movies.findIndex((item) => keyOf(item) === key);
                    return <div key={key} className="min-w-0 space-y-2">
                        <label className="flex cursor-pointer items-center gap-2 text-xs text-text-secondary"><input type="checkbox" checked={selectedKeys.includes(key)} onChange={(event) => setSelected((prev) => event.target.checked ? [...new Set([...prev, key])] : prev.filter((item) => item !== key))} aria-label={`Select ${movie.title || movie.name}`} />Select</label>
                        <MovieCard movie={movie} />
                        <div className="flex gap-1">
                            {sort === "manual" && <><button className={`${button} px-2`} aria-label={`Move ${movie.title || movie.name} up`} disabled={index === 0} onClick={() => reorderListItem(list.id, key, -1)}><ArrowUp size={14} /></button><button className={`${button} px-2`} aria-label={`Move ${movie.title || movie.name} down`} disabled={index === movies.length - 1} onClick={() => reorderListItem(list.id, key, 1)}><ArrowDown size={14} /></button></>}
                            <button className={`${button} flex-1 px-2`} onClick={() => removeFromList(list.id, movie.id, movie.type || "movie")}>Remove</button>
                        </div>
                    </div>;
                })}
            </div> : <p className="rounded-lg border border-white/10 bg-white/5 p-6 text-sm text-text-secondary">{movies.length ? "No titles match these filters." : "This list is empty. Add titles from movie or TV detail pages."}</p>}
        </section>
    );
}

export default function ListsPage() {
    const { lists, loading, createList } = useLists() as any;
    const [newListName, setNewListName] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [listQuery, setListQuery] = useState("");
    const handleCreate = async (event: FormEvent) => {
        event.preventDefault();
        if (!newListName.trim()) return;
        await createList(newListName, "List", newDescription);
        setNewListName(""); setNewDescription("");
    };
    const visibleLists = lists.filter((list: any) => `${list.name} ${list.description || ""}`.toLowerCase().includes(listQuery.trim().toLowerCase()));
    return <main className="min-h-screen bg-bg-main pb-20 pt-32 sm:pt-36"><div className="container mx-auto px-4 sm:px-6 lg:px-20">
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:justify-between">
            <div><h1 className="mb-2 text-3xl font-display font-bold text-white sm:text-4xl">Custom Lists</h1><p className="text-text-secondary">Organize, reorder and share your movies and shows.</p></div>
            <form onSubmit={handleCreate} className="w-full max-w-md space-y-2">
                <div className="flex gap-2"><input aria-label="New list name" value={newListName} maxLength={100} onChange={(event) => setNewListName(event.target.value)} placeholder="New list name" className={`${field} min-w-0 flex-1`} required /><button type="submit" disabled={loading || !newListName.trim()} className={button}><Plus size={18} />Create</button></div>
                <textarea aria-label="New list description" value={newDescription} maxLength={1000} onChange={(event) => setNewDescription(event.target.value)} placeholder="Description (optional)" rows={2} className={`${field} w-full`} />
            </form>
        </div>
        <input aria-label="Find a list" placeholder="Find a list by name or description" value={listQuery} onChange={(event) => setListQuery(event.target.value)} className={`${field} mb-6 w-full sm:max-w-md`} />
        {loading ? <div className="h-52 animate-pulse rounded-xl bg-white/5" /> : <div className="space-y-8">{visibleLists.map((list: any) => <ListSection key={list.id} list={list} allLists={lists} />)}{!visibleLists.length && <p className="text-text-secondary">No lists match your search.</p>}</div>}
    </div></main>;
}
