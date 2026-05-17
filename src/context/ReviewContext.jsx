"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { saveUnsafeMetadata } from "@/lib/clerkMetadata";
import { clearStoredKeys, hasGuestMergeChanges, mergeRatings, readStoredJson } from "@/lib/guestDataMerge";

const RatingContext = createContext();
const STORAGE_KEY = "movie_catalogue_ratings_v1";
const LEGACY_STORAGE_KEYS = ["movie_catalogue_reviews_v2", "userReviews"];

const getItemType = (item, fallback = "movie") => item?.type || (item?.name && !item?.title ? "tv" : fallback);
const ratingKey = (id, type = "movie") => `${type}:${id}`;

const minifyItem = (item, type = "movie") => ({
    id: item.id,
    title: item.title || item.name,
    poster_path: item.poster_path,
    vote_average: item.vote_average,
    release_date: item.release_date || item.first_air_date,
    genre_ids: Array.isArray(item.genre_ids)
        ? item.genre_ids
        : Array.isArray(item.genres)
            ? item.genres.map((genre) => genre.id).filter(Boolean)
            : [],
    genres: Array.isArray(item.genres)
        ? item.genres.map((genre) => ({ id: genre.id, name: genre.name })).filter((genre) => genre.id || genre.name)
        : [],
    type,
});

const parseItemId = (entry) => {
    if (entry.itemId || entry.movieId || entry.showId || entry.item?.id) {
        return entry.itemId || entry.movieId || entry.showId || entry.item.id;
    }

    if (typeof entry.id === "string") {
        if (entry.id.includes(":")) return entry.id.split(":").slice(1).join(":");
        if (entry.id.includes("-")) return entry.id.split("-")[0];
    }

    return entry.id;
};

const normalizeRating = (entry) => {
    const type = entry.type || entry.movieType || (entry.showId || entry.item?.name ? "tv" : "movie");
    const itemId = parseItemId(entry);
    const score = Math.max(0, Math.min(10, Number(entry.rating) || 0));

    return {
        id: ratingKey(itemId, type),
        itemId,
        type,
        rating: score,
        item: entry.item || {
            id: itemId,
            title: entry.movieTitle || entry.title,
            poster_path: entry.poster,
            type,
        },
        createdAt: entry.createdAt || new Date().toISOString(),
        updatedAt: entry.updatedAt || entry.createdAt || new Date().toISOString(),
    };
};

const normalizeRatings = (entries) => (
    Array.isArray(entries)
        ? entries.map(normalizeRating).filter((entry) => entry.itemId && entry.rating > 0)
        : []
);

function readLocalRatings() {
    const keys = [STORAGE_KEY, ...LEGACY_STORAGE_KEYS];
    const ratings = keys.flatMap((key) => normalizeRatings(readStoredJson(key, [])));
    return mergeRatings([], ratings);
}

function writeLocalRatings(ratings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ratings));
    LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}

function clearLocalRatings() {
    clearStoredKeys([STORAGE_KEY, ...LEGACY_STORAGE_KEYS]);
}

export function ReviewProvider({ children }) {
    const { user, isSignedIn, isLoaded } = useUser();
    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(true);
    const initialized = useRef(false);
    const saveTimeout = useRef(null);

    useEffect(() => {
        if (!isLoaded) return;

        initialized.current = false;
        setLoading(true);

        try {
            if (isSignedIn && user) {
                const accountRatings = normalizeRatings(user.unsafeMetadata?.ratings || user.unsafeMetadata?.reviews);
                const guestRatings = readLocalRatings();
                const mergedRatings = mergeRatings(accountRatings, guestRatings);
                const hasLegacyReviews = Array.isArray(user.unsafeMetadata?.reviews);

                setRatings(mergedRatings);

                if ((guestRatings.length > 0 && hasGuestMergeChanges(accountRatings, mergedRatings)) || hasLegacyReviews) {
                    void saveUnsafeMetadata(user, (current) => {
                        const next = {
                            ...current,
                            ratings: mergedRatings,
                        };
                        delete next.reviews;
                        return next;
                    }).then(() => {
                        clearLocalRatings();
                    }).catch((error) => {
                        console.error("Failed to merge guest ratings into Clerk:", error);
                    });
                } else if (guestRatings.length > 0) {
                    clearLocalRatings();
                }
            } else {
                setRatings(readLocalRatings());
            }
        } catch (error) {
            console.error("Failed to load ratings:", error);
            setRatings([]);
        } finally {
            setLoading(false);
            setTimeout(() => { initialized.current = true; }, 100);
        }
    }, [user, isSignedIn, isLoaded]);

    useEffect(() => {
        if (!isLoaded || !initialized.current) return;
        if (saveTimeout.current) clearTimeout(saveTimeout.current);

        saveTimeout.current = setTimeout(() => {
            if (isSignedIn && user) {
                saveUnsafeMetadata(user, (current) => {
                    const next = {
                        ...current,
                        ratings,
                    };
                    delete next.reviews;
                    return next;
                }).catch((error) => {
                    console.error("Failed to save ratings to Clerk:", error);
                    try {
                        writeLocalRatings(ratings);
                    } catch { /* ignore */ }
                });
            } else {
                try {
                    writeLocalRatings(ratings);
                } catch { /* ignore */ }
            }
        }, 700);

        return () => {
            if (saveTimeout.current) clearTimeout(saveTimeout.current);
        };
    }, [ratings, isSignedIn, user, isLoaded]);

    const upsertRating = useCallback(async (item, rating) => {
        const type = getItemType(item);
        const itemId = item.id;
        const score = Math.max(0, Math.min(10, Number(rating) || 0));
        if (!itemId || score <= 0) return null;

        const now = new Date().toISOString();
        const nextRating = normalizeRating({
            id: ratingKey(itemId, type),
            itemId,
            type,
            rating: score,
            item: minifyItem(item, type),
            createdAt: now,
            updatedAt: now,
        });

        setRatings((prev) => {
            const existing = prev.find((entry) => String(entry.itemId) === String(itemId) && entry.type === type);
            if (existing) {
                return prev.map((entry) => (
                    String(entry.itemId) === String(itemId) && entry.type === type
                        ? { ...nextRating, createdAt: existing.createdAt, updatedAt: now }
                        : entry
                ));
            }
            return [nextRating, ...prev];
        });

        return nextRating;
    }, []);

    const addRating = useCallback(async (movieId, movieTitle, poster, rating, _content, type = "movie") => {
        return upsertRating({ id: movieId, title: movieTitle, poster_path: poster, type }, rating);
    }, [upsertRating]);

    const updateRating = useCallback(async (ratingId, updates) => {
        setRatings((prev) => prev.map((entry) =>
            entry.id === ratingId
                ? normalizeRating({ ...entry, ...updates, content: "", updatedAt: new Date().toISOString() })
                : entry
        ).filter((entry) => entry.rating > 0));
    }, []);

    const deleteRating = useCallback(async (ratingId) => {
        setRatings((prev) => prev.filter((entry) => entry.id !== ratingId));
    }, []);

    const deleteRatingForItem = useCallback(async (itemId, type = "movie") => {
        setRatings((prev) => prev.filter((entry) => !(String(entry.itemId) === String(itemId) && entry.type === type)));
    }, []);

    const getRatingForItem = useCallback((itemId, type = "movie") => {
        return ratings.find((entry) => String(entry.itemId) === String(itemId) && entry.type === type) || null;
    }, [ratings]);

    const getRatingForMovie = useCallback((movieId) => getRatingForItem(movieId, "movie"), [getRatingForItem]);

    const getAverageRating = useCallback(() => {
        if (ratings.length === 0) return 0;
        const sum = ratings.reduce((acc, entry) => acc + (entry.rating || 0), 0);
        return sum / ratings.length;
    }, [ratings]);

    const value = useMemo(() => ({
        ratings,
        reviews: ratings,
        loading,
        addRating,
        addReview: addRating,
        upsertRating,
        upsertReview: upsertRating,
        updateRating,
        updateReview: updateRating,
        deleteRating,
        deleteReview: deleteRating,
        deleteRatingForItem,
        deleteReviewForItem: deleteRatingForItem,
        getRatingForMovie,
        getReviewForMovie: getRatingForMovie,
        getRatingForItem,
        getReviewForItem: getRatingForItem,
        getAverageRating,
    }), [
        ratings,
        loading,
        addRating,
        upsertRating,
        updateRating,
        deleteRating,
        deleteRatingForItem,
        getRatingForMovie,
        getRatingForItem,
        getAverageRating,
    ]);

    return (
        <RatingContext.Provider value={value}>
            {children}
        </RatingContext.Provider>
    );
}

export function useRatings() {
    const context = useContext(RatingContext);
    if (!context) {
        return {
            ratings: [],
            reviews: [],
            loading: false,
            addRating: async () => {},
            addReview: async () => {},
            upsertRating: async () => {},
            upsertReview: async () => {},
            updateRating: async () => {},
            updateReview: async () => {},
            deleteRating: async () => {},
            deleteReview: async () => {},
            deleteRatingForItem: async () => {},
            deleteReviewForItem: async () => {},
            getRatingForMovie: () => null,
            getReviewForMovie: () => null,
            getRatingForItem: () => null,
            getReviewForItem: () => null,
            getAverageRating: () => 0,
        };
    }
    return context;
}

export function useReviews() {
    return useRatings();
}

export { RatingContext, RatingContext as ReviewContext };
