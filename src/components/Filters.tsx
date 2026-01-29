"use client";

import { motion } from "framer-motion";
import { clsx } from "clsx";
import { useRouter, useSearchParams } from "next/navigation";

// TMDB Genre IDs
const genres = [
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

export function Filters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentGenre = searchParams.get("genre") || "all";

    const handleFilterClick = (genreId: string, genreValue: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (genreValue) {
            params.set("genre", genreValue);
        } else {
            params.delete("genre");
        }
        // Reset page to 1 on filter change
        params.set("page", "1");

        router.push(`?${params.toString()}`);
    };

    // Helper to check active state
    const isActive = (g: any) => {
        if (g.id === "all" && !searchParams.get("genre")) return true;
        return searchParams.get("genre") === g.value;
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
