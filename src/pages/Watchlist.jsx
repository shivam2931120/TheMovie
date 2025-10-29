import { useState } from "react";
import Container from "../components/Container";
import { useWatchlist } from "../context/watchlist-context";
import MovieCard from "../components/MovieCard";
import TvShowCard from "../components/TvShowCard";

export default function Watchlist() {
  const { items, movies, tvShows } = useWatchlist();
  const [filter, setFilter] = useState('all'); // 'all', 'movies', 'tv'

  const displayItems = filter === 'movies' ? movies : filter === 'tv' ? tvShows : items;

  return (
    <Container className="py-6 sm:py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold sm:text-3xl">Your Watchlist</h1>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              filter === 'all' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            All ({items.length})
          </button>
          <button
            onClick={() => setFilter('movies')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              filter === 'movies' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            Movies ({movies.length})
          </button>
          <button
            onClick={() => setFilter('tv')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              filter === 'tv' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            TV Shows ({tvShows.length})
          </button>
        </div>
      </div>
      {displayItems.length === 0 ? (
        <p className="text-center text-neutral-400">
          {filter === 'all' 
            ? 'Your watchlist is empty.' 
            : `No ${filter === 'movies' ? 'movies' : 'TV shows'} in your watchlist.`}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-5">
          {displayItems.map((item) => (
            item.type === 'tv' 
              ? <TvShowCard key={item.id} show={item} />
              : <MovieCard key={item.id} movie={item} />
          ))}
        </div>
      )}
    </Container>
  );
}
