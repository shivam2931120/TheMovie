import { Link } from "react-router-dom";
import RatingBadge from "./RatingBadge";
import WatchlistButton from "./WatchlistButton";
import WatchedButton from "./WatchedButton";

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
      <div className="relative overflow-hidden rounded-lg bg-neutral-900 shadow-sm ring-1 ring-neutral-800 transition duration-200 group-hover:-translate-y-1 group-hover:shadow-md max-w-[240px] mx-auto w-full">
        <div className="relative aspect-[2/3] w-full bg-neutral-800">
          <img
            src={img}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-200 group-hover:opacity-95"
            loading="lazy"
          />
          <RatingBadge value={movie.vote_average || movie.rating?.average} />
          <div className="absolute right-2 top-2">
            <WatchlistButton movie={movie} stopPropagation size="sm" />
          </div>
          <div className="absolute left-2 top-12">
            <WatchedButton movie={movie} stopPropagation size="sm" />
          </div>
        </div>
        <div className="p-2 text-center text-sm font-medium text-neutral-100 line-clamp-2 min-h-[3rem]">
          {title}
        </div>
      </div>
    </Link>
  );
}
