"use client";

import { useUser, RedirectToSignIn, useClerk } from "@clerk/nextjs";
import Image from "next/image";
import { Clock, Heart, Settings, LogOut, Edit2, Save, Eye } from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";
import { useContext, useEffect, useState } from "react";
import { WatchlistContext } from "@/context/watchlist-context";
import { WatchedContext } from "@/context/WatchedContext";
import { MovieCard } from "@/components/MovieCard";

export default function ProfilePage() {
    const { isLoaded, isSignedIn, user } = useUser();
    const { openUserProfile } = useClerk();
    const { items } = useContext(WatchlistContext) as any;
    const { watched } = useContext(WatchedContext) as any;
    const [bio, setBio] = useState("");
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [activeTab, setActiveTab] = useState<'watchlist' | 'watched'>('watchlist');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedBio = localStorage.getItem("user_bio");
            if (savedBio) setBio(savedBio);
        }
    }, []);

    const saveBio = () => {
        setIsEditingBio(false);
        localStorage.setItem("user_bio", bio);
    };

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
                                className="object-cover"
                            />
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left relative z-10 w-full">
                        <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">{user.fullName}</h1>
                        <p className="text-text-secondary text-sm sm:text-base mb-4">{user.primaryEmailAddress?.emailAddress}</p>

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
                                    />
                                    <button onClick={saveBio} className="p-1 hover:text-accent-primary text-white"><Save size={16} /></button>
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
                        </div>
                    </div>

                    <div className="flex gap-3 sm:gap-4 relative z-10">
                        <button onClick={() => openUserProfile()} className="p-2.5 sm:p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors">
                            <Settings size={18} className="sm:w-5 sm:h-5" />
                        </button>
                        <SignOutButton>
                            <button className="p-2.5 sm:p-3 rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 transition-colors">
                                <LogOut size={18} className="sm:w-5 sm:h-5" />
                            </button>
                        </SignOutButton>
                    </div>
                </div>

                {/* Stats Section (New) */}
                {watched.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-12">
                        <div className="bg-bg-card border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Eye size={64} />
                            </div>
                            <h3 className="text-text-secondary text-sm font-medium mb-1">Total Watched</h3>
                            <p className="text-4xl font-display font-bold text-white">{watched.length}</p>
                            <div className="w-full bg-white/10 h-1 mt-4 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 w-full" />
                            </div>
                        </div>

                        <div className="bg-bg-card border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Heart size={64} />
                            </div>
                            <h3 className="text-text-secondary text-sm font-medium mb-1">Favorite Genre</h3>
                            <p className="text-2xl font-display font-bold text-white truncate">
                                {(() => {
                                    const genres: Record<string, number> = {};
                                    watched.forEach((m: any) => {
                                        m.genres?.forEach((g: any) => {
                                            genres[g.name] = (genres[g.name] || 0) + 1;
                                        });
                                    });
                                    const sorted = Object.entries(genres).sort((a, b) => b[1] - a[1]);
                                    return sorted.length > 0 ? sorted[0][0] : 'N/A';
                                })()}
                            </p>
                            <p className="text-xs text-text-muted mt-2">Based on your history</p>
                        </div>

                        <div className="bg-bg-card border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Clock size={64} />
                            </div>
                            <h3 className="text-text-secondary text-sm font-medium mb-1">Time Spent</h3>
                            <p className="text-2xl font-display font-bold text-white">
                                {(() => {
                                    const minutes = watched.reduce((acc: number, m: any) => acc + (m.runtime || 0), 0);
                                    const hours = Math.floor(minutes / 60);
                                    return `${hours}h ${minutes % 60}m`;
                                })()}
                            </p>
                            <p className="text-xs text-text-muted mt-2">Approximate runtime</p>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-4 sm:gap-6 mb-6 sm:mb-8 border-b border-white/5 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('watchlist')}
                        className={`pb-3 sm:pb-4 text-xs sm:text-sm font-bold transition-colors relative whitespace-nowrap ${activeTab === 'watchlist' ? 'text-white' : 'text-text-muted hover:text-white'}`}
                    >
                        My Watchlist
                        {activeTab === 'watchlist' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-accent-primary rounded-t-full" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('watched')}
                        className={`pb-3 sm:pb-4 text-xs sm:text-sm font-bold transition-colors relative whitespace-nowrap ${activeTab === 'watched' ? 'text-white' : 'text-text-muted hover:text-white'}`}
                    >
                        Watched History
                        {activeTab === 'watched' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-accent-primary rounded-t-full" />}
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    {activeTab === 'watchlist' ? (
                        items.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-8 sm:gap-y-10 gap-x-3 sm:gap-x-6">
                                {items.map((movie: any) => (
                                    <MovieCard key={movie.id} movie={movie} />
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center bg-bg-card rounded-2xl border border-white/5 border-dashed">
                                <p className="text-text-secondary">Your watchlist is empty.</p>
                                <p className="text-text-muted text-sm mt-2">Browse movies and click the + button to add them.</p>
                            </div>
                        )
                    ) : (
                        watched.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-8 sm:gap-y-10 gap-x-3 sm:gap-x-6">
                                {watched.map((movie: any) => (
                                    <MovieCard key={movie.id} movie={movie} />
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center bg-bg-card rounded-2xl border border-white/5 border-dashed">
                                <p className="text-text-secondary">No movies watched yet.</p>
                                <p className="text-text-muted text-sm mt-2">Mark movies as watched to track your history.</p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </main>
    );
}
