import { Link } from "react-router-dom";

export default function CollectionCard({ collection, className = "" }) {
    const posterUrl = collection.poster
        ? collection.poster.startsWith("http")
            ? collection.poster
            : `https://image.tmdb.org/t/p/w300${collection.poster}`
        : "/placeholder.png";

    return (
        <Link
            to={`/collections/${collection.id}`}
            className={`group block ${className}`}
        >
            <div className="relative overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 transition duration-300 group-hover:-translate-y-1 group-hover:border-purple-500/50 group-hover:shadow-lg group-hover:shadow-purple-500/20">
                <div className="relative aspect-video overflow-hidden">
                    <img
                        src={posterUrl}
                        alt={collection.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="text-lg font-bold text-white line-clamp-1">{collection.name}</h3>
                        {collection.movieCount && (
                            <p className="text-sm text-neutral-400">{collection.movieCount} movies</p>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
