import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import Home from "./pages/Home";
import MovieDetails from "./pages/MovieDetails";
import TvUnified from "./pages/TvUnified";
import Container from "./components/Container";
import Watchlist from "./pages/Watchlist";
import Watched from "./pages/Watched";
import Statistics from "./pages/Statistics";
import Calendar from "./pages/Calendar";
import Discover from "./pages/Discover";
import Collections from "./pages/Collections";
import Trending from "./pages/Trending";
import Profile from "./pages/Profile";
import { WatchlistProvider } from "./context/WatchlistContext";
import { useWatchlist } from "./context/watchlist-context";
import { WatchedProvider } from "./context/WatchedContext";
import { useWatched } from "./context/watched-context";
import { ReviewProvider } from "./context/ReviewContext";
import { ListsProvider } from "./context/ListsContext";
import { SocialProvider } from "./context/SocialContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { ProtectedRoute, SignInPage, SignUpPage, UserButton } from "./components/AuthWrapper";
import { FireIcon, SearchIcon, CalendarIcon, CollectionIcon, TvIcon, StarIcon, CheckIcon, ChartIcon, UserIcon, MovieIcon } from "./components/Icons";
import { useState } from "react";

const CLERK_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

function Header() {
  const { count } = useWatchlist();
  const { count: watchedCount } = useWatched();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#1A1A1A] bg-[#070707]/95 backdrop-blur-md">
      <Container className="flex items-center justify-between py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-lg font-bold group shrink-0" aria-label="Home">
          <img src="/movie.png" alt="TheMovie" className="h-7 w-auto drop-shadow-[0_0_10px_rgba(225,6,0,0.5)]" />
          <span className="text-gradient-red font-extrabold tracking-tight hidden sm:inline">TheMovie</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 text-sm">
          <Link to="/trending" className="rounded-full bg-gradient-to-r from-[#E10600]/20 to-[#FF3333]/20 border border-[#E10600]/40 px-3 py-1.5 text-[#FF4444] font-medium transition hover:bg-[#E10600]/30 flex items-center gap-1.5">
            <FireIcon className="w-4 h-4" /> Trending
          </Link>
          <Link to="/discover" className="rounded-full px-3 py-1.5 text-neutral-400 transition hover:bg-[#1A1A1A] hover:text-white flex items-center gap-1.5">
            <SearchIcon className="w-4 h-4" /> Discover
          </Link>
          <Link to="/calendar" className="rounded-full px-3 py-1.5 text-neutral-400 transition hover:bg-[#1A1A1A] hover:text-white flex items-center gap-1.5">
            <CalendarIcon className="w-4 h-4" /> Calendar
          </Link>
          <Link to="/collections" className="rounded-full px-3 py-1.5 text-neutral-400 transition hover:bg-[#1A1A1A] hover:text-white flex items-center gap-1.5">
            <CollectionIcon className="w-4 h-4" /> Collections
          </Link>
          <Link to="/tv" className="rounded-full px-3 py-1.5 text-neutral-400 transition hover:bg-[#1A1A1A] hover:text-white flex items-center gap-1.5">
            <TvIcon className="w-4 h-4" /> TV
          </Link>

          <SignedIn>
            <div className="h-5 w-px bg-[#2A2A2A] mx-2" />
            <Link to="/watchlist" className="rounded-full px-3 py-1.5 text-neutral-400 transition hover:bg-[#1A1A1A] hover:text-white flex items-center gap-1.5">
              <StarIcon className="w-4 h-4" />
              {count > 0 && <span className="rounded-full bg-[#E10600] px-1.5 text-xs text-white">{count}</span>}
            </Link>
            <Link to="/watched" className="rounded-full px-3 py-1.5 text-neutral-400 transition hover:bg-[#1A1A1A] hover:text-white flex items-center gap-1.5">
              <CheckIcon className="w-4 h-4" />
              {watchedCount > 0 && <span className="rounded-full bg-[#22C55E] px-1.5 text-xs text-white">{watchedCount}</span>}
            </Link>
            <Link to="/statistics" className="rounded-full bg-[#E10600]/10 border border-[#E10600]/30 px-3 py-1.5 text-[#FF4444] transition hover:bg-[#E10600]/20 flex items-center gap-1.5">
              <ChartIcon className="w-4 h-4" /> Stats
            </Link>
            <Link to="/profile" className="rounded-full px-3 py-1.5 text-neutral-400 transition hover:bg-[#1A1A1A] hover:text-white flex items-center gap-1.5">
              <UserIcon className="w-4 h-4" />
            </Link>
            <UserButton
              appearance={{ elements: { avatarBox: "w-8 h-8 ring-2 ring-[#E10600]/50 hover:ring-[#E10600]" } }}
              afterSignOutUrl="/"
            />
          </SignedIn>

          <SignedOut>
            <div className="h-5 w-px bg-[#2A2A2A] mx-2" />
            <Link to="/sign-in" className="rounded-full bg-gradient-to-r from-[#E10600] to-[#B80500] px-5 py-1.5 text-sm font-semibold text-white shadow-lg shadow-[#E10600]/30">
              Sign In
            </Link>
          </SignedOut>
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg border border-[#2A2A2A] bg-[#141414] p-2 text-neutral-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </Container>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#1A1A1A] bg-[#0D0D0D]">
          <Container className="py-4 grid grid-cols-3 gap-2">
            <Link to="/trending" onClick={() => setMobileMenuOpen(false)} className="rounded-lg bg-[#141414] p-3 text-center text-sm text-neutral-300 hover:bg-[#E10600] hover:text-white">
              <FireIcon className="w-5 h-5 mx-auto mb-1" /> Trending
            </Link>
            <Link to="/discover" onClick={() => setMobileMenuOpen(false)} className="rounded-lg bg-[#141414] p-3 text-center text-sm text-neutral-300 hover:bg-[#E10600] hover:text-white">
              <SearchIcon className="w-5 h-5 mx-auto mb-1" /> Discover
            </Link>
            <Link to="/calendar" onClick={() => setMobileMenuOpen(false)} className="rounded-lg bg-[#141414] p-3 text-center text-sm text-neutral-300 hover:bg-[#E10600] hover:text-white">
              <CalendarIcon className="w-5 h-5 mx-auto mb-1" /> Calendar
            </Link>
            <Link to="/collections" onClick={() => setMobileMenuOpen(false)} className="rounded-lg bg-[#141414] p-3 text-center text-sm text-neutral-300 hover:bg-[#E10600] hover:text-white">
              <CollectionIcon className="w-5 h-5 mx-auto mb-1" /> Collections
            </Link>
            <Link to="/tv" onClick={() => setMobileMenuOpen(false)} className="rounded-lg bg-[#141414] p-3 text-center text-sm text-neutral-300 hover:bg-[#E10600] hover:text-white">
              <TvIcon className="w-5 h-5 mx-auto mb-1" /> TV
            </Link>
            <SignedIn>
              <Link to="/statistics" onClick={() => setMobileMenuOpen(false)} className="rounded-lg bg-[#E10600]/20 border border-[#E10600]/30 p-3 text-center text-sm text-[#FF4444]">
                <ChartIcon className="w-5 h-5 mx-auto mb-1" /> Stats
              </Link>
            </SignedIn>
            <SignedOut>
              <Link to="/sign-in" onClick={() => setMobileMenuOpen(false)} className="rounded-lg bg-gradient-to-r from-[#E10600] to-[#B80500] p-3 text-center text-sm text-white font-semibold">
                Sign In
              </Link>
            </SignedOut>
          </Container>
        </div>
      )}
    </header>
  );
}

// Hero banner for non-logged in users
function GuestHero() {
  return (
    <SignedOut>
      <div className="relative overflow-hidden bg-gradient-to-b from-[#E10600]/10 via-[#070707] to-[#070707]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(225,6,0,0.15)_0%,_transparent_70%)]" />
        <Container className="relative py-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4 sm:text-4xl">
            Welcome to <span className="text-gradient-red">TheMovie</span>
          </h2>
          <p className="text-neutral-400 max-w-xl mx-auto mb-6">
            Track movies, create lists, and get personalized recommendations.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/sign-up" className="rounded-full bg-gradient-to-r from-[#E10600] to-[#B80500] px-8 py-3 font-bold text-white shadow-lg shadow-[#E10600]/30">
              Get Started Free
            </Link>
            <Link to="/discover" className="rounded-full border border-[#E10600]/50 px-8 py-3 font-medium text-[#FF4444]">
              Explore Movies
            </Link>
          </div>

          {/* Feature highlights */}
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 max-w-2xl mx-auto">
            {[
              { icon: MovieIcon, title: "50K+ Movies" },
              { icon: FireIcon, title: "Trending" },
              { icon: ChartIcon, title: "Statistics" },
              { icon: CollectionIcon, title: "Collections" },
            ].map((f, i) => (
              <div key={i} className="rounded-lg border border-[#2A2A2A] bg-[#0D0D0D] p-3">
                <f.icon className="w-5 h-5 text-[#E10600] mx-auto mb-1" />
                <p className="text-sm font-medium text-white">{f.title}</p>
              </div>
            ))}
          </div>
        </Container>
      </div>
    </SignedOut>
  );
}

export default function App() {
  if (!CLERK_PUBLISHABLE_KEY) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070707]">
        <div className="rounded-xl border border-[#E10600]/30 bg-[#E10600]/10 p-6 text-center max-w-md">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#E10600]/20 flex items-center justify-center">
            <span className="text-[#E10600] text-2xl">!</span>
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Missing Clerk Configuration</h2>
          <p className="text-sm text-neutral-400">
            Add <code className="rounded bg-[#1A1A1A] px-2 py-0.5 text-[#FF4444]">VITE_CLERK_PUBLISHABLE_KEY</code> to your .env file.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
          <WatchlistProvider>
            <WatchedProvider>
              <ReviewProvider>
                <ListsProvider>
                  <SocialProvider>
                    <Router>
                      <Header />
                      <main>
                        <Routes>
                          <Route path="/" element={<><GuestHero /><Home /></>} />
                          <Route path="/movie/:id" element={<MovieDetails />} />
                          <Route path="/tv" element={<TvUnified />} />
                          <Route path="/trending" element={<Trending />} />
                          <Route path="/discover" element={<Discover />} />
                          <Route path="/calendar" element={<Calendar />} />
                          <Route path="/collections" element={<Collections />} />
                          <Route path="/collections/:id" element={<Collections />} />
                          <Route path="/sign-in/*" element={<SignInPage />} />
                          <Route path="/sign-up/*" element={<SignUpPage />} />
                          <Route path="/watchlist" element={<ProtectedRoute><Watchlist /></ProtectedRoute>} />
                          <Route path="/watched" element={<ProtectedRoute><Watched /></ProtectedRoute>} />
                          <Route path="/statistics" element={<ProtectedRoute><Statistics /></ProtectedRoute>} />
                          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                        </Routes>
                      </main>

                      {/* Footer */}
                      <footer className="border-t border-[#1A1A1A] bg-[#070707] py-6 mt-12">
                        <Container>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gradient-red font-bold">TheMovie</span>
                            <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer" className="text-neutral-500 hover:text-[#E10600]">
                              Powered by TMDB
                            </a>
                          </div>
                        </Container>
                      </footer>
                    </Router>
                  </SocialProvider>
                </ListsProvider>
              </ReviewProvider>
            </WatchedProvider>
          </WatchlistProvider>
        </ClerkProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}