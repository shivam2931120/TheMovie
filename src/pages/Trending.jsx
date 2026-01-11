import { useState, useEffect } from "react";
import Container from "../components/Container";
import MovieCard from "../components/MovieCard";
import { enhancedTrending, enhancedNowPlaying, enhancedTopRated } from "../api/enhanced";
import { FireIcon, MovieIcon, StarIcon, ArrowLeftIcon, ArrowRightIcon } from "../components/Icons";

const TABS = [
    { id: "trending", label: "Trending This Week", Icon: FireIcon },
    { id: "now", label: "Now Playing", Icon: MovieIcon },
    { id: "top", label: "All-Time Top", Icon: StarIcon },
];

export default function Trending() {
    const [activeTab, setActiveTab] = useState("trending");
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    useEffect(() => {
        const fetchMovies = async () => {
            setLoading(true);
            try {
                let data;
                if (activeTab === "trending") {
                    data = await enhancedTrending("week", page);
                } else if (activeTab === "now") {
                    data = await enhancedNowPlaying(page);
                } else if (activeTab === "top") {
                    data = await enhancedTopRated(page);
                }
                setMovies(data?.results || []);
            } catch (error) {
                console.error("Failed to fetch movies:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMovies();
    }, [activeTab, page]);

    return (
        <div>
            {/* Hero Header */}
            <div className="relative overflow-hidden bg-gradient-to-b from-[#E10600]/20 via-[#070707] to-[#070707]">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(225,6,0,0.2)_0%,_transparent_70%)]" />
                <Container className="relative py-10">
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <FireIcon className="w-8 h-8 text-[#E10600]" />
                        What's Hot
                    </h1>
                    <p className="text-neutral-400">See what everyone's watching right now</p>
                </Container>
            </div>

            <Container className="py-8">
                {/* Tab Navigation */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setPage(1); }}
                            className={`rounded-full px-6 py-2.5 font-medium transition flex items-center gap-2 ${activeTab === tab.id
                                    ? "bg-gradient-to-r from-[#E10600] to-[#B80500] text-white shadow-lg shadow-[#E10600]/30"
                                    : "bg-[#141414] border border-[#2A2A2A] text-neutral-400 hover:border-[#E10600] hover:text-white"
                                }`}
                        >
                            <tab.Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Featured Movie */}
                {movies.length > 0 && !loading && (
                    <div className="mb-10 rounded-2xl border border-[#1A1A1A] bg-[#0D0D0D] overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                            <div className="md:w-1/3 relative">
                                <img
                                    src={movies[0].backdrop_path
                                        ? `https://image.tmdb.org/t/p/w780${movies[0].backdrop_path}`
                                        : movies[0].poster_path
                                            ? `https://image.tmdb.org/t/p/w500${movies[0].poster_path}`
                                            : "/placeholder.png"
                                    }
                                    alt={movies[0].title}
                                    className="h-64 w-full object-cover md:h-full"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="rounded-full bg-gradient-to-r from-[#E10600] to-[#B80500] px-4 py-1.5 text-sm font-bold text-white shadow-lg shadow-[#E10600]/30 flex items-center gap-1">
                                        <FireIcon className="w-4 h-4" /> #1 Trending
                                    </span>
                                </div>
                            </div>
                            <div className="p-6 md:w-2/3">
                                <h2 className="text-2xl font-bold text-white mb-2">{movies[0].title}</h2>
                                <div className="flex items-center gap-4 text-neutral-400 mb-4">
                                    <span className="text-[#E10600] font-bold flex items-center gap-1">
                                        <StarIcon className="w-4 h-4" filled /> {movies[0].vote_average?.toFixed(1)}
                                    </span>
                                    <span>{movies[0].release_date?.slice(0, 4)}</span>
                                </div>
                                <p className="text-neutral-300 line-clamp-3 mb-4">{movies[0].overview}</p>
                                <a
                                    href={`/movie/${movies[0].id}`}
                                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#E10600] to-[#B80500] px-6 py-2.5 font-semibold text-white shadow-lg shadow-[#E10600]/20 hover:shadow-[#E10600]/40 transition"
                                >
                                    View Details <ArrowRightIcon className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {/* Movies Grid */}
                {loading ? (
                    <div className="text-center py-12 text-neutral-400">Loading...</div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {movies.slice(1).map((movie, index) => (
                            <div key={movie.id} className="relative">
                                <MovieCard movie={movie} />
                                {index < 9 && (
                                    <div className="absolute -top-2 -left-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-[#E10600] to-[#B80500] text-sm font-bold text-white shadow-lg">
                                        {index + 2}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {movies.length > 0 && (
                    <div className="mt-8 flex justify-center gap-4">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="rounded-lg border border-[#2A2A2A] bg-[#141414] px-5 py-2.5 text-neutral-300 hover:border-[#E10600] hover:text-white disabled:opacity-50 transition flex items-center gap-2"
                        >
                            <ArrowLeftIcon className="w-4 h-4" /> Previous
                        </button>
                        <span className="flex items-center px-4 text-neutral-400">Page {page}</span>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            className="rounded-lg border border-[#2A2A2A] bg-[#141414] px-5 py-2.5 text-neutral-300 hover:border-[#E10600] hover:text-white transition flex items-center gap-2"
                        >
                            Next <ArrowRightIcon className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </Container>
        </div>
    );
}
