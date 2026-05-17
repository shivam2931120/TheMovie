"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bell, CalendarDays, Loader2, Trash2 } from "lucide-react";
import { getUpcomingMovies } from "@/api/tmdb";
import { MovieCard } from "@/components/MovieCard";
import { ReminderButton } from "@/components/ReminderButton";
import { useReminders } from "@/context/ReminderContext";

export default function CalendarPage() {
    const [movies, setMovies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { upcomingReminders, removeReminder, requestNotificationPermission, notificationPermission } = useReminders() as any;

    useEffect(() => {
        let isMounted = true;

        async function loadUpcoming() {
            setLoading(true);
            const pages = await Promise.all([1, 2, 3].map((page) => getUpcomingMovies(page)));
            const items = pages
                .flatMap((page) => page?.results || [])
                .filter((movie) => movie.release_date)
                .sort((a, b) => a.release_date.localeCompare(b.release_date));

            if (isMounted) {
                setMovies(items);
                setLoading(false);
            }
        }

        loadUpcoming();
        return () => { isMounted = false; };
    }, []);

    const groupedMovies = useMemo(() => {
        return movies.reduce<Record<string, any[]>>((groups, movie) => {
            const month = new Date(`${movie.release_date}T00:00:00`).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
            });
            groups[month] = groups[month] || [];
            groups[month].push(movie);
            return groups;
        }, {});
    }, [movies]);

    return (
        <main className="min-h-screen pt-32 sm:pt-36 pb-20 bg-bg-main">
            <div className="container mx-auto px-4 sm:px-6 lg:px-20 mb-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-2 flex items-center gap-3">
                            <CalendarDays className="text-accent-primary" size={32} />
                            Release Calendar
                        </h1>
                        <p className="text-text-secondary">Upcoming theatrical and streaming releases from TMDB.</p>
                    </div>
                    {notificationPermission !== "granted" && notificationPermission !== "unsupported" && (
                        <button
                            onClick={() => requestNotificationPermission()}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-white/10"
                        >
                            <Bell size={18} />
                            Enable Browser Alerts
                        </button>
                    )}
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-20">
                {upcomingReminders.length > 0 && (
                    <section className="mb-10 rounded-xl border border-white/10 bg-bg-card p-5 sm:p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Your Reminders</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                            {upcomingReminders.slice(0, 9).map((reminder: any) => (
                                <div key={reminder.key} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                                    <div className="min-w-0">
                                        <Link
                                            href={reminder.type === "tv" ? `/tv/${reminder.id}` : `/movie/${reminder.id}`}
                                            className="block truncate text-sm font-bold text-white hover:text-accent-primary"
                                        >
                                            {reminder.title}
                                        </Link>
                                        <p className="text-xs text-text-muted">
                                            {new Date(`${reminder.date}T00:00:00`).toLocaleDateString()}
                                            {reminder.note ? ` - ${reminder.note}` : ""}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => removeReminder(reminder.id, reminder.type, reminder.date)}
                                        className="rounded-lg border border-white/10 bg-black/20 p-2 text-text-muted transition-all hover:border-red-500/50 hover:text-red-400"
                                        aria-label={`Remove reminder for ${reminder.title}`}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <Loader2 className="w-10 h-10 text-accent-primary animate-spin" />
                    </div>
                ) : movies.length === 0 ? (
                    <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-text-secondary">
                        No upcoming releases are available. Check the TMDB API key and try again.
                    </div>
                ) : (
                    <div className="space-y-12">
                        {Object.entries(groupedMovies).map(([month, releases]) => (
                            <section key={month}>
                                <h2 className="text-xl font-bold text-white mb-5">{month}</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-10 sm:gap-y-12 gap-x-3 sm:gap-x-6">
                                    {releases.slice(0, 15).map((movie) => (
                                        <div key={`movie-${movie.id}`}>
                                            <div className="text-xs text-text-muted mb-2">
                                                {new Date(`${movie.release_date}T00:00:00`).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </div>
                                            <MovieCard movie={movie} />
                                            <ReminderButton
                                                item={{ ...movie, type: "movie" }}
                                                date={movie.release_date}
                                                note="Movie release"
                                                className="mt-2 w-full"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
