"use client";

import { FormEvent, useMemo, useState } from "react";
import { Check, Copy, Eye, EyeOff, ListPlus, Pencil, Plus, Trash2 } from "lucide-react";
import clsx from "clsx";
import { MovieCard } from "@/components/MovieCard";
import { useLists } from "@/context/ListsContext";

export default function ListsPage() {
    const { lists, loading, createList, deleteList, renameList, toggleListPublic, removeFromList, getShareLink } = useLists() as any;
    const [newListName, setNewListName] = useState("");
    const [editingListId, setEditingListId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");
    const [copiedListId, setCopiedListId] = useState<string | null>(null);

    const sortedLists = useMemo(() => {
        return [...lists].sort((a, b) => Number(b.movies?.length || 0) - Number(a.movies?.length || 0));
    }, [lists]);

    const handleCreate = async (event: FormEvent) => {
        event.preventDefault();
        const name = newListName.trim();
        if (!name) return;
        await createList(name);
        setNewListName("");
    };

    const startRename = (list: any) => {
        setEditingListId(list.id);
        setEditingName(list.name);
    };

    const submitRename = async (event: FormEvent) => {
        event.preventDefault();
        if (!editingListId || !editingName.trim()) return;
        await renameList(editingListId, editingName.trim());
        setEditingListId(null);
        setEditingName("");
    };

    const copyShareLink = async (listId: string) => {
        const link = getShareLink(listId);
        if (!link) return;
        await navigator.clipboard.writeText(link);
        setCopiedListId(listId);
        window.setTimeout(() => setCopiedListId(null), 1600);
    };

    return (
        <main className="min-h-screen pt-32 sm:pt-36 pb-20 bg-bg-main">
            <div className="container mx-auto px-4 sm:px-6 lg:px-20">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-2">Custom Lists</h1>
                        <p className="text-text-secondary">Organize movies and shows into private or shareable collections.</p>
                    </div>

                    <form onSubmit={handleCreate} className="flex w-full max-w-md gap-2">
                        <input
                            value={newListName}
                            onChange={(event) => setNewListName(event.target.value)}
                            placeholder="New list name"
                            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-text-muted focus:border-accent-primary focus:outline-none"
                        />
                        <button
                            type="submit"
                            disabled={!newListName.trim()}
                            className="inline-flex items-center gap-2 rounded-xl bg-accent-primary px-4 py-3 text-sm font-bold text-white transition-all hover:bg-accent-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Plus size={18} />
                            Create
                        </button>
                    </form>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 gap-5">
                        {Array.from({ length: 3 }, (_, index) => (
                            <div key={index} className="h-52 rounded-xl bg-white/5 animate-pulse" />
                        ))}
                    </div>
                ) : sortedLists.length === 0 ? (
                    <div className="rounded-xl border border-white/10 bg-white/5 p-10 text-center">
                        <ListPlus size={36} className="mx-auto mb-3 text-accent-primary" />
                        <p className="text-white font-bold">No lists yet</p>
                        <p className="text-sm text-text-secondary">Create a list to start collecting titles.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {sortedLists.map((list: any) => {
                            const shareLink = getShareLink(list.id);
                            return (
                                <section key={list.id} className="rounded-xl border border-white/10 bg-bg-card p-5 sm:p-6">
                                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-5">
                                        <div className="min-w-0">
                                            {editingListId === list.id ? (
                                                <form onSubmit={submitRename} className="flex max-w-md gap-2">
                                                    <input
                                                        value={editingName}
                                                        onChange={(event) => setEditingName(event.target.value)}
                                                        className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-accent-primary focus:outline-none"
                                                        autoFocus
                                                    />
                                                    <button type="submit" className="rounded-lg bg-accent-primary px-3 py-2 text-sm font-bold text-white">
                                                        Save
                                                    </button>
                                                </form>
                                            ) : (
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <h2 className="text-xl font-bold text-white">{list.name}</h2>
                                                    <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-text-muted">
                                                        {list.movies?.length || 0} titles
                                                    </span>
                                                    {list.isPublic && (
                                                        <span className="rounded-full bg-green-500/15 px-2.5 py-1 text-xs font-medium text-green-400">
                                                            Public
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => toggleListPublic(list.id)}
                                                className={clsx(
                                                    "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all",
                                                    list.isPublic
                                                        ? "border-green-500/40 bg-green-500/10 text-green-300"
                                                        : "border-white/10 bg-white/5 text-text-secondary hover:text-white"
                                                )}
                                            >
                                                {list.isPublic ? <Eye size={15} /> : <EyeOff size={15} />}
                                                {list.isPublic ? "Public" : "Private"}
                                            </button>
                                            {shareLink && (
                                                <button
                                                    onClick={() => copyShareLink(list.id)}
                                                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-text-secondary transition-all hover:text-white"
                                                >
                                                    {copiedListId === list.id ? <Check size={15} /> : <Copy size={15} />}
                                                    {copiedListId === list.id ? "Copied" : "Share"}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => startRename(list)}
                                                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-text-secondary transition-all hover:text-white"
                                            >
                                                <Pencil size={15} />
                                                Rename
                                            </button>
                                            {!list.isDefault && (
                                                <button
                                                    onClick={() => deleteList(list.id)}
                                                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-text-secondary transition-all hover:border-red-500/50 hover:text-red-400"
                                                >
                                                    <Trash2 size={15} />
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {list.movies?.length ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-y-8 gap-x-3 sm:gap-x-5">
                                            {list.movies.map((movie: any) => (
                                                <div key={`${movie.type || "movie"}-${movie.id}`} className="space-y-2">
                                                    <MovieCard movie={movie} />
                                                    <button
                                                        onClick={() => removeFromList(list.id, movie.id, movie.type || "movie")}
                                                        className="w-full rounded-lg border border-white/10 bg-white/5 py-2 text-xs text-text-secondary transition-all hover:border-red-500/50 hover:text-red-400"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-sm text-text-secondary">
                                            This list is empty. Add titles from movie or TV detail pages.
                                        </div>
                                    )}
                                </section>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
