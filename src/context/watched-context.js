import { useContext } from "react";
import { WatchedContext } from "./watched-core";

export function useWatched() {
  const ctx = useContext(WatchedContext);
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
