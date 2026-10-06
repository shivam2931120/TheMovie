"use client";

import { createContext, useCallback, useMemo } from "react";
import { useAccountFeature } from "@/lib/useAccountFeature";
import { mergeTypedItems } from "@/lib/guestDataMerge";

export const WatchedContext = createContext();


const normalizeWatchedItem = (item) => ({
  ...item,
  type: item.type || (item.name && !item.title ? 'tv' : 'movie')
});

const EMPTY = [];
const normalizeWatched = value => Array.isArray(value) ? value.filter(item => item?.id).map(normalizeWatchedItem) : [];

export function WatchedProvider({ children }) {
    const { data: watched, update: setWatched, loading } = useAccountFeature("watched", EMPTY, mergeTypedItems, normalizeWatched);
  const addWatched = useCallback((item) => {
    // Keep stored card data compact.
    const minItem = {
      id: item.id,
      title: item.title || item.name,
      poster_path: item.poster_path,
      vote_average: item.vote_average,
      release_date: item.release_date || item.first_air_date,
      runtime: item.runtime,
      watchedAt: item.watchedAt || new Date().toISOString(),
      genre_ids: Array.isArray(item.genre_ids)
        ? item.genre_ids
        : Array.isArray(item.genres)
          ? item.genres.map((genre) => genre.id).filter(Boolean)
          : [],
      type: item.type || (item.name ? 'tv' : 'movie')
    };
    setWatched((prev) => (prev.find((m) => m.id === item.id && m.type === minItem.type) ? prev : [minItem, ...prev]));
  }, [setWatched]);

  const removeWatched = useCallback((id, type = 'movie') => setWatched((prev) => prev.filter((m) => !(m.id === id && (m.type || 'movie') === type))), [setWatched]);

  const hasWatched = useCallback((id, type = 'movie') => watched.some((m) => m.id === id && (m.type || 'movie') === type), [watched]);

  const value = useMemo(() => ({ watched, addWatched, removeWatched, hasWatched }), [watched, addWatched, removeWatched, hasWatched]);

  return <WatchedContext.Provider value={value}>{children}</WatchedContext.Provider>;
}
