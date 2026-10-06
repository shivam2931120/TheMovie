"use client";

import { motion, useMotionValue, useTransform, useReducedMotion, PanInfo } from "framer-motion";
import { PlayCircle, Plus, Check, Eye, EyeOff, Star, Info, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useContext, useEffect, useRef } from "react";
import { useActionNotice } from "./ActionNotice";
import clsx from "clsx";
import { WatchlistContext } from "@/context/watchlist-context";
import { WatchedContext } from "@/context/WatchedContext";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRatings } from "@/context/ReviewContext";
import { useRecommendationPreferences } from "@/context/RecommendationPreferencesContext";

import { usePathname } from "next/navigation";
import { useFeedback } from "@/context/FeedbackContext";

interface Movie {
    id: number;
    title?: string;
    name?: string;
    poster_path?: string | null;
    vote_average?: number | null;
    release_date?: string;
    first_air_date?: string;
    overview?: string;
    recommendationModel?: string;
    recommendationRequestId?: string;
    type?: "movie" | "tv";
}

interface MovieCardProps {
    movie: Movie;
    className?: string;
    priority?: boolean;
    recommendation?: boolean;
    reason?: string;
}

const QUICK_RATING_SCORES = [2, 4, 6, 8, 10];

export function MovieCard({ movie, className, priority = false, recommendation = false, reason }: MovieCardProps) {
    const { isSignedIn } = useUser();
    const { record, enabled, owner } = useFeedback();
    const pathname = usePathname();
    const source = pathname === "/search" ? "search" : pathname === "/" ? "home" : "details";
    const cardRef = useRef<HTMLDivElement>(null);
    const reducedMotion = useReducedMotion();
    const { openSignIn } = useClerk();
    const notify = useActionNotice();
    const { dismiss, restore } = useRecommendationPreferences();

    const [isHovered, setIsHovered] = useState(false);
    const [swipeAction, setSwipeAction] = useState<'watchlist' | 'watched' | null>(null);
    const x = useMotionValue(0);
    const backgroundColor = useTransform(
        x,
        [-100, 0, 100],
        ["rgba(34, 197, 94, 0.3)", "rgba(0, 0, 0, 0)", "rgba(255, 49, 88, 0.3)"]
    );

    const { has, add, remove, items } = useContext(WatchlistContext) as any;
    const { hasWatched, addWatched, removeWatched, watched } = useContext(WatchedContext) as any;
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

    useEffect(() => {
        if (!recommendation || !enabled || !cardRef.current) return;
        let timer: ReturnType<typeof setTimeout> | undefined;
        let sent=false;
        let visible=false;
        const schedule=()=>{
            clearTimeout(timer);
            if(document.visibilityState==='visible'&&visible&&!sent)timer=setTimeout(()=>{
                if(document.visibilityState!=='visible'||!visible)return;
                sent=true;
                record({id:movie.id,type,kind:'impression',source,model:movie.recommendationModel,requestId:movie.recommendationRequestId});
                observer.disconnect();
            },1000);
        };
        const observer=new IntersectionObserver(entries=>{
            visible=Boolean(entries[0]?.isIntersecting&&entries[0].intersectionRatio>=0.6);
            schedule();
        },{threshold:[0,0.6]});
        observer.observe(cardRef.current);
        document.addEventListener('visibilitychange',schedule);
        return ()=>{clearTimeout(timer);observer.disconnect();document.removeEventListener('visibilitychange',schedule);};
    },[recommendation,enabled,owner,movie.id,movie.recommendationModel,movie.recommendationRequestId,type,source,record]);

    const toggleWatchlist = () => {
        const previous = items.find((item: any) => item.id === movie.id && (item.type || 'movie') === type) || { ...movie, type };
        if (isWatchlisted) remove(movie.id, type); else add({ ...movie, type });
        notify(isWatchlisted ? `${title} removed from watchlist` : `${title} added to watchlist`, () => isWatchlisted ? add(previous) : remove(movie.id, type));
    };
    const toggleWatched = () => {
        const previous = watched.find((item: any) => item.id === movie.id && (item.type || 'movie') === type) || { ...movie, type };
        if (isWatched) removeWatched(movie.id, type); else addWatched({ ...movie, type });
        notify(isWatched ? `${title} marked unwatched` : `${title} marked watched`, () => isWatched ? addWatched(previous) : removeWatched(movie.id, type));
    };
    const handleDragEnd = (_event: any, info: PanInfo) => {
        const offset = info.offset.x;
        const velocity = info.velocity.x;
        if (!isSignedIn && (Math.abs(offset) > 50 || Math.abs(velocity) > 500)) { openSignIn(); x.set(0); return; }
        if ((offset > 50 || velocity > 500) && !isWatchlisted) {
            toggleWatchlist(); setSwipeAction('watchlist');
        } else if ((offset < -50 || velocity < -500) && !isWatched) {
            toggleWatched(); setSwipeAction('watched');
        }
        x.set(0);
    };
    useEffect(() => {
        if (!swipeAction) return;
        const timeout = setTimeout(() => setSwipeAction(null), 2000);
        return () => clearTimeout(timeout);
    }, [swipeAction]);

    return (
        <motion.div
            ref={cardRef}
            className={clsx(
                "relative group rounded-xl overflow-hidden cursor-pointer touch-pan-y shadow-elevated transition-transform duration-500 ease-out will-change-transform",
                className
            )}
            style={{ backgroundColor, x }}
            initial={reducedMotion ? false : { opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "50px" }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={reducedMotion ? undefined : { scale: 1.05, zIndex: 30 }}
            drag={reducedMotion ? false : "x"}
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

                {(isWatchlisted || isWatched) && <div className="pointer-events-none absolute left-2 top-2 z-20 flex flex-col gap-1 text-[11px] font-medium">
                    {isWatchlisted && <span className="rounded-full bg-black/80 px-2 py-1 text-white">Saved</span>}
                    {isWatched && <span className="rounded-full bg-black/80 px-2 py-1 text-green-300">Watched</span>}
                </div>}
                <Link href={`/${type === 'tv' ? 'tv' : 'movie'}/${movie.id}`} onClick={() => { if (recommendation) record({id:movie.id,type,kind:"click",source,model:movie.recommendationModel,requestId:movie.recommendationRequestId}); }} aria-label={`View ${title || "title"}`} className="absolute inset-0 z-10 outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-inset" />

                {/* Hover UI */}
                <div className="absolute inset-0 flex flex-col justify-center items-center z-20 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <PlayCircle size={48} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100" />
                </div>

                {/* Default Visible Metadata */}
                <div className="absolute bottom-0 left-0 right-0 p-4 z-20 pointer-events-none transform transition-transform duration-500 group-hover:-translate-y-12 group-focus-within:-translate-y-12 card-caption">
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
                <div className="absolute bottom-0 left-0 right-0 p-1 sm:p-4 z-30 translate-y-full group-hover:translate-y-0 group-focus-within:translate-y-0 card-actions transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] flex items-center justify-between pointer-events-auto bg-gradient-to-t from-black via-black/90 to-transparent pt-12">
                    <div className="flex gap-0.5 sm:gap-2">
                        <button
                            onClick={(e) => handleAction(e, toggleWatchlist)}
                            className={clsx(
                                "p-3 rounded-full backdrop-blur-md border transition-all focus-visible:ring-2 focus-visible:ring-accent-primary outline-none",
                                isWatchlisted ? "bg-accent-surface border-accent-primary text-white" : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                            )}
                            aria-pressed={isWatchlisted}
                            aria-label={isWatchlisted ? "Remove from watchlist" : "Add to watchlist"}
                        >
                            {isWatchlisted ? <Check size={16} /> : <Plus size={16} />}
                        </button>
                        <button
                            onClick={(e) => handleAction(e, toggleWatched)}
                            className={clsx(
                                "p-3 rounded-full backdrop-blur-md border transition-all focus-visible:ring-2 focus-visible:ring-accent-primary outline-none",
                                isWatched ? "bg-green-600 border-green-600 text-white" : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                            )}
                            aria-pressed={isWatched}
                            aria-label={isWatched ? "Mark unwatched" : "Mark watched"}
                        >
                            {isWatched ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                    </div>
                    <Link
                        href={`/${type === 'tv' ? 'tv' : 'movie'}/${movie.id}`}
                        aria-label={`Details for ${title || "title"}`}
                        onClick={() => { if (recommendation) record({id:movie.id,type,kind:"click",source,model:movie.recommendationModel,requestId:movie.recommendationRequestId}); }}
                        className="p-3 rounded-full bg-white/10 border border-white/20 text-white backdrop-blur-md hover:bg-white/20 transition-all focus-visible:ring-2 focus-visible:ring-accent-primary outline-none"
                    >
                        <Info size={16} />
                    </Link>
                </div>
                <details className="card-touch-menu absolute inset-x-2 bottom-2 z-40" onPointerDown={event => event.stopPropagation()}>
                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-center gap-2 rounded-full border border-white/20 bg-black/80 text-xs font-medium text-white"><MoreHorizontal size={18} />Actions</summary>
                    <div className="absolute inset-x-0 bottom-full mb-2 rounded-xl border border-white/20 bg-bg-surface p-1 shadow-xl">
                        <button type="button" aria-pressed={isWatchlisted} className="min-h-11 w-full rounded-lg px-2 text-left text-xs text-white hover:bg-white/10" onClick={event => { handleAction(event, toggleWatchlist); event.currentTarget.closest('details')?.removeAttribute('open'); }}>{isWatchlisted ? 'Remove saved title' : 'Add to watchlist'}</button>
                        <button type="button" aria-pressed={isWatched} className="min-h-11 w-full rounded-lg px-2 text-left text-xs text-white hover:bg-white/10" onClick={event => { handleAction(event, toggleWatched); event.currentTarget.closest('details')?.removeAttribute('open'); }}>{isWatched ? 'Mark unwatched' : 'Mark watched'}</button>
                        <Link href={`/${type === 'tv' ? 'tv' : 'movie'}/${movie.id}`} className="flex min-h-11 items-center rounded-lg px-2 text-xs text-accent-primary" onClick={() => { if (recommendation) record({ id: movie.id, type, kind: 'click', source, model: movie.recommendationModel, requestId: movie.recommendationRequestId }); }}>View details</Link>
                    </div>
                </details>
            </div>
            {recommendation && <div className="space-y-2 border-t border-white/10 bg-bg-card p-3 text-xs" onPointerDown={(event) => event.stopPropagation()}>
                <details className="text-text-secondary"><summary className="cursor-pointer text-accent-primary">Why this title?</summary><p className="mt-2">{reason || "Similar to titles you enjoy"}</p></details>
                <button type="button" onClick={(event) => { event.stopPropagation(); dismiss({ ...movie, type }); notify(`${title} hidden from recommendations`, () => restore(movie.id, type)); }} className="text-text-muted hover:text-white" aria-label={`Not interested in ${title}`}>Not interested</button>
            </div>}
        </motion.div>
    );
}
