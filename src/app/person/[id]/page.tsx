"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, Film, Tv, Instagram, Twitter, Facebook } from "lucide-react";
import { getPersonDetails, getPersonExternalIds, getPersonCombinedCredits } from "@/api/tmdb";
import { MovieCard } from "@/components/MovieCard";
import { motion } from "framer-motion";

export default function PersonPage() {
    const { id } = useParams();
    const [person, setPerson] = useState<any>(null);
    const [externalIds, setExternalIds] = useState<any>(null);
    const [credits, setCredits] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'movies' | 'tv'>('movies');

    useEffect(() => {
        async function loadPerson() {
            if (!id) return;
            
            setLoading(true);
            const [personData, idsData, creditsData] = await Promise.all([
                getPersonDetails(id as string),
                getPersonExternalIds(id as string),
                getPersonCombinedCredits(id as string)
            ]);

            setPerson(personData);
            setExternalIds(idsData);
            setCredits(creditsData);
            setLoading(false);
        }

        loadPerson();
    }, [id]);

    if (loading || !person) {
        return (
            <div className="min-h-screen pt-32 pb-20 bg-bg-main flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    const movies = credits?.cast?.filter((c: any) => c.media_type === 'movie').sort((a: any, b: any) => {
        return (b.popularity || 0) - (a.popularity || 0);
    }).slice(0, 20) || [];

    const tvShows = credits?.cast?.filter((c: any) => c.media_type === 'tv').sort((a: any, b: any) => {
        return (b.popularity || 0) - (a.popularity || 0);
    }).slice(0, 20) || [];

    return (
        <main className="min-h-screen pt-20 pb-20 bg-bg-main">
            {/* Hero Section */}
            <div className="relative h-[50vh] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bg-main" />
                {person.profile_path && (
                    <Image
                        src={`https://image.tmdb.org/t/p/original${person.profile_path}`}
                        alt={person.name}
                        fill
                        sizes="100vw"
                        className="object-cover object-top blur-sm opacity-30"
                    />
                )}
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-20 -mt-32 relative z-10">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Profile Image */}
                    <div className="w-full max-w-[300px] shrink-0 mx-auto md:mx-0">
                        <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                            {person.profile_path ? (
                                <Image
                                    src={`https://image.tmdb.org/t/p/w500${person.profile_path}`}
                                    alt={person.name}
                                    width={300}
                                    height={450}
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                                    <span className="text-text-muted">No Image</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-6">
                        <div>
                            <h1 className="text-4xl lg:text-6xl font-display font-bold text-white mb-4">
                                {person.name}
                            </h1>

                            {/* Social Links */}
                            {externalIds && (
                                <div className="flex gap-3 mb-6">
                                    {externalIds.instagram_id && (
                                        <a
                                            href={`https://instagram.com/${externalIds.instagram_id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all"
                                        >
                                            <Instagram size={20} className="text-white" />
                                        </a>
                                    )}
                                    {externalIds.twitter_id && (
                                        <a
                                            href={`https://twitter.com/${externalIds.twitter_id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all"
                                        >
                                            <Twitter size={20} className="text-white" />
                                        </a>
                                    )}
                                    {externalIds.facebook_id && (
                                        <a
                                            href={`https://facebook.com/${externalIds.facebook_id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all"
                                        >
                                            <Facebook size={20} className="text-white" />
                                        </a>
                                    )}

                                </div>
                            )}

                            {/* Details */}
                            <div className="space-y-3 text-text-secondary mb-6">
                                {person.known_for_department && (
                                    <p className="flex items-center gap-2">
                                        <span className="text-text-muted">Known For:</span>
                                        <span className="text-white font-medium">{person.known_for_department}</span>
                                    </p>
                                )}
                                {person.birthday && (
                                    <p className="flex items-center gap-2">
                                        <Calendar size={16} className="text-text-muted" />
                                        <span className="text-white">
                                            {new Date(person.birthday).toLocaleDateString('en-US', { 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric' 
                                            })}
                                            {person.deathday && ` - ${new Date(person.deathday).toLocaleDateString('en-US', { 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric' 
                                            })}`}
                                            {!person.deathday && ` (${new Date().getFullYear() - new Date(person.birthday).getFullYear()} years old)`}
                                        </span>
                                    </p>
                                )}
                                {person.place_of_birth && (
                                    <p className="flex items-center gap-2">
                                        <MapPin size={16} className="text-text-muted" />
                                        <span className="text-white">{person.place_of_birth}</span>
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Biography */}
                        {person.biography && (
                            <div>
                                <h2 className="text-2xl font-display font-bold text-white mb-3">Biography</h2>
                                <p className="text-text-secondary leading-relaxed whitespace-pre-line">
                                    {person.biography}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Filmography */}
                <div className="mt-16">
                    <h2 className="text-2xl font-display font-bold text-white mb-6">Known For</h2>
                    
                    {/* Tabs */}
                    <div className="flex gap-4 mb-6 border-b border-white/10">
                        <button
                            onClick={() => setActiveTab('movies')}
                            className={`px-4 py-2 font-medium transition-all relative ${
                                activeTab === 'movies' ? 'text-white' : 'text-text-muted hover:text-white'
                            }`}
                        >
                            <Film size={18} className="inline mr-2" />
                            Movies ({movies.length})
                            {activeTab === 'movies' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-primary"
                                />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('tv')}
                            className={`px-4 py-2 font-medium transition-all relative ${
                                activeTab === 'tv' ? 'text-white' : 'text-text-muted hover:text-white'
                            }`}
                        >
                            <Tv size={18} className="inline mr-2" />
                            TV Shows ({tvShows.length})
                            {activeTab === 'tv' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-primary"
                                />
                            )}
                        </button>
                    </div>

                    {/* Content */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {activeTab === 'movies' ? (
                            movies.map((movie: any) => (
                                <MovieCard key={movie.id} movie={movie} />
                            ))
                        ) : (
                            tvShows.map((show: any) => (
                                <MovieCard key={show.id} movie={show} />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
