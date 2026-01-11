import { useState, useEffect, useRef } from "react";
import { getTrailerKey } from "../api/enhanced";
import { MiniTrailer } from "./VideoPlayer";

export default function TrailerHover({ movieId, children, enabled = true }) {
    const [showTrailer, setShowTrailer] = useState(false);
    const [trailerKey, setTrailerKey] = useState(null);
    const [loading, setLoading] = useState(false);
    const hoverTimeoutRef = useRef(null);
    const loadTimeoutRef = useRef(null);

    const handleMouseEnter = () => {
        if (!enabled) return;

        // Delay before starting to load trailer
        hoverTimeoutRef.current = setTimeout(() => {
            if (!trailerKey && !loading) {
                setLoading(true);
                getTrailerKey(movieId)
                    .then(key => {
                        setTrailerKey(key);
                        if (key) {
                            loadTimeoutRef.current = setTimeout(() => {
                                setShowTrailer(true);
                            }, 300);
                        }
                    })
                    .catch(() => { })
                    .finally(() => setLoading(false));
            } else if (trailerKey) {
                setShowTrailer(true);
            }
        }, 800); // Wait 800ms before loading
    };

    const handleMouseLeave = () => {
        clearTimeout(hoverTimeoutRef.current);
        clearTimeout(loadTimeoutRef.current);
        setShowTrailer(false);
    };

    useEffect(() => {
        return () => {
            clearTimeout(hoverTimeoutRef.current);
            clearTimeout(loadTimeoutRef.current);
        };
    }, []);

    return (
        <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="relative"
        >
            {children}

            {/* Trailer overlay */}
            {showTrailer && trailerKey && (
                <div className="absolute inset-0 z-20 overflow-hidden rounded-lg">
                    <MiniTrailer videoKey={trailerKey} muted />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                        <span className="text-xs font-medium text-white">▶ Trailer Preview</span>
                    </div>
                </div>
            )}

            {/* Loading indicator */}
            {loading && (
                <div className="absolute right-2 top-2 z-30">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-600 border-t-purple-500" />
                </div>
            )}
        </div>
    );
}
