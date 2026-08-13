"use client";

import { useEffect, useState, useContext } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Play, Plus, Star, Calendar, Clock, X, Check, DollarSign, MapPin, Film, Tag, List as ListIcon, Info } from "lucide-react";
import { getMovieDetails, getWatchProviders, getCollection } from "@/api/tmdb";
import { MovieCard } from "@/components/MovieCard";
import { UserRatingPanel } from "@/components/UserRatingPanel";
import { WatchProviders } from "@/components/WatchProviders";
import YouTube from "react-youtube";
import { WatchlistContext } from "@/context/watchlist-context";
import { RecentlyViewedContext } from "@/context/RecentlyViewedContext";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { AIRecommendations } from "@/components/AIRecommendations";
import { SignedIn, SignedOut, useClerk } from "@clerk/nextjs";
import { useLists } from "@/context/ListsContext";
import { getFmdbMedia, getFmdbPoster } from "@/api/fmdb";

export default function MovieDetailsPage() {
    const { id } = useParams();
    const [movie, setMovie] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showTrailer, setShowTrailer] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedRegion, setSelectedRegion] = useState('US');
    const [selectedVideo, setSelectedVideo] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'trailers' | 'clips' | 'behind'>('trailers');
    const [collection, setCollection] = useState<any>(null);
    const [fmdbMedia, setFmdbMedia] = useState<{ url: string; youtubeId: string | null } | null>(null);
    const [fmdbPoster, setFmdbPoster] = useState<string | null>(null);

    const { openSignIn } = useClerk();
    const { lists, addToList, removeFromList, isInList, createList } = useLists() as any;
    const [showListDropdown, setShowListDropdown] = useState(false);
    const [newListName, setNewListName] = useState("");

    const { has, add, remove } = useContext(WatchlistContext) as any;
    const { addToRecentlyViewed } = useContext(RecentlyViewedContext) as any;
    const isWatchlisted = movie ? has(movie.id, 'movie') : false;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        async function loadDetails() {
            if (id) {
                try {
                    const data = await getMovieDetails(id as string);
                    if (!data?.id) throw new Error("Movie details unavailable.");
                    const providers = await getWatchProviders(id as string, 'movie');
                    
                    const myProviders = providers?.results?.[selectedRegion] || providers?.results?.['US'];
                    const movieData = { ...data, providers: myProviders, allProviders: providers?.results };
                    setMovie(movieData);
                    setFmdbMedia(null);
                    setFmdbPoster(null);

                    if (data?.belongs_to_collection?.id) {
                        try {
                            const collectionData = await getCollection(data.belongs_to_collection.id);
                            setCollection(collectionData);
                        } catch (err) {
                            setCollection(null);
                        }
                    }

                    if (addToRecentlyViewed) {
                        addToRecentlyViewed({
                            id: movieData.id,
                            title: movieData.title,
                            poster_path: movieData.poster_path,
                            vote_average: movieData.vote_average,
                            release_date: movieData.release_date,
                            type: 'movie'
                        });
                    }

                    setLoading(false);
                } catch (error: any) {
                    setError(error?.message || 'Failed to load movie');
                    setLoading(false);
                }
            }
        }
        loadDetails();
    }, [id, addToRecentlyViewed, selectedRegion]);

    useEffect(() => {
        let cancelled = false;
        const imdbId = movie?.external_ids?.imdb_id;

        if (!imdbId) return undefined;

        Promise.all([getFmdbMedia(imdbId), Promise.resolve(getFmdbPoster(imdbId))]).then(([media, poster]) => {
            if (cancelled) return;
            setFmdbMedia(media);
            setFmdbPoster(poster);
        });

        return () => {
            cancelled = true;
        };
    }, [movie?.external_ids?.imdb_id]);

    const handleWatchlist = () => {
        if (!movie) return;
        if (isWatchlisted) remove(movie.id, 'movie');
        else add({ ...movie, type: 'movie' });
    };

    const handleListToggle = (listId: string) => {
        if (isInList(listId, movie.id, 'movie')) removeFromList(listId, movie.id, 'movie');
        else addToList(listId, { ...movie, type: 'movie' });
    };

    const handleCreateList = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newListName.trim()) return;
        const list = await createList(newListName.trim());
        if (list?.id && movie) await addToList(list.id, { ...movie, type: 'movie' });
        setNewListName("");
    };

    if (loading) return (
        <div className="min-h-screen bg-bg-main flex items-center justify-center">
            <div className="animate-pulse rounded-full h-16 w-16 bg-accent-primary/20"></div>
        </div>
    );
    if (!movie) return (
        <div className="min-h-screen bg-bg-main flex items-center justify-center">
            <div className="text-center">
                <p className="text-white text-3xl font-display mb-4">Movie not found</p>
                <Link href="/movies" className="text-accent-primary hover:underline">← Back to Discover</Link>
            </div>
        </div>
    );

    const trailers = movie.videos?.results.filter((v: any) => v.type === "Trailer" && v.site === "YouTube") || [];
    const clips = movie.videos?.results.filter((v: any) => v.type === "Clip" && v.site === "YouTube") || [];
    const behindScenes = movie.videos?.results.filter((v: any) => (v.type === "Behind the Scenes" || v.type === "Featurette") && v.site === "YouTube") || [];
    const trailer = trailers[0] || clips[0] || (fmdbMedia?.youtubeId ? {
        id: `fmdb-${movie.external_ids.imdb_id}`,
        key: fmdbMedia.youtubeId,
        name: "Trailer from FM-DB",
        site: "YouTube",
        type: "Trailer",
    } : null);
    const activeVideo = selectedVideo || trailer;
    
    const cast = movie.credits?.cast || [];
    const crew = movie.credits?.crew || [];
    const director = crew.find((c: any) => c.job === "Director");
    const writers = crew.filter((c: any) => c.department === "Writing").slice(0, 3);
    
    const similar = movie.similar?.results?.slice(0, 10) || [];
    const keywords = movie.keywords?.keywords || [];
    const availableRegions = movie.allProviders ? Object.keys(movie.allProviders).sort() : ['US'];

    return (
        <main className="min-h-screen bg-bg-main relative">
            {/* Ambient Blurred Background Effect */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {(movie.backdrop_path || fmdbPoster) && (
                    <Image
                        src={movie.backdrop_path ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}` : fmdbPoster as string}
                        alt="ambient"
                        fill
                        className="object-cover opacity-20 blur-[100px] saturate-200"
                    />
                )}
                <div className="absolute inset-0 bg-bg-main/80" />
            </div>

            {/* Trailer Modal */}
            <AnimatePresence>
                {showTrailer && activeVideo && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4"
                        onClick={() => { setShowTrailer(false); setSelectedVideo(null); }}
                    >
                        <button className="absolute top-8 right-8 text-white hover:text-accent-primary p-2 z-50">
                            <X size={32} />
                        </button>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-6xl aspect-video relative rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]"
                            onClick={e => e.stopPropagation()}
                        >
                            <YouTube
                                videoId={activeVideo.key}
                                opts={{ width: '100%', height: '100%', playerVars: { autoplay: 1 } }}
                                className="w-full h-full"
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cinematic Hero Section */}
            <div className="relative w-full h-[75vh] min-h-[600px] z-10 flex items-end pb-12">
                <div className="absolute inset-0">
                    {movie.backdrop_path || fmdbPoster ? (
                        <Image
                            src={movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : fmdbPoster as string}
                            alt={movie.title}
                            fill
                            priority
                            className="object-cover object-top mask-image-b"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-bg-surface" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-main via-bg-main/50 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-bg-main via-bg-main/30 to-transparent" />
                </div>

                <div className="container relative z-20 mx-auto px-6 lg:px-20">
                    <div className="max-w-4xl">
                        {movie.tagline && (
                            <p className="text-accent-primary font-bold tracking-widest uppercase text-sm mb-4 drop-shadow-md">
                                {movie.tagline}
                            </p>
                        )}
                        <h1 className="text-5xl sm:text-7xl lg:text-[6rem] font-display font-bold text-white leading-[0.9] tracking-tight mb-6 drop-shadow-2xl">
                            {movie.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-text-secondary mb-8 drop-shadow">
                            {movie.vote_average > 0 && (
                                <span className="flex items-center gap-1.5 text-white bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                                    <Star size={16} className="text-accent-primary fill-accent-primary" />
                                    {movie.vote_average.toFixed(1)} <span className="text-text-muted text-xs font-normal">({movie.vote_count})</span>
                                </span>
                            )}
                            {movie.release_date && (
                                <span className="flex items-center gap-1.5">
                                    <Calendar size={16} /> {movie.release_date.split("-")[0]}
                                </span>
                            )}
                            {movie.runtime > 0 && (
                                <span className="flex items-center gap-1.5">
                                    <Clock size={16} /> {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                                </span>
                            )}
                            {movie.adult !== undefined && (
                                <span className="border border-text-muted px-2 py-0.5 rounded text-xs">{movie.adult ? '18+' : 'PG'}</span>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            {trailer && (
                                <button
                                    onClick={() => { setSelectedVideo(trailer); setShowTrailer(true); }}
                                    className="flex items-center gap-3 px-8 py-4 bg-white text-bg-main font-bold rounded-full transition-transform hover:scale-105"
                                >
                                    <Play fill="currentColor" size={20} />
                                    Watch Trailer
                                </button>
                            )}

                            <SignedIn>
                                <button
                                    onClick={handleWatchlist}
                                    className={clsx(
                                        "flex items-center justify-center p-4 rounded-full transition-all border backdrop-blur-md hover:scale-105",
                                        isWatchlisted ? "bg-accent-primary border-accent-primary text-white shadow-cinematic-glow" : "bg-glass border-border text-white hover:bg-white/10"
                                    )}
                                >
                                    {isWatchlisted ? <Check size={20} /> : <Plus size={20} />}
                                </button>

                                <div className="relative">
                                    <button
                                        onClick={() => setShowListDropdown(!showListDropdown)}
                                        className="flex items-center justify-center p-4 rounded-full transition-all border backdrop-blur-md bg-glass border-border text-white hover:bg-white/10 hover:scale-105"
                                    >
                                        <ListIcon size={20} />
                                    </button>
                                    <AnimatePresence>
                                        {showListDropdown && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                                className="absolute top-full left-0 mt-4 w-72 bg-bg-surface/90 border border-white/10 rounded-2xl shadow-elevated p-5 z-50 backdrop-blur-3xl"
                                            >
                                                {/* List Dropdown Content */}
                                                <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                                                    <h4 className="text-white font-bold text-sm">Add to List</h4>
                                                    <button onClick={() => setShowListDropdown(false)}><X size={16} className="text-text-muted hover:text-white" /></button>
                                                </div>
                                                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                                                    {lists.map((list: any) => {
                                                        const inList = isInList(list.id, movie.id, 'movie');
                                                        return (
                                                            <button
                                                                key={list.id} onClick={() => handleListToggle(list.id)}
                                                                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/10 transition-colors text-left"
                                                            >
                                                                <span className="text-sm text-white">{list.name}</span>
                                                                {inList && <Check size={16} className="text-accent-primary" />}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                <form onSubmit={handleCreateList} className="flex gap-2 relative">
                                                    <input type="text" placeholder="Create new list..." className="flex-1 bg-black/50 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-sm text-white focus:outline-none focus:border-accent-primary transition-colors" value={newListName} onChange={(e) => setNewListName(e.target.value)} />
                                                    <button type="submit" disabled={!newListName.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 text-accent-primary disabled:opacity-50 hover:scale-110 transition-transform"><Plus size={20} /></button>
                                                </form>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </SignedIn>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area - Masonry/Grid Layout */}
            <div className="container relative z-20 mx-auto px-6 lg:px-20 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    {/* Left Column (Main Info) */}
                    <div className="lg:col-span-8 space-y-16">
                        {/* Synopsis & Director */}
                        <div>
                            <h2 className="text-2xl font-display font-bold text-white mb-6">Overview</h2>
                            <p className="text-text-secondary text-lg leading-relaxed font-sans max-w-4xl">
                                {movie.overview}
                            </p>
                            
                            <div className="flex flex-wrap gap-8 mt-8 border-t border-white/5 pt-8">
                                {director && (
                                    <div>
                                        <p className="text-text-muted text-sm font-medium mb-1">Director</p>
                                        <p className="text-white font-medium">{director.name}</p>
                                    </div>
                                )}
                                {writers.length > 0 && (
                                    <div>
                                        <p className="text-text-muted text-sm font-medium mb-1">Writers</p>
                                        <p className="text-white font-medium">{writers.map((w: any) => w.name).join(', ')}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Top Cast */}
                        {cast.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-display font-bold text-white mb-6">Top Cast</h2>
                                <div className="flex gap-4 overflow-x-auto horizontal-scroll pb-6 -mx-6 px-6 lg:-mx-0 lg:px-0 snap-x">
                                    {cast.slice(0, 15).map((actor: any) => (
                                        <Link key={actor.id} href={`/person/${actor.id}`} className="snap-start shrink-0 w-[140px] group">
                                            <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 shadow-elevated">
                                                {actor.profile_path ? (
                                                    <Image src={`https://image.tmdb.org/t/p/w300${actor.profile_path}`} alt={actor.name} fill sizes="140px" className="object-cover transition-transform duration-500 group-hover:scale-110" />
                                                ) : (
                                                    <div className="w-full h-full bg-bg-surface flex items-center justify-center text-text-muted border border-border">No Image</div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            </div>
                                            <p className="text-white font-bold text-sm truncate group-hover:text-accent-primary transition-colors">{actor.name}</p>
                                            <p className="text-text-secondary text-xs truncate">{actor.character}</p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Videos Grid */}
                        {(trailers.length > 0 || clips.length > 0 || behindScenes.length > 0) && (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-display font-bold text-white">Videos</h2>
                                    <div className="flex gap-2">
                                        {[
                                            { id: 'trailers', label: 'Trailers', data: trailers },
                                            { id: 'clips', label: 'Clips', data: clips },
                                            { id: 'behind', label: 'BTS', data: behindScenes }
                                        ].filter(t => t.data.length > 0).map(tab => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id as any)}
                                                className={clsx(
                                                    "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                                                    activeTab === tab.id ? "bg-white/10 text-white" : "text-text-muted hover:text-white"
                                                )}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {(activeTab === 'trailers' ? trailers : activeTab === 'clips' ? clips : behindScenes).slice(0, 4).map((video: any) => (
                                        <button key={video.id} onClick={() => { setSelectedVideo(video); setShowTrailer(true); }} className="group relative aspect-video rounded-2xl overflow-hidden bg-bg-surface shadow-elevated transform transition-transform hover:scale-[1.02]">
                                            <Image src={`https://img.youtube.com/vi/${video.key}/maxresdefault.jpg`} alt={video.name} fill className="object-cover" />
                                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                <Play size={48} className="text-white drop-shadow-[0_0_15px_rgba(0,0,0,0.5)] transform group-hover:scale-110 transition-transform" fill="currentColor" />
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
                                                <p className="text-white text-sm font-medium line-clamp-1">{video.name}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column (Sidebar) */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Providers */}
                        <div className="bg-bg-surface/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-elevated">
                            <WatchProviders
                                providers={movie.providers}
                                availableRegions={availableRegions}
                                selectedRegion={selectedRegion}
                                onRegionChange={setSelectedRegion}
                            />
                        </div>

                        {/* Rating Panel */}
                        <div className="bg-bg-surface/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-elevated">
                            <UserRatingPanel item={{ ...movie, type: 'movie' }} type="movie" />
                        </div>

                        {/* Movie Facts */}
                        <div className="bg-bg-surface/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-elevated space-y-6">
                            <h3 className="font-display font-bold text-white text-lg">Details</h3>
                            <div className="space-y-4">
                                {movie.status && (
                                    <div>
                                        <p className="text-text-muted text-xs font-medium uppercase tracking-wider mb-1">Status</p>
                                        <p className="text-white font-medium">{movie.status}</p>
                                    </div>
                                )}
                                {movie.budget > 0 && (
                                    <div>
                                        <p className="text-text-muted text-xs font-medium uppercase tracking-wider mb-1">Budget</p>
                                        <p className="text-white font-medium">${(movie.budget / 1000000).toFixed(1)}M</p>
                                    </div>
                                )}
                                {movie.revenue > 0 && (
                                    <div>
                                        <p className="text-text-muted text-xs font-medium uppercase tracking-wider mb-1">Revenue</p>
                                        <p className="text-white font-medium">${(movie.revenue / 1000000).toFixed(1)}M</p>
                                    </div>
                                )}
                                {movie.original_language && (
                                    <div>
                                        <p className="text-text-muted text-xs font-medium uppercase tracking-wider mb-1">Original Language</p>
                                        <p className="text-white font-medium uppercase">{movie.original_language}</p>
                                    </div>
                                )}
                                {movie.genres && (
                                    <div>
                                        <p className="text-text-muted text-xs font-medium uppercase tracking-wider mb-2">Genres</p>
                                        <div className="flex flex-wrap gap-2">
                                            {movie.genres.map((g: any) => (
                                                <span key={g.id} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white">
                                                    {g.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {keywords.length > 0 && (
                                    <div>
                                        <p className="text-text-muted text-xs font-medium uppercase tracking-wider mb-2">Keywords</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {keywords.map((k: any) => (
                                                <span key={k.id} className="text-text-secondary text-xs hover:text-white cursor-pointer transition-colors">
                                                    #{k.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Full Width Sections */}
                {collection && (
                    <div className="mt-24">
                        <div className="relative rounded-[2rem] overflow-hidden shadow-elevated border border-white/5 bg-bg-surface">
                            {collection.backdrop_path && (
                                <Image src={`https://image.tmdb.org/t/p/original${collection.backdrop_path}`} alt={collection.name} fill className="object-cover opacity-30" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-bg-main via-bg-main/80 to-transparent" />
                            <div className="relative z-10 p-8 sm:p-12">
                                <h3 className="text-text-muted font-bold tracking-widest uppercase text-sm mb-2">Part of</h3>
                                <h4 className="text-4xl font-display font-bold text-white mb-8">{collection.name}</h4>
                                <div className="flex gap-4 sm:gap-6 overflow-x-auto horizontal-scroll pb-4 snap-x">
                                    {collection.parts?.map((part: any) => (
                                        <div key={part.id} className="snap-start shrink-0 w-[160px] sm:w-[200px]">
                                            <MovieCard movie={part} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-24 space-y-24">
                    <AIRecommendations id={movie.id} type="movie" />

                    {similar && similar.length > 0 && (
                        <div>
                            <div className="flex items-center gap-4 mb-8">
                                <h3 className="text-3xl font-display font-bold text-white">More Like This</h3>
                                <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                                {similar.map((m: any) => (
                                    <MovieCard key={m.id} movie={m} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
