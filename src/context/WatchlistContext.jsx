import { useCallback, useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { WatchlistContext } from "./watchlist-context";

const STORAGE_KEY = "movie_catalogue_watchlist_v1";

export function WatchlistProvider({ children }) {
  const { user, isSignedIn, isLoaded } = useUser();
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user) {
      const userWatchlist = user.unsafeMetadata?.watchlist || [];
      const migratedItems = userWatchlist.map(item => {
        if (item.type) return item; // Already has type
        const isTv = (item.name && !item.title) || item.image?.medium || item.premiered;
        return { ...item, type: isTv ? 'tv' : 'movie' };
      });
      console.log('Loaded watchlist items (migrated):', migratedItems); // Debug
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
        console.log('Loaded watchlist items from localStorage (migrated):', migratedItems); // Debug
        setItems(migratedItems);
      } catch {
        setItems([]);
      }
    }
  }, [isSignedIn, user, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user) {
      user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          watchlist: items
        }
      }).catch(err => console.error("Failed to save watchlist:", err));
    } else {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch {
      }
    }
  }, [items, isSignedIn, user, isLoaded]);

  const add = useCallback((item) => {
    const itemWithType = { ...item, type: item.type || 'movie' };
    setItems((prev) => (prev.find((m) => m.id === item.id && m.type === itemWithType.type) ? prev : [itemWithType, ...prev]));
  }, []);
  
  const remove = useCallback((id, type = 'movie') => setItems((prev) => prev.filter((m) => !(m.id === id && m.type === type))), []);
  
  const toggle = useCallback((item) => {
    const itemWithType = { ...item, type: item.type || 'movie' };
    setItems((prev) => (
      prev.find((m) => m.id === item.id && m.type === itemWithType.type) 
        ? prev.filter((m) => !(m.id === item.id && m.type === itemWithType.type))
        : [itemWithType, ...prev]
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
