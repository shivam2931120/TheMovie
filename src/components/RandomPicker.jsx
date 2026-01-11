import { useState } from "react";
import { getRandomMovie } from "../api/enhanced";
import { Link } from "react-router-dom";
import { DiceIcon, RefreshIcon, ArrowRightIcon, SpinnerIcon } from "./Icons";

export default function RandomPicker() {
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        genreId: "",
        minRating: "",
    });
    const [isSpinning, setIsSpinning] = useState(false);

    const genres = [
        { id: 28, name: "Action" },
        { id: 35, name: "Comedy" },
        { id: 18, name: "Drama" },
        { id: 27, name: "Horror" },
        { id: 878, name: "Sci-Fi" },
        { id: 53, name: "Thriller" },
        { id: 10749, name: "Romance" },
        { id: 12, name: "Adventure" },
        { id: 16, name: "Animation" },
        { id: 80, name: "Crime" },
        { id: 14, name: "Fantasy" },
    ];

    const handlePick = async () => {
        setLoading(true);
        setIsSpinning(true);

        await new Promise(r => setTimeout(r, 1500));

        try {
            const result = await getRandomMovie({
                genreId: filters.genreId || undefined,
                minRating: filters.minRating ? parseFloat(filters.minRating) : undefined,
            });
            setMovie(result);
        } catch (error) {
            console.error("Random pick failed:", error);
        } finally {
            setLoading(false);
            setIsSpinning(false);
        }
    };

    return (
        <div className="rounded-2xl border border-[#1A1A1A] bg-gradient-to-br from-[#0D0D0D] to-[#E10600]/5 p-8">
            <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                    <DiceIcon className="w-7 h-7 text-[#E10600]" />
                    Random Movie Picker
                </h3>
                <p className="text-neutral-400">Can't decide what to watch? Let fate decide!</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-8 justify-center">
                <select
                    value={filters.genreId}
                    onChange={(e) => setFilters({ ...filters, genreId: e.target.value })}
                    className="rounded-lg border border-[#2A2A2A] bg-[#141414] px-4 py-2.5 text-white focus:border-[#E10600]"
                >
                    <option value="">Any Genre</option>
                    {genres.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                </select>

                <select
                    value={filters.minRating}
                    onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
                    className="rounded-lg border border-[#2A2A2A] bg-[#141414] px-4 py-2.5 text-white focus:border-[#E10600]"
                >
                    <option value="">Any Rating</option>
                    <option value="6">6+ Stars</option>
                    <option value="7">7+ Stars</option>
                    <option value="8">8+ Stars</option>
                </select>
            </div>

            {/* Pick Button */}
            <div className="flex justify-center mb-8">
                <button
                    onClick={handlePick}
                    disabled={loading}
                    className={`relative rounded-full bg-gradient-to-r from-[#E10600] to-[#B80500] px-10 py-4 text-lg font-bold text-white shadow-xl shadow-[#E10600]/30 transition hover:shadow-[#E10600]/50 hover:scale-105 disabled:opacity-70 flex items-center gap-3 ${isSpinning ? "animate-pulse" : ""
                        }`}
                >
                    {loading ? (
                        <>
                            <SpinnerIcon className="w-6 h-6" />
                            Picking...
                        </>
                    ) : (
                        <>
                            <DiceIcon className="w-6 h-6" />
                            Pick Random Movie
                        </>
                    )}
                </button>
            </div>

            {/* Result */}
            {movie && (
                <div className={`rounded-xl border border-[#E10600]/30 bg-[#0D0D0D] p-6 transition-all duration-500 ${isSpinning ? "opacity-0 scale-95" : "opacity-100 scale-100"
                    }`}>
                    <div className="flex gap-6 flex-col sm:flex-row">
                        <img
                            src={movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : "/placeholder.png"}
                            alt={movie.title}
                            className="w-48 rounded-lg shadow-xl shadow-[#E10600]/20 mx-auto sm:mx-0"
                        />
                        <div className="flex-1">
                            <h4 className="text-2xl font-bold text-white mb-2">{movie.title}</h4>
                            <div className="flex flex-wrap items-center gap-3 mb-4 text-neutral-400">
                                <span className="text-[#E10600] font-bold">{movie.vote_average?.toFixed(1) || "N/A"}</span>
                                <span>{movie.release_date?.slice(0, 4)}</span>
                            </div>
                            <p className="text-neutral-300 line-clamp-4 mb-6">{movie.overview}</p>
                            <div className="flex gap-3">
                                <Link
                                    to={`/movie/${movie.id}`}
                                    className="rounded-lg bg-gradient-to-r from-[#E10600] to-[#B80500] px-6 py-2.5 font-semibold text-white shadow-lg shadow-[#E10600]/20 hover:shadow-[#E10600]/40 transition flex items-center gap-2"
                                >
                                    View Details <ArrowRightIcon className="w-4 h-4" />
                                </Link>
                                <button
                                    onClick={handlePick}
                                    className="rounded-lg border border-[#2A2A2A] px-6 py-2.5 text-neutral-300 hover:border-[#E10600] hover:text-white transition flex items-center gap-2"
                                >
                                    <RefreshIcon className="w-4 h-4" /> Pick Again
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
