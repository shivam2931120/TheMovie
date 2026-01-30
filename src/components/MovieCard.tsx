"use client";

import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { PlayCircle, Plus, Info, Check, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useContext } from "react";
import clsx from "clsx";
import { WatchlistContext } from "@/context/watchlist-context";
import { WatchedContext } from "@/context/WatchedContext";
import { useUser, useClerk } from "@clerk/nextjs";

interface Movie {
    id: number;
    title?: string;
    name?: string; // For TV
    poster_path: string;
    vote_average: number;
    release_date?: string;
    first_air_date?: string; // For TV
    overview?: string;
}

interface MovieCardProps {
    movie: Movie;
    className?: string;
}

export function MovieCard({ movie, className }: MovieCardProps) {
    const { isSignedIn } = useUser();
    const { openSignIn } = useClerk();

    const [isHovered, setIsHovered] = useState(false);
    const [swipeAction, setSwipeAction] = useState<'watchlist' | 'watched' | null>(null);
    const x = useMotionValue(0);
    const backgroundColor = useTransform(
        x,
        [-100, 0, 100],
        ["rgba(34, 197, 94, 0.3)", "rgba(0, 0, 0, 0)", "rgba(229, 9, 20, 0.3)"]
    );

    // Contexts
    const { has, add, remove } = useContext(WatchlistContext) as any;
    const { hasWatched, addWatched, removeWatched } = useContext(WatchedContext) as any;

    // Determine type based on props (crude but effective for combined card)
    const type = movie.name ? 'tv' : 'movie';

    const isWatchlisted = has(movie.id, type);
    const isWatched = hasWatched(movie.id);

    const handleWatchlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isSignedIn) {
            openSignIn();
            return;
        }

        if (isWatchlisted) {
            remove(movie.id, type);
        } else {
            add({ ...movie, type });
        }
    };

    const handleWatched = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isSignedIn) {
            openSignIn();
            return;
        }

        if (isWatched) {
            removeWatched(movie.id);
        } else {
            addWatched({ ...movie, type });
        }
    };

    const title = movie.title || movie.name;
    const date = movie.release_date || movie.first_air_date;
    const year = date ? new Date(date).getFullYear() : "N/A";

    const handleDragEnd = (event: any, info: PanInfo) => {
        const offset = info.offset.x;
        const velocity = info.velocity.x;

        // Swipe right (> 50px or fast swipe) - Add to watchlist
        if (offset > 50 || velocity > 500) {
            if (!isWatchlisted) {
                add({ ...movie, type });
                setSwipeAction('watchlist');
                setTimeout(() => setSwipeAction(null), 2000);
            }
        }
        // Swipe left (< -50px or fast swipe) - Mark as watched
        else if (offset < -50 || velocity < -500) {
            if (!isWatched) {
                addWatched({ ...movie, type });
                setSwipeAction('watched');
                setTimeout(() => setSwipeAction(null), 2000);
            }
        }

        // Reset position
        x.set(0);
    };

    return (
        <motion.div
            className={clsx("relative group rounded-xl overflow-hidden cursor-pointer touch-pan-y", className)}
            style={{ backgroundColor, x }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
        >
            {/* Swipe Indicators */}
            {swipeAction && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-white font-bold text-sm shadow-lg"
                    style={{
                        backgroundColor: swipeAction === 'watchlist' ? '#E50914' : '#22C55E'
                    }}
                >
                    {swipeAction === 'watchlist' ? '✓ Added to Watchlist' : '✓ Marked as Watched'}
                </motion.div>
            )}
            {/* Poster */}
            <div className="relative aspect-[2/3] w-full bg-bg-card">
                {movie.poster_path ? (
                    <Image
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={title || "Movie"}
                        fill
                        className={clsx(
                            "object-cover transition-transform duration-500",
                            isHovered ? "scale-105 saturate-100" : "scale-100 saturate-[0.8]"
                        )}
                        sizes="(max-width: 768px) 50vw, 33vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted">No Image</div>
                )}

                {/* Cinematic Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80" />

                {/* Hover Actions Overlay - Optimized for Touch */}
                <div
                    className={clsx(
                        "absolute inset-0 flex flex-col items-center justify-center gap-3 sm:gap-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
                        isHovered ? "opacity-100" : "opacity-0"
                    )}
                >
                    <Link href={`/${type === 'tv' ? 'tv' : 'movie'}/${movie.id}`} className="absolute inset-0 z-0" />

                    <Link href={`/${type === 'tv' ? 'tv' : 'movie'}/${movie.id}`} className="relative z-10">
                        <div className="flex gap-4">
                            <button className="text-white hover:text-accent-primary transition-colors">
                                <PlayCircle size={32} className="sm:w-[40px] sm:h-[40px] drop-shadow-lg" />
                            </button>
                        </div>
                    </Link>

                    <div className="flex gap-2 text-white relative z-10 flex-wrap justify-center px-2 sm:px-4">
                        <button
                            onClick={handleWatchlist}
                            className={clsx(
                                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[10px] sm:text-xs font-medium transition-all backdrop-blur-md",
                                isWatchlisted
                                    ? "bg-accent-primary/80 border-accent-primary text-white"
                                    : "bg-black/30 hover:bg-accent-primary hover:border-transparent border-white/20"
                            )}
                        >
                            {isWatchlisted ? <Check size={12} /> : <Plus size={12} />}
                            {isWatchlisted ? "Added" : "Watchlist"}
                        </button>
                        <button
                            onClick={handleWatched}
                            title={isWatched ? "Mark as Unwatched" : "Mark as Watched"}
                            className={clsx(
                                "p-1.5 rounded-full border text-xs font-medium transition-all backdrop-blur-md",
                                isWatched
                                    ? "bg-green-600/80 border-green-600 text-white"
                                    : "bg-black/30 hover:bg-green-600 hover:border-transparent border-white/20"
                            )}
                        >
                            {isWatched ? <Eye size={12} /> : <EyeOff size={12} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Title & Metadata */}
            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 transform transition-transform duration-300 group-hover:translate-y-2 pointer-events-none">
                <h3 className="text-white font-display font-medium text-sm sm:text-base lg:text-lg truncate drop-shadow-md">
                    {title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-accent-primary text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded bg-accent-primary/10 border border-accent-primary/20">
                        {(movie.vote_average * 10).toFixed(0)}% Match
                    </span>
                    <span className="text-text-muted text-[10px] sm:text-xs">
                        {year}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
