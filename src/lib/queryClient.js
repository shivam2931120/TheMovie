import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a client with optimal settings
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 30, // 30 minutes (previously cacheTime)
            refetchOnWindowFocus: false,
            retry: 2,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        },
    },
});

export { QueryClientProvider };

// Query keys for caching
export const queryKeys = {
    movies: {
        all: ["movies"],
        popular: (page) => ["movies", "popular", page],
        trending: (timeWindow, page) => ["movies", "trending", timeWindow, page],
        nowPlaying: (page) => ["movies", "nowPlaying", page],
        upcoming: (page) => ["movies", "upcoming", page],
        topRated: (page) => ["movies", "topRated", page],
        search: (query, page) => ["movies", "search", query, page],
        discover: (filters) => ["movies", "discover", filters],
        details: (id) => ["movies", "details", id],
        similar: (id, page) => ["movies", "similar", id, page],
        reviews: (id, page) => ["movies", "reviews", id, page],
        trailer: (id) => ["movies", "trailer", id],
    },
    collections: {
        all: ["collections"],
        details: (id) => ["collections", id],
    },
    genres: ["genres"],
    era: (era, page) => ["era", era, page],
    awards: (category, page) => ["awards", category, page],
};
