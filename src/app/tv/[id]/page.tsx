"use client";

import { useEffect, useState, useContext } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Play, Plus, Star, Calendar, Clock, X, Check, Eye, EyeOff, Film, MessageSquare, Tag, User, ChevronLeft, ChevronRight } from "lucide-react";
import { getTVDetails, getWatchProviders } from "@/api/tmdb";
import { MovieCard } from "@/components/MovieCard";
import YouTube from "react-youtube";
import { WatchlistContext } from "@/context/watchlist-context";
import { WatchedContext } from "@/context/WatchedContext";
import { RecentlyViewedContext } from "@/context/RecentlyViewedContext";
import { TVWatchProgressContext } from "@/context/TVWatchProgressContext";
import { motion } from "framer-motion";
import clsx from "clsx";
import Link from "next/link";
import { AIRecommendations } from "@/components/AIRecommendations";

export default function TVDetailsPage() {
    const { id } = useParams();
    const [show, setShow] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showTrailer, setShowTrailer] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedRegion, setSelectedRegion] = useState('IN');
    const [selectedVideo, setSelectedVideo] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'trailers' | 'clips' | 'behind'>('trailers');

    // Scroll to top on mount to ensure navbar hides properly
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    // Watchlist Logic
    const { has, add, remove } = useContext(WatchlistContext) as any;
    const isWatchlisted = show ? has(show.id, 'tv') : false;

    // Watched Logic
    const { hasWatched, addWatched, removeWatched } = useContext(WatchedContext) as any;
    const isWatched = show ? hasWatched(show.id) : false;

    // Recently Viewed
    const { addToRecentlyViewed } = useContext(RecentlyViewedContext) as any;

    // TV Watch Progress
    const tvProgress = useContext(TVWatchProgressContext);
    const totalEpisodes = show?.number_of_episodes || 0;
    const watchProgress = tvProgress?.getShowProgress(Number(id), totalEpisodes);

    useEffect(() => {
        async function loadDetails() {
            if (id) {
                try {
                    const data = await getTVDetails(id as string);
                    const providers = await getWatchProviders(id as string, 'tv');

                    // Get providers for selected region
                    const myProviders = providers?.results?.[selectedRegion] || providers?.results?.['US'];

                    const showData = { ...data, providers: myProviders, allProviders: providers?.results };
                    setShow(showData);

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

    const handleWatchlist = () => {
        if (!show) return;
        if (isWatchlisted) {
            remove(show.id, 'tv');
        } else {
            add({ ...show, type: 'tv' });
        }
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
            removeWatched(show.id);
        } else {
            addWatched({ ...show, type: 'tv' });
        }
    };

    const trailer = show?.videos?.results.find((v: any) => (v.type === "Trailer" || v.type === "Teaser") && v.site === "YouTube");
    const cast = show?.aggregate_credits?.cast || show?.credits?.cast || [];
    const similar = show?.similar?.results.slice(0, 5);

    // Organize videos by type
    const trailers = show?.videos?.results.filter((v: any) => v.type === 'Trailer') || [];
    const clips = show?.videos?.results.filter((v: any) => v.type === 'Clip') || [];
    const behindScenes = show?.videos?.results.filter((v: any) => v.type === 'Behind the Scenes' || v.type === 'Featurette') || [];

    // Get reviews and keywords
    const reviews = show?.reviews?.results || [];
    const keywords = show?.keywords?.results || [];
    const alternativeTitles = show?.alternative_titles?.results || [];

    // Get available regions for streaming
    const availableRegions = show?.allProviders ? Object.keys(show.allProviders) : [];

    return (
        <>
            <main className="min-h-screen bg-bg-main pb-20">
                {/* Cinematic Background */}
                <div className="relative h-[80vh] w-full overflow-hidden">
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
                                            onClick={() => setShowTrailer(true)}
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
                                </div>
                            </div>

                            {/* Streaming Providers */}
                            <div className="mb-0">
                                {show?.providers && (show.providers.flatrate || show.providers.buy) ? (
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
                                            {show.providers.flatrate?.map((provider: any) => (
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
                                            {show.providers.buy?.map((provider: any) => (
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
                            <div className="flex items-center justify-between mb-6">
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

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {show.seasons.filter((s: any) => s.season_number > 0).map((season: any) => {
                                    const seasonProgress = tvProgress?.getSeasonProgress(
                                        Number(id),
                                        season.season_number,
                                        season.episode_count
                                    );
                                    return (
                                        <div
                                            key={season.id}
                                            className="bg-bg-card border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all group"
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
                                            {season.overview && (
                                                <p className="text-text-secondary text-xs mt-3 line-clamp-2">
                                                    {season.overview}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Recommendations */}
                    <div className="mt-20 border-t border-white/5 pt-12">
                        <AIRecommendations id={Number(id)} type="tv" />
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
