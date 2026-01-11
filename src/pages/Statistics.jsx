import { useMemo } from "react";
import { format, parseISO, startOfMonth, eachMonthOfInterval, subMonths } from "date-fns";
import Container from "../components/Container";
import StatCard from "../components/StatCard";
import WatchGoals from "../components/WatchGoals";
import ActivityFeed from "../components/ActivityFeed";
import { useWatched } from "../context/watched-context";
import { useReviews } from "../context/ReviewContext";
import { useGoals, GoalsProvider } from "../context/GoalsContext";
import { Link } from "react-router-dom";
import { ChartIcon, MovieIcon, StarIcon, CalendarIcon, TrophyIcon, EditIcon, ArrowRightIcon } from "../components/Icons";

function StatisticsContent() {
    const { items: watchedItems } = useWatched();
    const { reviews, getAverageRating } = useReviews();

    const stats = useMemo(() => {
        const now = new Date();
        const thisMonth = startOfMonth(now);
        const thisYear = new Date(now.getFullYear(), 0, 1);

        const watchedThisMonth = watchedItems.filter(item => {
            if (!item.watchedAt) return false;
            const watchedDate = parseISO(item.watchedAt);
            return watchedDate >= thisMonth;
        }).length;

        const watchedThisYear = watchedItems.filter(item => {
            if (!item.watchedAt) return false;
            const watchedDate = parseISO(item.watchedAt);
            return watchedDate >= thisYear;
        }).length;

        const last6Months = eachMonthOfInterval({
            start: subMonths(now, 5),
            end: now,
        });

        const monthlyData = last6Months.map(month => {
            const monthStart = startOfMonth(month);
            const monthEnd = startOfMonth(subMonths(month, -1));

            const count = watchedItems.filter(item => {
                if (!item.watchedAt) return false;
                const watchedDate = parseISO(item.watchedAt);
                return watchedDate >= monthStart && watchedDate < monthEnd;
            }).length;

            return { month: format(month, "MMM"), count };
        });

        const genreCounts = {};
        watchedItems.forEach(item => {
            if (item.genres) {
                item.genres.forEach(genre => {
                    const name = genre.name || genre;
                    genreCounts[name] = (genreCounts[name] || 0) + 1;
                });
            }
        });

        const topGenres = Object.entries(genreCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));

        return {
            total: watchedItems.length,
            thisMonth: watchedThisMonth,
            thisYear: watchedThisYear,
            avgRating: getAverageRating(),
            reviewCount: reviews.length,
            monthlyData,
            topGenres,
        };
    }, [watchedItems, reviews, getAverageRating]);

    const maxMonthly = Math.max(...stats.monthlyData.map(d => d.count), 1);

    return (
        <div>
            {/* Hero Header */}
            <div className="relative overflow-hidden bg-gradient-to-b from-[#E10600]/15 via-[#070707] to-[#070707]">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(225,6,0,0.15)_0%,_transparent_70%)]" />
                <Container className="relative py-10">
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <ChartIcon className="w-8 h-8 text-[#E10600]" />
                        Your Statistics
                    </h1>
                    <p className="text-neutral-400">Track your movie watching journey</p>
                </Container>
            </div>

            <Container className="py-8">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
                    <StatCard title="Total Watched" value={stats.total} Icon={MovieIcon} color="red" />
                    <StatCard title="Average Rating" value={stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "—"} subtitle={`${stats.reviewCount} reviews`} Icon={StarIcon} color="amber" />
                    <StatCard title="This Month" value={stats.thisMonth} Icon={CalendarIcon} color="blue" />
                    <StatCard title="This Year" value={stats.thisYear} Icon={TrophyIcon} color="green" />
                </div>

                {/* Goals Section */}
                <div className="mb-8">
                    <h2 className="mb-4 text-xl font-semibold text-white flex items-center gap-2">
                        <TrophyIcon className="w-5 h-5 text-[#E10600]" />
                        Watch Goals
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <WatchGoals currentCount={stats.thisMonth} period="monthly" />
                        <WatchGoals currentCount={stats.thisYear} period="yearly" />
                    </div>
                </div>

                {/* Watch Timeline Chart */}
                <div className="mb-8">
                    <h2 className="mb-4 text-xl font-semibold text-white flex items-center gap-2">
                        <ChartIcon className="w-5 h-5 text-[#E10600]" />
                        Watch Timeline
                    </h2>
                    <div className="rounded-xl border border-[#1A1A1A] bg-[#0D0D0D] p-5">
                        <div className="flex items-end justify-between gap-2 h-40">
                            {stats.monthlyData.map((data, idx) => (
                                <div key={idx} className="flex flex-col items-center flex-1">
                                    <div
                                        className="w-full max-w-12 rounded-t bg-gradient-to-t from-[#E10600] to-[#FF4444] transition-all duration-300 hover:from-[#FF4444] hover:to-[#FF6666]"
                                        style={{
                                            height: `${(data.count / maxMonthly) * 100}%`,
                                            minHeight: data.count > 0 ? '8px' : '0'
                                        }}
                                    />
                                    <span className="mt-2 text-xs text-neutral-400">{data.month}</span>
                                    <span className="text-sm font-medium text-white">{data.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Top Genres */}
                {stats.topGenres.length > 0 && (
                    <div className="mb-8">
                        <h2 className="mb-4 text-xl font-semibold text-white flex items-center gap-2">
                            <StarIcon className="w-5 h-5 text-[#E10600]" filled />
                            Favorite Genres
                        </h2>
                        <div className="rounded-xl border border-[#1A1A1A] bg-[#0D0D0D] p-5">
                            <div className="space-y-3">
                                {stats.topGenres.map((genre, idx) => {
                                    const percentage = (genre.count / stats.total) * 100;
                                    return (
                                        <div key={genre.name} className="flex items-center gap-3">
                                            <span className="w-6 text-center text-neutral-500">#{idx + 1}</span>
                                            <span className="w-24 text-sm text-white">{genre.name}</span>
                                            <div className="flex-1 h-4 rounded-full bg-[#1A1A1A] overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-[#E10600] to-[#FF4444]"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <span className="text-sm text-neutral-400">{genre.count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Activity Feed */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                            <EditIcon className="w-5 h-5 text-[#E10600]" />
                            Recent Activity
                        </h2>
                        <Link to="/profile" className="text-sm text-[#E10600] hover:text-[#FF4444] flex items-center gap-1">
                            View Profile <ArrowRightIcon className="w-4 h-4" />
                        </Link>
                    </div>
                    <ActivityFeed limit={5} showHeader={false} />
                </div>
            </Container>
        </div>
    );
}

export default function Statistics() {
    return (
        <GoalsProvider>
            <StatisticsContent />
        </GoalsProvider>
    );
}
