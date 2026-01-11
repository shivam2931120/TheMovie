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
    toggle(normalizedItem);
  };

  const dims = size === "sm" ? "h-8 w-8 text-sm" : "h-10 w-10 text-base";

  return (
    <button
      onClick={handleClick}
      title={active ? "Remove from watchlist" : "Add to watchlist"}
      aria-label={active ? "Remove from watchlist" : "Add to watchlist"}
      className={`inline-flex items-center justify-center rounded-full shadow-lg backdrop-blur-sm ${dims} transition-all duration-200 ${active
          ? "bg-gradient-to-r from-[#E10600] to-[#B80500] text-white shadow-[#E10600]/30 hover:shadow-[#E10600]/50 hover:scale-110"
          : "bg-[#1A1A1A]/90 border border-[#2A2A2A] text-neutral-400 hover:border-[#E10600] hover:text-[#E10600] hover:shadow-[#E10600]/20"
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
      title: undefined,
      poster_path: item.image?.medium || item.poster_path || item.poster,
      image: item.image,
      vote_average: item.rating?.average || item.vote_average,
      rating: item.rating,
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
