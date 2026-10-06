"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useAccountFeature } from "@/lib/useAccountFeature";

const SocialContext = createContext();

const INITIAL={following:[],followers:[],activityFeed:[]};
const normalizeSocial=value=>({following:Array.isArray(value?.following)?value.following:[],followers:Array.isArray(value?.followers)?value.followers:[],activityFeed:Array.isArray(value?.activityFeed)?value.activityFeed.slice(0,50):[]});
const mergeSocial=(a,b)=>({following:[...new Map([...a.following,...b.following].map(item=>[item.id,item])).values()],followers:a.followers,activityFeed:[...new Map([...a.activityFeed,...b.activityFeed].map(item=>[item.id,item])).values()].slice(0,50)});

export function SocialProvider({ children }) {
    const { user, isSignedIn } = useUser();
    const {data,update,loading}=useAccountFeature('social',INITIAL,mergeSocial,normalizeSocial);
    const {following,followers,activityFeed}=data;
    const setFollowing=apply=>update(current=>({...current,following:typeof apply==='function'?apply(current.following):apply}));
    const setActivityFeed=apply=>update(current=>({...current,activityFeed:typeof apply==='function'?apply(current.activityFeed):apply}));
    const saveSocialData=async()=>{};

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
