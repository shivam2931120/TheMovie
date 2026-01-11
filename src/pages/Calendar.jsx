import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, addMonths, subMonths } from "date-fns";
import Container from "../components/Container";
import MovieCard from "../components/MovieCard";
import { enhancedUpcoming } from "../api/enhanced";
import { CalendarIcon, ArrowLeftIcon, ArrowRightIcon, MovieIcon, ClockIcon, PlusIcon, TrashIcon } from "../components/Icons";

export default function Calendar() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [upcomingMovies, setUpcomingMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(null);
    const [personalSchedule, setPersonalSchedule] = useState(() => {
        const saved = localStorage.getItem("personalWatchSchedule");
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        const fetchUpcoming = async () => {
            setLoading(true);
            try {
                const data = await enhancedUpcoming(1);
                setUpcomingMovies(data.results || []);
            } catch (error) {
                console.error("Failed to fetch upcoming movies:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUpcoming();
    }, []);

    useEffect(() => {
        localStorage.setItem("personalWatchSchedule", JSON.stringify(personalSchedule));
    }, [personalSchedule]);

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const getMoviesForDate = (date) => {
        return upcomingMovies.filter(movie => {
            if (!movie.release_date) return false;
            return isSameDay(parseISO(movie.release_date), date);
        });
    };

    const getScheduledForDate = (date) => {
        return personalSchedule.filter(item => {
            return isSameDay(parseISO(item.scheduledDate), date);
        });
    };

    const addToSchedule = (movie) => {
        if (!selectedDate) return;
        const newItem = {
            ...movie,
            scheduledDate: selectedDate.toISOString(),
            addedAt: new Date().toISOString(),
        };
        setPersonalSchedule([...personalSchedule, newItem]);
    };

    const removeFromSchedule = (movieId, date) => {
        setPersonalSchedule(
            personalSchedule.filter(
                item => !(item.id === movieId && isSameDay(parseISO(item.scheduledDate), date))
            )
        );
    };

    const selectedDateMovies = selectedDate ? getMoviesForDate(selectedDate) : [];
    const selectedDateScheduled = selectedDate ? getScheduledForDate(selectedDate) : [];

    return (
        <div>
            {/* Hero Header */}
            <div className="relative overflow-hidden bg-gradient-to-b from-[#E10600]/15 via-[#070707] to-[#070707]">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(225,6,0,0.15)_0%,_transparent_70%)]" />
                <Container className="relative py-10">
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <CalendarIcon className="w-8 h-8 text-[#E10600]" />
                        Movie Calendar
                    </h1>
                    <p className="text-neutral-400">Upcoming releases & your watch schedule</p>
                </Container>
            </div>

            <Container className="py-8">
                <div className="grid gap-8 lg:grid-cols-[1fr,320px]">
                    {/* Calendar Grid */}
                    <div className="rounded-xl border border-[#1A1A1A] bg-[#0D0D0D] p-5">
                        {/* Month Navigation */}
                        <div className="flex items-center justify-between mb-6">
                            <button
                                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                                className="rounded-lg border border-[#2A2A2A] bg-[#141414] px-3 py-2 text-neutral-300 hover:border-[#E10600] hover:text-white transition"
                            >
                                <ArrowLeftIcon className="w-5 h-5" />
                            </button>
                            <h2 className="text-xl font-semibold text-white">
                                {format(currentMonth, "MMMM yyyy")}
                            </h2>
                            <button
                                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                                className="rounded-lg border border-[#2A2A2A] bg-[#141414] px-3 py-2 text-neutral-300 hover:border-[#E10600] hover:text-white transition"
                            >
                                <ArrowRightIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Day Headers */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                                <div key={day} className="py-2 text-center text-sm font-medium text-neutral-500">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Days */}
                        <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                                <div key={`empty-${i}`} className="h-20" />
                            ))}

                            {days.map(day => {
                                const moviesOnDay = getMoviesForDate(day);
                                const scheduledOnDay = getScheduledForDate(day);
                                const isSelected = selectedDate && isSameDay(day, selectedDate);
                                const isToday = isSameDay(day, new Date());

                                return (
                                    <button
                                        key={day.toISOString()}
                                        onClick={() => setSelectedDate(day)}
                                        className={`h-20 rounded-lg border p-2 text-left transition hover:border-[#E10600]/50 ${isSelected
                                                ? "border-[#E10600] bg-[#E10600]/20"
                                                : isToday
                                                    ? "border-[#22C55E]/50 bg-[#22C55E]/10"
                                                    : "border-[#1A1A1A] bg-[#141414]/30"
                                            }`}
                                    >
                                        <span className={`text-sm font-medium ${isToday ? "text-[#22C55E]" : "text-neutral-300"}`}>
                                            {format(day, "d")}
                                        </span>
                                        <div className="mt-1 space-y-0.5">
                                            {moviesOnDay.length > 0 && (
                                                <div className="flex items-center gap-1">
                                                    <span className="h-2 w-2 rounded-full bg-[#E10600]" />
                                                    <span className="text-xs text-[#FF4444] truncate">
                                                        {moviesOnDay.length} release{moviesOnDay.length > 1 ? "s" : ""}
                                                    </span>
                                                </div>
                                            )}
                                            {scheduledOnDay.length > 0 && (
                                                <div className="flex items-center gap-1">
                                                    <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
                                                    <span className="text-xs text-[#F59E0B] truncate">
                                                        {scheduledOnDay.length} scheduled
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Selected Date Panel */}
                    <div className="space-y-6">
                        {selectedDate ? (
                            <div className="rounded-xl border border-[#1A1A1A] bg-[#0D0D0D] p-5">
                                <h3 className="text-lg font-semibold text-white mb-4">
                                    {format(selectedDate, "EEEE, MMMM d")}
                                </h3>

                                {selectedDateMovies.length > 0 && (
                                    <div className="mb-6">
                                        <p className="text-sm text-[#E10600] mb-3 flex items-center gap-2">
                                            <MovieIcon className="w-4 h-4" /> Releasing
                                        </p>
                                        <div className="space-y-3">
                                            {selectedDateMovies.map(movie => (
                                                <div key={movie.id} className="flex items-center gap-3 rounded-lg bg-[#141414] p-2">
                                                    <img
                                                        src={movie.poster_path ? `https://image.tmdb.org/t/p/w92${movie.poster_path}` : "/placeholder.png"}
                                                        alt={movie.title}
                                                        className="h-14 w-10 rounded object-cover"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-white truncate">{movie.title}</p>
                                                        <p className="text-xs text-neutral-400">{movie.vote_average?.toFixed(1) || "N/A"}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => addToSchedule(movie)}
                                                        className="text-xs text-[#E10600] hover:text-[#FF4444] flex items-center gap-1"
                                                    >
                                                        <PlusIcon className="w-3 h-3" /> Add
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedDateScheduled.length > 0 && (
                                    <div>
                                        <p className="text-sm text-[#F59E0B] mb-3 flex items-center gap-2">
                                            <ClockIcon className="w-4 h-4" /> Your Schedule
                                        </p>
                                        <div className="space-y-3">
                                            {selectedDateScheduled.map(movie => (
                                                <div key={`${movie.id}-sched`} className="flex items-center gap-3 rounded-lg bg-[#141414] p-2">
                                                    <img
                                                        src={movie.poster_path ? `https://image.tmdb.org/t/p/w92${movie.poster_path}` : "/placeholder.png"}
                                                        alt={movie.title}
                                                        className="h-14 w-10 rounded object-cover"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-white truncate">{movie.title}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => removeFromSchedule(movie.id, selectedDate)}
                                                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                                                    >
                                                        <TrashIcon className="w-3 h-3" /> Remove
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedDateMovies.length === 0 && selectedDateScheduled.length === 0 && (
                                    <p className="text-neutral-500 text-sm">No movies scheduled for this day.</p>
                                )}
                            </div>
                        ) : (
                            <div className="rounded-xl border border-[#1A1A1A] bg-[#0D0D0D] p-5 text-center">
                                <p className="text-neutral-400">Select a date to see details</p>
                            </div>
                        )}

                        {/* Legend */}
                        <div className="rounded-xl border border-[#1A1A1A] bg-[#0D0D0D] p-4">
                            <p className="text-sm font-medium text-neutral-300 mb-3">Legend</p>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="h-3 w-3 rounded-full bg-[#E10600]" />
                                    <span className="text-neutral-400">Movie Release</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="h-3 w-3 rounded-full bg-[#F59E0B]" />
                                    <span className="text-neutral-400">Personal Schedule</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="h-3 w-3 rounded-full bg-[#22C55E]" />
                                    <span className="text-neutral-400">Today</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upcoming Movies Grid */}
                <div className="mt-12">
                    <h2 className="mb-6 text-xl font-semibold text-white flex items-center gap-2">
                        <MovieIcon className="w-5 h-5 text-[#E10600]" />
                        All Upcoming Releases
                    </h2>
                    {loading ? (
                        <div className="text-center text-neutral-400">Loading...</div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                            {upcomingMovies.map(movie => (
                                <MovieCard key={movie.id} movie={movie} />
                            ))}
                        </div>
                    )}
                </div>
            </Container>
        </div>
    );
}
