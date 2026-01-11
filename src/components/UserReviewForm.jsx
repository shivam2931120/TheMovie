import { useState } from "react";
import { useReviews } from "../context/ReviewContext";

export default function UserReviewForm({ movieId, movieTitle, poster, onSubmit }) {
    const { addReview, getReviewForMovie, updateReview, deleteReview } = useReviews();
    const existingReview = getReviewForMovie(movieId);

    const [rating, setRating] = useState(existingReview?.rating || 0);
    const [content, setContent] = useState(existingReview?.content || "");
    const [hoveredRating, setHoveredRating] = useState(0);
    const [isEditing, setIsEditing] = useState(!existingReview);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) return;

        setSubmitting(true);
        try {
            if (existingReview) {
                await updateReview(existingReview.id, { rating, content });
            } else {
                await addReview(String(movieId), movieTitle, poster, rating, content);
            }
            setIsEditing(false);
            onSubmit?.();
        } catch (error) {
            console.error("Failed to save review:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!existingReview) return;
        if (!confirm("Delete your review?")) return;

        await deleteReview(existingReview.id);
        setRating(0);
        setContent("");
        setIsEditing(true);
    };

    // Star rating component
    const StarRating = () => (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={!isEditing}
                    onMouseEnter={() => isEditing && setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => isEditing && setRating(star)}
                    className={`text-xl transition ${star <= (hoveredRating || rating)
                            ? "text-amber-400"
                            : "text-neutral-600"
                        } ${isEditing ? "hover:scale-110 cursor-pointer" : ""}`}
                >
                    ★
                </button>
            ))}
            <span className="ml-2 text-white font-medium">
                {hoveredRating || rating || "—"}/10
            </span>
        </div>
    );

    if (existingReview && !isEditing) {
        return (
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-white">Your Review</h4>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="text-sm text-purple-400 hover:text-purple-300"
                        >
                            Edit
                        </button>
                        <button
                            onClick={handleDelete}
                            className="text-sm text-red-400 hover:text-red-300"
                        >
                            Delete
                        </button>
                    </div>
                </div>
                <StarRating />
                {existingReview.content && (
                    <p className="mt-3 text-neutral-300">{existingReview.content}</p>
                )}
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
            <h4 className="font-semibold text-white mb-4">
                {existingReview ? "Edit Your Review" : "Write a Review"}
            </h4>

            <div className="mb-4">
                <label className="block text-sm text-neutral-400 mb-2">Your Rating</label>
                <StarRating />
            </div>

            <div className="mb-4">
                <label className="block text-sm text-neutral-400 mb-2">Your Thoughts (optional)</label>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What did you think about this movie?"
                    rows={4}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-3 text-white placeholder-neutral-500 resize-none focus:border-purple-500 focus:outline-none"
                />
            </div>

            <div className="flex gap-3">
                <button
                    type="submit"
                    disabled={rating === 0 || submitting}
                    className="rounded-lg bg-purple-600 px-6 py-2 font-medium text-white hover:bg-purple-700 disabled:opacity-50"
                >
                    {submitting ? "Saving..." : existingReview ? "Update Review" : "Submit Review"}
                </button>
                {existingReview && (
                    <button
                        type="button"
                        onClick={() => {
                            setRating(existingReview.rating);
                            setContent(existingReview.content);
                            setIsEditing(false);
                        }}
                        className="rounded-lg border border-neutral-700 px-4 py-2 text-neutral-400 hover:bg-neutral-800"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
}
