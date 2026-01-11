import { useSocial } from "../context/SocialContext";
import { useWatched } from "../context/watched-context";
import { useReviews } from "../context/ReviewContext";
import { format, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import { MovieIcon, StarIcon, UserPlusIcon, HeartIcon, ActivityIcon } from "./Icons";

export default function ActivityFeed({ limit = 20, showHeader = true }) {
    const { activityFeed } = useSocial();
    const { items: watchedItems } = useWatched();
    const { reviews } = useReviews();

    // Combine activities from different sources
    const combinedActivities = [
        ...activityFeed,
        ...watchedItems.slice(0, 10).map(item => ({
            id: `watched-${item.id}`,
            type: "watched",
            movieId: item.id,
            movieTitle: item.title || item.name,
            moviePoster: item.poster_path,
            timestamp: item.watchedAt || new Date().toISOString(),
        })),
        ...reviews.slice(0, 10).map(review => ({
            id: `review-${review.id}`,
            type: "review",
            movieId: review.movieId,
            movieTitle: review.movieTitle,
            moviePoster: review.poster,
            rating: review.rating,
            timestamp: review.createdAt,
        })),
    ]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);

    const getActivityIcon = (type) => {
        switch (type) {
            case "watched":
                return <MovieIcon className="w-4 h-4 text-[#22C55E]" />;
            case "review":
                return <StarIcon className="w-4 h-4 text-[#F59E0B]" filled />;
            case "watchlist":
                return <HeartIcon className="w-4 h-4 text-[#E10600]" />;
            case "follow":
                return <UserPlusIcon className="w-4 h-4 text-[#3B82F6]" />;
            default:
                return <ActivityIcon className="w-4 h-4 text-neutral-400" />;
        }
    };

    const getActivityText = (activity) => {
        switch (activity.type) {
            case "watched":
                return (
                    <>
                        Watched <Link to={`/movie/${activity.movieId}`} className="text-white font-medium hover:text-[#E10600]">"{activity.movieTitle}"</Link>
                    </>
                );
            case "review":
                return (
                    <>
                        Reviewed <Link to={`/movie/${activity.movieId}`} className="text-white font-medium hover:text-[#E10600]">"{activity.movieTitle}"</Link>
                        <span className="text-[#F59E0B] ml-1">{activity.rating}/10</span>
                    </>
                );
            case "watchlist":
                return (
                    <>
                        Added <Link to={`/movie/${activity.movieId}`} className="text-white font-medium hover:text-[#E10600]">"{activity.movieTitle}"</Link> to watchlist
                    </>
                );
            case "follow":
                return (
                    <>Started following <span className="text-white font-medium">{activity.targetUser}</span></>
                );
            default:
                return "Activity";
        }
    };

    if (combinedActivities.length === 0) {
        return (
            <div className="rounded-xl border border-[#1A1A1A] bg-[#0D0D0D] p-8 text-center">
                <ActivityIcon className="w-12 h-12 mx-auto text-neutral-600 mb-3" />
                <p className="text-neutral-500">No activity yet. Start watching movies!</p>
                <Link to="/" className="text-[#E10600] text-sm hover:text-[#FF4444] mt-2 inline-block">
                    Discover movies
                </Link>
            </div>
        );
    }

    return (
        <div>
            {showHeader && (
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                    <ActivityIcon className="w-5 h-5 text-[#E10600]" />
                    Recent Activity
                </h3>
            )}
            <div className="rounded-xl border border-[#1A1A1A] bg-[#0D0D0D] divide-y divide-[#1A1A1A]">
                {combinedActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-4 p-4 hover:bg-[#141414] transition">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center">
                            {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-neutral-300">{getActivityText(activity)}</p>
                            <p className="text-xs text-neutral-500 mt-0.5">
                                {format(parseISO(activity.timestamp), "MMM d 'at' h:mm a")}
                            </p>
                        </div>
                        {activity.moviePoster && (
                            <Link to={`/movie/${activity.movieId}`}>
                                <img
                                    src={activity.moviePoster.startsWith('http') ? activity.moviePoster : `https://image.tmdb.org/t/p/w92${activity.moviePoster}`}
                                    alt=""
                                    className="h-12 w-8 rounded object-cover hover:ring-2 hover:ring-[#E10600] transition"
                                />
                            </Link>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
