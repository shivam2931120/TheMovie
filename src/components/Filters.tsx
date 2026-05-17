"use client";

import { motion } from "framer-motion";
import { clsx } from "clsx";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// TMDB Genre IDs
const MOVIE_GENRES = [
    { id: "all", label: "All", value: "" },
    { id: "action", label: "Action", value: "28" },
    { id: "adventure", label: "Adventure", value: "12" },
    { id: "comedy", label: "Comedy", value: "35" },
    { id: "drama", label: "Drama", value: "18" },
    { id: "scifi", label: "Sci-Fi", value: "878" },
    { id: "horror", label: "Horror", value: "27" },
    { id: "romance", label: "Romance", value: "10749" },
    { id: "thriller", label: "Thriller", value: "53" },
    { id: "animation", label: "Animation", value: "16" },
];

const TV_GENRES = [
    { id: "all", label: "All", value: "" },
    { id: "action-adventure", label: "Action", value: "10759" },
    { id: "animation", label: "Animation", value: "16" },
    { id: "comedy", label: "Comedy", value: "35" },
    { id: "crime", label: "Crime", value: "80" },
    { id: "documentary", label: "Documentary", value: "99" },
    { id: "drama", label: "Drama", value: "18" },
    { id: "family", label: "Family", value: "10751" },
    { id: "kids", label: "Kids", value: "10762" },
    { id: "mystery", label: "Mystery", value: "9648" },
    { id: "reality", label: "Reality", value: "10764" },
    { id: "scifi-fantasy", label: "Sci-Fi", value: "10765" },
];

export function Filters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const genres = pathname?.startsWith("/tv") ? TV_GENRES : MOVIE_GENRES;

    const handleFilterClick = (_genreId: string, genreValue: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (genreValue) {
            params.set("with_genres", genreValue);
        } else {
            params.delete("with_genres");
        }
        params.delete("genre");
        // Reset page to 1 on filter change
        params.set("page", "1");

        router.push(`?${params.toString()}`);
    };

    // Helper to check active state
    const isActive = (g: any) => {
        const selectedGenre = searchParams.get("with_genres") || searchParams.get("genre");
        if (g.id === "all" && !selectedGenre) return true;
        return selectedGenre === g.value;
    };

    return (
        <div className="sticky top-20 z-40 w-full overflow-hidden border-b border-white/5 bg-black/80 py-4 backdrop-blur-md">
            <div className="container px-6 mx-auto">
                <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-2">
                    {genres.map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => handleFilterClick(filter.id, filter.value)}
                            className={clsx(
                                "relative flex-shrink-0 rounded-full px-5 py-2 text-sm font-medium transition-all duration-300",
                                isActive(filter)
                                    ? "bg-white text-black"
                                    : "bg-white/10 text-white hover:bg-white/20"
                            )}
                        >
                            {filter.label}
                            {isActive(filter) && (
                                <motion.div
                                    layoutId="activeFilter"
                                    className="absolute inset-0 rounded-full bg-white mix-blend-difference"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
