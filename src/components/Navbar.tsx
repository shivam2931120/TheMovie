"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, User, X, Home } from "lucide-react";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import clsx from "clsx";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { searchMulti } from "@/api/tmdb";

// NAV_LINKS removed


export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [hideNavbar, setHideNavbar] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const lastScrollY = useRef(0);

    const pathname = usePathname();
    const router = useRouter();

    // Check if we're on a detail page
    const isDetailPage = pathname?.startsWith("/movie/") || pathname?.startsWith("/tv/");

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (isDetailPage) {
                // On detail pages: hide navbar at top, show when scrolling
                if (currentScrollY < 100) {
                    setHideNavbar(true);
                    setIsScrolled(false);
                } else {
                    setHideNavbar(false);
                    setIsScrolled(true);
                }
            } else {
                // On other pages: normal behavior
                setHideNavbar(false);
                setIsScrolled(currentScrollY > 0);
            }

            lastScrollY.current = currentScrollY;
        };

        handleScroll(); // Run on mount
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isDetailPage]);

    // Fetch suggestions when query changes
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchQuery.length > 2) {
                const data = await searchMulti(searchQuery);
                if (data?.results) {
                    // Filter to movies and TV shows only, skip people
                    setSuggestions(
                        data.results
                            .filter((r: any) => r.media_type === "movie" || r.media_type === "tv")
                            .slice(0, 5)
                    );
                }
            } else {
                setSuggestions([]);
            }
        };

        const timeoutId = setTimeout(fetchSuggestions, 300); // Debounce
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setSuggestions([]);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleSearchCheck = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
            setShowSearch(false);
            setSuggestions([]);
        }
    };

    return (
        <nav
            className={clsx(
                "fixed left-0 right-0 z-40 transition-all duration-500",
                hideNavbar ? "-top-32" : "top-0",
                isScrolled
                    ? "bg-black/95 backdrop-blur-2xl shadow-2xl shadow-black/50"
                    : "bg-gradient-to-b from-black via-black/80 to-transparent"
            )}
        >
            {/* Main Navbar */}
            <div className="border-b border-white/10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-20">
                    <div className="flex items-center justify-between h-16 sm:h-20">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3 relative z-50 group">
                            <div className="relative">
                                <Image
                                    src="/movie.png"
                                    alt="TheMovie Logo"
                                    width={48}
                                    height={48}
                                    className="w-10 h-10 sm:w-12 sm:h-12 object-contain transition-transform group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-accent-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <span className="font-display font-bold text-xl sm:text-3xl tracking-tight text-white">
                                The<span className="text-accent-primary">Movie</span>
                            </span>
                        </Link>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            {/* Home Button */}
                            <Link
                                href="/"
                                className="p-2.5 rounded-full bg-white/5 text-text-secondary hover:text-white hover:bg-white/10 transition-all focus-visible:ring-2 focus-visible:ring-accent-primary"
                                aria-label="Home"
                            >
                                <Home size={20} />
                            </Link>

                            {/* Search Bar */}
                            <div ref={wrapperRef} className="relative flex items-center">
                                <AnimatePresence>
                                    {showSearch && (
                                        <motion.form
                                            initial={{ width: 0, opacity: 0 }}
                                            animate={{ width: "auto", opacity: 1 }}
                                            exit={{ width: 0, opacity: 0 }}
                                            onSubmit={handleSearchCheck}
                                            className="overflow-visible mr-2 relative w-[200px] sm:w-[280px]"
                                        >
                                            <input
                                                type="text"
                                                placeholder="Search movies, shows..."
                                                className="w-full bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-accent-primary focus:bg-white/15 transition-all"
                                                autoFocus
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                            {/* Suggestions Dropdown */}
                                            {suggestions.length > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="absolute top-full text-start left-0 sm:left-auto sm:right-0 w-[90vw] sm:w-96 mt-2 bg-bg-card/95 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-2xl z-50 max-h-[60vh] overflow-y-auto"
                                                >
                                                    {suggestions.map((item: any) => {
                                                        const isTV = item.media_type === "tv";
                                                        const title = isTV ? item.name : item.title;
                                                        const date = isTV ? item.first_air_date : item.release_date;
                                                        const href = isTV ? `/tv/${item.id}` : `/movie/${item.id}`;
                                                        return (
                                                            <Link
                                                                key={`${item.media_type}-${item.id}`}
                                                                href={href}
                                                                onClick={() => {
                                                                    setShowSearch(false);
                                                                    setSuggestions([]);
                                                                    setSearchQuery("");
                                                                }}
                                                                className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-white/10 transition-all border-b border-white/5 last:border-0 group"
                                                            >
                                                                <div className="w-12 h-16 sm:w-14 sm:h-20 relative bg-neutral-800 rounded-lg overflow-hidden shrink-0 ring-2 ring-white/0 group-hover:ring-white/20 transition-all">
                                                                    {item.poster_path && (
                                                                        <Image
                                                                            src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                                                                            alt={title || ""}
                                                                            fill
                                                                            sizes="56px"
                                                                            className="object-cover"
                                                                        />
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-bold text-white leading-tight mb-1 line-clamp-2 group-hover:text-accent-primary transition-colors">{title}</p>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs text-text-muted">{date?.split("-")[0]}</span>
                                                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-text-secondary font-medium uppercase">
                                                                            {isTV ? "TV" : "Movie"}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <span className="text-xs text-yellow-500">★ {item.vote_average?.toFixed(1)}</span>
                                                                    </div>
                                                                </div>
                                                            </Link>
                                                        );
                                                    })}
                                                </motion.div>
                                            )}
                                        </motion.form>
                                    )}
                                </AnimatePresence>
                                <button
                                    onClick={() => setShowSearch(!showSearch)}
                                    className={clsx(
                                        "p-2.5 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-accent-primary",
                                        showSearch
                                            ? "bg-accent-primary text-white"
                                            : "bg-white/5 text-text-secondary hover:text-white hover:bg-white/10"
                                    )}
                                    aria-label={showSearch ? "Close search" : "Open search"}
                                >
                                    {showSearch ? <X size={20} /> : <Search size={20} />}
                                </button>
                            </div>

                            <SignedIn>
                                <Link
                                    href="/profile"
                                    className="p-2.5 rounded-full bg-white/5 text-text-secondary hover:text-white hover:bg-white/10 transition-all focus-visible:ring-2 focus-visible:ring-accent-primary"
                                    aria-label="Profile"
                                >
                                    <User size={20} />
                                </Link>
                            </SignedIn>
                            <SignedOut>
                                <Link
                                    href="/sign-in"
                                    className="px-4 py-2 rounded-full bg-accent-primary hover:bg-accent-primary/90 text-white text-sm font-bold transition-all shadow-lg shadow-accent-primary/20 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                                >
                                    Sign In
                                </Link>
                            </SignedOut>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
