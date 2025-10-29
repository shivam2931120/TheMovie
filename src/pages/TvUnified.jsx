import { useState, useRef } from "react";
import Container from "../components/Container";
import { searchTvShows as searchMaze } from "../api/tvmaze";
import TvShowCard from "../components/TvShowCard";

const API_OPTIONS = [
  { label: "TVmaze", value: "maze" },
  { label: "TMDB", value: "tmdb" },
  { label: "Trakt.tv", value: "trakt" },
];

export default function TvUnified() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef();

  async function handleInput(e) {
    const val = e.target.value;
    setQuery(val);
    setError("");
    setResults([]);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) return;
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const recs = await searchMaze(val);
        setResults(recs);
        if (recs.length === 0) setError("No TV shows found.");
      } catch {
        setError("Failed to fetch TV shows.");
      } finally {
        setLoading(false);
      }
    }, 350);
  }

  return (
    <Container className="py-6 sm:py-8">
      <h1 className="mb-4 text-2xl font-bold sm:text-3xl">TV Show Search</h1>
      <div className="mb-6 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={handleInput}
          placeholder="Type a TV show title..."
          className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-white placeholder-neutral-500 transition focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
        />
      </div>
  {error && <p className="mb-4 text-center text-red-400">{error}</p>}
  {loading && query && <p className="mb-4 text-center text-neutral-400">Searching…</p>}
      {results.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-5">
          {results.map((show, idx) => (
            <TvShowCard key={show.id || show.name || idx} show={show} />
          ))}
        </div>
      )}
    </Container>
  );
}
