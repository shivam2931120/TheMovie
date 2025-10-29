import { useWatchlist } from "../context/watchlist-context";

export default function WatchlistButton({ movie, size = "sm", className = "", stopPropagation = false }) {
  const { has, toggle } = useWatchlist();
  
  let itemType = movie.type;
  if (!itemType) {
    if (movie.image?.medium || (movie.name && !movie.title)) {
      itemType = 'tv';
    } else {
      itemType = 'movie';
    }
  }
  
  const active = has(movie.id, itemType);

  const handleClick = (e) => {
    if (stopPropagation) {
      e.preventDefault();
      e.stopPropagation();
    }
    const normalizedItem = normalizeItem(movie, itemType);
    console.log('Toggling watchlist:', normalizedItem); // Debug
    toggle(normalizedItem);
  };

  const dims = size === "sm" ? "h-7 w-7 text-sm" : "h-8 w-8 text-base";
  return (
    <button
      onClick={handleClick}
      title={active ? "Remove from watchlist" : "Add to watchlist"}
      aria-label={active ? "Remove from watchlist" : "Add to watchlist"}
      className={`inline-flex items-center justify-center rounded-full border shadow-sm ${dims} transition ${
        active
          ? "border-amber-500 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
          : "border-neutral-700 bg-neutral-900/80 text-neutral-300 hover:bg-neutral-800"
      } ${className}`}
    >
      <span className="leading-none">{active ? "★" : "☆"}</span>
    </button>
  );
}

function normalizeItem(item, type) {
  if (type === 'tv') {
    return { 
      id: item.id, 
      name: item.name || item.title,
      title: undefined, // Explicitly unset title for TV shows
      poster_path: item.image?.medium || item.poster_path || item.poster,
      image: item.image, // Keep original image object
      vote_average: item.rating?.average || item.vote_average,
      rating: item.rating, // Keep original rating object
      release_date: item.premiered || item.first_air_date || item.year,
      premiered: item.premiered,
      type: 'tv'
    };
  }
  
  return { 
    id: item.id, 
    title: item.title,
    name: undefined, 
    poster_path: item.poster_path, 
    vote_average: item.vote_average, 
    release_date: item.release_date, 
    type: 'movie' 
  };
}
