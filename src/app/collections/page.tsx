"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus, Film, List } from "lucide-react";

const FRANCHISES = [
    { id: 86311, title: "Marvel Cinematic Universe", image: "/marvel_collection.jpg", backdrop: "/mcu_backdrop.jpg" }, // Need to use IDs that work or generic images if we don't have them
    // Actually, let's use real TMDb Collection IDs and fetch their images? 
    // Or simpler: Hardcode some known backdrops from major movies in these collections for visual impact.
    // Specifying IDs for reference: Avengers Collection (86311), Star Wars (10), Harry Potter (1241), James Bond (645)
    // I will use a high quality poster path for them.
    { id: 86311, name: "The Avengers Collection", poster: "/yF1eOkaYvwiORauRCPWznV9xVvi.jpg" },
    { id: 10, name: "Star Wars Collection", poster: "/r8Ph5MYXL04Qzu4LfdIiogozKOQ.jpg" },
    { id: 1241, name: "Harry Potter Collection", poster: "/evtCkkF3t4aw3u3e4k8s6aX3z5.jpg" },
    { id: 263, name: "The Dark Knight Collection", poster: "/oLoL92C5Y2bO9x5d47p5q2vW76.jpg" },
    { id: 9485, name: "The Fast and the Furious", poster: "/uv63yAGg1zETAs1XqsOQpava87l.jpg" },
    { id: 87359, name: "Mission: Impossible", poster: "/pRp129c5Xj6gN0I8fEbdE1bXG50.jpg" },
    { id: 295, name: "Pirates of the Caribbean", poster: "/z8onk7LV9MKAoCLkCHOktlq4d6K.jpg" },
    { id: 2344, name: "The Matrix Collection", poster: "/bV9qTVHTVf0gkW0j7p7M0ILD4pG.jpg" },
];

export default function CollectionsPage() {
    return (
        <main className="min-h-screen pt-32 sm:pt-36 pb-20 bg-bg-main">
            <div className="container mx-auto px-6 lg:px-20 mb-10">
                <h1 className="text-4xl font-display font-bold text-white mb-2">Collections</h1>
                <p className="text-text-secondary">Popular franchises and your custom lists.</p>
            </div>

            <div className="container mx-auto px-6 lg:px-20">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Film className="text-accent-primary" size={24} /> Popular Franchises
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-16">
                    {FRANCHISES.map((collection) => (
                        <div key={collection.id} className="relative aspect-video group cursor-pointer overflow-hidden rounded-xl border border-white/5">
                            <Image
                                src={`https://image.tmdb.org/t/p/w780${collection.poster}`}
                                alt={collection.name || 'Collection'}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />

                            <div className="absolute bottom-4 left-4 right-4">
                                <h3 className="text-white font-bold text-lg drop-shadow-md">{collection.name}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <List className="text-accent-primary" size={24} /> Your Lists
                    </h2>
                    <button className="flex items-center gap-2 px-4 py-2 bg-accent-primary rounded-lg text-sm font-bold text-white hover:bg-accent-primary/90 transition-colors">
                        <Plus size={16} /> Create List
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="border border-white/10 bg-bg-card rounded-xl p-6 flex flex-col items-center justify-center text-center h-48 border-dashed hover:border-accent-primary/50 hover:bg-white/5 transition-all cursor-pointer group">
                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-text-muted group-hover:text-accent-primary group-hover:bg-accent-primary/20 transition-all mb-4">
                            <Plus size={24} />
                        </div>
                        <p className="text-text-secondary font-medium">Create New List</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
