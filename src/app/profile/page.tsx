"use client";

import { useUser, RedirectToSignIn, useClerk } from "@clerk/nextjs";
import Image from "next/image";
import { Clock, Heart, Settings, LogOut, Edit2, Save, Eye, Film, Star, TrendingUp, BarChart3, Palette, Award, Calendar } from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";
import { useContext, useEffect, useState, useMemo } from "react";
import { WatchlistContext } from "@/context/watchlist-context";
import { WatchedContext } from "@/context/WatchedContext";
import { RecentlyViewedContext } from "@/context/RecentlyViewedContext";
import { MovieCard } from "@/components/MovieCard";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// Genre name mapping for TMDB IDs
const GENRE_MAP: Record<number, string> = {
    28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
    99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
    27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
    10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
};

export default function ProfilePage() {
    const { isLoaded, isSignedIn, user } = useUser();
    const { openUserProfile } = useClerk();
    const { items } = useContext(WatchlistContext) as any;
    const { watched } = useContext(WatchedContext) as any;
    const { recentlyViewed } = useContext(RecentlyViewedContext) as any;
    const [bio, setBio] = useState("");
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [activeTab, setActiveTab] = useState<'watchlist' | 'watched' | 'activity'>('watchlist');
    const [favoriteGenres, setFavoriteGenres] = useState<string[]>([]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedBio = localStorage.getItem("user_bio");
            if (savedBio) setBio(savedBio);
            const savedGenres = localStorage.getItem("user_favorite_genres");
            if (savedGenres) setFavoriteGenres(JSON.parse(savedGenres));
        }
    }, []);

    const saveBio = () => {
        setIsEditingBio(false);
        localStorage.setItem("user_bio", bio);
    };

    const toggleFavoriteGenre = (genre: string) => {
        setFavoriteGenres(prev => {
            const next = prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre].slice(0, 5);
            localStorage.setItem("user_favorite_genres", JSON.stringify(next));
            return next;
        });
    };

    // Computed stats from watched history
    const stats = useMemo(() => {
        if (!watched || watched.length === 0) return null;

        const totalMinutes = watched.reduce((acc: number, m: any) => acc + (m.runtime || 0), 0);
        const hours = Math.floor(totalMinutes / 60);
        const avgRating = watched.reduce((acc: number, m: any) => acc + (m.vote_average || 0), 0) / watched.length;

        // Genre distribution
        const genreCounts: Record<string, number> = {};
        watched.forEach((m: any) => {
            // Try genres array first, then genre_ids
            const genres = m.genres || (m.genre_ids?.map((id: number) => ({ name: GENRE_MAP[id] || "Unknown" }))) || [];
            genres.forEach((g: any) => {
                const name = g.name || g;
                if (name) genreCounts[name] = (genreCounts[name] || 0) + 1;
            });
        });
        const topGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
        const maxGenreCount = topGenres.length > 0 ? topGenres[0][1] : 1;

        // Decade distribution
        const decadeCounts: Record<string, number> = {};
        watched.forEach((m: any) => {
            const year = parseInt((m.release_date || m.first_air_date || "").split("-")[0]);
            if (year) {
                const decade = `${Math.floor(year / 10) * 10}s`;
                decadeCounts[decade] = (decadeCounts[decade] || 0) + 1;
            }
        });
        const topDecades = Object.entries(decadeCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

        // Watch streak: consecutive days with a movie watched (approximate)
        const uniqueMovies = watched.length;

        return { hours, totalMinutes, avgRating, topGenres, maxGenreCount, topDecades, uniqueMovies };
    }, [watched]);

    if (!isLoaded) return <div className="min-h-screen bg-bg-main flex items-center justify-center text-white">Loading...</div>;

    if (!isSignedIn) {
        return <RedirectToSignIn />;
    }

    return (
        <main className="min-h-screen pt-32 sm:pt-36 pb-20 bg-bg-main">
            <div className="container mx-auto px-4 sm:px-6 lg:px-20">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 mb-10 sm:mb-12 bg-bg-card p-6 sm:p-8 rounded-2xl border border-white/5 relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-accent-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                    <div className="relative">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-bg-main overflow-hidden ring-4 ring-white/10 relative group">
                            <Image
                                src={user.imageUrl}
                                alt={user.fullName || "User"}
                                fill
                                sizes="128px"
                                className="object-cover"
                            />
                        </div>
                        {/* Level Badge */}
                        {watched.length > 0 && (
                            <div className="absolute -bottom-1 -right-1 bg-accent-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-bg-card">
                                Lvl {Math.min(Math.floor(watched.length / 5) + 1, 99)}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left relative z-10 w-full">
                        <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-1">{user.fullName}</h1>
                        <p className="text-text-secondary text-sm sm:text-base mb-2">{user.primaryEmailAddress?.emailAddress}</p>

                        {/* Favorite Genres Tags */}
                        {favoriteGenres.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3 justify-center md:justify-start">
                                {favoriteGenres.map(g => (
                                    <span key={g} className="px-2 py-0.5 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-[10px] font-medium">
                                        {g}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Bio Section */}
                        <div className="mb-4 max-w-xl">
                            {isEditingBio ? (
                                <div className="flex gap-2">
                                    <input
                                        autoFocus
                                        type="text"
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="Add a bio..."
                                        className="bg-black/50 border border-white/20 rounded px-3 py-1 text-sm text-white w-full focus:outline-none focus:border-accent-primary"
                                        onKeyDown={(e) => e.key === 'Enter' && saveBio()}
                                        maxLength={160}
                                    />
                                    <button onClick={saveBio} className="p-1 hover:text-accent-primary text-white" aria-label="Save bio"><Save size={16} /></button>
                                </div>
                            ) : (
                                <p className="text-text-muted text-sm flex items-center justify-center md:justify-start gap-2 group cursor-pointer" onClick={() => setIsEditingBio(true)}>
                                    {bio || "Add a bio..."}
                                    <Edit2 size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </p>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                            <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-text-muted flex items-center gap-2">
                                <Heart size={14} className="text-accent-primary" /> {items.length} Saved
                            </div>
                            <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-text-muted flex items-center gap-2">
                                <Eye size={14} className="text-green-500" /> {watched.length} Watched
                            </div>
                            {stats && (
                                <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-text-muted flex items-center gap-2">
                                    <Clock size={14} className="text-accent-highlight" /> {stats.hours}h watched
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 sm:gap-4 relative z-10">
                        <button onClick={() => openUserProfile()} className="p-2.5 sm:p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors" aria-label="Account settings">
                            <Settings size={18} className="sm:w-5 sm:h-5" />
                        </button>
                        <SignOutButton>
                            <button className="p-2.5 sm:p-3 rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 transition-colors" aria-label="Sign out">
                                <LogOut size={18} className="sm:w-5 sm:h-5" />
                            </button>
                        </SignOutButton>
                    </div>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
                        <div className="bg-bg-card border border-white/5 p-5 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-colors">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Film size={48} />
                            </div>
                            <h3 className="text-text-muted text-xs font-medium mb-1">Movies Watched</h3>
                            <p className="text-3xl font-display font-bold text-white">{stats.uniqueMovies}</p>
                        </div>
                        <div className="bg-bg-card border border-white/5 p-5 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-colors">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Clock size={48} />
                            </div>
                            <h3 className="text-text-muted text-xs font-medium mb-1">Time Spent</h3>
                            <p className="text-3xl font-display font-bold text-white">{stats.hours}<span className="text-lg">h</span></p>
                        </div>
                        <div className="bg-bg-card border border-white/5 p-5 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-colors">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Star size={48} />
                            </div>
                            <h3 className="text-text-muted text-xs font-medium mb-1">Avg Rating</h3>
                            <p className="text-3xl font-display font-bold text-white">{stats.avgRating.toFixed(1)}</p>
                        </div>
                        <div className="bg-bg-card border border-white/5 p-5 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-colors">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Award size={48} />
                            </div>
                            <h3 className="text-text-muted text-xs font-medium mb-1">Top Genre</h3>
                            <p className="text-xl font-display font-bold text-white truncate">{stats.topGenres[0]?.[0] || "N/A"}</p>
                        </div>
                    </div>
                )}

                {/* Genre Distribution + Decade Breakdown */}
                {stats && stats.topGenres.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-10">
                        {/* Genre Distribution */}
                        <div className="bg-bg-card border border-white/5 p-6 rounded-2xl">
                            <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                                <BarChart3 size={16} className="text-accent-primary" /> Genre Distribution
                            </h3>
                            <div className="space-y-3">
                                {stats.topGenres.map(([genre, count]) => (
                                    <div key={genre} className="flex items-center gap-3">
                                        <span className="text-text-muted text-xs w-20 truncate">{genre}</span>
                                        <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(count / stats.maxGenreCount) * 100}%` }}
                                                transition={{ duration: 0.8, delay: 0.1 }}
                                                className="h-full bg-accent-primary rounded-full"
                                            />
                                        </div>
                                        <span className="text-text-muted text-xs w-6 text-right">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Decade Breakdown */}
                        <div className="bg-bg-card border border-white/5 p-6 rounded-2xl">
                            <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                                <Calendar size={16} className="text-accent-secondary" /> Era Breakdown
                            </h3>
                            <div className="flex items-end gap-2 h-32">
                                {stats.topDecades.map(([decade, count]) => {
                                    const maxCount = stats.topDecades[0][1] as number;
                                    const height = ((count as number) / maxCount) * 100;
                                    return (
                                        <div key={decade} className="flex-1 flex flex-col items-center gap-1">
                                            <span className="text-text-muted text-[10px]">{count}</span>
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${height}%` }}
                                                transition={{ duration: 0.8, delay: 0.1 }}
                                                className="w-full bg-accent-secondary/60 rounded-t-md min-h-[4px]"
                                            />
                                            <span className="text-text-muted text-[10px]">{decade}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Favorite Genres Picker */}
                <div className="bg-bg-card border border-white/5 p-6 rounded-2xl mb-8 sm:mb-10">
                    <h3 className="text-white font-bold text-sm mb-2 flex items-center gap-2">
                        <Palette size={16} className="text-accent-highlight" /> Your Favorite Genres
                    </h3>
                    <p className="text-text-muted text-xs mb-4">Pick up to 5 genres you love. These help personalize your recommendations.</p>
                    <div className="flex flex-wrap gap-2">
                        {Object.values(GENRE_MAP).map(genre => (
                            <button
                                key={genre}
                                onClick={() => toggleFavoriteGenre(genre)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                    favoriteGenres.includes(genre)
                                        ? "bg-accent-primary text-white"
                                        : "bg-white/5 text-text-muted hover:bg-white/10 hover:text-white"
                                }`}
                            >
                                {genre}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 sm:gap-6 mb-6 sm:mb-8 border-b border-white/5 overflow-x-auto">
                    {(['watchlist', 'watched', 'activity'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 sm:pb-4 text-xs sm:text-sm font-bold transition-colors relative whitespace-nowrap capitalize ${activeTab === tab ? 'text-white' : 'text-text-muted hover:text-white'}`}
                        >
                            {tab === 'watchlist' ? 'My Watchlist' : tab === 'watched' ? 'Watched History' : 'Recent Activity'}
                            {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-accent-primary rounded-t-full" />}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                    >
                        {activeTab === 'watchlist' ? (
                            items.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-8 sm:gap-y-10 gap-x-3 sm:gap-x-6">
                                    {items.map((movie: any) => (
                                        <MovieCard key={movie.id} movie={movie} />
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center bg-bg-card rounded-2xl border border-white/5 border-dashed">
                                    <Film size={48} className="mx-auto text-text-muted mb-4 opacity-30" />
                                    <p className="text-text-secondary font-medium">Your watchlist is empty.</p>
                                    <p className="text-text-muted text-sm mt-2 mb-6">Browse movies and click the + button to add them.</p>
                                    <Link href="/discover" className="px-5 py-2.5 bg-accent-primary hover:bg-accent-primary/90 text-white text-sm font-bold rounded-lg transition-all">
                                        Discover Movies
                                    </Link>
                                </div>
                            )
                        ) : activeTab === 'watched' ? (
                            watched.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-8 sm:gap-y-10 gap-x-3 sm:gap-x-6">
                                    {watched.map((movie: any) => (
                                        <MovieCard key={movie.id} movie={movie} />
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center bg-bg-card rounded-2xl border border-white/5 border-dashed">
                                    <Eye size={48} className="mx-auto text-text-muted mb-4 opacity-30" />
                                    <p className="text-text-secondary font-medium">No movies watched yet.</p>
                                    <p className="text-text-muted text-sm mt-2">Mark movies as watched to track your history.</p>
                                </div>
                            )
                        ) : (
                            /* Activity Tab */
                            recentlyViewed && recentlyViewed.length > 0 ? (
                                <div className="space-y-3">
                                    {recentlyViewed.slice(0, 20).map((item: any, idx: number) => (
                                        <Link
                                            key={`${item.id}-${idx}`}
                                            href={`/${item.type === 'tv' ? 'tv' : 'movie'}/${item.id}`}
                                            className="flex items-center gap-4 p-4 bg-bg-card border border-white/5 rounded-xl hover:border-white/10 transition-all group"
                                        >
                                            <div className="w-12 h-16 relative rounded-lg overflow-hidden shrink-0 bg-white/5">
                                                {item.poster_path && (
                                                    <Image
                                                        src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                                                        alt={item.title || item.name || ""}
                                                        fill
                                                        sizes="48px"
                                                        className="object-cover"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white text-sm font-medium truncate group-hover:text-accent-primary transition-colors">
                                                    {item.title || item.name}
                                                </p>
                                                <p className="text-text-muted text-xs mt-0.5">
                                                    {item.type === 'tv' ? 'TV Show' : 'Movie'} &middot; Viewed recently
                                                </p>
                                            </div>
                                            <div className="text-text-muted text-xs shrink-0">
                                                {item.vote_average ? `★ ${item.vote_average.toFixed(1)}` : ''}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center bg-bg-card rounded-2xl border border-white/5 border-dashed">
                                    <TrendingUp size={48} className="mx-auto text-text-muted mb-4 opacity-30" />
                                    <p className="text-text-secondary font-medium">No activity yet.</p>
                                    <p className="text-text-muted text-sm mt-2">Start browsing movies and shows to see your activity here.</p>
                                </div>
                            )
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </main>
    );
}
