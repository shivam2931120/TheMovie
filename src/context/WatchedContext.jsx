"use client";

import { createContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { saveUnsafeMetadata } from "@/lib/clerkMetadata";
import { clearStoredKeys, hasGuestMergeChanges, mergeTypedItems, readStoredJson } from "@/lib/guestDataMerge";

export const WatchedContext = createContext();

const STORAGE_KEY = "movie_catalogue_watched_v1";

const normalizeWatchedItem = (item) => ({
  ...item,
  type: item.type || (item.name && !item.title ? 'tv' : 'movie')
});

export function WatchedProvider({ children }) {
  const { user, isSignedIn, isLoaded } = useUser();
  const [watched, setWatched] = useState([]);
  const initialized = useRef(false);
  const saveTimeout = useRef(null);

  // Load
  useEffect(() => {
    if (!isLoaded) return;
    initialized.current = false;

    if (isSignedIn && user) {
      const userWatched = user.unsafeMetadata?.watched || [];
      const accountWatched = userWatched.map(normalizeWatchedItem);
      const guestWatched = readStoredJson(STORAGE_KEY, []).map(normalizeWatchedItem);
      const mergedWatched = mergeTypedItems(accountWatched, guestWatched);
      setWatched(mergedWatched);

      if ((guestWatched.length > 0 && hasGuestMergeChanges(accountWatched, mergedWatched)) || hasGuestMergeChanges(userWatched, accountWatched)) {
        saveUnsafeMetadata(user, { watched: mergedWatched }).then(() => {
          clearStoredKeys([STORAGE_KEY]);
        }).catch(() => {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(guestWatched));
          } catch { /* ignore */ }
        });
      } else if (guestWatched.length > 0) {
        clearStoredKeys([STORAGE_KEY]);
      }
    } else {
      try {
        const stored = readStoredJson(STORAGE_KEY, []);
        setWatched(stored.map(normalizeWatchedItem));
      } catch {
        setWatched([]);
      }
    }
    // Mark initialized after first load
    setTimeout(() => { initialized.current = true; }, 100);
  }, [isSignedIn, user, isLoaded]);

  // Save (debounced, skip initial mount)
  useEffect(() => {
    if (!isLoaded || !initialized.current) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);

    saveTimeout.current = setTimeout(() => {
      if (isSignedIn && user) {
        saveUnsafeMetadata(user, { watched }).catch(() => {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(watched));
          } catch { /* ignore */ }
        });
      } else {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(watched));
        } catch { /* ignore */ }
      }
    }, 1000);

    return () => { if (saveTimeout.current) clearTimeout(saveTimeout.current); };
  }, [watched, isSignedIn, user, isLoaded]);

  const addWatched = useCallback((item) => {
    // Minify the item to save space (Clerk has 8k limit)
    const minItem = {
      id: item.id,
      title: item.title || item.name,
      poster_path: item.poster_path,
      vote_average: item.vote_average,
      release_date: item.release_date || item.first_air_date,
      type: item.type || (item.name ? 'tv' : 'movie')
    };
    setWatched((prev) => (prev.find((m) => m.id === item.id && m.type === minItem.type) ? prev : [minItem, ...prev]));
  }, []);

  const removeWatched = useCallback((id, type = 'movie') => setWatched((prev) => prev.filter((m) => !(m.id === id && (m.type || 'movie') === type))), []);

  const hasWatched = useCallback((id, type = 'movie') => watched.some((m) => m.id === id && (m.type || 'movie') === type), [watched]);

  const value = useMemo(() => ({ watched, addWatched, removeWatched, hasWatched }), [watched, addWatched, removeWatched, hasWatched]);

  return <WatchedContext.Provider value={value}>{children}</WatchedContext.Provider>;
}
