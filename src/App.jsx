import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-react";
import Home from "./pages/Home";
import MovieDetails from "./pages/MovieDetails";
import TvUnified from "./pages/TvUnified";
import Container from "./components/Container";
import Watchlist from "./pages/Watchlist";
import { WatchlistProvider } from "./context/WatchlistContext";
import { useWatchlist } from "./context/watchlist-context";
import { WatchedProvider } from "./context/WatchedContext";
import { useWatched } from "./context/watched-context";
import ErrorBoundary from "./components/ErrorBoundary";
import { ProtectedRoute, SignInPage, SignUpPage, UserButton } from "./components/AuthWrapper"; 
import Watched from "./pages/Watched";
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
function Header() {
  const { count } = useWatchlist();
  const { count: watchedCount } = useWatched();
  return (
    <header className="sticky top-0 z-10 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur-sm">
      <Container className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold sm:text-xl" aria-label="Home">
          <img src="/movie.png" alt="TheMovie" className="h-7 w-auto sm:h-8" />
          <span className="bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent">TheMovie</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-2 text-sm sm:gap-4">
          <Link to="/tv" className="rounded-full bg-neutral-800 px-3 py-1.5 text-neutral-300 transition hover:bg-neutral-700 hover:text-white">
            TV Shows
          </Link>
          <SignedIn>
            <Link to="/watchlist" className="rounded-full bg-neutral-800 px-3 py-1.5 text-neutral-300 transition hover:bg-neutral-700 hover:text-white">
              Watchlist ({count})
            </Link>
            <Link to="/watched" className="rounded-full bg-neutral-800 px-3 py-1.5 text-neutral-300 transition hover:bg-neutral-700 hover:text-white">
              Watched ({watchedCount})
            </Link>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8"
                }
              }}
              afterSignOutUrl="/" 
            />
          </SignedIn>
          <SignedOut>
            <Link 
              to="/sign-in" 
              className="rounded-full bg-blue-600 px-4 py-1.5 text-sm text-white transition hover:bg-blue-700"
            >
              Sign In
            </Link>
          </SignedOut>
          <a href="https://www.omdbapi.com/" target="_blank" rel="noreferrer" className="hidden text-xs text-neutral-400 hover:text-neutral-200 sm:block">OMDb</a>
        </nav>
      </Container>
    </header>
  );
}

export default function App() {
  if (!CLERK_PUBLISHABLE_KEY) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <div className="rounded-lg border border-yellow-800 bg-yellow-900/20 p-6 text-yellow-200">
          <h2 className="mb-2 text-lg font-semibold">⚠️ Missing Clerk Configuration</h2>
          <p className="text-sm">Add <code className="rounded bg-neutral-800 px-1">VITE_CLERK_PUBLISHABLE_KEY</code> to your .env file.</p>
          <p className="mt-2 text-xs text-yellow-300">Get your key from: https://clerk.com</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
        <WatchlistProvider>
          <WatchedProvider>
          <Router>
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/movie/:id" element={<MovieDetails />} />
                <Route path="/tv" element={<TvUnified />} />
                <Route path="/sign-in/*" element={<SignInPage />} />
                <Route path="/sign-up/*" element={<SignUpPage />} />
                <Route 
                  path="/watchlist" 
                  element={
                    <ProtectedRoute>
                      <Watchlist />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/watched" 
                  element={
                    <ProtectedRoute>
                      <Watched />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </main>
          </Router>
          </WatchedProvider>
        </WatchlistProvider>
      </ClerkProvider>
    </ErrorBoundary>
  );
}