export const ACCOUNT_FEATURES = ['watchlist','watched','ratings','customLists','recentlyViewed','tvProgress','watchDiary','recommendationPreferences','profilePreferences','watchGoals','social','feedbackConsent'] as const;
export type AccountFeature = typeof ACCOUNT_FEATURES[number];
export const isAccountFeature = (value: string): value is AccountFeature => (ACCOUNT_FEATURES as readonly string[]).includes(value);
export const LEGACY_KEYS: Record<string, string[]> = {
    watchlist: ['movie_catalogue_watchlist_v1'], watched: ['movie_catalogue_watched_v1'],
    ratings: ['movie_catalogue_ratings_v1','movie_catalogue_reviews_v2','userReviews'],
    customLists: ['movie_catalogue_custom_lists_v2','customLists'], recentlyViewed: ['movie_catalogue_recently_viewed_v1'],
    tvProgress: ['tv_watch_progress_v1'], watchGoals: ['watchGoals'], social: ['socialData'],
};
