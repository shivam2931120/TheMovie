import { useState, useEffect } from "react";
import Container from "../components/Container";
import MovieCard from "../components/MovieCard";
import RandomPicker from "../components/RandomPicker";
import { discoverByEra, getAwardWinners } from "../api/enhanced";
import { SearchIcon, CalendarIcon, TrophyIcon, DiceIcon, ArrowLeftIcon, ArrowRightIcon } from "../components/Icons";

const ERAS = [
    { id: "80s", label: "80s Nostalgic", color: "from-[#E10600]/30 to-[#B80500]/20" },
    { id: "90s", label: "90s Classics", color: "from-[#E10600]/30 to-[#B80500]/20" },
    { id: "2000s", label: "2000s Hits", color: "from-[#E10600]/30 to-[#B80500]/20" },
    { id: "2010s", label: "2010s Modern", color: "from-[#E10600]/30 to-[#B80500]/20" },
    { id: "2020s", label: "2020s New", color: "from-[#E10600]/30 to-[#B80500]/20" },
];

const AWARD_CATEGORIES = [
    { id: "oscar", label: "Oscar Worthy" },
    { id: "cannes", label: "Festival Favorites" },
];

export default function Discover() {
    const [activeTab, setActiveTab] = useState("era");
    const [selectedEra, setSelectedEra] = useState("90s");
    const [selectedAward, setSelectedAward] = useState("oscar");
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);

    useEffect(() => {
        const fetchMovies = async () => {
            setLoading(true);
            try {
                let data;
                if (activeTab === "era") {
                    data = await discoverByEra(selectedEra, page);
                } else if (activeTab === "awards") {
                    data = await getAwardWinners(selectedAward, page);
                }
                setMovies(data?.results || []);
            } catch (error) {
                console.error("Failed to fetch movies:", error);
            } finally {
                setLoading(false);
            }
        };

        if (activeTab !== "random") {
            fetchMovies();
        }
    }, [activeTab, selectedEra, selectedAward, page]);

    return (
        <div>
            {/* Hero Header */}
            <div className="relative overflow-hidden bg-gradient-to-b from-[#E10600]/15 via-[#070707] to-[#070707]">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(225,6,0,0.15)_0%,_transparent_70%)]" />
                <Container className="relative py-10">
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <SearchIcon className="w-8 h-8 text-[#E10600]" />
                        Discover Movies
                    </h1>
                    <p className="text-neutral-400">Explore by era, awards, or let us pick for you</p>
                </Container>
            </div>

            <Container className="py-8">
                {/* Tab Navigation */}
                <div className="flex flex-wrap gap-2 mb-8">
                    <button
                        onClick={() => setActiveTab("era")}
                        className={`rounded-full px-6 py-2.5 font-medium transition flex items-center gap-2 ${activeTab === "era"
                                ? "bg-gradient-to-r from-[#E10600] to-[#B80500] text-white shadow-lg shadow-[#E10600]/30"
                                : "bg-[#141414] border border-[#2A2A2A] text-neutral-400 hover:border-[#E10600] hover:text-white"
                            }`}
                    >
                        <CalendarIcon className="w-4 h-4" />
                        Browse by Era
                    </button>
                    <button
                        onClick={() => setActiveTab("awards")}
                        className={`rounded-full px-6 py-2.5 font-medium transition flex items-center gap-2 ${activeTab === "awards"
                                ? "bg-gradient-to-r from-[#E10600] to-[#B80500] text-white shadow-lg shadow-[#E10600]/30"
                                : "bg-[#141414] border border-[#2A2A2A] text-neutral-400 hover:border-[#E10600] hover:text-white"
                            }`}
                    >
                        <TrophyIcon className="w-4 h-4" />
                        Award Winners
                    </button>
                    <button
                        onClick={() => setActiveTab("random")}
                        className={`rounded-full px-6 py-2.5 font-medium transition flex items-center gap-2 ${activeTab === "random"
                                ? "bg-gradient-to-r from-[#E10600] to-[#B80500] text-white shadow-lg shadow-[#E10600]/30"
                                : "bg-[#141414] border border-[#2A2A2A] text-neutral-400 hover:border-[#E10600] hover:text-white"
                            }`}
                    >
                        <DiceIcon className="w-4 h-4" />
                        Random Pick
                    </button>
                </div>

                {/* Era Browsing */}
                {activeTab === "era" && (
                    <div>
                        <div className="flex flex-wrap gap-3 mb-8">
                            {ERAS.map(era => (
                                <button
                                    key={era.id}
                                    onClick={() => { setSelectedEra(era.id); setPage(1); }}
                                    className={`rounded-xl border px-5 py-3 font-medium transition ${selectedEra === era.id
                                            ? `border-[#E10600] bg-gradient-to-br ${era.color} text-white shadow-lg shadow-[#E10600]/20`
                                            : "border-[#2A2A2A] bg-[#0D0D0D] text-neutral-300 hover:border-[#E10600]/50"
                                        }`}
                                >
                                    {era.label}
                                </button>
                            ))}
                        </div>

                        {loading ? (
                            <div className="text-center py-12 text-neutral-400">Loading {selectedEra} movies...</div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                                {movies.map(movie => (
                                    <MovieCard key={movie.id} movie={movie} />
                                ))}
                            </div>
                        )}

                        {movies.length > 0 && (
                            <div className="mt-8 flex justify-center gap-4">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="rounded-lg border border-[#2A2A2A] bg-[#141414] px-4 py-2 text-neutral-300 hover:border-[#E10600] disabled:opacity-50 transition flex items-center gap-2"
                                >
                                    <ArrowLeftIcon className="w-4 h-4" /> Previous
                                </button>
                                <span className="flex items-center px-4 text-neutral-400">Page {page}</span>
                                <button
                                    onClick={() => setPage(p => p + 1)}
                                    className="rounded-lg border border-[#2A2A2A] bg-[#141414] px-4 py-2 text-neutral-300 hover:border-[#E10600] transition flex items-center gap-2"
                                >
                                    Next <ArrowRightIcon className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Award Winners */}
                {activeTab === "awards" && (
                    <div>
                        <div className="flex flex-wrap gap-3 mb-8">
                            {AWARD_CATEGORIES.map(award => (
                                <button
                                    key={award.id}
                                    onClick={() => { setSelectedAward(award.id); setPage(1); }}
                                    className={`rounded-xl border px-5 py-3 font-medium transition flex items-center gap-2 ${selectedAward === award.id
                                            ? "border-[#E10600] bg-gradient-to-br from-[#E10600]/20 to-[#B80500]/10 text-white shadow-lg shadow-[#E10600]/20"
                                            : "border-[#2A2A2A] bg-[#0D0D0D] text-neutral-300 hover:border-[#E10600]/50"
                                        }`}
                                >
                                    <TrophyIcon className="w-4 h-4" />
                                    {award.label}
                                </button>
                            ))}
                        </div>

                        {loading ? (
                            <div className="text-center py-12 text-neutral-400">Loading award-winning movies...</div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                                {movies.map(movie => (
                                    <MovieCard key={movie.id} movie={movie} />
                                ))}
                            </div>
                        )}

                        {movies.length > 0 && (
                            <div className="mt-8 flex justify-center gap-4">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="rounded-lg border border-[#2A2A2A] bg-[#141414] px-4 py-2 text-neutral-300 hover:border-[#E10600] disabled:opacity-50 transition flex items-center gap-2"
                                >
                                    <ArrowLeftIcon className="w-4 h-4" /> Previous
                                </button>
                                <span className="flex items-center px-4 text-neutral-400">Page {page}</span>
                                <button
                                    onClick={() => setPage(p => p + 1)}
                                    className="rounded-lg border border-[#2A2A2A] bg-[#141414] px-4 py-2 text-neutral-300 hover:border-[#E10600] transition flex items-center gap-2"
                                >
                                    Next <ArrowRightIcon className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Random Picker */}
                {activeTab === "random" && (
                    <RandomPicker />
                )}
            </Container>
        </div>
    );
}
