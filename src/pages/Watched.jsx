import { useState } from "react";
import Container from "../components/Container";
import { useWatched } from "../context/watched-context";
import MovieCard from "../components/MovieCard";
import TvShowCard from "../components/TvShowCard";

export default function Watched() {
  const { items, movies, tvShows } = useWatched();
  const [filter, setFilter] = useState('all'); // 'all', 'movies', 'tv'

  console.log('Watched items:', items);
  console.log('Movies:', movies);
  console.log('TV Shows:', tvShows);

  const displayItems = filter === 'movies' ? movies : filter === 'tv' ? tvShows : items;

  return (
    <Container className="py-6 sm:py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold sm:text-3xl">Watched</h1>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              filter === 'all' 
                ? 'bg-green-600 text-white shadow-lg shadow-green-600/30' 
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            All ({items.length})
          </button>
          <button
            onClick={() => setFilter('movies')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              filter === 'movies' 
                ? 'bg-green-600 text-white shadow-lg shadow-green-600/30' 
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            Movies ({movies.length})
          </button>
          <button
            onClick={() => setFilter('tv')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              filter === 'tv' 
                ? 'bg-green-600 text-white shadow-lg shadow-green-600/30' 
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
            ? "You haven't marked anything as watched yet." 
            : `No ${filter === 'movies' ? 'movies' : 'TV shows'} marked as watched.`}
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
