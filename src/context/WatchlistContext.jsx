"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { WatchlistContext } from "./watchlist-context";

const STORAGE_KEY = "movie_catalogue_watchlist_v1";

export function WatchlistProvider({ children }) {
  const { user, isSignedIn, isLoaded } = useUser();
  const [items, setItems] = useState([]);
  const initialized = useRef(false);
  const saveTimeout = useRef(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user) {
      const userWatchlist = user.unsafeMetadata?.watchlist || [];
      const migratedItems = userWatchlist.map(item => {
        if (item.type) return item;
        const isTv = (item.name && !item.title) || item.image?.medium || item.premiered;
        return { ...item, type: isTv ? 'tv' : 'movie' };
      });
      setItems(migratedItems);
    } else {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const storedItems = raw ? JSON.parse(raw) : [];
        const migratedItems = storedItems.map(item => {
          if (item.type) return item;
          const isTv = (item.name && !item.title) || item.image?.medium || item.premiered;
          return { ...item, type: isTv ? 'tv' : 'movie' };
        });
        setItems(migratedItems);
      } catch {
        setItems([]);
      }
    }
    setTimeout(() => { initialized.current = true; }, 100);
  }, [isSignedIn, user, isLoaded]);

  useEffect(() => {
    if (!isLoaded || !initialized.current) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);

    saveTimeout.current = setTimeout(() => {
      if (isSignedIn && user) {
        user.update({
          unsafeMetadata: {
            ...user.unsafeMetadata,
            watchlist: items
          }
        }).catch(() => {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
          } catch { /* ignore */ }
        });
      } else {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch { /* ignore */ }
      }
    }, 1000);

    return () => { if (saveTimeout.current) clearTimeout(saveTimeout.current); };
  }, [items, isSignedIn, user, isLoaded]);

  const add = useCallback((item) => {
    // Minify for 8KB limit
    const minItem = {
      id: item.id,
      title: item.title || item.name,
      poster_path: item.poster_path,
      vote_average: item.vote_average,
      release_date: item.release_date || item.first_air_date,
      type: item.type || (item.name ? 'tv' : 'movie')
    };
    setItems((prev) => (prev.find((m) => m.id === item.id && m.type === minItem.type) ? prev : [minItem, ...prev]));
  }, []);

  const remove = useCallback((id, type = 'movie') => setItems((prev) => prev.filter((m) => !(m.id === id && m.type === type))), []);

  const toggle = useCallback((item) => {
    // Minify for 8KB limit
    const minItem = {
      id: item.id,
      title: item.title || item.name,
      poster_path: item.poster_path,
      vote_average: item.vote_average,
      release_date: item.release_date || item.first_air_date,
      type: item.type || (item.name ? 'tv' : 'movie')
    };
    setItems((prev) => (
      prev.find((m) => m.id === item.id && m.type === minItem.type)
        ? prev.filter((m) => !(m.id === item.id && m.type === minItem.type))
        : [minItem, ...prev]
    ));
  }, []);

  const has = useCallback((id, type = 'movie') => items.some((m) => m.id === id && m.type === type), [items]);

  const movies = useMemo(() => items.filter(i => i.type === 'movie' || !i.type), [items]);
  const tvShows = useMemo(() => items.filter(i => i.type === 'tv'), [items]);

  const value = useMemo(() => ({
    items,
    movies,
    tvShows,
    add,
    remove,
    toggle,
    has,
    count: items.length
  }), [items, movies, tvShows, add, remove, toggle, has]);
  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
}
