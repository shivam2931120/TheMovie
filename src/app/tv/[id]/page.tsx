"use client";

import { useEffect, useState, useContext } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Play, Plus, Star, Calendar, Clock, X, Check, Eye, EyeOff, Tag, User, List as ListIcon } from "lucide-react";
import { getTVDetails, getTVSeasonDetails, getWatchProviders } from "@/api/tmdb";
import { MovieCard } from "@/components/MovieCard";
import { ReminderButton } from "@/components/ReminderButton";
import { UserRatingPanel } from "@/components/UserRatingPanel";
import { WatchProviders } from "@/components/WatchProviders";
import YouTube from "react-youtube";
import { WatchlistContext } from "@/context/watchlist-context";
import { WatchedContext } from "@/context/WatchedContext";
import { RecentlyViewedContext } from "@/context/RecentlyViewedContext";
import { TVWatchProgressContext } from "@/context/TVWatchProgressContext";
import { motion } from "framer-motion";
import clsx from "clsx";
import Link from "next/link";
import { AIRecommendations } from "@/components/AIRecommendations";
import { useLists } from "@/context/ListsContext";

export default function TVDetailsPage() {
    const { id } = useParams();
    const [show, setShow] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showTrailer, setShowTrailer] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedRegion, setSelectedRegion] = useState('IN');
    const [selectedVideo, setSelectedVideo] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'trailers' | 'clips' | 'behind'>('trailers');
    const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number | null>(null);
    const [seasonDetails, setSeasonDetails] = useState<any>(null);
    const [seasonLoading, setSeasonLoading] = useState(false);
    const [showListDropdown, setShowListDropdown] = useState(false);
    const [newListName, setNewListName] = useState("");

    // Scroll to top on mount to ensure navbar hides properly
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    // Watchlist Logic
    const { has, add, remove } = useContext(WatchlistContext) as any;
    const isWatchlisted = show ? has(show.id, 'tv') : false;

    // Watched Logic
    const { hasWatched, addWatched, removeWatched } = useContext(WatchedContext) as any;
    const isWatched = show ? hasWatched(show.id, 'tv') : false;

    // Recently Viewed
    const { addToRecentlyViewed } = useContext(RecentlyViewedContext) as any;

    // TV Watch Progress
    const tvProgress = useContext(TVWatchProgressContext);
    const totalEpisodes = show?.number_of_episodes || 0;
    const watchProgress = tvProgress?.getShowProgress(Number(id), totalEpisodes);

    const { lists, addToList, removeFromList, isInList, createList } = useLists() as any;

    useEffect(() => {
        async function loadDetails() {
            if (id) {
                try {
                    const data = await getTVDetails(id as string);
                    if (!data?.id) {
                        throw new Error("TV show details are unavailable. Check the TMDB API key and try again.");
                    }
                    const providers = await getWatchProviders(id as string, 'tv');

                    // Get providers for selected region
                    const myProviders = providers?.results?.[selectedRegion] || providers?.results?.['US'];

                    const showData = { ...data, providers: myProviders, allProviders: providers?.results };
                    setShow(showData);
                    const firstSeason = data?.seasons?.find((season: any) => season.season_number > 0);
                    setSelectedSeasonNumber((current) => current ?? firstSeason?.season_number ?? null);

                    // Add to recently viewed
                    if (addToRecentlyViewed) {
                        addToRecentlyViewed({
                            id: showData.id,
                            name: showData.name,
                            poster_path: showData.poster_path,
                            vote_average: showData.vote_average,
                            first_air_date: showData.first_air_date,
                            type: 'tv'
                        });
                    }

                    setLoading(false);
                } catch (error: any) {
                    console.error('Error loading TV show details:', error);
                    setError(error?.message || 'Failed to load TV show');
                    setLoading(false);
                    setShow(null);
                }
            }
        }
        loadDetails();
    }, [id, selectedRegion, addToRecentlyViewed]);

    useEffect(() => {
        if (!id || selectedSeasonNumber === null) return;
        let isMounted = true;

        async function loadSeasonDetails() {
            setSeasonLoading(true);
            const data = await getTVSeasonDetails(id as string, selectedSeasonNumber);
            if (isMounted) {
                setSeasonDetails(data?.id ? data : null);
                setSeasonLoading(false);
            }
        }

        loadSeasonDetails();
        return () => { isMounted = false; };
    }, [id, selectedSeasonNumber]);

    const handleWatchlist = () => {
        if (!show) return;
        if (isWatchlisted) {
            remove(show.id, 'tv');
        } else {
            add({ ...show, type: 'tv' });
        }
    };

    const handleListToggle = (listId: string) => {
        if (!show) return;
        if (isInList(listId, show.id, 'tv')) {
            removeFromList(listId, show.id, 'tv');
        } else {
            addToList(listId, { ...show, type: 'tv' });
        }
    };

    const handleCreateList = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!newListName.trim()) return;
        const list = await createList(newListName.trim());
        if (list?.id && show) {
            await addToList(list.id, { ...show, type: 'tv' });
        }
        setNewListName("");
    };

    if (loading) return (
        <div className="min-h-screen bg-bg-main flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent-primary mx-auto mb-4"></div>
                <p className="text-white text-lg">Loading TV show details...</p>
            </div>
        </div>
    );

    if (!show) return (
        <div className="min-h-screen bg-bg-main flex items-center justify-center">
            <div className="text-center px-4">
                <p className="text-white text-2xl mb-2">TV Show not found</p>
                <p className="text-text-muted mb-4">{error || 'This show might have been removed or doesn\'t exist.'}</p>
                <Link href="/tv" className="text-accent-primary hover:underline">
                    ← Back to TV Shows
                </Link>
            </div>
        </div>
    );

    const handleWatched = () => {
        if (!show) return;
        if (isWatched) {
            removeWatched(show.id, 'tv');
        } else {
            addWatched({ ...show, type: 'tv' });
        }
    };

    const trailer = show?.videos?.results.find((v: any) => (v.type === "Trailer" || v.type === "Teaser") && v.site === "YouTube");
    const activeVideo = selectedVideo || trailer;
    const cast = show?.aggregate_credits?.cast || show?.credits?.cast || [];

    // Organize videos by type
    const trailers = show?.videos?.results.filter((v: any) => v.type === 'Trailer' && v.site === 'YouTube') || [];
    const clips = show?.videos?.results.filter((v: any) => v.type === 'Clip' && v.site === 'YouTube') || [];
    const behindScenes = show?.videos?.results.filter((v: any) => (v.type === 'Behind the Scenes' || v.type === 'Featurette') && v.site === 'YouTube') || [];

    // Get keywords and supporting metadata
    const keywords = show?.keywords?.results || [];
    const alternativeTitles = show?.alternative_titles?.results || [];
    const nextEpisode = show?.next_episode_to_air;
    const lastEpisode = show?.last_episode_to_air;

    // Get available regions for streaming
    const availableRegions = show?.allProviders ? Object.keys(show.allProviders).sort() : ['IN', 'US', 'GB', 'CA', 'AU'];

    return (
        <>
            <main className="min-h-screen bg-bg-main pb-20">
                {/* Cinematic Background */}
                <div className="relative h-[80vh] w-full overflow-hidden">
                    {showTrailer && activeVideo ? (
                        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
                            <div className="absolute inset-0 bg-black/90" onClick={() => { setShowTrailer(false); setSelectedVideo(null); }} />
                            <button
                                onClick={() => { setShowTrailer(false); setSelectedVideo(null); }}
                                className="absolute top-8 right-8 text-white hover:text-red-500 z-50 p-2 bg-black/50 rounded-full"
                            >
                                <X size={32} />
                            </button>
                            <div className="relative w-full max-w-6xl aspect-video z-50 p-4">
                                <YouTube
                                    videoId={activeVideo.key}
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
                            {show?.backdrop_path && (
                                <Image
                                    src={`https://image.tmdb.org/t/p/original${show.backdrop_path}`}
                                    alt={show?.name || 'Show'}
                                    fill
                                    sizes="100vw"
                                    className="object-cover"
                                    priority
                                />
                            )}
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
                                {show?.poster_path && (
                                    <Image
                                        src={`https://image.tmdb.org/t/p/w780${show.poster_path}`}
                                        alt={show?.name || 'Show'}
                                        fill
                                        sizes="(max-width: 640px) 280px, 300px"
                                        className="object-cover"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-6 lg:space-y-8 pt-4 lg:pt-10">
                            <div>
                                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-display font-bold text-white mb-3 lg:mb-4 leading-tight">
                                    {show?.name}
                                </h1>
                                <p className="text-lg sm:text-xl text-text-secondary italic font-light mb-4 lg:mb-6">"{show?.tagline || 'TV Series'}"</p>

                                <div className="flex flex-wrap items-center gap-6 text-sm text-text-muted mb-6">
                                    {show?.vote_average && (
                                        <span className="flex items-center gap-2 text-accent-primary font-bold" title="TMDB Rating">
                                            <Star size={16} fill="currentColor" />
                                            {show.vote_average.toFixed(1)}
                                            <span className="text-text-muted text-xs font-normal">TMDB</span>
                                        </span>
                                    )}

                                    {show?.first_air_date && (
                                        <span className="flex items-center gap-2">
                                            <Calendar size={16} />
                                            {show.first_air_date.split("-")[0]}
                                        </span>
                                    )}
                                    {show?.number_of_seasons && (
                                        <span className="flex items-center gap-2">
                                            <Clock size={16} />
                                            {show.number_of_seasons} Seasons
                                        </span>
                                    )}
                                    {show?.genres && show.genres.length > 0 && (
                                        <div className="flex gap-2">
                                            {show.genres.map((g: any) => (
                                                <span key={g.id} className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-white">
                                                    {g.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-4 flex-wrap">
                                    {trailer && (
                                        <button
                                            onClick={() => { setSelectedVideo(trailer); setShowTrailer(true); }}
                                            className="flex items-center gap-2 px-8 py-4 bg-accent-primary hover:bg-accent-primary/90 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(229,9,20,0.4)]"
                                        >
                                            <Play fill="currentColor" size={20} />
                                            Watch Trailer
                                        </button>
                                    )}
                                    <button
                                        onClick={handleWatchlist}
                                        className={clsx(
                                            "flex items-center gap-2 px-6 py-4 border backdrop-blur-md text-white font-medium rounded-xl transition-all",
                                            isWatchlisted ? "bg-accent-secondary border-accent-secondary" : "bg-white/10 hover:bg-white/20 border-white/10"
                                        )}
                                    >
                                        {isWatchlisted ? <Check size={20} /> : <Plus size={20} />}
                                        {isWatchlisted ? "Added" : "Watchlist"}
                                    </button>
                                    <button
                                        onClick={handleWatched}
                                        className={clsx(
                                            "flex items-center gap-2 px-6 py-4 border backdrop-blur-md text-white font-medium rounded-xl transition-all",
                                            isWatched ? "bg-green-600 border-green-600" : "bg-white/10 hover:bg-white/20 border-white/10"
                                        )}
                                    >
                                        {isWatched ? <Eye size={20} /> : <EyeOff size={20} />}
                                        {isWatched ? "Watched" : "Mark Watched"}
                                    </button>
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowListDropdown(!showListDropdown)}
                                            className="flex items-center gap-2 px-6 py-4 border border-white/10 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-medium rounded-xl transition-all"
                                        >
                                            <ListIcon size={20} />
                                            Add to List
                                        </button>

                                        {showListDropdown && (
                                            <div className="absolute top-full left-0 mt-2 w-64 bg-bg-card border border-white/10 rounded-xl shadow-2xl p-4 z-50 backdrop-blur-xl">
                                                <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                                                    <h4 className="text-white font-bold text-sm">Save to List</h4>
                                                    <button onClick={() => setShowListDropdown(false)} className="text-text-muted hover:text-white">
                                                        <X size={16} />
                                                    </button>
                                                </div>

                                                <div className="space-y-2 mb-4 max-h-[200px] overflow-y-auto">
                                                    {lists.map((list: any) => {
                                                        const inList = isInList(list.id, show.id, 'tv');
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
                                                        onChange={(event) => setNewListName(event.target.value)}
                                                    />
                                                    <button type="submit" disabled={!newListName.trim()} className="bg-accent-primary px-3 rounded-lg text-white text-xs font-bold hover:bg-accent-primary/80 disabled:opacity-50">
                                                        +
                                                    </button>
                                                </form>
                                            </div>
                                        )}
                                    </div>
                                    {(nextEpisode?.air_date || show.first_air_date) && (
                                        <ReminderButton
                                            item={{ ...show, type: 'tv' }}
                                            date={nextEpisode?.air_date || show.first_air_date}
                                            note={nextEpisode ? `Next episode: ${nextEpisode.name}` : "TV release"}
                                            className="px-6 py-4 rounded-xl"
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Streaming Providers */}
                            <WatchProviders
                                providers={show.providers}
                                availableRegions={availableRegions}
                                selectedRegion={selectedRegion}
                                onRegionChange={setSelectedRegion}
                            />

                            <UserRatingPanel item={{ ...show, type: 'tv' }} type="tv" />

                            {(nextEpisode || lastEpisode) && (
                                <section className="bg-bg-card border border-white/10 rounded-xl p-5 sm:p-6">
                                    <h3 className="text-lg font-bold text-white mb-4">Episode Status</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {nextEpisode && (
                                            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                                                <p className="text-xs font-semibold uppercase text-accent-primary mb-1">Next Episode</p>
                                                <p className="text-white font-bold">{nextEpisode.name || `Episode ${nextEpisode.episode_number}`}</p>
                                                <p className="text-sm text-text-secondary">
                                                    Season {nextEpisode.season_number}, Episode {nextEpisode.episode_number}
                                                    {nextEpisode.air_date ? ` - ${new Date(`${nextEpisode.air_date}T00:00:00`).toLocaleDateString()}` : ""}
                                                </p>
                                            </div>
                                        )}
                                        {lastEpisode && (
                                            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                                                <p className="text-xs font-semibold uppercase text-text-muted mb-1">Last Aired</p>
                                                <p className="text-white font-bold">{lastEpisode.name || `Episode ${lastEpisode.episode_number}`}</p>
                                                <p className="text-sm text-text-secondary">
                                                    Season {lastEpisode.season_number}, Episode {lastEpisode.episode_number}
                                                    {lastEpisode.air_date ? ` - ${new Date(`${lastEpisode.air_date}T00:00:00`).toLocaleDateString()}` : ""}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}

                            {/* Overview */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">Synopsis</h3>
                                <p className="text-text-secondary leading-relaxed text-lg max-w-3xl">
                                    {show?.overview || 'No synopsis available.'}
                                </p>
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
                                            <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                                                <User size={32} className="text-text-muted" />
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-white text-sm font-medium truncate group-hover:text-accent-primary transition-colors">{actor.name}</p>
                                    <p className="text-text-muted text-xs truncate">{actor.roles?.[0]?.character || actor.character}</p>
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
                                            <p className="text-text-muted text-xs">{title.type || 'Alternative'}</p>
                                        </div>
                                    </div>
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

                    {/* Watch Progress & Seasons */}
                    {show && show.seasons && (
                        <div className="mt-12 border-t border-white/5 pt-12">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
                                <h3 className="text-xl font-display font-bold text-white">Seasons & Episodes</h3>
                                {watchProgress && watchProgress.total > 0 && (
                                    <div className="text-sm text-text-secondary">
                                        {watchProgress.watched} / {watchProgress.total} episodes watched
                                        <span className="ml-2 text-accent-primary font-bold">
                                            ({watchProgress.percentage.toFixed(0)}%)
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 overflow-x-auto horizontal-scroll pb-3 mb-6">
                                {show.seasons.filter((s: any) => s.season_number > 0).map((season: any) => {
                                    const seasonProgress = tvProgress?.getSeasonProgress(
                                        Number(id),
                                        season.season_number,
                                        season.episode_count
                                    );
                                    return (
                                        <button
                                            key={season.id}
                                            onClick={() => setSelectedSeasonNumber(season.season_number)}
                                            className={clsx(
                                                "w-[220px] shrink-0 rounded-xl border p-4 text-left transition-all",
                                                selectedSeasonNumber === season.season_number
                                                    ? "border-accent-primary bg-accent-primary/10"
                                                    : "border-white/10 bg-bg-card hover:border-white/20"
                                            )}
                                        >
                                            <div className="flex gap-3">
                                                {season.poster_path && (
                                                    <div className="w-20 h-28 relative shrink-0 rounded-lg overflow-hidden">
                                                        <Image
                                                            src={`https://image.tmdb.org/t/p/w200${season.poster_path}`}
                                                            alt={season.name}
                                                            fill
                                                            sizes="80px"
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-white font-bold text-sm mb-1 truncate">
                                                        {season.name}
                                                    </h4>
                                                    <p className="text-text-muted text-xs mb-2">
                                                        {season.episode_count} episodes
                                                    </p>
                                                    {seasonProgress && (
                                                        <div className="space-y-2">
                                                            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                                                                <div
                                                                    className="h-full bg-accent-primary rounded-full transition-all"
                                                                    style={{ width: `${seasonProgress.percentage}%` }}
                                                                />
                                                            </div>
                                                            <p className="text-xs text-text-muted">
                                                                {seasonProgress.watched}/{seasonProgress.total} watched
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="rounded-xl border border-white/10 bg-bg-card p-5 sm:p-6">
                                {seasonLoading ? (
                                    <div className="space-y-3">
                                        {Array.from({ length: 5 }, (_, index) => (
                                            <div key={index} className="h-20 rounded-lg bg-white/5 animate-pulse" />
                                        ))}
                                    </div>
                                ) : seasonDetails?.episodes?.length ? (
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-lg font-bold text-white">{seasonDetails.name}</h4>
                                            <p className="text-sm text-text-secondary">
                                                {seasonDetails.air_date ? `${new Date(`${seasonDetails.air_date}T00:00:00`).getFullYear()} - ` : ""}
                                                {seasonDetails.episodes.length} episodes
                                            </p>
                                        </div>

                                        <div className="divide-y divide-white/10">
                                            {seasonDetails.episodes.map((episode: any) => {
                                                const watched = tvProgress?.isEpisodeWatched(Number(id), seasonDetails.season_number, episode.episode_number);
                                                return (
                                                    <div key={episode.id} className="flex flex-col gap-4 py-4 lg:flex-row lg:items-start">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                                <span className="rounded-md bg-white/5 px-2 py-1 text-xs font-bold text-text-muted">
                                                                    E{episode.episode_number}
                                                                </span>
                                                                <h5 className="text-white font-bold">{episode.name || `Episode ${episode.episode_number}`}</h5>
                                                                {episode.vote_average > 0 && (
                                                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-accent-primary">
                                                                        <Star size={13} fill="currentColor" />
                                                                        {episode.vote_average.toFixed(1)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-text-muted mb-2">
                                                                {episode.air_date ? new Date(`${episode.air_date}T00:00:00`).toLocaleDateString() : "Air date unavailable"}
                                                                {episode.runtime ? ` - ${episode.runtime}m` : ""}
                                                            </p>
                                                            {episode.overview && (
                                                                <p className="text-sm text-text-secondary line-clamp-3">{episode.overview}</p>
                                                            )}
                                                        </div>
                                                        <div className="flex shrink-0 flex-wrap gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    if (!tvProgress) return;
                                                                    if (watched) {
                                                                        tvProgress.unmarkEpisodeWatched(Number(id), seasonDetails.season_number, episode.episode_number);
                                                                    } else {
                                                                        tvProgress.markEpisodeWatched(Number(id), seasonDetails.season_number, episode.episode_number);
                                                                    }
                                                                }}
                                                                className={clsx(
                                                                    "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all",
                                                                    watched
                                                                        ? "border-green-500 bg-green-600 text-white"
                                                                        : "border-white/10 bg-white/5 text-text-secondary hover:text-white"
                                                                )}
                                                            >
                                                                {watched ? <Check size={15} /> : <EyeOff size={15} />}
                                                                {watched ? "Watched" : "Mark Watched"}
                                                            </button>
                                                            {episode.air_date && (
                                                                <ReminderButton
                                                                    item={{ ...show, title: `${show.name}: ${episode.name}`, type: 'tv' }}
                                                                    date={episode.air_date}
                                                                    note={`Season ${seasonDetails.season_number}, Episode ${episode.episode_number}`}
                                                                    className="px-3 py-2 text-xs"
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-sm text-text-secondary">
                                        Episode details are unavailable for this season.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Recommendations */}
                    <div className="mt-20 border-t border-white/5 pt-12">
                        <AIRecommendations id={Number(id)} type="tv" />
                    </div>
                </div>
            </main>

        </>
    );
}
