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
      add: () => {},
      remove: () => {},
      toggle: () => {},
      has: () => false,
    };
  }
  return ctx;
}
