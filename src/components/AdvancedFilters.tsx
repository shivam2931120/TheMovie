"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X, ChevronDown, SlidersHorizontal, Bookmark, BookmarkCheck, Trash2, Folder } from "lucide-react";
import { clsx } from "clsx";
import { getMovieGenres } from "@/api/tmdb";

// TMDB Genre IDs
const MOVIE_GENRES = [
    { id: 28, label: "Action" },
    { id: 12, label: "Adventure" },
    { id: 16, label: "Animation" },
    { id: 35, label: "Comedy" },
    { id: 80, label: "Crime" },
    { id: 99, label: "Documentary" },
    { id: 18, label: "Drama" },
    { id: 10751, label: "Family" },
    { id: 14, label: "Fantasy" },
    { id: 36, label: "History" },
    { id: 27, label: "Horror" },
    { id: 10402, label: "Music" },
    { id: 9648, label: "Mystery" },
    { id: 10749, label: "Romance" },
    { id: 878, label: "Sci-Fi" },
    { id: 10770, label: "TV Movie" },
    { id: 53, label: "Thriller" },
    { id: 10752, label: "War" },
    { id: 37, label: "Western" },
];

const SORT_OPTIONS = [
    { value: "popularity.desc", label: "Popularity ↓" },
    { value: "popularity.asc", label: "Popularity ↑" },
    { value: "vote_average.desc", label: "Rating ↓" },
    { value: "vote_average.asc", label: "Rating ↑" },
    { value: "primary_release_date.desc", label: "Release Date ↓" },
    { value: "primary_release_date.asc", label: "Release Date ↑" },
    { value: "revenue.desc", label: "Revenue ↓" },
    { value: "revenue.asc", label: "Revenue ↑" },
];

const RUNTIME_OPTIONS = [
    { value: "", label: "Any Duration" },
    { value: "0-90", label: "Under 90 mins" },
    { value: "90-120", label: "90-120 mins" },
    { value: "120-150", label: "2-2.5 hours" },
    { value: "150-999", label: "Over 2.5 hours" },
];

const LANGUAGE_OPTIONS = [
    { value: "", label: "All Languages" },
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
    { value: "de", label: "German" },
    { value: "it", label: "Italian" },
    { value: "ja", label: "Japanese" },
    { value: "ko", label: "Korean" },
    { value: "zh", label: "Chinese" },
    { value: "hi", label: "Hindi" },
];

const RATING_OPTIONS = [
    { value: "", label: "All Ratings" },
    { value: "G", label: "G" },
    { value: "PG", label: "PG" },
    { value: "PG-13", label: "PG-13" },
    { value: "R", label: "R" },
    { value: "NC-17", label: "NC-17" },
];

interface AdvancedFiltersProps {
    onApply?: (filters: any) => void;
}

export interface SavedSearch {
    id: string;
    name: string;
    genres: number[];
    sortBy: string;
    yearRange: { min: number; max: number };
    runtime: string;
    language: string;
    rating: string;
    createdAt: number;
}

const SAVED_SEARCHES_KEY = "themovie_saved_searches";

export function getSavedSearches(): SavedSearch[] {
    if (typeof window === "undefined") return [];
    try {
        return JSON.parse(localStorage.getItem(SAVED_SEARCHES_KEY) || "[]");
    } catch { return []; }
}

function saveSavedSearches(searches: SavedSearch[]) {
    localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(searches));
}

export function AdvancedFilters({ onApply }: AdvancedFiltersProps) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    // Filter States
    const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
    const [sortBy, setSortBy] = useState("popularity.desc");
    const [yearRange, setYearRange] = useState({ min: 1900, max: new Date().getFullYear() });
    const [runtime, setRuntime] = useState("");
    const [language, setLanguage] = useState("");
    const [rating, setRating] = useState("");

    // Saved searches state
    const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
    const [showSaveInput, setShowSaveInput] = useState(false);
    const [saveName, setSaveName] = useState("");
    const [showSavedList, setShowSavedList] = useState(false);

    // Initialize from URL params
    useEffect(() => {
        const genres = searchParams.get("with_genres");
        if (genres) {
            setSelectedGenres(genres.split(",").map(Number));
        }
        setSortBy(searchParams.get("sort_by") || "popularity.desc");
        setYearRange({
            min: parseInt(searchParams.get("year_min") || "1900"),
            max: parseInt(searchParams.get("year_max") || String(new Date().getFullYear())),
        });
        setRuntime(searchParams.get("runtime") || "");
        setLanguage(searchParams.get("language") || "");
        setRating(searchParams.get("certification") || "");
    }, [searchParams]);

    // Load saved searches from localStorage
    useEffect(() => {
        setSavedSearches(getSavedSearches());
    }, []);

    const handleSaveSearch = useCallback(() => {
        const name = saveName.trim();
        if (!name) return;
        const newSearch: SavedSearch = {
            id: Date.now().toString(36),
            name,
            genres: selectedGenres,
            sortBy,
            yearRange,
            runtime,
            language,
            rating,
            createdAt: Date.now(),
        };
        const updated = [...savedSearches, newSearch];
        saveSavedSearches(updated);
        setSavedSearches(updated);
        setSaveName("");
        setShowSaveInput(false);
    }, [saveName, selectedGenres, sortBy, yearRange, runtime, language, rating, savedSearches]);

    const handleDeleteSearch = useCallback((id: string) => {
        const updated = savedSearches.filter(s => s.id !== id);
        saveSavedSearches(updated);
        setSavedSearches(updated);
    }, [savedSearches]);

    const handleLoadSearch = useCallback((search: SavedSearch) => {
        setSelectedGenres(search.genres);
        setSortBy(search.sortBy);
        setYearRange(search.yearRange);
        setRuntime(search.runtime);
        setLanguage(search.language);
        setRating(search.rating);
        setShowSavedList(false);
    }, []);

    const toggleGenre = (genreId: number) => {
        setSelectedGenres(prev =>
            prev.includes(genreId)
                ? prev.filter(id => id !== genreId)
                : [...prev, genreId]
        );
    };

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString());
        
        // Genres
        if (selectedGenres.length > 0) {
            params.set("with_genres", selectedGenres.join(","));
        } else {
            params.delete("with_genres");
        }

        // Sort
        if (sortBy !== "popularity.desc") {
            params.set("sort_by", sortBy);
        } else {
            params.delete("sort_by");
        }

        // Year Range
        if (yearRange.min !== 1900) {
            params.set("year_min", yearRange.min.toString());
        } else {
            params.delete("year_min");
        }
        if (yearRange.max !== new Date().getFullYear()) {
            params.set("year_max", yearRange.max.toString());
        } else {
            params.delete("year_max");
        }

        // Runtime
        if (runtime) {
            params.set("runtime", runtime);
        } else {
            params.delete("runtime");
        }

        // Language
        if (language) {
            params.set("language", language);
        } else {
            params.delete("language");
        }

        // Rating
        if (rating) {
            params.set("certification", rating);
        } else {
            params.delete("certification");
        }

        params.set("page", "1"); // Reset to page 1
        router.push(`?${params.toString()}`);
        setIsOpen(false);

        if (onApply) {
            const filters: any = { sort_by: sortBy };
            if (selectedGenres.length > 0) filters.with_genres = selectedGenres.join(",");
            if (yearRange.min !== 1900) filters["primary_release_date.gte"] = `${yearRange.min}-01-01`;
            if (yearRange.max !== new Date().getFullYear()) filters["primary_release_date.lte"] = `${yearRange.max}-12-31`;
            if (runtime) {
                const [min, max] = runtime.split("-").map(Number);
                filters["with_runtime.gte"] = min;
                filters["with_runtime.lte"] = max;
            }
            if (language) filters.with_original_language = language;
            if (rating) filters.certification_country = "US";
            if (rating) filters.certification = rating;
            onApply(filters);
        }
    };

    const clearFilters = () => {
        setSelectedGenres([]);
        setSortBy("popularity.desc");
        setYearRange({ min: 1900, max: new Date().getFullYear() });
        setRuntime("");
        setLanguage("");
        setRating("");
        router.push(window.location.pathname);
        setIsOpen(false);
    };

    const activeFiltersCount = 
        selectedGenres.length +
        (sortBy !== "popularity.desc" ? 1 : 0) +
        (yearRange.min !== 1900 ? 1 : 0) +
        (yearRange.max !== new Date().getFullYear() ? 1 : 0) +
        (runtime ? 1 : 0) +
        (language ? 1 : 0) +
        (rating ? 1 : 0);

    return (
        <div className="relative">
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white text-sm font-medium transition-all"
            >
                <SlidersHorizontal size={18} />
                Advanced Filters
                {activeFiltersCount > 0 && (
                    <span className="bg-accent-primary text-white text-xs px-2 py-0.5 rounded-full">
                        {activeFiltersCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Filter Panel */}
                    <div className="absolute top-full mt-2 right-0 w-[90vw] max-w-3xl bg-bg-card border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                        <div className="p-6 max-h-[70vh] overflow-y-auto">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white">Advanced Filters</h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <X size={20} className="text-white" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Multi-Genre Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-3">
                                        Genres (Select Multiple)
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {MOVIE_GENRES.map(genre => (
                                            <button
                                                key={genre.id}
                                                onClick={() => toggleGenre(genre.id)}
                                                className={clsx(
                                                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                                                    selectedGenres.includes(genre.id)
                                                        ? "bg-accent-primary text-white"
                                                        : "bg-white/5 text-white hover:bg-white/10"
                                                )}
                                            >
                                                {genre.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Sort Options */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-3">
                                        Sort By
                                    </label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-primary"
                                    >
                                        {SORT_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value} className="bg-black">
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Year Range */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-3">
                                        Year Range: {yearRange.min} - {yearRange.max}
                                    </label>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <input
                                                type="range"
                                                min="1900"
                                                max={new Date().getFullYear()}
                                                value={yearRange.min}
                                                onChange={(e) => setYearRange(prev => ({ ...prev, min: parseInt(e.target.value) }))}
                                                className="w-full accent-accent-primary"
                                            />
                                            <span className="text-xs text-text-muted">Min: {yearRange.min}</span>
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="range"
                                                min="1900"
                                                max={new Date().getFullYear()}
                                                value={yearRange.max}
                                                onChange={(e) => setYearRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                                                className="w-full accent-accent-primary"
                                            />
                                            <span className="text-xs text-text-muted">Max: {yearRange.max}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Runtime Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-3">
                                        Runtime
                                    </label>
                                    <select
                                        value={runtime}
                                        onChange={(e) => setRuntime(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-primary"
                                    >
                                        {RUNTIME_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value} className="bg-black">
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Language Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-3">
                                        Original Language
                                    </label>
                                    <select
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-primary"
                                    >
                                        {LANGUAGE_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value} className="bg-black">
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* MPAA Rating Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-3">
                                        MPAA Rating (US)
                                    </label>
                                    <select
                                        value={rating}
                                        onChange={(e) => setRating(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-primary"
                                    >
                                        {RATING_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value} className="bg-black">
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Saved Searches Section */}
                                <div className="border-t border-white/10 pt-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="flex items-center gap-2 text-sm font-medium text-white">
                                            <Folder size={16} className="text-accent-primary" />
                                            Saved Searches ({savedSearches.length})
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => { setShowSavedList(!showSavedList); setShowSaveInput(false); }}
                                            className="text-xs text-accent-primary hover:underline"
                                        >
                                            {showSavedList ? "Hide" : "Show All"}
                                        </button>
                                    </div>

                                    {/* Save current filter set */}
                                    {!showSaveInput ? (
                                        <button
                                            type="button"
                                            onClick={() => setShowSaveInput(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-all w-full justify-center"
                                        >
                                            <Bookmark size={16} />
                                            Save Current Filters
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={saveName}
                                                onChange={(e) => setSaveName(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && handleSaveSearch()}
                                                placeholder="e.g. Sci-Fi Classics"
                                                autoFocus
                                                className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent-primary"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleSaveSearch}
                                                disabled={!saveName.trim()}
                                                className="px-4 py-2 bg-accent-primary hover:bg-accent-primary/90 text-white text-sm rounded-lg font-medium transition-all disabled:opacity-40"
                                            >
                                                <BookmarkCheck size={16} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setShowSaveInput(false); setSaveName(""); }}
                                                className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white text-sm rounded-lg transition-all"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    )}

                                    {/* List of saved searches */}
                                    {showSavedList && savedSearches.length > 0 && (
                                        <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                                            {savedSearches.map(s => (
                                                <div key={s.id} className="flex items-center gap-2 group">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleLoadSearch(s)}
                                                        className="flex-1 text-left px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white transition-all truncate"
                                                        title={`Load: ${s.name}`}
                                                    >
                                                        <span className="font-medium">{s.name}</span>
                                                        <span className="text-xs text-text-muted ml-2">
                                                            {s.genres.length > 0
                                                                ? s.genres.map(gid => MOVIE_GENRES.find(g => g.id === gid)?.label).filter(Boolean).slice(0, 2).join(", ")
                                                                : "All Genres"}
                                                            {s.genres.length > 2 && ` +${s.genres.length - 2}`}
                                                        </span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteSearch(s.id)}
                                                        className="p-1.5 text-white/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                                        aria-label={`Delete saved search: ${s.name}`}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {showSavedList && savedSearches.length === 0 && (
                                        <p className="text-xs text-text-muted mt-2 text-center py-3">
                                            No saved searches yet. Set your filters and save them for quick access.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex gap-3 p-4 bg-black/30 border-t border-white/10">
                            <button
                                onClick={clearFilters}
                                className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-all"
                            >
                                Clear All
                            </button>
                            <button
                                onClick={applyFilters}
                                className="flex-1 px-6 py-3 bg-accent-primary hover:bg-accent-primary/90 text-white rounded-lg font-bold transition-all"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
