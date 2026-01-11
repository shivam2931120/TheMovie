import { Link } from "react-router-dom";
import RatingBadge from "./RatingBadge";
import WatchlistButton from "./WatchlistButton";
import WatchedButton from "./WatchedButton";
import LazyImage from "./LazyImage";

export default function MovieCard({ movie }) {
  const title = movie.title || movie.name;

  let img = movie.poster_path;

  if (!img && movie.image?.medium) {
    img = movie.image.medium;
  } else if (!img && movie.poster) {
    img = movie.poster;
  }

  if (img && !img.startsWith('http')) {
    img = `https://image.tmdb.org/t/p/w500${img}`;
  } else if (!img) {
    img = "/placeholder.png";
  }

  return (
    <Link to={`/movie/${movie.id}`} className="group block">
      <div className="card-hover relative overflow-hidden rounded-xl bg-[#0D0D0D] shadow-lg ring-1 ring-[#1A1A1A] max-w-[240px] mx-auto w-full">
        <div className="relative aspect-[2/3] w-full bg-[#141414]">
          <LazyImage
            src={img}
            alt={title}
            className="absolute inset-0 h-full w-full"
          />

          {/* Rating Badge */}
          <RatingBadge value={movie.vote_average || movie.rating?.average} />

          {/* Action Buttons */}
          <div className="absolute right-2 top-2 z-10">
            <WatchlistButton movie={movie} stopPropagation size="sm" />
          </div>
          <div className="absolute left-2 top-2 z-10">
            <WatchedButton movie={movie} stopPropagation size="sm" />
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Red Glow Effect on Hover */}
          <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none">
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-[#E10600] to-transparent" />
          </div>
        </div>

        {/* Title */}
        <div className="p-3 text-center">
          <p className="text-sm font-medium text-white line-clamp-2 min-h-[2.5rem] group-hover:text-[#FF4444] transition-colors">
            {title}
          </p>
          {movie.release_date && (
            <p className="mt-1 text-xs text-neutral-500">
              {movie.release_date.slice(0, 4)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
