import { useState, useEffect } from "react";
import { useReviews } from "../context/ReviewContext";
import { getMovieReviews } from "../api/enhanced";
import { format, parseISO } from "date-fns";

export default function ReviewSection({ movieId, movieTitle, poster }) {
    const { getReviewForMovie } = useReviews();
    const [tmdbReviews, setTmdbReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState({});

    const userReview = getReviewForMovie(movieId);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const data = await getMovieReviews(movieId);
                setTmdbReviews(data.results?.slice(0, 5) || []);
            } catch (error) {
                console.error("Failed to fetch reviews:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, [movieId]);

    const toggleExpand = (id) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const allReviews = [
        ...(userReview ? [{
            id: userReview.id,
            author: "You",
            author_details: { rating: userReview.rating },
            content: userReview.content,
            created_at: userReview.createdAt,
            isUserReview: true,
        }] : []),
        ...tmdbReviews,
    ];

    if (loading) {
        return <div className="text-neutral-400 text-sm">Loading reviews...</div>;
    }

    if (allReviews.length === 0) {
        return (
            <div className="text-center py-6 text-neutral-500">
                No reviews yet. Be the first to share your thoughts!
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {allReviews.map((review) => {
                const isLong = review.content?.length > 300;
                const isExpanded = expanded[review.id];
                const displayContent = isLong && !isExpanded
                    ? review.content.slice(0, 300) + "..."
                    : review.content;

                return (
                    <div
                        key={review.id}
                        className={`rounded-xl border p-4 ${review.isUserReview
                                ? "border-purple-500/30 bg-purple-500/10"
                                : "border-neutral-800 bg-neutral-900/50"
                            }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-white">{review.author}</span>
                                {review.isUserReview && (
                                    <span className="rounded-full bg-purple-600 px-2 py-0.5 text-xs text-white">
                                        Your Review
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                {review.author_details?.rating && (
                                    <span className="text-amber-400">
                                        ⭐ {review.author_details.rating}/10
                                    </span>
                                )}
                                {review.created_at && (
                                    <span className="text-neutral-500">
                                        {format(parseISO(review.created_at), "MMM d, yyyy")}
                                    </span>
                                )}
                            </div>
                        </div>

                        {displayContent && (
                            <div className="text-neutral-300 text-sm leading-relaxed">
                                <p dangerouslySetInnerHTML={{ __html: displayContent.replace(/\n/g, "<br/>") }} />
                                {isLong && (
                                    <button
                                        onClick={() => toggleExpand(review.id)}
                                        className="mt-2 text-purple-400 hover:text-purple-300 text-sm"
                                    >
                                        {isExpanded ? "Show less" : "Read more"}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
