import { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

const ReviewContext = createContext();

export function ReviewProvider({ children }) {
    const { user, isSignedIn } = useUser();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load reviews from user metadata or localStorage
    useEffect(() => {
        const loadReviews = async () => {
            try {
                if (isSignedIn && user) {
                    const savedReviews = user.unsafeMetadata?.reviews;
                    if (savedReviews) {
                        setReviews(savedReviews);
                    }
                } else {
                    const localReviews = localStorage.getItem("userReviews");
                    if (localReviews) {
                        setReviews(JSON.parse(localReviews));
                    }
                }
            } catch (error) {
                console.error("Failed to load reviews:", error);
            } finally {
                setLoading(false);
            }
        };
        loadReviews();
    }, [user, isSignedIn]);

    // Save reviews
    const saveReviews = async (newReviews) => {
        try {
            if (isSignedIn && user) {
                await user.update({
                    unsafeMetadata: {
                        ...user.unsafeMetadata,
                        reviews: newReviews,
                    },
                });
            } else {
                localStorage.setItem("userReviews", JSON.stringify(newReviews));
            }
        } catch (error) {
            console.error("Failed to save reviews:", error);
        }
    };

    // Add a review
    const addReview = async (movieId, movieTitle, poster, rating, content) => {
        const newReview = {
            id: `${movieId}-${Date.now()}`,
            movieId,
            movieTitle,
            poster,
            rating,
            content,
            createdAt: new Date().toISOString(),
        };

        const updatedReviews = [newReview, ...reviews];
        setReviews(updatedReviews);
        await saveReviews(updatedReviews);
        return newReview;
    };

    // Update a review
    const updateReview = async (reviewId, updates) => {
        const updatedReviews = reviews.map((r) =>
            r.id === reviewId ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
        );
        setReviews(updatedReviews);
        await saveReviews(updatedReviews);
    };

    // Delete a review
    const deleteReview = async (reviewId) => {
        const updatedReviews = reviews.filter((r) => r.id !== reviewId);
        setReviews(updatedReviews);
        await saveReviews(updatedReviews);
    };

    // Get review for a specific movie
    const getReviewForMovie = (movieId) => {
        return reviews.find((r) => r.movieId === String(movieId));
    };

    // Get average rating
    const getAverageRating = () => {
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
        return sum / reviews.length;
    };

    return (
        <ReviewContext.Provider
            value={{
                reviews,
                loading,
                addReview,
                updateReview,
                deleteReview,
                getReviewForMovie,
                getAverageRating,
            }}
        >
            {children}
        </ReviewContext.Provider>
    );
}

export function useReviews() {
    const context = useContext(ReviewContext);
    if (!context) {
        return {
            reviews: [],
            loading: false,
            addReview: async () => {},
            updateReview: async () => {},
            deleteReview: async () => {},
            getReviewForMovie: () => null,
            getAverageRating: () => 0,
        };
    }
    return context;
}

export { ReviewContext };
