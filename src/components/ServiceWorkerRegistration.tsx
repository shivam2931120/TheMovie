"use client";

import { useEffect, useState } from "react";
import { Wifi, WifiOff, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ServiceWorkerRegistration() {
    const [isOffline, setIsOffline] = useState(false);
    const [showOfflineBanner, setShowOfflineBanner] = useState(false);
    const [updateAvailable, setUpdateAvailable] = useState(false);

    useEffect(() => {
        // Register service worker
        if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
            navigator.serviceWorker
                .register("/sw.js")
                .then((registration) => {
                    // Check for updates periodically
                    registration.addEventListener("updatefound", () => {
                        const newWorker = registration.installing;
                        if (newWorker) {
                            newWorker.addEventListener("statechange", () => {
                                if (newWorker.state === "activated") {
                                    setUpdateAvailable(true);
                                }
                            });
                        }
                    });

                    // Periodic cache cleanup
                    setInterval(() => {
                        navigator.serviceWorker.controller?.postMessage("CLEANUP");
                    }, 60 * 60 * 1000); // Every hour
                })
                .catch(() => {
                    // SW registration failed silently
                });
        }

        // Online/Offline detection
        const handleOnline = () => {
            setIsOffline(false);
            setShowOfflineBanner(false);
        };
        const handleOffline = () => {
            setIsOffline(true);
            setShowOfflineBanner(true);
        };

        setIsOffline(!navigator.onLine);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    return (
        <>
            {/* Offline Banner */}
            <AnimatePresence>
                {showOfflineBanner && isOffline && (
                    <motion.div
                        initial={{ y: -60, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -60, opacity: 0 }}
                        className="fixed top-0 left-0 right-0 z-[60] bg-yellow-600/95 backdrop-blur-sm text-white text-center py-2 px-4 text-sm font-medium flex items-center justify-center gap-2"
                    >
                        <WifiOff size={16} />
                        You&apos;re offline. Showing cached content.
                        <button
                            onClick={() => setShowOfflineBanner(false)}
                            className="ml-2 p-0.5 hover:bg-white/20 rounded"
                            aria-label="Dismiss"
                        >
                            <X size={14} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Update Available Toast */}
            <AnimatePresence>
                {updateAvailable && (
                    <motion.div
                        initial={{ y: 60, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 60, opacity: 0 }}
                        className="fixed bottom-6 right-6 z-[60] bg-bg-card border border-white/10 rounded-xl shadow-2xl p-4 max-w-sm"
                    >
                        <p className="text-white text-sm font-medium mb-2">A new version is available!</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setUpdateAvailable(false);
                                    window.location.reload();
                                }}
                                className="px-4 py-1.5 bg-accent-primary hover:bg-accent-primary/90 text-white text-xs font-bold rounded-lg transition-all"
                            >
                                Refresh
                            </button>
                            <button
                                onClick={() => setUpdateAvailable(false)}
                                className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-white text-xs rounded-lg transition-all"
                            >
                                Later
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
