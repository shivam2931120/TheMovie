import { useCallback, useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { WatchedContext } from "./watched-core";


const STORAGE_KEY = "movie_catalogue_watched_v1";

export function WatchedProvider({ children }) {
  const { user, isSignedIn, isLoaded } = useUser();
  const [items, setItems] = useState([]);

  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    setIsDataLoaded(false);

    if (isSignedIn && user) {
      const userWatched = user.unsafeMetadata?.watched || [];
      const migratedItems = userWatched.map(item => {
        if (item.type) return item; // Already has type
        const isTv = (item.name && !item.title) || item.image?.medium || item.premiered;
        return { ...item, type: isTv ? 'tv' : 'movie' };
      });
      console.log('Loaded watched items (migrated):', migratedItems); // Debug
      setItems(migratedItems);
    } else {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const storedItems = raw ? JSON.parse(raw) : [];
        const migratedItems = storedItems.map(item => {
          if (item.type) return item; // Already has type
          const isTv = (item.name && !item.title) || item.image?.medium || item.premiered;
          return { ...item, type: isTv ? 'tv' : 'movie' };
        });
        console.log('Loaded watched items from localStorage (migrated):', migratedItems); // Debug
        setItems(migratedItems);
      } catch {
        setItems([]);
      }
    }

    setIsDataLoaded(true);
  }, [isSignedIn, user, isLoaded]);

  useEffect(() => {
    if (!isDataLoaded) return;

    if (isSignedIn && user) {
      user
        .update({
          unsafeMetadata: {
            ...user.unsafeMetadata,
            watched: items,
          },
        })
        .catch((err) => console.error("Failed to save watched:", err));
    } else {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch {
      }
    }
  }, [items, isSignedIn, user, isDataLoaded]);

  const add = useCallback((item) => {
    const itemWithType = {
      ...item,
      type: item.type || 'movie',
      watchedAt: item.watchedAt || new Date().toISOString(),
    };
    setItems((prev) => (prev.find((m) => m.id === item.id && m.type === itemWithType.type) ? prev : [itemWithType, ...prev]));
  }, []);

  const remove = useCallback((id, type = 'movie') => setItems((prev) => prev.filter((m) => !(m.id === id && m.type === type))), []);

  const toggle = useCallback((item) => {
    const itemWithType = {
      ...item,
      type: item.type || 'movie',
      watchedAt: item.watchedAt || new Date().toISOString(),
    };
    setItems((prev) => (
      prev.find((m) => m.id === item.id && m.type === itemWithType.type)
        ? prev.filter((m) => !(m.id === item.id && m.type === itemWithType.type))
        : [itemWithType, ...prev]
    ));
  }, []);

  const has = useCallback((id, type = 'movie') => items.some((m) => m.id === id && m.type === type), [items]);

  const movies = useMemo(() => items.filter(i => i.type === 'movie' || !i.type), [items]);
  const tvShows = useMemo(() => items.filter(i => i.type === 'tv'), [items]);

  const count = items.length;
  const watchedCount = count;

  const value = useMemo(
    () => ({ items, movies, tvShows, add, remove, toggle, has, count, watchedCount }),
    [items, movies, tvShows, add, remove, toggle, has, count, watchedCount]
  );

  return <WatchedContext.Provider value={value}>{children}</WatchedContext.Provider>;
}