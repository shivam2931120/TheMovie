"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { useAccountFeature } from "@/lib/useAccountFeature";
import { mergeRatings } from "@/lib/guestDataMerge";

const RatingContext = createContext();

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
        ? entries.filter(entry => entry && typeof entry === "object").map(normalizeRating).filter((entry) => entry.itemId && entry.rating > 0)
        : []
);

const EMPTY = [];

export function ReviewProvider({ children }) {
    const { data: ratings, update: setRatings, loading } = useAccountFeature("ratings", EMPTY, mergeRatings, normalizeRatings);
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
    }, [setRatings]);

    const addRating = useCallback(async (movieId, movieTitle, poster, rating, _content, type = "movie") => {
        return upsertRating({ id: movieId, title: movieTitle, poster_path: poster, type }, rating);
    }, [upsertRating]);

    const updateRating = useCallback(async (ratingId, updates) => {
        setRatings((prev) => prev.map((entry) =>
            entry.id === ratingId
                ? normalizeRating({ ...entry, ...updates, content: "", updatedAt: new Date().toISOString() })
                : entry
        ).filter((entry) => entry.rating > 0));
    }, [setRatings]);

    const deleteRating = useCallback(async (ratingId) => {
        setRatings((prev) => prev.filter((entry) => entry.id !== ratingId));
    }, [setRatings]);

    const deleteRatingForItem = useCallback(async (itemId, type = "movie") => {
        setRatings((prev) => prev.filter((entry) => !(String(entry.itemId) === String(itemId) && entry.type === type)));
    }, [setRatings]);

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
