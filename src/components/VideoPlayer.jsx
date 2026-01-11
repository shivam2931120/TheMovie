import { useState, useEffect } from "react";
import YouTube from "react-youtube";

export default function VideoPlayer({
    videoKey,
    title = "Movie Trailer",
    autoplay = false,
    className = "",
    onReady,
    onEnd,
    onError,
}) {
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    if (!videoKey) {
        return (
            <div className={`flex items-center justify-center bg-neutral-900 text-neutral-500 ${className}`}>
                <span>No trailer available</span>
            </div>
        );
    }

    const opts = {
        height: "100%",
        width: "100%",
        playerVars: {
            autoplay: autoplay ? 1 : 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            controls: 1,
            fs: 1,
        },
    };

    const handleReady = (event) => {
        setLoading(false);
        onReady?.(event);
    };

    const handleError = (event) => {
        setError(true);
        setLoading(false);
        onError?.(event);
    };

    if (error) {
        return (
            <div className={`flex items-center justify-center bg-neutral-900 text-red-400 ${className}`}>
                <span>Failed to load trailer</span>
            </div>
        );
    }

    return (
        <div className={`relative overflow-hidden rounded-lg ${className}`}>
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-900">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-600 border-t-purple-500" />
                </div>
            )}
            <YouTube
                videoId={videoKey}
                opts={opts}
                onReady={handleReady}
                onEnd={onEnd}
                onError={handleError}
                className="h-full w-full"
                iframeClassName="h-full w-full rounded-lg"
                title={title}
            />
        </div>
    );
}

// Mini trailer player for hover preview
export function MiniTrailer({ videoKey, muted = true }) {
    if (!videoKey) return null;

    const opts = {
        height: "100%",
        width: "100%",
        playerVars: {
            autoplay: 1,
            mute: muted ? 1 : 0,
            controls: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            loop: 1,
            playlist: videoKey,
        },
    };

    return (
        <div className="absolute inset-0 z-10">
            <YouTube
                videoId={videoKey}
                opts={opts}
                className="h-full w-full"
                iframeClassName="h-full w-full object-cover"
            />
        </div>
    );
}
