"use client";

const parseTime = (value) => {
    const time = value ? new Date(value).getTime() : 0;
    return Number.isFinite(time) ? time : 0;
};

export const readStoredJson = (key, fallback) => {
    if (typeof window === "undefined") return fallback;

    try {
        const raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        window.localStorage.removeItem(key);
        return fallback;
    }
};

export const readStoredJsonFromKeys = (keys, fallback) => {
    for (const key of keys) {
        const value = readStoredJson(key, null);
        if (value !== null && value !== undefined) return value;
    }
    return fallback;
};

export const clearStoredKeys = (keys) => {
    if (typeof window === "undefined") return;
    keys.forEach((key) => window.localStorage.removeItem(key));
};

export const getItemType = (item, fallback = "movie") => (
    item?.type || (item?.name && !item?.title ? "tv" : fallback)
);

export const getItemKey = (item, fallbackType = "movie") => (
    `${getItemType(item, fallbackType)}:${item?.id}`
);

export const withItemType = (item, fallbackType = "movie") => ({
    ...item,
    type: getItemType(item, fallbackType),
});

export const mergeTypedItems = (accountItems = [], guestItems = [], maxItems) => {
    const merged = new Map();

    [...accountItems, ...guestItems].forEach((item) => {
        if (!item?.id) return;
        const next = withItemType(item);
        const key = getItemKey(next);
        const existing = merged.get(key);

        if (!existing) {
            merged.set(key, next);
            return;
        }

        const existingTime = parseTime(existing.updatedAt || existing.viewedAt || existing.createdAt);
        const nextTime = parseTime(next.updatedAt || next.viewedAt || next.createdAt);
        merged.set(key, nextTime >= existingTime ? { ...existing, ...next } : existing);
    });

    const result = [...merged.values()];
    return typeof maxItems === "number" ? result.slice(0, maxItems) : result;
};

export const mergeRecentItems = (accountItems = [], guestItems = [], maxItems = 50) => (
    mergeTypedItems(accountItems, guestItems)
        .sort((a, b) => parseTime(b.viewedAt || b.updatedAt || b.createdAt) - parseTime(a.viewedAt || a.updatedAt || a.createdAt))
        .slice(0, maxItems)
);

export const mergeRatings = (accountRatings = [], guestRatings = []) => {
    const merged = new Map();

    [...accountRatings, ...guestRatings].forEach((rating) => {
        if (!rating?.itemId || !rating?.type) return;
        const key = `${rating.type}:${rating.itemId}`;
        const existing = merged.get(key);
        if (!existing || parseTime(rating.updatedAt || rating.createdAt) >= parseTime(existing.updatedAt || existing.createdAt)) {
            merged.set(key, rating);
        }
    });

    return [...merged.values()].sort((a, b) => parseTime(b.updatedAt || b.createdAt) - parseTime(a.updatedAt || a.createdAt));
};

export const mergeReleaseReminders = (accountReminders = [], guestReminders = []) => {
    const merged = new Map();

    [...accountReminders, ...guestReminders].forEach((reminder) => {
        const key = reminder?.key || `${reminder?.type || "movie"}:${reminder?.id}:${reminder?.date || ""}`;
        if (!reminder?.id || !reminder?.date) return;
        const existing = merged.get(key);
        if (!existing || parseTime(reminder.updatedAt || reminder.createdAt) >= parseTime(existing.updatedAt || existing.createdAt)) {
            merged.set(key, reminder);
        }
    });

    return [...merged.values()].sort((a, b) => String(a.date).localeCompare(String(b.date)));
};

export const mergeTVProgress = (accountProgress = {}, guestProgress = {}) => {
    const merged = { ...(accountProgress || {}) };

    Object.entries(guestProgress || {}).forEach(([showId, seasons]) => {
        merged[showId] = { ...(merged[showId] || {}) };
        Object.entries(seasons || {}).forEach(([seasonNumber, episodes]) => {
            merged[showId][seasonNumber] = {
                ...(merged[showId][seasonNumber] || {}),
                ...(episodes || {}),
            };
        });
    });

    return merged;
};

export const hasGuestMergeChanges = (accountData, mergedData) => (
    JSON.stringify(accountData ?? null) !== JSON.stringify(mergedData ?? null)
);
