"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { saveUnsafeMetadata } from "@/lib/clerkMetadata";
import { clearStoredKeys, hasGuestMergeChanges, mergeTypedItems, readStoredJsonFromKeys } from "@/lib/guestDataMerge";

const ListsContext = createContext();
const STORAGE_KEY = "movie_catalogue_custom_lists_v2";

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
    movies: Array.isArray(list.movies)
        ? list.movies.map((movie) => ({ ...movie, type: itemType(movie) }))
        : [],
});

const mergeWithDefaults = (savedLists = []) => {
    const normalized = savedLists.map(normalizeList);
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
    const { user, isSignedIn, isLoaded } = useUser();
    const [lists, setLists] = useState(DEFAULT_LISTS);
    const [loading, setLoading] = useState(true);
    const initialized = useRef(false);
    const saveTimeout = useRef(null);

    useEffect(() => {
        if (!isLoaded) return;
        initialized.current = false;

        try {
            if (isSignedIn && user) {
                const savedLists = user.unsafeMetadata?.customLists;
                const accountLists = Array.isArray(savedLists) && savedLists.length > 0 ? mergeWithDefaults(savedLists) : DEFAULT_LISTS;
                const guestListData = readStoredJsonFromKeys([STORAGE_KEY, "customLists"], []);
                const guestLists = Array.isArray(guestListData) && guestListData.length > 0 ? mergeWithDefaults(guestListData) : [];
                const mergedLists = guestLists.length > 0 ? mergeListCollections(accountLists, guestLists) : accountLists;

                setLists(mergedLists);

                if ((guestLists.length > 0 && hasGuestMergeChanges(accountLists, mergedLists)) || hasGuestMergeChanges(savedLists || [], accountLists)) {
                    void saveUnsafeMetadata(user, { customLists: mergedLists }).then(() => {
                        clearStoredKeys([STORAGE_KEY, "customLists"]);
                    }).catch((error) => {
                        console.error("Failed to merge guest lists into Clerk:", error);
                    });
                } else if (guestLists.length > 0) {
                    clearStoredKeys([STORAGE_KEY, "customLists"]);
                }
            } else {
                const localLists = readStoredJsonFromKeys([STORAGE_KEY, "customLists"], null);
                setLists(localLists ? mergeWithDefaults(localLists) : DEFAULT_LISTS);
            }
        } catch (error) {
            console.error("Failed to load lists:", error);
            setLists(DEFAULT_LISTS);
        } finally {
            setLoading(false);
            setTimeout(() => { initialized.current = true; }, 100);
        }
    }, [user, isSignedIn, isLoaded]);

    useEffect(() => {
        if (!isLoaded || !initialized.current) return;
        if (saveTimeout.current) clearTimeout(saveTimeout.current);

        saveTimeout.current = setTimeout(() => {
            if (isSignedIn && user) {
                saveUnsafeMetadata(user, { customLists: lists }).catch((error) => {
                    console.error("Failed to save lists to Clerk:", error);
                    try {
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
                    } catch { /* ignore */ }
                });
            } else {
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
                } catch { /* ignore */ }
            }
        }, 800);

        return () => {
            if (saveTimeout.current) clearTimeout(saveTimeout.current);
        };
    }, [lists, isSignedIn, user, isLoaded]);

    const createList = useCallback(async (name, icon = "List") => {
        const newList = {
            id: `list-${Date.now()}`,
            name,
            icon,
            isDefault: false,
            movies: [],
            createdAt: new Date().toISOString(),
            isPublic: false,
        };

        setLists((prev) => [...prev, newList]);
        return newList;
    }, []);

    const deleteList = useCallback(async (listId) => {
        setLists((prev) => prev.filter((list) => list.id !== listId || list.isDefault));
    }, []);

    const renameList = useCallback(async (listId, newName) => {
        setLists((prev) => prev.map((l) =>
            l.id === listId ? { ...l, name: newName } : l
        ));
    }, []);

    const toggleListPublic = useCallback(async (listId) => {
        setLists((prev) => prev.map((l) =>
            l.id === listId ? { ...l, isPublic: !l.isPublic } : l
        ));
    }, []);

    const addToList = useCallback(async (listId, movie) => {
        const nextItem = minifyItem(movie);
        setLists((prev) => prev.map((l) => {
            if (l.id !== listId) return l;
            if (l.movies.some((m) => itemKey(m.id, itemType(m)) === itemKey(nextItem.id, nextItem.type))) return l;
            return { ...l, movies: [nextItem, ...l.movies] };
        }));
    }, []);

    const removeFromList = useCallback(async (listId, movieId, type = "movie") => {
        setLists((prev) => prev.map((l) => {
            if (l.id !== listId) return l;
            return { ...l, movies: l.movies.filter((m) => itemKey(m.id, itemType(m)) !== itemKey(movieId, type)) };
        }));
    }, []);

    const isInList = useCallback((listId, movieId, type = "movie") => {
        const list = lists.find((l) => l.id === listId);
        return list?.movies.some((m) => itemKey(m.id, itemType(m)) === itemKey(movieId, type)) || false;
    }, [lists]);

    const getShareLink = useCallback((listId) => {
        const list = lists.find((l) => l.id === listId);
        if (!list?.isPublic) return null;
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        const data = encodeSharePayload({
            name: list.name,
            movies: list.movies,
            createdAt: list.createdAt,
            sharedAt: new Date().toISOString(),
        });
        return `${origin}/shared-list/${data}`;
    }, [lists]);

    const value = useMemo(() => ({
        lists,
        loading,
        createList,
        deleteList,
        renameList,
        toggleListPublic,
        addToList,
        removeFromList,
        isInList,
        getShareLink,
    }), [lists, loading, createList, deleteList, renameList, toggleListPublic, addToList, removeFromList, isInList, getShareLink]);

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
