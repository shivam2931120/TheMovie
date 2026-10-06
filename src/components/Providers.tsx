"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { WatchlistProvider } from "@/context/WatchlistContext";
import { WatchedProvider } from "@/context/WatchedContext";
import { ReviewProvider } from "@/context/ReviewContext";
import { ListsProvider } from "@/context/ListsContext";
import { SocialProvider } from "@/context/SocialContext";
import { RecentlyViewedProvider } from "@/context/RecentlyViewedContext";
import { TVWatchProgressProvider } from "@/context/TVWatchProgressContext";
import { DiaryProvider } from "@/context/DiaryContext";
import { RecommendationPreferencesProvider } from "@/context/RecommendationPreferencesContext";

import { ProfilePreferencesProvider } from "@/context/ProfilePreferencesContext";
import { FeedbackProvider } from "@/context/FeedbackContext";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <ProfilePreferencesProvider><FeedbackProvider><RecommendationPreferencesProvider>
            <WatchlistProvider>
                <WatchedProvider>
                    <DiaryProvider>
                    <TVWatchProgressProvider>
                        <RecentlyViewedProvider>
                            <ReviewProvider>
                                <ListsProvider>
                                    <SocialProvider>
                                        {children}
                                    </SocialProvider>
                                </ListsProvider>
                            </ReviewProvider>
                        </RecentlyViewedProvider>
                    </TVWatchProgressProvider>
                    </DiaryProvider>
                </WatchedProvider>
            </WatchlistProvider>
            </RecommendationPreferencesProvider></FeedbackProvider></ProfilePreferencesProvider>
        </QueryClientProvider>
    );
}
