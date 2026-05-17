"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { WatchlistProvider } from "@/context/WatchlistContext";
import { WatchedProvider } from "@/context/WatchedContext";
import { ReviewProvider } from "@/context/ReviewContext";
import { ListsProvider } from "@/context/ListsContext";
import { SocialProvider } from "@/context/SocialContext";
import { RecentlyViewedProvider } from "@/context/RecentlyViewedContext";
import { ReminderProvider } from "@/context/ReminderContext";
import { TVWatchProgressProvider } from "@/context/TVWatchProgressContext";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <WatchlistProvider>
                <WatchedProvider>
                    <TVWatchProgressProvider>
                        <RecentlyViewedProvider>
                            <ReviewProvider>
                                <ListsProvider>
                                    <ReminderProvider>
                                        <SocialProvider>
                                            {children}
                                        </SocialProvider>
                                    </ReminderProvider>
                                </ListsProvider>
                            </ReviewProvider>
                        </RecentlyViewedProvider>
                    </TVWatchProgressProvider>
                </WatchedProvider>
            </WatchlistProvider>
        </QueryClientProvider>
    );
}
