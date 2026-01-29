"use client";

import { createContext, useState, useEffect, useCallback, useMemo } from "react";
import { useUser } from "@clerk/nextjs";

export const WatchedContext = createContext();

const STORAGE_KEY = "movie_catalogue_watched_v1";

export function WatchedProvider({ children }) {
  const { user, isSignedIn, isLoaded } = useUser();
  const [watched, setWatched] = useState([]);

  // Load
  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user) {
      const userWatched = user.unsafeMetadata?.watched || [];
      setWatched(userWatched);
    } else {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        setWatched(raw ? JSON.parse(raw) : []);
      } catch {
        setWatched([]);
      }
    }
  }, [isSignedIn, user, isLoaded]);

  // Save
  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn && user) {
      user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          watched: watched
        }
      }).catch(err => {
        console.error("Failed to save watched:", err);
        // Fallback to localStorage on Clerk API errors (e.g., 429 rate limit)
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(watched));
        } catch (e) {
          console.error("Failed to save to localStorage:", e);
        }
      });
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watched));
    }
  }, [watched, isSignedIn, user, isLoaded]);

  const addWatched = useCallback((item) => {
    // Minify the item to save space (Clerk has 8k limit)
    const minItem = {
      id: item.id,
      title: item.title || item.name,
      poster_path: item.poster_path,
      vote_average: item.vote_average,
      release_date: item.release_date || item.first_air_date,
      type: item.name ? 'tv' : 'movie'
    };
    setWatched((prev) => (prev.find((m) => m.id === item.id) ? prev : [minItem, ...prev]));
  }, []);

  const removeWatched = useCallback((id) => setWatched((prev) => prev.filter((m) => m.id !== id)), []);

  const hasWatched = useCallback((id) => watched.some((m) => m.id === id), [watched]);

  const value = useMemo(() => ({ watched, addWatched, removeWatched, hasWatched }), [watched, addWatched, removeWatched, hasWatched]);

  return <WatchedContext.Provider value={value}>{children}</WatchedContext.Provider>;
}