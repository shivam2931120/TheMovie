import { useState, useRef, useEffect } from "react";

export default function LazyImage({
    src,
    alt,
    className = "",
    placeholder = "/placeholder.png",
    blurhash = null,
}) {
    const [loaded, setLoaded] = useState(false);
    const [inView, setInView] = useState(false);
    const imgRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.disconnect();
                }
            },
            { rootMargin: "100px", threshold: 0.1 }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const handleLoad = () => setLoaded(true);
    const handleError = (e) => {
        e.target.src = placeholder;
        setLoaded(true);
    };

    return (
        <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
            {/* Blur placeholder */}
            <div
                className={`absolute inset-0 bg-neutral-800 transition-opacity duration-500 ${loaded ? "opacity-0" : "opacity-100"
                    }`}
                style={{
                    background: blurhash
                        ? `linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)`
                        : undefined,
                }}
            >
                {/* Shimmer effect */}
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-neutral-700/30 to-transparent" />
            </div>

            {/* Actual image */}
            {inView && (
                <img
                    src={src || placeholder}
                    alt={alt}
                    className={`h-full w-full object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"
                        }`}
                    onLoad={handleLoad}
                    onError={handleError}
                    loading="lazy"
                />
            )}
        </div>
    );
}
