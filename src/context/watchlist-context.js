import { createContext, useContext } from "react";

export const WatchlistContext = createContext(null);

export function useWatchlist() {
  const ctx = useContext(WatchlistContext);
  if (!ctx) {
    return {
      items: [],
      movies: [],
      tvShows: [],
      count: 0,
      add: () => console.warn('Watchlist context not available'),
      remove: () => console.warn('Watchlist context not available'),
      toggle: () => console.warn('Watchlist context not available'),
      has: () => false,
    };
  }
  return ctx;
}
