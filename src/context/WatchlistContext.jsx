"use client";

import { useCallback, useMemo } from "react";
import { WatchlistContext } from "./watchlist-context";
import { useAccountFeature } from "@/lib/useAccountFeature";
import { mergeTypedItems } from "@/lib/guestDataMerge";


const normalizeWatchlistItem = (item) => {
  if (item.type) return item;
  const isTv = (item.name && !item.title) || item.image?.medium || item.premiered;
  return { ...item, type: isTv ? 'tv' : 'movie' };
};

const EMPTY = [];
const normalizeWatchlist = value => Array.isArray(value) ? value.filter(item => item?.id).map(normalizeWatchlistItem) : [];

export function WatchlistProvider({ children }) {
    const { data: items, update: setItems, loading } = useAccountFeature("watchlist", EMPTY, mergeTypedItems, normalizeWatchlist);
  const add = useCallback((item) => {
    // Keep stored card data compact.
    const minItem = {
      id: item.id,
      title: item.title || item.name,
      poster_path: item.poster_path,
      vote_average: item.vote_average,
      release_date: item.release_date || item.first_air_date,
      addedAt: item.addedAt || new Date().toISOString(),
      genre_ids: item.genre_ids || item.genres?.map(genre => genre.id) || [],
      type: item.type || (item.name ? 'tv' : 'movie')
    };
    setItems((prev) => (prev.find((m) => m.id === item.id && m.type === minItem.type) ? prev : [minItem, ...prev]));
  }, [setItems]);

  const remove = useCallback((id, type = 'movie') => setItems((prev) => prev.filter((m) => !(m.id === id && m.type === type))), [setItems]);

  const toggle = useCallback((item) => {
    // Keep stored card data compact.
    const minItem = {
      id: item.id,
      title: item.title || item.name,
      poster_path: item.poster_path,
      vote_average: item.vote_average,
      release_date: item.release_date || item.first_air_date,
      addedAt: item.addedAt || new Date().toISOString(),
      genre_ids: item.genre_ids || item.genres?.map(genre => genre.id) || [],
      type: item.type || (item.name ? 'tv' : 'movie')
    };
    setItems((prev) => (
      prev.find((m) => m.id === item.id && m.type === minItem.type)
        ? prev.filter((m) => !(m.id === item.id && m.type === minItem.type))
        : [minItem, ...prev]
    ));
  }, [setItems]);

  const has = useCallback((id, type = 'movie') => items.some((m) => m.id === id && m.type === type), [items]);

  const movies = useMemo(() => items.filter(i => i.type === 'movie' || !i.type), [items]);
  const tvShows = useMemo(() => items.filter(i => i.type === 'tv'), [items]);

  const value = useMemo(() => ({
    items,
    loading,
    movies,
    tvShows,
    add,
    remove,
    toggle,
    has,
    count: items.length
  }), [items, loading, movies, tvShows, add, remove, toggle, has]);
  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
}
