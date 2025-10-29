import { useState } from "react";
import WatchlistButton from "./WatchlistButton";
import WatchedButton from "./WatchedButton";
import RatingBadge from "./RatingBadge";

export default function TvShowCard({ show }) {
  const [expanded, setExpanded] = useState(false);
  
  let img = "/placeholder.png";
  if (show.image?.medium) {
    img = show.image.medium; // Live TVmaze API data
  } else if (show.poster_path) {
    img = show.poster_path.startsWith('http') ? show.poster_path : `https://image.tmdb.org/t/p/w500${show.poster_path}`;
  } else if (show.poster) {
    img = show.poster;
  }
  
  const title = show.name || show.title || show.original_name || "Unknown";
  const summary = show.summary ? show.summary.replace(/<[^>]+>/g, "") : show.overview || show.description || "";
  const genres = show.genres || show.genre || [];
  const year = show.premiered?.slice(0, 4) || show.first_air_date?.slice(0, 4) || show.year || "";
  const rating = show.rating?.average || show.vote_average;

  const tvShow = { ...show, type: 'tv' };
  
  console.log('TvShowCard rendering:', { title, img, type: tvShow.type }); // Debug

  return (
    <div 
      className="group relative overflow-hidden rounded-lg bg-neutral-900 shadow-sm ring-1 ring-neutral-800 transition duration-200 hover:-translate-y-1 hover:shadow-md max-w-[240px] mx-auto w-full cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="relative aspect-[2/3] w-full bg-neutral-800">
        <img
          src={img}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-200 group-hover:opacity-95"
          loading="lazy"
          onError={(e) => {
            console.error('Image load error for:', title, img);
            e.target.src = '/placeholder.png';
          }}
        />
        {rating && <RatingBadge value={rating} />}
        <div className="absolute right-2 top-2" onClick={(e) => e.stopPropagation()}>
          <WatchlistButton movie={tvShow} stopPropagation size="sm" />
        </div>
        <div className="absolute left-2 top-12" onClick={(e) => e.stopPropagation()}>
          <WatchedButton movie={tvShow} stopPropagation size="sm" />
        </div>
      </div>
      <div className="p-2 text-center text-sm font-medium text-neutral-100 line-clamp-2 min-h-[3rem]">
        {title}
      </div>
      {expanded && (
        <div className="px-3 pb-3 space-y-2">
          <p className="text-xs text-neutral-300 leading-relaxed">{summary}</p>
          <div className="flex flex-wrap gap-1">
            {Array.isArray(genres) && genres.slice(0, 3).map((g, i) => (
              <span key={i} className="rounded-full border border-neutral-700 px-2 py-0.5 text-xs text-neutral-300">
                {g}
              </span>
            ))}
          </div>
          {year && <div className="text-xs text-neutral-400">Year: {year}</div>}
        </div>
      )}
    </div>
  );
}
