import { useWatched } from "../context/watched-context";

export default function WatchedButton({ movie, size = "sm", className = "", stopPropagation = false }) {
  const { has, toggle } = useWatched();
  
  // Determine type - if explicitly set use it, otherwise detect from data
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
    console.log('Toggling watched:', normalizedItem); // Debug
    toggle(normalizedItem);
  };

  const dims = size === "sm" ? "h-7 w-7 text-base" : "h-9 w-9 text-lg";
  return (
    <button
      onClick={handleClick}
      title={active ? "Mark as unwatched" : "Mark as watched"}
      aria-label={active ? "Unmark as watched" : "Mark as watched"}
      className={`inline-flex items-center justify-center rounded-full border shadow-sm backdrop-blur-sm ${dims} transition-all duration-200 ${
        active
          ? "border-green-500 bg-green-500/25 text-green-400 hover:bg-green-500/35 hover:scale-110 hover:shadow-green-500/20"
          : "border-neutral-600 bg-neutral-900/90 text-neutral-400 hover:bg-neutral-800 hover:border-green-500/50 hover:text-green-400"
      } ${className}`}
    >
      <span className="leading-none font-bold">{active ? "✓" : "○"}</span>
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
    name: undefined, // Explicitly unset name for movies
    poster_path: item.poster_path, 
    vote_average: item.vote_average, 
    release_date: item.release_date, 
    type: 'movie' 
  };
}
