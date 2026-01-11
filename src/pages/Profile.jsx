import { useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import Container from "../components/Container";
import { useSocial } from "../context/SocialContext";
import { useWatched } from "../context/watched-context";
import { useWatchlist } from "../context/watchlist-context";
import { useReviews } from "../context/ReviewContext";
import { useLists } from "../context/ListsContext";
import { UserIcon, EditIcon, MovieIcon, StarIcon, HeartIcon, UsersIcon, ChartIcon } from "../components/Icons";
import { format, parseISO } from "date-fns";
import MovieCard from "../components/MovieCard";

export default function Profile() {
    const { user, isSignedIn } = useUser();
    const { following, followers, activityFeed } = useSocial();
    const { items: watchedItems } = useWatched();
    const { items: watchlistItems } = useWatchlist();
    const { reviews, getAverageRating } = useReviews();
    const { lists } = useLists();

    if (!isSignedIn || !user) {
        return (
            <Container className="py-16 text-center">
                <UserIcon className="w-16 h-16 mx-auto text-neutral-600 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Sign in to view your profile</h2>
                <p className="text-neutral-400 mb-6">Track your movies, connect with friends, and more</p>
                <Link
                    to="/sign-in"
                    className="inline-block rounded-lg bg-gradient-to-r from-[#E10600] to-[#B80500] px-8 py-3 font-semibold text-white"
                >
                    Sign In
                </Link>
            </Container>
        );
    }

    const stats = [
        { label: "Watched", value: watchedItems.length, icon: MovieIcon },
        { label: "Watchlist", value: watchlistItems.length, icon: StarIcon },
        { label: "Reviews", value: reviews.length, icon: EditIcon },
        { label: "Lists", value: lists.length, icon: HeartIcon },
        { label: "Following", value: following.length, icon: UsersIcon },
        { label: "Avg Rating", value: getAverageRating() > 0 ? getAverageRating().toFixed(1) : "—", icon: ChartIcon },
    ];

    return (
        <div>
            {/* Profile Header */}
            <div className="relative bg-gradient-to-b from-[#E10600]/20 via-[#070707] to-[#070707]">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(225,6,0,0.15)_0%,_transparent_70%)]" />
                <Container className="relative py-10">
                    <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                        {/* Avatar */}
                        <div className="relative">
                            <img
                                src={user.imageUrl}
                                alt={user.firstName || "Profile"}
                                className="w-28 h-28 rounded-full border-4 border-[#E10600]/30 shadow-xl shadow-[#E10600]/20"
                            />
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#22C55E] border-4 border-[#070707] flex items-center justify-center">
                                <span className="text-white text-xs font-bold">✓</span>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="text-center sm:text-left flex-1">
                            <h1 className="text-2xl font-bold text-white sm:text-3xl">
                                {user.firstName} {user.lastName}
                            </h1>
                            {user.username && (
                                <p className="text-neutral-400">@{user.username}</p>
                            )}
                            <p className="text-sm text-neutral-500 mt-2">
                                Member since {format(new Date(user.createdAt), "MMMM yyyy")}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <Link
                                to="/statistics"
                                className="rounded-lg border border-[#2A2A2A] bg-[#141414] px-4 py-2 text-neutral-300 hover:border-[#E10600] hover:text-white transition flex items-center gap-2"
                            >
                                <ChartIcon className="w-4 h-4" />
                                Stats
                            </Link>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mt-8">
                        {stats.map((stat, i) => (
                            <div key={i} className="rounded-xl border border-[#1A1A1A] bg-[#0D0D0D] p-4 text-center">
                                <stat.icon className="w-5 h-5 mx-auto text-[#E10600] mb-2" />
                                <p className="text-xl font-bold text-white">{stat.value}</p>
                                <p className="text-xs text-neutral-500">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </Container>
            </div>

            <Container className="py-8">
                {/* Recently Watched */}
                {watchedItems.length > 0 && (
                    <section className="mb-10">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                <MovieIcon className="w-5 h-5 text-[#E10600]" />
                                Recently Watched
                            </h2>
                            <Link to="/watched" className="text-sm text-[#E10600] hover:text-[#FF4444]">
                                View All
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                            {watchedItems.slice(0, 6).map(movie => (
                                <MovieCard key={movie.id} movie={movie} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Following */}
                {following.length > 0 && (
                    <section className="mb-10">
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
                            <UsersIcon className="w-5 h-5 text-[#E10600]" />
                            Following
                        </h2>
                        <div className="flex flex-wrap gap-4">
                            {following.map(followedUser => (
                                <div key={followedUser.id} className="flex items-center gap-3 rounded-xl border border-[#1A1A1A] bg-[#0D0D0D] p-3">
                                    <img
                                        src={followedUser.imageUrl || "/placeholder.png"}
                                        alt={followedUser.username}
                                        className="w-10 h-10 rounded-full"
                                    />
                                    <div>
                                        <p className="font-medium text-white">{followedUser.username}</p>
                                        <p className="text-xs text-neutral-500">
                                            Following since {format(parseISO(followedUser.followedAt), "MMM yyyy")}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Activity Feed */}
                <section>
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
                        <ChartIcon className="w-5 h-5 text-[#E10600]" />
                        Your Activity
                    </h2>
                    <ActivityFeed activities={activityFeed} />
                </section>
            </Container>
        </div>
    );
}

function ActivityFeed({ activities }) {
    if (!activities || activities.length === 0) {
        return (
            <div className="rounded-xl border border-[#1A1A1A] bg-[#0D0D0D] p-8 text-center">
                <p className="text-neutral-500">No activity yet. Start watching movies!</p>
            </div>
        );
    }

    const getActivityText = (activity) => {
        switch (activity.type) {
            case "watched":
                return `You watched "${activity.movieTitle}"`;
            case "review":
                return `You reviewed "${activity.movieTitle}" with ${activity.rating}/10`;
            case "watchlist":
                return `You added "${activity.movieTitle}" to your watchlist`;
            case "follow":
                return `You started following ${activity.targetUser}`;
            default:
                return "Activity";
        }
    };

    return (
        <div className="rounded-xl border border-[#1A1A1A] bg-[#0D0D0D] divide-y divide-[#1A1A1A]">
            {activities.slice(0, 10).map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-4">
                    <img
                        src={activity.userImage || "/placeholder.png"}
                        alt={activity.username}
                        className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                        <p className="text-neutral-300">{getActivityText(activity)}</p>
                        <p className="text-xs text-neutral-500">
                            {format(parseISO(activity.timestamp), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                    </div>
                    {activity.moviePoster && (
                        <img
                            src={activity.moviePoster.startsWith('http') ? activity.moviePoster : `https://image.tmdb.org/t/p/w92${activity.moviePoster}`}
                            alt=""
                            className="h-14 w-10 rounded"
                        />
                    )}
                </div>
            ))}
        </div>
    );
}
