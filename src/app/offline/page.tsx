"use client";

import { WifiOff, RefreshCw } from "lucide-react";

export default function OfflinePage() {
    return (
        <main className="min-h-screen bg-bg-main flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <div className="mx-auto w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                    <WifiOff size={40} className="text-text-muted" />
                </div>
                <h1 className="text-3xl font-display font-bold text-white mb-3">
                    You&apos;re Offline
                </h1>
                <p className="text-text-muted mb-8 leading-relaxed">
                    It looks like you&apos;ve lost your internet connection. Previously viewed movies and shows are still available from cache.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-accent-primary hover:bg-accent-primary/90 text-white font-bold rounded-lg transition-all"
                >
                    <RefreshCw size={18} />
                    Try Again
                </button>
            </div>
        </main>
    );
}
