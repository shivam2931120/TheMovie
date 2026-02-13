"use client";

import { useEffect, useState, useContext } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Play, Plus, Star, Calendar, Clock, X, Check, DollarSign, Award, MapPin, Music, Film, ChevronLeft, ChevronRight, MessageSquare, Tag, User, List as ListIcon, Trash2 } from "lucide-react";
import { getMovieDetails, getWatchProviders, getCollection } from "@/api/tmdb";
import { MovieCard } from "@/components/MovieCard";
import YouTube from "react-youtube";
import { WatchlistContext } from "@/context/watchlist-context";
import { RecentlyViewedContext } from "@/context/RecentlyViewedContext";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { AIRecommendations } from "@/components/AIRecommendations";
import { SignedIn, SignedOut, useClerk } from "@clerk/nextjs";
import { useLists } from "@/context/ListsContext";

export default function MovieDetailsPage() {
    const { id } = useParams();
    const [movie, setMovie] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showTrailer, setShowTrailer] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedRegion, setSelectedRegion] = useState('IN');
    const [selectedVideo, setSelectedVideo] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'trailers' | 'clips' | 'behind'>('trailers');
    const [collection, setCollection] = useState<any>(null);

    // Auth & Lists
    const { openSignIn } = useClerk();
    const { lists, addToList, removeFromList, isInList, createList } = useLists() as any;
    const [showListDropdown, setShowListDropdown] = useState(false);
    const [newListName, setNewListName] = useState("");

    // Scroll to top on mount to ensure navbar hides properly
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    // Watchlist Logic
    const { has, add, remove } = useContext(WatchlistContext) as any;
    const { addToRecentlyViewed } = useContext(RecentlyViewedContext) as any;
    const isWatchlisted = movie ? has(movie.id, 'movie') : false;

    useEffect(() => {
        async function loadDetails() {
            if (id) {
                try {
                    const data = await getMovieDetails(id as string);
                    const providers = await getWatchProviders(id as string, 'movie');

                    // Get providers for selected region
                    const myProviders = providers?.results?.[selectedRegion] || providers?.results?.['US'];

                    const movieData = { ...data, providers: myProviders, allProviders: providers?.results };
                    setMovie(movieData);

                    // Load collection if part of one
                    if (data?.belongs_to_collection?.id) {
                        try {
                            const collectionData = await getCollection(data.belongs_to_collection.id);
                            setCollection(collectionData);
                        } catch (err) {
                            console.warn('Could not load collection:', err);
                            setCollection(null);
                        }
                    }

                    // Add to recently viewed
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
                    console.error('Error loading movie details:', error);
                    setError(error?.message || 'Failed to load movie');
                    setLoading(false);
                    setMovie(null);
                }
            }
        }
        loadDetails();
    }, [id, addToRecentlyViewed, selectedRegion]);

    const handleWatchlist = () => {
        if (!movie) return;
        if (isWatchlisted) {
            remove(movie.id, 'movie');
        } else {
            add({ ...movie, type: 'movie' });
        }
    };

    const handleListToggle = (listId: string) => {
        if (isInList(listId, movie.id)) {
            removeFromList(listId, movie.id);
        } else {
            addToList(listId, movie);
        }
    };

    const handleCreateList = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newListName.trim()) return;
        await createList(newListName.trim());
        setNewListName("");
    };

    if (loading) return (
        <div className="min-h-screen bg-bg-main flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent-primary mx-auto mb-4"></div>
                <p className="text-white text-lg">Loading movie details...</p>
            </div>
        </div>
    );
    if (!movie) return (
        <div className="min-h-screen bg-bg-main flex items-center justify-center">
            <div className="text-center px-4">
                <p className="text-white text-2xl mb-2">Movie not found</p>
                <p className="text-text-muted mb-4">{error || 'This movie might have been removed or doesn\'t exist.'}</p>
                <Link href="/movies" className="text-accent-primary hover:underline">
                    ← Back to Movies
                </Link>
            </div>
        </div>
    );

    // Organize videos by type
    const trailers = movie.videos?.results.filter((v: any) => v.type === "Trailer" && v.site === "YouTube") || [];
    const clips = movie.videos?.results.filter((v: any) => v.type === "Clip" && v.site === "YouTube") || [];
    const behindScenes = movie.videos?.results.filter((v: any) => (v.type === "Behind the Scenes" || v.type === "Featurette") && v.site === "YouTube") || [];

    const trailer = trailers[0] || clips[0];
    const crew = movie.credits?.crew.slice(0, 5);
    const cast = movie.credits?.cast || [];
    const reviews = movie.reviews?.results || [];
    const similar = movie.similar?.results.slice(0, 10);
    const keywords = movie.keywords?.keywords || [];
    const alternativeTitles = movie.alternative_titles?.titles || [];
    const availableRegions = movie.allProviders ? Object.keys(movie.allProviders).sort() : ['IN', 'US', 'GB', 'CA', 'AU'];

    return (
        <>
            <main className="min-h-screen bg-bg-main pb-20">
                {/* Cinematic Background */}
                <div className="relative h-[80vh] w-full overflow-hidden">
                    {/* Video Player Overlay */}
                    {showTrailer && trailer ? (
                        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
                            <div className="absolute inset-0 bg-black/90" onClick={() => setShowTrailer(false)} />
                            <button
                                onClick={() => setShowTrailer(false)}
                                className="absolute top-8 right-8 text-white hover:text-red-500 z-50 p-2 bg-black/50 rounded-full"
                            >
                                <X size={32} />
                            </button>
                            <div className="relative w-full max-w-6xl aspect-video z-50 p-4">
                                <YouTube
                                    videoId={trailer.key}
                                    opts={{
                                        width: '100%',
                                        height: '100%',
                                        playerVars: { autoplay: 1 }
                                    }}
                                    className="w-full h-full rounded-2xl overflow-hidden shadow-2xl"
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            <Image
                                src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                                alt={movie.title}
                                fill
                                className="object-cover"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-bg-main via-bg-main/60 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-r from-bg-main via-bg-main/40 to-transparent" />
                        </>
                    )}
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-20 -mt-[40vh] relative z-10">
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                        {/* Poster */}
                        <div className="w-full max-w-[280px] sm:max-w-[300px] shrink-0 mx-auto lg:mx-0">
                            <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative group">
                                <Image
                                    src={`https://image.tmdb.org/t/p/w780${movie.poster_path}`}
                                    alt={movie.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-6 lg:space-y-8 pt-4 lg:pt-10">
                            <div>
                                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-display font-bold text-white mb-3 lg:mb-4 leading-tight">
                                    {movie.title}
                                </h1>
                                {movie.tagline && (
                                    <p className="text-lg sm:text-xl text-text-secondary italic font-light mb-4 lg:mb-6">"{movie.tagline}"</p>
                                )}

                                <div className="flex flex-wrap items-center gap-4 lg:gap-6 text-sm text-text-muted mb-4 lg:mb-6">
                                    {movie.vote_average && (
                                        <span className="flex items-center gap-2 text-accent-primary font-bold" title="TMDB Rating">
                                            <Star size={16} fill="currentColor" />
                                            {movie.vote_average.toFixed(1)}
                                            <span className="text-text-muted text-xs font-normal">TMDB</span>
                                        </span>
                                    )}

                                    {movie.release_date && (
                                        <span className="flex items-center gap-2">
                                            <Calendar size={16} />
                                            {movie.release_date.split("-")[0]}
                                        </span>
                                    )}
                                    {movie.runtime && (
                                        <span className="flex items-center gap-2">
                                            <Clock size={16} />
                                            {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                                        </span>
                                    )}
                                    <div className="flex flex-wrap gap-2">
                                        {movie.genres?.map((g: any) => (
                                            <span key={g.id} className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-white">
                                                {g.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap items-center gap-3 lg:gap-4 relative">
                                    {trailer && (
                                        <button
                                            onClick={() => setShowTrailer(true)}
                                            className="flex items-center gap-2 px-6 lg:px-8 py-3 lg:py-4 bg-accent-primary hover:bg-accent-primary/90 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(229,9,20,0.4)] text-sm lg:text-base"
                                        >
                                            <Play fill="currentColor" size={20} />
                                            Watch Trailer
                                        </button>
                                    )}

                                    {/* Auth Guarded Actions */}
                                    <SignedIn>
                                        <button
                                            onClick={handleWatchlist}
                                            className={clsx(
                                                "flex items-center gap-2 px-4 lg:px-6 py-3 lg:py-4 border backdrop-blur-md text-white font-medium rounded-xl transition-all text-sm lg:text-base",
                                                isWatchlisted ? "bg-accent-primary border-accent-primary" : "bg-white/10 hover:bg-white/20 border-white/10"
                                            )}
                                        >
                                            {isWatchlisted ? <Check size={20} /> : <Plus size={20} />}
                                            <span className="hidden sm:inline">{isWatchlisted ? "Added to Watchlist" : "Add to Watchlist"}</span>
                                            <span className="sm:hidden">{isWatchlisted ? "Added" : "Add"}</span>
                                        </button>

                                        {/* Add to List Dropdown */}
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowListDropdown(!showListDropdown)}
                                                className="flex items-center gap-2 px-4 lg:px-6 py-3 lg:py-4 border border-white/10 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-medium rounded-xl transition-all text-sm lg:text-base"
                                            >
                                                <ListIcon size={20} />
                                                <span className="hidden sm:inline">Add to List</span>
                                            </button>

                                            <AnimatePresence>
                                                {showListDropdown && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 10 }}
                                                        className="absolute top-full left-0 mt-2 w-64 bg-bg-card border border-white/10 rounded-xl shadow-2xl p-4 z-50 backdrop-blur-xl"
                                                    >
                                                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                                                            <h4 className="text-white font-bold text-sm">Save to List</h4>
                                                            <button onClick={() => setShowListDropdown(false)} className="text-text-muted hover:text-white">
                                                                <X size={16} />
                                                            </button>
                                                        </div>

                                                        <div className="space-y-2 mb-4 max-h-[200px] overflow-y-auto">
                                                            {lists.map((list: any) => {
                                                                const inList = isInList(list.id, movie.id);
                                                                return (
                                                                    <button
                                                                        key={list.id}
                                                                        onClick={() => handleListToggle(list.id)}
                                                                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-all text-left group"
                                                                    >
                                                                        <span className="text-sm text-white group-hover:text-accent-primary transition-colors">{list.name}</span>
                                                                        {inList && <Check size={16} className="text-accent-primary" />}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>

                                                        <form onSubmit={handleCreateList} className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                placeholder="New List..."
                                                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-accent-primary"
                                                                value={newListName}
                                                                onChange={(e) => setNewListName(e.target.value)}
                                                            />
                                                            <button type="submit" disabled={!newListName.trim()} className="bg-accent-primary px-3 rounded-lg text-white text-xs font-bold hover:bg-accent-primary/80 disabled:opacity-50">
                                                                +
                                                            </button>
                                                        </form>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </SignedIn>

                                    <SignedOut>
                                        <button
                                            onClick={() => openSignIn()}
                                            className="flex items-center gap-2 px-6 py-3 lg:py-4 border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-md text-text-secondary font-medium rounded-xl transition-all text-sm lg:text-base"
                                        >
                                            Sign in to track
                                        </button>
                                    </SignedOut>
                                </div>
                            </div>

                            {/* Streaming Providers */}
                            <div className="mb-0">
                                {movie.providers && (movie.providers.flatrate || movie.providers.buy) ? (
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-lg font-bold text-white">Where to Watch</h3>
                                            <select
                                                value={selectedRegion}
                                                onChange={(e) => setSelectedRegion(e.target.value)}
                                                className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-accent-primary"
                                            >
                                                {availableRegions.map((region) => (
                                                    <option key={region} value={region} className="bg-bg-card">
                                                        {region}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex flex-wrap gap-4">
                                            {movie.providers.flatrate?.map((provider: any) => (
                                                <div key={provider.provider_id} className="relative group" title={`Stream on ${provider.provider_name}`}>
                                                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10">
                                                        <Image
                                                            src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                                                            alt={provider.provider_name}
                                                            width={48}
                                                            height={48}
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            {movie.providers.buy?.map((provider: any) => (
                                                <div key={provider.provider_id} className="relative group" title={`Buy on ${provider.provider_name}`}>
                                                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 opacity-80 hover:opacity-100 transition-opacity">
                                                        <Image
                                                            src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                                                            alt={provider.provider_name}
                                                            width={48}
                                                            height={48}
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-xs text-text-muted mt-2">Data via JustWatch</p>
                                    </div>
                                ) : null}
                            </div>

                            {/* Overview */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">Synopsis</h3>
                                <p className="text-text-secondary leading-relaxed text-lg max-w-3xl">
                                    {movie.overview}
                                </p>
                            </div>

                            {/* Box Office Stats */}
                            {(movie.budget > 0 || movie.revenue > 0) && (
                                <div className="bg-bg-card border border-white/10 rounded-xl p-6">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <DollarSign size={20} className="text-green-500" />
                                        Box Office Performance
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                        {movie.budget > 0 && (
                                            <div>
                                                <p className="text-text-muted text-sm mb-1">Budget</p>
                                                <p className="text-white text-xl font-bold">
                                                    ${(movie.budget / 1000000).toFixed(1)}M
                                                </p>
                                            </div>
                                        )}
                                        {movie.revenue > 0 && (
                                            <div>
                                                <p className="text-text-muted text-sm mb-1">Revenue</p>
                                                <p className="text-white text-xl font-bold">
                                                    ${(movie.revenue / 1000000).toFixed(1)}M
                                                </p>
                                            </div>
                                        )}
                                        {movie.budget > 0 && movie.revenue > 0 && (
                                            <div>
                                                <p className="text-text-muted text-sm mb-1">Profit</p>
                                                <p className={clsx(
                                                    "text-xl font-bold",
                                                    movie.revenue > movie.budget ? "text-green-500" : "text-red-500"
                                                )}>
                                                    ${((movie.revenue - movie.budget) / 1000000).toFixed(1)}M
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Production Companies */}
                            {movie.production_companies && movie.production_companies.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-4">Production Companies</h3>
                                    <div className="flex flex-wrap gap-6">
                                        {movie.production_companies.map((company: any) => (
                                            <div key={company.id} className="flex flex-col items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-4 min-w-[120px] hover:bg-white/10 transition-all">
                                                {company.logo_path ? (
                                                    <div className="w-24 h-16 relative flex items-center justify-center">
                                                        <Image
                                                            src={`https://image.tmdb.org/t/p/w200${company.logo_path}`}
                                                            alt={company.name}
                                                            fill
                                                            sizes="96px"
                                                            className="object-contain brightness-0 invert"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-24 h-16 flex items-center justify-center bg-white/5 rounded">
                                                        <span className="text-xs text-white/50">No Logo</span>
                                                    </div>
                                                )}
                                                <span className="text-white text-sm text-center font-medium">{company.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Filming Locations */}
                            {movie.production_countries && movie.production_countries.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <MapPin size={20} className="text-blue-500" />
                                        Production Countries
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {movie.production_countries.map((country: any) => (
                                            <span key={country.iso_3166_1} className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                                                {country.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Additional Movie Info */}
                            <div className="bg-bg-card border border-white/10 rounded-xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4">Movie Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    {movie.original_title && movie.original_title !== movie.title && (
                                        <div>
                                            <p className="text-text-muted mb-1">Original Title</p>
                                            <p className="text-white font-medium">{movie.original_title}</p>
                                        </div>
                                    )}
                                    {movie.original_language && (
                                        <div>
                                            <p className="text-text-muted mb-1">Original Language</p>
                                            <p className="text-white font-medium uppercase">{movie.original_language}</p>
                                        </div>
                                    )}
                                    {movie.status && (
                                        <div>
                                            <p className="text-text-muted mb-1">Status</p>
                                            <p className="text-white font-medium">{movie.status}</p>
                                        </div>
                                    )}
                                    {movie.homepage && (
                                        <div>
                                            <p className="text-text-muted mb-1">Official Website</p>
                                            <a
                                                href={movie.homepage}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-accent-primary hover:underline font-medium"
                                            >
                                                Visit Site
                                            </a>
                                        </div>
                                    )}
                                    {movie.adult !== undefined && (
                                        <div>
                                            <p className="text-text-muted mb-1">Content Rating</p>
                                            <p className="text-white font-medium">{movie.adult ? '18+' : 'All Ages'}</p>
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cast - Full Width Section */}
                    <div className="mt-12">
                        <h3 className="text-lg font-bold text-white mb-4">Top Cast</h3>
                        <div className="flex gap-4 overflow-x-auto horizontal-scroll pb-4 -mx-4 sm:-mx-6 lg:-mx-20 px-4 sm:px-6 lg:px-20">
                            {cast && cast.length > 0 ? cast.slice(0, 20).map((actor: any) => (
                                <Link
                                    key={actor.id}
                                    href={`/person/${actor.id}`}
                                    className="flex-shrink-0 w-[120px] text-center group"
                                >
                                    <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-white/10 mb-2 relative group-hover:border-accent-primary transition-colors">
                                        {actor.profile_path ? (
                                            <Image
                                                src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                                                alt={actor.name}
                                                fill
                                                sizes="96px"
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-xs">No Image</div>
                                        )}
                                    </div>
                                    <p className="text-white text-sm font-medium truncate group-hover:text-accent-primary transition-colors">{actor.name}</p>
                                    <p className="text-text-muted text-xs truncate">{actor.character}</p>
                                </Link>
                            )) : <p className="text-text-secondary px-4 sm:px-6 lg:px-20">No cast information available.</p>}
                        </div>
                    </div>

                    {/* Keywords */}
                    {keywords.length > 0 && (
                        <div className="mt-12">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Tag size={20} className="text-accent-primary" />
                                Keywords
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {keywords.map((keyword: any) => (
                                    <span
                                        key={keyword.id}
                                        className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-text-secondary hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                                    >
                                        {keyword.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Alternative Titles */}
                    {alternativeTitles.length > 0 && (
                        <div className="mt-12">
                            <h3 className="text-lg font-bold text-white mb-4">Alternative Titles</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {alternativeTitles.slice(0, 10).map((title: any, index: number) => (
                                    <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                                        <span className="text-text-muted text-xs font-mono">{title.iso_3166_1}</span>
                                        <div className="flex-1">
                                            <p className="text-white text-sm font-medium">{title.title}</p>
                                            <p className="text-text-muted text-xs">{title.type}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Collection */}
                    {collection && (
                        <div className="mt-12">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Film size={20} className="text-accent-primary" />
                                Part of {collection.name}
                            </h3>
                            <div className="relative rounded-2xl overflow-hidden border border-white/10 mb-6">
                                {collection.backdrop_path && (
                                    <Image
                                        src={`https://image.tmdb.org/t/p/original${collection.backdrop_path}`}
                                        alt={collection.name}
                                        width={1200}
                                        height={300}
                                        className="w-full h-48 object-cover"
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-6">
                                    <h4 className="text-2xl font-bold text-white mb-2">{collection.name}</h4>
                                    <p className="text-text-secondary text-sm mb-4 line-clamp-2">{collection.overview}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {collection.parts?.map((part: any) => (
                                    <MovieCard key={part.id} movie={part} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Videos Section */}
                    {(trailers.length > 0 || clips.length > 0 || behindScenes.length > 0) && (
                        <div className="mt-12">
                            <h3 className="text-lg font-bold text-white mb-4">Videos</h3>

                            {/* Video Tabs */}
                            <div className="flex gap-4 mb-6 border-b border-white/10">
                                {trailers.length > 0 && (
                                    <button
                                        onClick={() => setActiveTab('trailers')}
                                        className={`px-4 py-2 font-medium transition-all relative ${activeTab === 'trailers' ? 'text-white' : 'text-text-muted hover:text-white'
                                            }`}
                                    >
                                        Trailers ({trailers.length})
                                        {activeTab === 'trailers' && (
                                            <motion.div
                                                layoutId="videoTab"
                                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-primary"
                                            />
                                        )}
                                    </button>
                                )}
                                {clips.length > 0 && (
                                    <button
                                        onClick={() => setActiveTab('clips')}
                                        className={`px-4 py-2 font-medium transition-all relative ${activeTab === 'clips' ? 'text-white' : 'text-text-muted hover:text-white'
                                            }`}
                                    >
                                        Clips ({clips.length})
                                        {activeTab === 'clips' && (
                                            <motion.div
                                                layoutId="videoTab"
                                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-primary"
                                            />
                                        )}
                                    </button>
                                )}
                                {behindScenes.length > 0 && (
                                    <button
                                        onClick={() => setActiveTab('behind')}
                                        className={`px-4 py-2 font-medium transition-all relative ${activeTab === 'behind' ? 'text-white' : 'text-text-muted hover:text-white'
                                            }`}
                                    >
                                        Behind the Scenes ({behindScenes.length})
                                        {activeTab === 'behind' && (
                                            <motion.div
                                                layoutId="videoTab"
                                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-primary"
                                            />
                                        )}
                                    </button>
                                )}
                            </div>

                            {/* Video Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {(activeTab === 'trailers' ? trailers : activeTab === 'clips' ? clips : behindScenes).map((video: any) => (
                                    <button
                                        key={video.id}
                                        onClick={() => {
                                            setSelectedVideo(video);
                                            setShowTrailer(true);
                                        }}
                                        className="group relative aspect-video rounded-xl overflow-hidden border border-white/10 hover:border-accent-primary transition-all"
                                    >
                                        <Image
                                            src={`https://img.youtube.com/vi/${video.key}/mqdefault.jpg`}
                                            alt={video.name}
                                            fill
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            className="object-cover group-hover:scale-105 transition-transform"
                                        />
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Play size={48} className="text-white" fill="white" />
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent">
                                            <p className="text-white text-sm font-medium line-clamp-2">{video.name}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Reviews & More */}
                    <div className="mt-20 space-y-12">
                        {/* AI Recommendations */}
                        <AIRecommendations id={movie.id} type="movie" />

                        {/* Similar Movies Carousel - Improved */}
                        {similar && similar.length > 0 && (
                            <div className="border-t border-white/5 pt-12">
                                <h3 className="text-2xl font-display font-bold text-white mb-6">You Might Also Like</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                                    {similar.map((m: any) => (
                                        <MovieCard key={m.id} movie={m} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Reviews */}
                        <div className="border-t border-white/5 pt-12">
                            <h3 className="text-2xl font-display font-bold text-white mb-6">Reviews</h3>
                            {reviews && reviews.length > 0 ? (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {reviews.map((review: any) => (
                                        <div key={review.id} className="bg-bg-card p-6 rounded-xl border border-white/5">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-bold text-white">{review.author}</h4>
                                                <span className="text-xs text-text-muted">{new Date(review.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-text-secondary line-clamp-6 leading-relaxed">{review.content}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-text-secondary italic">No reviews yet.</p>
                            )}
                        </div>

                        {/* Trivia & Fun Facts */}
                        <div className="border-t border-white/5 pt-12">
                            <h3 className="text-2xl font-display font-bold text-white mb-6 flex items-center gap-2">
                                <Award size={24} className="text-yellow-500" />
                                Did You Know?
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {movie.vote_count > 10000 && (
                                    <div className="bg-bg-card border border-white/10 rounded-xl p-6">
                                        <h4 className="text-white font-bold mb-2">Highly Rated</h4>
                                        <p className="text-text-secondary">
                                            This movie has been rated by over {movie.vote_count.toLocaleString()} viewers on TMDB!
                                        </p>
                                    </div>
                                )}
                                {movie.spoken_languages && movie.spoken_languages.length > 1 && (
                                    <div className="bg-bg-card border border-white/10 rounded-xl p-6">
                                        <h4 className="text-white font-bold mb-2">Multilingual</h4>
                                        <p className="text-text-secondary">
                                            Available in {movie.spoken_languages.length} languages: {movie.spoken_languages.map((l: any) => l.english_name).join(", ")}
                                        </p>
                                    </div>
                                )}
                                {movie.runtime > 180 && (
                                    <div className="bg-bg-card border border-white/10 rounded-xl p-6">
                                        <h4 className="text-white font-bold mb-2">Epic Length</h4>
                                        <p className="text-text-secondary">
                                            At {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m, this is an epic cinematic experience!
                                        </p>
                                    </div>
                                )}
                                {movie.popularity > 100 && (
                                    <div className="bg-bg-card border border-white/10 rounded-xl p-6">
                                        <h4 className="text-white font-bold mb-2">Trending</h4>
                                        <p className="text-text-secondary">
                                            Currently one of the most popular movies with a popularity score of {movie.popularity.toFixed(0)}!
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Trailer Modal */}
            {showTrailer && selectedVideo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setShowTrailer(false)}>
                    <div className="relative w-full max-w-6xl aspect-video" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setShowTrailer(false)}
                            className="absolute -top-12 right-0 text-white hover:text-accent-primary transition-colors"
                        >
                            <X size={32} />
                        </button>
                        <iframe
                            src={`https://www.youtube.com/embed/${selectedVideo.key}?autoplay=1`}
                            className="w-full h-full rounded-xl"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                </div>
            )}
        </>
    );
}
