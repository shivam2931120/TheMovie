"use client";

import { useEffect, useState, useContext } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Play, Plus, Star, Calendar, X, Check, Tv, Tag, List as ListIcon, Info } from "lucide-react";
import { getTVDetails, getWatchProviders } from "@/api/tmdb";
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

export default function TVDetailsPage() {
    const { id } = useParams();
    const [tv, setTv] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showTrailer, setShowTrailer] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedRegion, setSelectedRegion] = useState('US');
    const [selectedVideo, setSelectedVideo] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'trailers' | 'clips' | 'behind'>('trailers');

    const { openSignIn } = useClerk();
    const { lists, addToList, removeFromList, isInList, createList } = useLists() as any;
    const [showListDropdown, setShowListDropdown] = useState(false);
    const [newListName, setNewListName] = useState("");

    const { has, add, remove } = useContext(WatchlistContext) as any;
    const { addToRecentlyViewed } = useContext(RecentlyViewedContext) as any;
    const isWatchlisted = tv ? has(tv.id, 'tv') : false;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        async function loadDetails() {
            if (id) {
                try {
                    const data = await getTVDetails(id as string);
                    if (!data?.id) throw new Error("TV details unavailable.");
                    const providers = await getWatchProviders(id as string, 'tv');
                    
                    const myProviders = providers?.results?.[selectedRegion] || providers?.results?.['US'];
                    const tvData = { ...data, providers: myProviders, allProviders: providers?.results };
                    setTv(tvData);

                    if (addToRecentlyViewed) {
                        addToRecentlyViewed({
                            id: tvData.id,
                            name: tvData.name,
                            poster_path: tvData.poster_path,
                            vote_average: tvData.vote_average,
                            first_air_date: tvData.first_air_date,
                            type: 'tv'
                        });
                    }
                    setLoading(false);
                } catch (error: any) {
                    setError(error?.message || 'Failed to load TV show');
                    setLoading(false);
                }
            }
        }
        loadDetails();
    }, [id, addToRecentlyViewed, selectedRegion]);

    const handleWatchlist = () => {
        if (!tv) return;
        if (isWatchlisted) remove(tv.id, 'tv');
        else add({ ...tv, type: 'tv' });
    };

    const handleListToggle = (listId: string) => {
        if (isInList(listId, tv.id, 'tv')) removeFromList(listId, tv.id, 'tv');
        else addToList(listId, { ...tv, type: 'tv' });
    };

    const handleCreateList = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newListName.trim()) return;
        const list = await createList(newListName.trim());
        if (list?.id && tv) await addToList(list.id, { ...tv, type: 'tv' });
        setNewListName("");
    };

    if (loading) return (
        <div className="min-h-screen bg-bg-main flex items-center justify-center">
            <div className="animate-pulse rounded-full h-16 w-16 bg-accent-primary/20"></div>
        </div>
    );
    if (!tv) return (
        <div className="min-h-screen bg-bg-main flex items-center justify-center">
            <div className="text-center">
                <p className="text-white text-3xl font-display mb-4">TV Show not found</p>
                <Link href="/discover" className="text-accent-primary hover:underline">← Back to Discover</Link>
            </div>
        </div>
    );

    const trailers = tv.videos?.results.filter((v: any) => v.type === "Trailer" && v.site === "YouTube") || [];
    const clips = tv.videos?.results.filter((v: any) => v.type === "Clip" && v.site === "YouTube") || [];
    const behindScenes = tv.videos?.results.filter((v: any) => (v.type === "Behind the Scenes" || v.type === "Featurette") && v.site === "YouTube") || [];
    const trailer = trailers[0] || clips[0];
    const activeVideo = selectedVideo || trailer;
    
    const cast = tv.credits?.cast || [];
    const creators = tv.created_by || [];
    
    const similar = tv.similar?.results?.slice(0, 10) || [];
    const keywords = tv.keywords?.results || [];
    const availableRegions = tv.allProviders ? Object.keys(tv.allProviders).sort() : ['US'];

    return (
        <main className="min-h-screen bg-bg-main relative">
            <div className="fixed inset-0 pointer-events-none z-0">
                {tv.backdrop_path && (
                    <Image
                        src={`https://image.tmdb.org/t/p/w780${tv.backdrop_path}`}
                        alt="ambient"
                        fill
                        className="object-cover opacity-20 blur-[100px] saturate-200"
                    />
                )}
                <div className="absolute inset-0 bg-bg-main/80" />
            </div>

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

            <div className="relative w-full h-[75vh] min-h-[600px] z-10 flex items-end pb-12">
                <div className="absolute inset-0">
                    {tv.backdrop_path ? (
                        <Image src={`https://image.tmdb.org/t/p/original${tv.backdrop_path}`} alt={tv.name} fill priority className="object-cover object-top mask-image-b" />
                    ) : (
                        <div className="absolute inset-0 bg-bg-surface" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-main via-bg-main/50 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-bg-main via-bg-main/30 to-transparent" />
                </div>

                <div className="container relative z-20 mx-auto px-6 lg:px-20">
                    <div className="max-w-4xl">
                        {tv.tagline && (
                            <p className="text-accent-primary font-bold tracking-widest uppercase text-sm mb-4 drop-shadow-md">
                                {tv.tagline}
                            </p>
                        )}
                        <h1 className="text-5xl sm:text-7xl lg:text-[6rem] font-display font-bold text-white leading-[0.9] tracking-tight mb-6 drop-shadow-2xl">
                            {tv.name}
                        </h1>

                        <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-text-secondary mb-8 drop-shadow">
                            {tv.vote_average > 0 && (
                                <span className="flex items-center gap-1.5 text-white bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                                    <Star size={16} className="text-accent-primary fill-accent-primary" />
                                    {tv.vote_average.toFixed(1)} <span className="text-text-muted text-xs font-normal">({tv.vote_count})</span>
                                </span>
                            )}
                            {tv.first_air_date && (
                                <span className="flex items-center gap-1.5">
                                    <Calendar size={16} /> {tv.first_air_date.split("-")[0]} {tv.status === "Ended" ? `- ${tv.last_air_date?.split("-")[0]}` : "- Present"}
                                </span>
                            )}
                            {tv.number_of_seasons > 0 && (
                                <span className="flex items-center gap-1.5">
                                    <Tv size={16} /> {tv.number_of_seasons} Season{tv.number_of_seasons !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            {trailer && (
                                <button
                                    onClick={() => { setSelectedVideo(trailer); setShowTrailer(true); }}
                                    className="flex items-center gap-3 px-8 py-4 bg-white text-bg-main font-bold rounded-full transition-transform hover:scale-105"
                                >
                                    <Play fill="currentColor" size={20} /> Watch Trailer
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
                            </SignedIn>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container relative z-20 mx-auto px-6 lg:px-20 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    <div className="lg:col-span-8 space-y-16">
                        <div>
                            <h2 className="text-2xl font-display font-bold text-white mb-6">Overview</h2>
                            <p className="text-text-secondary text-lg leading-relaxed font-sans max-w-4xl">
                                {tv.overview}
                            </p>
                            
                            <div className="flex flex-wrap gap-8 mt-8 border-t border-white/5 pt-8">
                                {creators.length > 0 && (
                                    <div>
                                        <p className="text-text-muted text-sm font-medium mb-1">Creators</p>
                                        <p className="text-white font-medium">{creators.map((c: any) => c.name).join(', ')}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {tv.seasons && tv.seasons.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-display font-bold text-white mb-6">Seasons</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {tv.seasons.filter((s: any) => s.season_number > 0).map((season: any) => (
                                        <div key={season.id} className="flex gap-4 p-4 bg-bg-surface border border-white/5 rounded-2xl">
                                            {season.poster_path ? (
                                                <Image src={`https://image.tmdb.org/t/p/w200${season.poster_path}`} alt={season.name} width={80} height={120} className="rounded-lg object-cover" />
                                            ) : (
                                                <div className="w-[80px] h-[120px] bg-bg-elevated rounded-lg" />
                                            )}
                                            <div>
                                                <h4 className="text-white font-bold">{season.name}</h4>
                                                <p className="text-text-muted text-sm mt-1">{season.episode_count} Episodes</p>
                                                <p className="text-text-secondary text-xs mt-1">{season.air_date ? new Date(season.air_date).getFullYear() : 'Upcoming'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

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
                    </div>

                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-bg-surface/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-elevated">
                            <WatchProviders providers={tv.providers} availableRegions={availableRegions} selectedRegion={selectedRegion} onRegionChange={setSelectedRegion} />
                        </div>

                        <div className="bg-bg-surface/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-elevated">
                            <UserRatingPanel item={{ ...tv, type: 'tv' }} type="tv" />
                        </div>

                        <div className="bg-bg-surface/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-elevated space-y-6">
                            <h3 className="font-display font-bold text-white text-lg">Details</h3>
                            <div className="space-y-4">
                                {tv.status && (
                                    <div>
                                        <p className="text-text-muted text-xs font-medium uppercase tracking-wider mb-1">Status</p>
                                        <p className="text-white font-medium">{tv.status}</p>
                                    </div>
                                )}
                                {tv.networks && tv.networks.length > 0 && (
                                    <div>
                                        <p className="text-text-muted text-xs font-medium uppercase tracking-wider mb-1">Networks</p>
                                        <p className="text-white font-medium">{tv.networks.map((n:any)=>n.name).join(", ")}</p>
                                    </div>
                                )}
                                {tv.genres && (
                                    <div>
                                        <p className="text-text-muted text-xs font-medium uppercase tracking-wider mb-2">Genres</p>
                                        <div className="flex flex-wrap gap-2">
                                            {tv.genres.map((g: any) => (
                                                <span key={g.id} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white">
                                                    {g.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-24 space-y-24">
                    <AIRecommendations id={tv.id} type="tv" />

                    {similar && similar.length > 0 && (
                        <div>
                            <div className="flex items-center gap-4 mb-8">
                                <h3 className="text-3xl font-display font-bold text-white">More Like This</h3>
                                <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                                {similar.map((m: any) => (
                                    <MovieCard key={m.id} movie={{...m, type: 'tv'}} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
