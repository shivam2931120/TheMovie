"use client";

import { trapDialogFocus } from "@/lib/dialogFocus";

import { useState, useEffect, useRef, Fragment } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, User, X, Home, Film, Tv, Compass, Library } from "lucide-react";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import clsx from "clsx";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { searchMulti } from "@/api/tmdb";

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [suggestionStatus, setSuggestionStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
    const [searchRetry, setSearchRetry] = useState(0);
    const dialogRef = useRef<HTMLDialogElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Global keyboard shortcut for search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName || "") && !(document.activeElement as HTMLElement | null)?.isContentEditable) {
                e.preventDefault();
                setShowSearch(true);
            } else if (e.key === "Escape") {
                setShowSearch(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        const query = searchQuery.trim();
        setSuggestions([]);
        if (!showSearch || query.length < 3) { setSuggestionStatus("idle"); return; }
        setSuggestionStatus("loading");
        const timeoutId = setTimeout(async () => {
            try {
                const data = await searchMulti(query, 1, { signal: controller.signal, throwOnError: true });
                if (controller.signal.aborted) return;
                setSuggestions((data?.results || []).filter((item: any) => ["movie", "tv", "person"].includes(item.media_type)).slice(0, 5));
                setSuggestionStatus("ready");
            } catch {
                if (!controller.signal.aborted) setSuggestionStatus("error");
            }
        }, 300);
        return () => { clearTimeout(timeoutId); controller.abort(); };
    }, [searchQuery, showSearch, searchRetry]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSearch(false);
            }
        }
        if (showSearch) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showSearch]);

    useEffect(() => {
        if (!showSearch) return;
        const previousFocus = document.activeElement as HTMLElement | null;
        const previousOverflow = document.body.style.overflow;
        const dialog = dialogRef.current;
        dialog?.showModal();
        document.body.style.overflow = "hidden";
        return () => { dialog?.close(); document.body.style.overflow = previousOverflow; previousFocus?.focus(); };
    }, [showSearch]);

    const handleSearchCheck = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
            setShowSearch(false);
            setSuggestions([]);
            setSearchQuery("");
        }
    };

    const navLinks = [
        { name: "Home", href: "/", icon: Home },
        { name: "Discover", href: "/discover", icon: Compass },
        { name: "Library", href: "/library", icon: Library },
    ];
    const isLinkActive = (href: string) => href === "/library"
        ? ["/library", "/lists", "/diary"].some(path => pathname === path || pathname.startsWith(path + "/"))
        : pathname === href || (href !== "/" && pathname.startsWith(href + "/"));

    return (
        <>
            <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between bg-bg-main/90 p-3"><Link href="/" className="font-display text-white font-bold">THEMOVIE</Link><SignedOut><Link href="/sign-in" className="min-h-11 inline-flex items-center px-4 text-accent-primary">Sign in</Link></SignedOut><SignedIn><Link href="/library" className="min-h-11 inline-flex items-center px-4 text-accent-primary">Library</Link></SignedIn></div>
            {/* Desktop & Tablet Floating Navbar */}
            <header className="fixed top-0 left-0 right-0 z-50 pt-4 sm:pt-6 pointer-events-none px-4 hidden lg:block">
                <div className="container mx-auto max-w-4xl flex justify-center">
                    <nav
                        className={clsx(
                            "pointer-events-auto flex items-center justify-between px-6 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] border rounded-full",
                            isScrolled
                                ? "h-14 bg-bg-surface/80 backdrop-blur-xl border-white/10 shadow-glass"
                                : "h-16 bg-bg-main/50 backdrop-blur-md border-transparent shadow-none"
                        )}
                    >
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group mr-8 outline-none">
                            <span className="font-display font-bold text-xl tracking-tight text-white group-focus-visible:ring-2 group-focus-visible:ring-accent-primary rounded px-1">
                                THE<span className="text-accent-primary">MOVIE</span>
                            </span>
                        </Link>

                        {/* Center Links */}
                        <div className="flex items-center gap-1">
                            {navLinks.map((link) => {
                                const isActive = isLinkActive(link.href);
                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        aria-current={isActive ? "page" : undefined}
                                        className={clsx(
                                            "relative px-4 py-2 text-sm font-medium transition-colors outline-none rounded-full",
                                            isActive ? "text-white" : "text-text-secondary hover:text-white hover:bg-white/5",
                                            "focus-visible:ring-2 focus-visible:ring-accent-primary"
                                        )}
                                    >
                                        {link.name}
                                        {isActive && (
                                            <motion.div
                                                layoutId="nav-indicator"
                                                className="absolute inset-x-0 -bottom-px h-px bg-accent-surface glow"
                                                initial={false}
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-2 ml-8">
                            <button
                                onClick={() => setShowSearch(true)}
                                className="p-2 rounded-full text-text-secondary hover:text-white hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-accent-primary outline-none"
                                aria-label="Search"
                            >
                                <Search size={18} />
                            </button>

                            <SignedIn>
                                <Link
                                    href="/profile"
                                    className="p-2 rounded-full text-text-secondary hover:text-white hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-accent-primary outline-none"
                                    aria-label="Profile"
                                >
                                    <User size={18} />
                                </Link>
                            </SignedIn>
                            <SignedOut>
                                <Link
                                    href="/sign-in"
                                    className="px-4 py-1.5 rounded-full bg-accent-surface text-white text-xs font-bold transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface outline-none"
                                >
                                    Sign In
                                </Link>
                            </SignedOut>
                        </div>
                    </nav>
                </div>
            </header>

            {/* Mobile Bottom Navigation */}
            <nav aria-label="Main navigation" className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg-surface/90 backdrop-blur-xl border-t border-white/5 pb-[env(safe-area-inset-bottom)]">
                <div className="flex items-center justify-around h-16">
                    {navLinks.map((link) => {
                        const isActive = isLinkActive(link.href);
                        return (
                            <Fragment key={link.name}>
                                {link.name === "Library" && (
                                    <button type="button" onClick={() => setShowSearch(true)} className="flex h-full w-full flex-col items-center justify-center gap-1 text-text-secondary hover:text-white">
                                        <Search size={20} />
                                        <span className="text-xs font-medium">Search</span>
                                    </button>
                                )}
                                <Link href={link.href} aria-current={isActive ? "page" : undefined}
                                    className={clsx("flex h-full w-full flex-col items-center justify-center gap-1 transition-colors", isActive ? "text-accent-primary" : "text-text-secondary hover:text-white")}>
                                    <link.icon size={20} className={isActive ? "fill-accent-primary/20" : ""} />
                                    <span className="text-xs font-medium">{link.name}</span>
                                </Link>
                            </Fragment>
                        );
                    })}
                    <SignedIn>
                        <Link
                            href="/profile"
                            className={clsx(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                                pathname === "/profile" ? "text-accent-primary" : "text-text-secondary hover:text-white"
                            )}
                        >
                            <User size={20} />
                            <span className="text-xs font-medium">Profile</span>
                        </Link>
                    </SignedIn>
                    <SignedOut><Link href="/sign-in" className="flex h-full w-full flex-col items-center justify-center gap-1 text-text-secondary"><User size={20} /><span className="text-xs font-medium">Sign in</span></Link></SignedOut>
                </div>
            </nav>

            {/* Cinematic Search Overlay */}
            <AnimatePresence>
                {showSearch && (
                    <motion.dialog
                        onKeyDown={trapDialogFocus}
                        ref={dialogRef}
                        aria-label="Search movies and TV shows"
                        onCancel={() => setShowSearch(false)}
                        onClose={() => setShowSearch(false)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="m-0 overflow-y-auto max-w-none max-h-none w-screen h-dvh fixed inset-0 z-[100] bg-bg-main/80 backdrop-blur-2xl flex flex-col pt-[12vh] sm:pt-[16vh] items-center px-4"
                    >
                        <div ref={wrapperRef} className="w-full max-w-2xl relative">
                            <form onSubmit={handleSearchCheck} className="relative w-full">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted" size={24} />
                                <input
                                    type="search"
                                    aria-label="Search movies and TV shows"
                                    placeholder="Search movies, shows, people..."
                                    className="w-full bg-white/5 border border-white/10 rounded-full pl-16 pr-12 py-5 text-xl sm:text-2xl font-display text-white placeholder:text-text-muted focus:outline-none focus:border-accent-primary/50 focus:bg-white/10 transition-all shadow-2xl"
                                    autoFocus
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowSearch(false)}
                                    aria-label="Close search"
                                    className="absolute right-6 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-white transition-colors rounded-full focus-visible:ring-2 focus-visible:ring-accent-primary"
                                >
                                    <X size={24} />
                                </button>
                            </form>

                            <div role="status" aria-live="polite" className="mt-3 text-sm text-text-secondary">
                                {suggestionStatus === "loading" && "Searching…"}
                                {suggestionStatus === "error" && <p>Search is unavailable. <button type="button" onClick={() => setSearchRetry(value => value + 1)} className="underline text-accent-primary">Retry</button></p>}
                                {suggestionStatus === "ready" && (suggestions.length === 0 ? "No matching titles or people. Try another search." : `${suggestions.length} suggestions available.`)}
                            </div>
                            {searchQuery.trim().length > 0 && <Link href={`/search?q=${encodeURIComponent(searchQuery.trim())}`} onClick={() => setShowSearch(false)} className="mt-2 inline-flex min-h-11 items-center text-sm text-accent-primary">View all search results →</Link>}
                            {/* Results */}
                            {suggestions.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-4 max-h-[55dvh] overflow-y-auto bg-bg-surface/95 border border-white/5 rounded-3xl shadow-2xl"
                                >
                                    {suggestions.map((item: any) => {
                                        const isTV = item.media_type === "tv";
                                        const title = item.title || item.name;
                                        const date = isTV ? item.first_air_date : item.release_date;
                                        const href = item.media_type === "person" ? `/person/${item.id}` : isTV ? `/tv/${item.id}` : `/movie/${item.id}`;
                                        return (
                                            <Link
                                                key={`${item.media_type}-${item.id}`}
                                                href={href}
                                                onClick={() => setShowSearch(false)}
                                                className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 group outline-none focus-visible:bg-white/10"
                                            >
                                                <div className="w-12 h-16 relative bg-bg-elevated rounded overflow-hidden shrink-0">
                                                    {(item.poster_path || item.profile_path) ? (
                                                        <Image
                                                            src={`https://image.tmdb.org/t/p/w92${item.poster_path || item.profile_path}`}
                                                            alt={title || ""}
                                                            fill
                                                            sizes="48px"
                                                            className="object-cover transition-transform group-hover:scale-110"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-text-muted">
                                                            {isTV ? <Tv size={16} /> : <Film size={16} />}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="text-base font-medium text-white group-hover:text-accent-primary transition-colors">
                                                        {title}
                                                    </h4>
                                                    <div className="flex items-center gap-2 mt-1 text-sm text-text-muted">
                                                        <span>{date?.split("-")[0]}</span>
                                                        <span>•</span>
                                                        <span className="capitalize">{item.media_type}</span>
                                                        {item.vote_average > 0 && (
                                                            <>
                                                                <span>•</span>
                                                                <span className="text-accent-primary/80">★ {item.vote_average.toFixed(1)}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </div>
                        <p className="mt-8 text-sm text-text-muted font-medium">Press <kbd className="px-2 py-1 bg-white/10 rounded text-xs mx-1">ESC</kbd> to close</p>
                    </motion.dialog>
                )}
            </AnimatePresence>
        </>
    );
}
