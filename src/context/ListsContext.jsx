"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { reorderListEntry, transferListEntries } from "@/lib/listManagement";
import { useAccountFeature } from "@/lib/useAccountFeature";
import { mergeTypedItems } from "@/lib/guestDataMerge";

const ListsContext = createContext();

const DEFAULT_LISTS = [
    { id: "favorites", name: "My Favorites", icon: "Heart", isDefault: true, isPublic: false, movies: [] },
    { id: "to-rewatch", name: "Want to Rewatch", icon: "RotateCcw", isDefault: true, isPublic: false, movies: [] },
];

const itemType = (item) => item?.type || (item?.name && !item?.title ? "tv" : "movie");
const itemKey = (id, type = "movie") => `${type}:${id}`;

const minifyItem = (item) => ({
    id: item.id,
    title: item.title || item.name,
    poster_path: item.poster_path,
    vote_average: item.vote_average,
    release_date: item.release_date || item.first_air_date,
    type: itemType(item),
});

const normalizeList = (list) => ({
    ...list,
    isPublic: Boolean(list.isPublic),
    description: typeof list.description === "string" ? list.description : "",
    movies: Array.isArray(list.movies)
        ? list.movies.map((movie) => ({ ...movie, type: itemType(movie) }))
        : [],
});

const mergeWithDefaults = (savedLists = []) => {
    const normalized = (Array.isArray(savedLists) ? savedLists : []).filter(list => list?.id).map(normalizeList);
    const savedIds = new Set(normalized.map((list) => list.id));
    return [
        ...DEFAULT_LISTS.filter((list) => !savedIds.has(list.id)),
        ...normalized,
    ];
};

const mergeListCollections = (accountLists = [], guestLists = []) => {
    const merged = new Map();

    accountLists.forEach((list) => {
        merged.set(list.id, normalizeList(list));
    });

    guestLists.forEach((list) => {
        const normalizedGuest = normalizeList(list);
        const existing = merged.get(normalizedGuest.id);

        if (!existing) {
            merged.set(normalizedGuest.id, normalizedGuest);
            return;
        }

        merged.set(normalizedGuest.id, {
            ...normalizedGuest,
            ...existing,
            movies: mergeTypedItems(existing.movies, normalizedGuest.movies),
        });
    });

    return mergeWithDefaults([...merged.values()]);
};

const encodeSharePayload = (payload) => {
    const json = JSON.stringify(payload);
    const encoded = btoa(unescape(encodeURIComponent(json)));
    return encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

export function ListsProvider({ children }) {
    const { data: lists, update: setLists, loading, status, owner } = useAccountFeature("customLists", DEFAULT_LISTS, mergeListCollections, mergeWithDefaults);
    const { user, isSignedIn } = useUser();
    const createList = useCallback(async (name, icon = "List", description = "") => {
        const newList = {
            id: `list-${crypto.randomUUID()}`,
            name: name.trim().slice(0, 100),
            description: description.trim().slice(0, 1000),
            icon,
            isDefault: false,
            movies: [],
            createdAt: new Date().toISOString(),
            isPublic: false,
        };

        setLists((prev) => [...prev, newList]);
        return newList;
    }, [setLists]);

    const deleteList = useCallback(async (listId) => {
        setLists((prev) => prev.filter((list) => list.id !== listId || list.isDefault));
    }, [setLists]);

    const renameList = useCallback(async (listId, newName) => {
        setLists((prev) => prev.map((l) =>
            l.id === listId ? { ...l, name: newName } : l
        ));
    }, [setLists]);

    const toggleListPublic = useCallback(async (listId) => {
        if (!isSignedIn || !user) throw new Error("Sign in to publish or revoke a shared list.");
        const current = lists.find((list) => list.id === listId);
        if (!current) throw new Error("This list no longer exists.");
        // Wait for the database before reporting publication/revocation success.
        const completion = new Promise((resolve,reject) => {
            const timer = setTimeout(() => { cleanup(); reject(new Error("List sync is taking longer than expected. Check account sync before sharing.")); },20000);
            const handler = event => {
                const detail=event.detail;
                if(detail?.feature!=="customLists" || detail.owner!==owner) return;
                if(detail.status==="Synced to your account") {cleanup();resolve();}
                else if(/unavailable|Conflict|storage unavailable/.test(detail.status)) {cleanup();reject(new Error(detail.status));}
            };
            const cleanup = () => { clearTimeout(timer);window.removeEventListener("themovie-sync-status",handler); };
            window.addEventListener("themovie-sync-status",handler);
        });
        setLists(prev => prev.map(list => list.id === listId ? { ...list, isPublic: !list.isPublic } : list));
        await completion;

    }, [isSignedIn, lists, user, setLists, owner]);

    const addToList = useCallback(async (listId, movie) => {
        const nextItem = minifyItem(movie);
        setLists((prev) => prev.map((l) => {
            if (l.id !== listId) return l;
            if (l.movies.some((m) => itemKey(m.id, itemType(m)) === itemKey(nextItem.id, nextItem.type))) return l;
            return { ...l, movies: [nextItem, ...l.movies] };
        }));
    }, [setLists]);

    const removeFromList = useCallback(async (listId, movieId, type = "movie") => {
        setLists((prev) => prev.map((l) => {
            if (l.id !== listId) return l;
            return { ...l, movies: l.movies.filter((m) => itemKey(m.id, itemType(m)) !== itemKey(movieId, type)) };
        }));
    }, [setLists]);

    const updateListDetails = useCallback(async (listId, name, description = "") => {
        if (!name.trim()) return;
        setLists((prev) => prev.map((list) => list.id === listId
            ? { ...list, name: name.trim().slice(0, 100), description: description.trim().slice(0, 1000) }
            : list));
    }, [setLists]);

    const reorderListItem = useCallback((listId, key, direction) => {
        setLists((prev) => reorderListEntry(prev, listId, key, direction));
    }, [setLists]);

    const removeListItems = useCallback((listId, keys) => {
        const selected = new Set(keys);
        setLists((prev) => prev.map((list) => list.id === listId
            ? { ...list, movies: list.movies.filter((movie) => !selected.has(itemKey(movie.id, itemType(movie)))) }
            : list));
    }, [setLists]);

    const transferListItems = useCallback((sourceId, targetId, keys, move = false) => {
        setLists((prev) => transferListEntries(prev, sourceId, targetId, keys, move));
    }, [setLists]);

    const isInList = useCallback((listId, movieId, type = "movie") => {
        const list = lists.find((l) => l.id === listId);
        return list?.movies.some((m) => itemKey(m.id, itemType(m)) === itemKey(movieId, type)) || false;
    }, [lists]);

    const getShareLink = useCallback((listId) => {
        const list = lists.find((l) => l.id === listId);
        if (!list?.isPublic || !isSignedIn || !user || status !== "Synced to your account") return null;
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        const data = encodeSharePayload({ userId: user.id, listId: list.id });
        return `${origin}/shared-list/${data}`;
    }, [isSignedIn, lists, user, status]);

    const value = useMemo(() => ({
        lists,
        loading,
        createList,
        deleteList,
        renameList,
        updateListDetails,
        reorderListItem,
        removeListItems,
        transferListItems,
        toggleListPublic,
        addToList,
        removeFromList,
        isInList,
        getShareLink,
    }), [lists, loading, createList, deleteList, renameList, updateListDetails, reorderListItem, removeListItems, transferListItems, toggleListPublic, addToList, removeFromList, isInList, getShareLink]);

    return (
        <ListsContext.Provider value={value}>
            {children}
        </ListsContext.Provider>
    );
}

export function useLists() {
    const context = useContext(ListsContext);
    if (!context) {
        throw new Error("useLists must be used within ListsProvider");
    }
    return context;
}
