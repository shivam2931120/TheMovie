"use client";

import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { PlayCircle, Plus, Check, Eye, EyeOff, Star, Info } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useContext } from "react";
import clsx from "clsx";
import { WatchlistContext } from "@/context/watchlist-context";
import { WatchedContext } from "@/context/WatchedContext";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRatings } from "@/context/ReviewContext";

interface Movie {
    id: number;
    title?: string;
    name?: string;
    poster_path?: string | null;
    vote_average?: number | null;
    release_date?: string;
    first_air_date?: string;
    overview?: string;
    type?: "movie" | "tv";
}

interface MovieCardProps {
    movie: Movie;
    className?: string;
    priority?: boolean;
}

const QUICK_RATING_SCORES = [2, 4, 6, 8, 10];

export function MovieCard({ movie, className, priority = false }: MovieCardProps) {
    const { isSignedIn } = useUser();
    const { openSignIn } = useClerk();

    const [isHovered, setIsHovered] = useState(false);
    const [swipeAction, setSwipeAction] = useState<'watchlist' | 'watched' | null>(null);
    const x = useMotionValue(0);
    const backgroundColor = useTransform(
        x,
        [-100, 0, 100],
        ["rgba(34, 197, 94, 0.3)", "rgba(0, 0, 0, 0)", "rgba(255, 49, 88, 0.3)"]
    );

    const { has, add, remove } = useContext(WatchlistContext) as any;
    const { hasWatched, addWatched, removeWatched } = useContext(WatchedContext) as any;
    const { getRatingForItem, upsertRating, deleteRatingForItem } = useRatings() as any;

    const type = movie.type || (movie.name ? 'tv' : 'movie');
    const posterSrc = movie.poster_path
        ? movie.poster_path.startsWith("http")
            ? movie.poster_path
            : `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null;

    const isWatchlisted = has(movie.id, type);
    const isWatched = hasWatched(movie.id, type);
    const personalRating = getRatingForItem(movie.id, type);
    const personalScore = Number(personalRating?.rating || 0);

    const handleAction = (e: React.MouseEvent, action: () => void) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isSignedIn) {
            openSignIn();
            return;
        }
        action();
    };

    const title = movie.title || movie.name;
    const date = movie.release_date || movie.first_air_date;
    const year = date ? date.split("-")[0] : "";
    const rating = typeof movie.vote_average === "number" ? movie.vote_average : null;

    const handleDragEnd = (_event: any, info: PanInfo) => {
        const offset = info.offset.x;
        const velocity = info.velocity.x;

        if (!isSignedIn && (Math.abs(offset) > 50 || Math.abs(velocity) > 500)) {
            openSignIn();
            x.set(0);
            return;
        }

        if (offset > 50 || velocity > 500) {
            if (!isWatchlisted) {
                add({ ...movie, type });
                setSwipeAction('watchlist');
                setTimeout(() => setSwipeAction(null), 2000);
            }
        } else if (offset < -50 || velocity < -500) {
            if (!isWatched) {
                addWatched({ ...movie, type });
                setSwipeAction('watched');
                setTimeout(() => setSwipeAction(null), 2000);
            }
        }
        x.set(0);
    };

    return (
        <motion.div
            className={clsx(
                "relative group rounded-xl overflow-hidden cursor-pointer touch-pan-y shadow-elevated transition-transform duration-500 ease-out will-change-transform",
                className
            )}
            style={{ backgroundColor, x }}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "50px" }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{ scale: 1.05, zIndex: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
        >
            {swipeAction && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-3 py-1 rounded-full text-white font-bold text-xs shadow-glass backdrop-blur-md whitespace-nowrap"
                    style={{ backgroundColor: swipeAction === 'watchlist' ? 'var(--accent-primary)' : 'var(--status-success)' }}
                >
                    {swipeAction === 'watchlist' ? 'Added' : 'Watched'}
                </motion.div>
            )}

            <div className="relative aspect-[2/3] w-full bg-bg-surface overflow-hidden">
                {posterSrc ? (
                    <Image
                        src={posterSrc}
                        alt={title || "Movie"}
                        fill
                        priority={priority}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-text-muted bg-bg-elevated p-4 text-center">
                        <span className="text-sm font-medium">{title}</span>
                        <span className="text-xs mt-1">{year}</span>
                    </div>
                )}

                {/* Ambient Glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-accent-primary/20 mix-blend-overlay pointer-events-none" />

                {/* Vignette & Gradients */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] pointer-events-none" />

                <Link href={`/${type === 'tv' ? 'tv' : 'movie'}/${movie.id}`} className="absolute inset-0 z-10 outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-inset" />

                {/* Hover UI */}
                <div className="absolute inset-0 flex flex-col justify-center items-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <PlayCircle size={48} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100" />
                </div>

                {/* Default Visible Metadata */}
                <div className="absolute bottom-0 left-0 right-0 p-4 z-20 pointer-events-none transform transition-transform duration-500 group-hover:-translate-y-12">
                    {rating !== null && rating > 0 && (
                        <div className="flex items-center gap-1.5 mb-1.5">
                            <Star size={12} className="text-accent-primary fill-accent-primary" />
                            <span className="text-white text-xs font-bold drop-shadow-md">{rating.toFixed(1)}</span>
                        </div>
                    )}
                    <h3 className="text-white font-display font-semibold text-base sm:text-lg leading-tight line-clamp-2 drop-shadow-md">
                        {title}
                    </h3>
                    {year && <p className="text-text-secondary text-xs sm:text-sm mt-0.5 drop-shadow-md">{year}</p>}
                </div>

                {/* Hover Reveal Actions */}
                <div className="absolute bottom-0 left-0 right-0 p-4 z-30 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] flex items-center justify-between pointer-events-auto bg-gradient-to-t from-black via-black/90 to-transparent pt-12">
                    <div className="flex gap-2">
                        <button
                            onClick={(e) => handleAction(e, () => isWatchlisted ? remove(movie.id, type) : add({ ...movie, type }))}
                            className={clsx(
                                "p-2 rounded-full backdrop-blur-md border transition-all focus-visible:ring-2 focus-visible:ring-accent-primary outline-none",
                                isWatchlisted ? "bg-accent-primary border-accent-primary text-white" : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                            )}
                            aria-label={isWatchlisted ? "Remove from watchlist" : "Add to watchlist"}
                        >
                            {isWatchlisted ? <Check size={16} /> : <Plus size={16} />}
                        </button>
                        <button
                            onClick={(e) => handleAction(e, () => isWatched ? removeWatched(movie.id, type) : addWatched({ ...movie, type }))}
                            className={clsx(
                                "p-2 rounded-full backdrop-blur-md border transition-all focus-visible:ring-2 focus-visible:ring-accent-primary outline-none",
                                isWatched ? "bg-green-600 border-green-600 text-white" : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                            )}
                            aria-label={isWatched ? "Mark unwatched" : "Mark watched"}
                        >
                            {isWatched ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                    </div>
                    <Link
                        href={`/${type === 'tv' ? 'tv' : 'movie'}/${movie.id}`}
                        className="p-2 rounded-full bg-white/10 border border-white/20 text-white backdrop-blur-md hover:bg-white/20 transition-all focus-visible:ring-2 focus-visible:ring-accent-primary outline-none"
                    >
                        <Info size={16} />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
