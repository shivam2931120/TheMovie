"use client";

import { Plus } from "lucide-react";

export default function ListsPage() {
    return (
        <main className="min-h-screen pt-24 pb-20 bg-bg-main flex flex-col items-center justify-center text-center px-6">
            <div className="max-w-md w-full bg-bg-card p-10 rounded-2xl border border-white/5">
                <div className="w-16 h-16 bg-accent-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 text-accent-primary">
                    <Plus size={32} />
                </div>
                <h1 className="text-2xl font-display font-bold text-white mb-4">Create Your First List</h1>
                <p className="text-text-secondary mb-8">
                    Keep track of movies you want to watch or create collections of your favorites.
                </p>
                <button className="w-full py-3 bg-accent-primary hover:bg-accent-primary/90 text-white font-medium rounded-lg transition-transform hover:scale-[1.02]">
                    Create New List
                </button>
            </div>
        </main>
    );
}
