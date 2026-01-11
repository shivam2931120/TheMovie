import { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";

const SocialContext = createContext();

export function SocialProvider({ children }) {
    const { user, isSignedIn } = useUser();
    const [following, setFollowing] = useState([]);
    const [followers, setFollowers] = useState([]);
    const [activityFeed, setActivityFeed] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load social data
    useEffect(() => {
        const loadSocialData = async () => {
            try {
                if (isSignedIn && user) {
                    const socialData = user.unsafeMetadata?.social || {};
                    setFollowing(socialData.following || []);
                    setFollowers(socialData.followers || []);
                    setActivityFeed(socialData.activityFeed || []);
                } else {
                    const local = localStorage.getItem("socialData");
                    if (local) {
                        const parsed = JSON.parse(local);
                        setFollowing(parsed.following || []);
                        setActivityFeed(parsed.activityFeed || []);
                    }
                }
            } catch (error) {
                console.error("Failed to load social data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadSocialData();
    }, [user, isSignedIn]);

    // Save social data
    const saveSocialData = async (data) => {
        try {
            if (isSignedIn && user) {
                await user.update({
                    unsafeMetadata: {
                        ...user.unsafeMetadata,
                        social: data,
                    },
                });
            } else {
                localStorage.setItem("socialData", JSON.stringify(data));
            }
        } catch (error) {
            console.error("Failed to save social data:", error);
        }
    };

    // Follow a user
    const followUser = async (targetUser) => {
        if (following.some(f => f.id === targetUser.id)) return;

        const newFollowing = [...following, {
            id: targetUser.id,
            username: targetUser.username || targetUser.firstName || "User",
            imageUrl: targetUser.imageUrl,
            followedAt: new Date().toISOString(),
        }];

        setFollowing(newFollowing);
        await saveSocialData({ following: newFollowing, followers, activityFeed });

        // Add activity
        addActivity({
            type: "follow",
            targetUser: targetUser.username || targetUser.firstName,
            targetUserId: targetUser.id,
        });
    };

    // Unfollow a user
    const unfollowUser = async (userId) => {
        const newFollowing = following.filter(f => f.id !== userId);
        setFollowing(newFollowing);
        await saveSocialData({ following: newFollowing, followers, activityFeed });
    };

    // Check if following
    const isFollowing = (userId) => {
        return following.some(f => f.id === userId);
    };

    // Add activity
    const addActivity = async (activity) => {
        const newActivity = {
            id: `activity-${Date.now()}`,
            userId: user?.id || "guest",
            username: user?.username || user?.firstName || "Guest",
            userImage: user?.imageUrl,
            timestamp: new Date().toISOString(),
            ...activity,
        };

        const newFeed = [newActivity, ...activityFeed].slice(0, 50); // Keep last 50
        setActivityFeed(newFeed);
        await saveSocialData({ following, followers, activityFeed: newFeed });
    };

    // Get user profile data
    const getProfile = () => {
        if (!isSignedIn || !user) return null;

        return {
            id: user.id,
            username: user.username || user.firstName || "User",
            firstName: user.firstName,
            lastName: user.lastName,
            imageUrl: user.imageUrl,
            email: user.primaryEmailAddress?.emailAddress,
            createdAt: user.createdAt,
            followingCount: following.length,
            followersCount: followers.length,
        };
    };

    return (
        <SocialContext.Provider
            value={{
                following,
                followers,
                activityFeed,
                loading,
                followUser,
                unfollowUser,
                isFollowing,
                addActivity,
                getProfile,
            }}
        >
            {children}
        </SocialContext.Provider>
    );
}

export function useSocial() {
    const context = useContext(SocialContext);
    if (!context) {
        throw new Error("useSocial must be used within SocialProvider");
    }
    return context;
}
