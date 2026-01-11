import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { enhancedMovieSearch, enhancedPopular, enhancedDiscover, enhancedTrending } from "../api/enhanced";
import MovieCard from "../components/MovieCard";
import SkeletonCard from "../components/SkeletonCard";
import Pagination from "../components/Pagination";
import Container from "../components/Container";
import Filters from "../components/Filters";
import { queryKeys } from "../lib/queryClient";
import { Link } from "react-router-dom";
import { FireIcon, SearchIcon, ArrowRightIcon } from "../components/Icons";

function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useState(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function Home() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ sortBy: "popularity.desc" });

  const debouncedQuery = useDebouncedValue(query, 400);

  const getQueryKey = () => {
    if (debouncedQuery) {
      return queryKeys.movies.search(debouncedQuery, page);
    }
    if (filters.genreId || filters.year || filters.rating) {
      return queryKeys.movies.discover({ ...filters, page });
    }
    return queryKeys.movies.popular(page);
  };

  const getQueryFn = () => {
    if (debouncedQuery) {
      return () => enhancedMovieSearch(debouncedQuery, page);
    }
    if (filters.genreId || filters.year || filters.rating) {
      return () => enhancedDiscover({ page, ...filters });
    }
    return () => enhancedPopular(page);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: getQueryKey(),
    queryFn: getQueryFn(),
    staleTime: 1000 * 60 * 5,
  });

  const { data: trendingData } = useQuery({
    queryKey: queryKeys.movies.trending("week", 1),
    queryFn: () => enhancedTrending("week", 1),
    staleTime: 1000 * 60 * 30,
  });

  const movies = data?.results || [];
  const totalPages = data?.total_pages || 1;
  const trendingMovies = trendingData?.results?.slice(0, 5) || [];

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
    setPage(1);
  };

  const handleFiltersChange = (v) => {
    setFilters({ ...filters, ...v });
    setPage(1);
  };

  return (
    <div>
      {/* Trending Section */}
      {!query && trendingMovies.length > 0 && page === 1 && !filters.genreId && (
        <div className="relative overflow-hidden">
          <div
            className="absolute inset-0 -z-10 bg-cover bg-center opacity-20 blur-sm"
            style={{
              backgroundImage: trendingMovies[0]?.backdrop_path
                ? `url(https://image.tmdb.org/t/p/original${trendingMovies[0].backdrop_path})`
                : undefined,
            }}
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#E10600]/10 via-[#070707]/90 to-[#070707]" />

          <Container className="py-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FireIcon className="w-5 h-5 text-[#E10600]" />
                Trending This Week
              </h2>
              <Link to="/trending" className="text-sm text-[#E10600] hover:text-[#FF4444] transition flex items-center gap-1">
                View All <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {trendingMovies.map((movie, index) => (
                <div key={movie.id} className="relative">
                  <MovieCard movie={movie} />
                  <div className="absolute -left-2 -top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-[#E10600] to-[#B80500] text-sm font-bold text-white shadow-lg shadow-[#E10600]/30">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </div>
      )}

      {/* Search Section */}
      <div className="relative bg-[#0D0D0D] border-y border-[#1A1A1A]">
        <Container className="py-8">
          <div className="mx-auto max-w-2xl">
            <div className="flex overflow-hidden rounded-xl border border-[#2A2A2A] bg-[#141414] shadow-lg shadow-black/20 focus-within:border-[#E10600] focus-within:shadow-[#E10600]/20 transition">
              <span className="flex items-center pl-4 text-neutral-500">
                <SearchIcon className="w-5 h-5" />
              </span>
              <input
                type="text"
                className="w-full bg-transparent px-4 py-3 text-white placeholder-neutral-500 outline-none"
                placeholder="Search for movies..."
                value={query}
                onChange={handleQueryChange}
              />
              <button
                className="border-l border-[#2A2A2A] px-6 text-neutral-400 hover:bg-[#E10600] hover:text-white transition"
                onClick={() => setPage(1)}
              >
                Search
              </button>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-8">
        <Filters
          value={filters}
          onChange={handleFiltersChange}
          onClear={() => { setFilters({ sortBy: "popularity.desc" }); setPage(1); }}
        />

        {error && (
          <div className="mb-4 rounded-xl border border-[#E10600]/30 bg-[#E10600]/10 p-4 text-sm text-[#FF4444]">
            <p>{error.message || "Failed to load movies. Check your API key or try again."}</p>
            {(filters.genreId || filters.year || filters.rating) && (
              <button
                onClick={() => setFilters({ sortBy: "popularity.desc" })}
                className="mt-2 text-xs underline hover:text-white"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Section Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">
            {query ? `Results for "${query}"` : filters.genreId || filters.year ? "Filtered Movies" : "Popular Movies"}
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-[repeat(auto-fill,_minmax(180px,_1fr))] gap-4 sm:gap-5 md:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : movies.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-neutral-400 mb-4">
              {query ? `No results found for "${query}"` : "No movies found. Try adjusting your filters."}
            </p>
            <Link to="/discover" className="text-[#E10600] hover:text-[#FF4444]">
              Try Discover
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[repeat(auto-fill,_minmax(180px,_1fr))] gap-4 sm:gap-5 md:gap-6">
              {movies.map((m) => (
                <MovieCard key={m.id} movie={m} />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </Container>
    </div>
  );
}
