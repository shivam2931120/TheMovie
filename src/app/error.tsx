"use client";

import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Application error:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-bg-main flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <div className="text-6xl mb-6">🎬</div>
                <h2 className="text-2xl font-display font-bold text-white mb-3">
                    Something went wrong
                </h2>
                <p className="text-text-muted mb-8 leading-relaxed">
                    An unexpected error occurred. Don&apos;t worry, your data is safe. Try refreshing or go back to the home page.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                        onClick={reset}
                        className="px-6 py-3 bg-accent-primary hover:bg-accent-primary/90 text-white font-bold rounded-lg transition-all w-full sm:w-auto"
                    >
                        Try Again
                    </button>
                    <a
                        href="/"
                        className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-medium rounded-lg transition-all w-full sm:w-auto text-center"
                    >
                        Go Home
                    </a>
                </div>
            </div>
        </div>
    );
}
