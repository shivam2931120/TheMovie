"use client";

import { useEffect, useMemo, useState } from "react";
import { SignedIn, SignedOut, useClerk } from "@clerk/nextjs";
import { Check, Save, Star, Trash2 } from "lucide-react";
import clsx from "clsx";
import { useRatings } from "@/context/ReviewContext";

interface RateableItem {
    id: number;
    title?: string;
    name?: string;
    poster_path?: string | null;
    vote_average?: number | null;
    release_date?: string;
    first_air_date?: string;
    type?: "movie" | "tv";
}

interface UserRatingPanelProps {
    item: RateableItem;
    type: "movie" | "tv";
}

export function UserRatingPanel({ item, type }: UserRatingPanelProps) {
    const { openSignIn } = useClerk();
    const { getRatingForItem, upsertRating, deleteRatingForItem } = useRatings() as any;
    const savedRating = getRatingForItem(item.id, type);
    const [rating, setRating] = useState(savedRating?.rating || 0);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setRating(savedRating?.rating || 0);
    }, [savedRating?.id, savedRating?.rating]);

    const ratingLabel = useMemo(() => {
        if (!rating) return "Not rated";
        if (rating >= 9) return "Loved it";
        if (rating >= 7) return "Worth watching";
        if (rating >= 5) return "Mixed";
        return "Not for me";
    }, [rating]);

    const saveRating = async (nextRating = rating) => {
        if (!nextRating) return;
        await upsertRating({ ...item, type }, nextRating);
        setSaved(true);
        window.setTimeout(() => setSaved(false), 1400);
    };

    const handleDelete = async () => {
        await deleteRatingForItem(item.id, type);
        setRating(0);
    };

    return (
        <section className="bg-bg-card border border-white/10 rounded-xl p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                    <h3 className="text-lg font-bold text-white">Your Rating</h3>
                    <p className="text-sm text-text-muted">{ratingLabel}</p>
                </div>
                {saved && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/15 px-3 py-1 text-xs font-medium text-green-400">
                        <Check size={14} />
                        Saved
                    </span>
                )}
            </div>

            <SignedIn>
                <div className="space-y-4">
                    <div className="flex flex-wrap gap-1.5">
                        {Array.from({ length: 10 }, (_, index) => {
                            const value = index + 1;
                            const active = value <= rating;
                            return (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => {
                                        setRating(value);
                                        saveRating(value);
                                    }}
                                    className={clsx(
                                        "h-9 w-9 rounded-lg border text-sm font-bold transition-all",
                                        active
                                            ? "border-accent-primary bg-accent-primary text-white"
                                            : "border-white/10 bg-white/5 text-text-muted hover:border-white/30 hover:text-white"
                                    )}
                                    aria-label={`Rate ${value} out of 10`}
                                >
                                    {value}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => saveRating()}
                            disabled={!rating}
                            className="inline-flex items-center gap-2 rounded-lg bg-accent-primary px-4 py-2 text-sm font-bold text-white transition-all hover:bg-accent-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Save size={16} />
                            Save Rating
                        </button>
                        {savedRating && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-text-secondary transition-all hover:border-red-500/50 hover:text-red-400"
                            >
                                <Trash2 size={16} />
                                Remove
                            </button>
                        )}
                    </div>
                </div>
            </SignedIn>

            <SignedOut>
                <button
                    onClick={() => openSignIn()}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/10"
                >
                    <Star size={16} />
                    Sign in to rate
                </button>
            </SignedOut>
        </section>
    );
}
