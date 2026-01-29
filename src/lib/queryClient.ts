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
        popular: (page: number) => ["movies", "popular", page],
        trending: (timeWindow: string, page: number) => ["movies", "trending", timeWindow, page],
        nowPlaying: (page: number) => ["movies", "nowPlaying", page],
        upcoming: (page: number) => ["movies", "upcoming", page],
        topRated: (page: number) => ["movies", "topRated", page],
        search: (query: string, page: number) => ["movies", "search", query, page],
        discover: (filters: any) => ["movies", "discover", filters],
        details: (id: string | number) => ["movies", "details", id],
        similar: (id: string | number, page: number) => ["movies", "similar", id, page],
        reviews: (id: string | number, page: number) => ["movies", "reviews", id, page],
        trailer: (id: string | number) => ["movies", "trailer", id],
    },
    collections: {
        all: ["collections"],
        details: (id: number | string) => ["collections", id],
    },
    genres: ["genres"],
    era: (era: string, page: number) => ["era", era, page],
    awards: (category: string, page: number) => ["awards", category, page],
};
