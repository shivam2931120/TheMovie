import { useWatched } from "../context/watched-context";

export default function WatchedButton({ movie, size = "sm", className = "", stopPropagation = false }) {
  const { has, toggle } = useWatched();

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

  const dims = size === "sm" ? "h-8 w-8 text-base" : "h-10 w-10 text-lg";

  return (
    <button
      onClick={handleClick}
      title={active ? "Mark as unwatched" : "Mark as watched"}
      aria-label={active ? "Unmark as watched" : "Mark as watched"}
      className={`inline-flex items-center justify-center rounded-full shadow-lg backdrop-blur-sm ${dims} transition-all duration-200 ${active
          ? "bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white shadow-[#22C55E]/30 hover:shadow-[#22C55E]/50 hover:scale-110"
          : "bg-[#1A1A1A]/90 border border-[#2A2A2A] text-neutral-400 hover:border-[#22C55E] hover:text-[#22C55E] hover:shadow-[#22C55E]/20"
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
