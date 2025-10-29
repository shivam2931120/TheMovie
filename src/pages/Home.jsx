import { useEffect, useState } from "react";
import { enhancedDiscover, enhancedPopular, enhancedMovieSearch } from "../api/enhanced";
import MovieCard from "../components/MovieCard";
import SkeletonCard from "../components/SkeletonCard";
import Pagination from "../components/Pagination";
import Container from "../components/Container";
import Filters from "../components/Filters";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ sortBy: "popularity.desc" });

  const debouncedQuery = useDebouncedValue(query, 400);

  useEffect(() => {
    const run = async () => {
      setLoading(true); setError("");
      try {
        let data;
        if (debouncedQuery) {
          data = await enhancedMovieSearch(debouncedQuery, page);
        } else if (filters.genreId || filters.year || filters.rating || filters.sortBy !== "popularity.desc") {
          data = await enhancedDiscover({ page, ...filters });
        } else {
          data = await enhancedPopular(page);
        }
        
        setMovies(data.results || []);
        setTotalPages(data.total_pages || 1);
        
        if ((!data.results || data.results.length === 0) && (filters.genreId || filters.year || filters.rating)) {
          setError("No movies found with these filters. Try adjusting your criteria.");
        }
      } catch (err) {
        console.error("API Error:", err);
        setError(err.message || "Failed to load movies. Check your API key or try again.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [debouncedQuery, page, filters]);

  useEffect(() => { setPage(1); }, [debouncedQuery, filters]);

  return (
    <div>
      <div className="relative">
        <div className="from-purple-700/20 to-emerald-700/20 bg-gradient-to-r py-12">
          <Container>
            <div className="mx-auto max-w-2xl">
              <div className="flex overflow-hidden rounded-lg border border-neutral-700 bg-neutral-900/60">
                <input
                  type="text"
                  className="w-full bg-transparent px-3 py-2 text-neutral-100 placeholder-neutral-500 outline-none"
                  placeholder="Search movies..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button
                  className="border-l border-neutral-700 px-4 text-neutral-300 hover:text-white"
                  onClick={() => setPage(1)}
                >Search</button>
              </div>
            </div>
          </Container>
        </div>
      </div>

      <Container className="py-8">
        <Filters
          value={filters}
          onChange={(v) => setFilters({ ...filters, ...v })}
          onClear={() => setFilters({ sortBy: "popularity.desc" })}
        />
        {error && (
          <div className="mb-4 rounded-md border border-red-800 bg-red-900/30 p-3 text-sm text-red-200">
            <p>{error}</p>
            {(filters.genreId || filters.year || filters.rating) && (
              <button 
                onClick={() => setFilters({ sortBy: "popularity.desc" })} 
                className="mt-2 text-xs underline hover:text-red-100"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-[repeat(auto-fill,_minmax(180px,_1fr))] gap-4 sm:gap-5 md:gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : movies.length === 0 ? (
          <div className="py-16 text-center text-neutral-400">No results found.</div>
        ) : (
          <>
            <div className="grid grid-cols-[repeat(auto-fill,_minmax(180px,_1fr))] gap-4 sm:gap-5 md:gap-6">
              {movies.map((m) => (
                <MovieCard key={m.id} movie={m} />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={(p) => setPage(p)} />
          </>
        )}
      </Container>
    </div>
  );
}

function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
