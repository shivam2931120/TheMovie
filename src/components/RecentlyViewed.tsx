"use client";

import { useContext } from "react";
import { RecentlyViewedContext } from "@/context/RecentlyViewedContext";
import { MovieCard } from "./MovieCard";
import { History, X } from "lucide-react";

export function RecentlyViewed() {
    const { recentlyViewed, clearRecentlyViewed, removeFromRecentlyViewed } = useContext(RecentlyViewedContext) as any;

    if (!recentlyViewed || recentlyViewed.length === 0) {
        return null;
    }

    return (
        <section className="relative py-12">
            <div className="container px-6 lg:px-20 mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="font-display text-3xl font-bold text-white flex items-center gap-3">
                        <History size={28} className="text-accent-primary" />
                        Recently Viewed
                    </h2>
                    <button
                        onClick={clearRecentlyViewed}
                        className="text-sm text-text-muted hover:text-white transition-colors"
                    >
                        Clear History
                    </button>
                </div>

                <div className="relative -mx-6 px-6 lg:-mx-20 lg:px-20 overflow-x-auto hide-scrollbar">
                    <div className="flex gap-6 pb-4 w-max">
                        {recentlyViewed.slice(0, 10).map((item: any) => (
                            <div key={`${item.id}-${item.type}`} className="relative w-[180px] md:w-[220px] group">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        removeFromRecentlyViewed(item.id, item.type);
                                    }}
                                    className="absolute -top-2 -right-2 z-20 bg-black/80 hover:bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all"
                                    title="Remove from history"
                                >
                                    <X size={14} />
                                </button>
                                <MovieCard movie={item} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
