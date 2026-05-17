"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { saveUnsafeMetadata } from "@/lib/clerkMetadata";
import { clearStoredKeys, hasGuestMergeChanges, mergeReleaseReminders, readStoredJson } from "@/lib/guestDataMerge";

const ReminderContext = createContext(null);
const STORAGE_KEY = "movie_catalogue_release_reminders_v1";

const getType = (item) => item?.type || (item?.name && !item?.title ? "tv" : "movie");
const reminderKey = (id, type = "movie", date = "") => `${type}:${id}:${date}`;

const normalizeReminder = (reminder) => ({
    ...reminder,
    type: reminder.type || "movie",
    date: reminder.date || reminder.release_date || reminder.air_date,
    title: reminder.title || reminder.name || "Untitled",
    notificationStatus: reminder.notificationStatus || "pending",
    createdAt: reminder.createdAt || new Date().toISOString(),
});

const minifyReminder = (item, date, note = "") => {
    const type = getType(item);
    return normalizeReminder({
        id: item.id,
        type,
        key: reminderKey(item.id, type, date),
        title: item.title || item.name,
        poster_path: item.poster_path,
        date,
        note,
        createdAt: new Date().toISOString(),
        notificationStatus: "pending",
    });
};

export function ReminderProvider({ children }) {
    const { user, isSignedIn, isLoaded } = useUser();
    const [reminders, setReminders] = useState([]);
    const [notificationPermission, setNotificationPermission] = useState("default");
    const initialized = useRef(false);
    const saveTimeout = useRef(null);

    useEffect(() => {
        if (typeof window !== "undefined" && "Notification" in window) {
            setNotificationPermission(window.Notification.permission);
        }
    }, []);

    useEffect(() => {
        if (!isLoaded) return;
        initialized.current = false;

        try {
            if (isSignedIn && user) {
                const savedReminders = user.unsafeMetadata?.releaseReminders;
                const accountReminders = Array.isArray(savedReminders) ? savedReminders.map(normalizeReminder) : [];
                const guestReminders = readStoredJson(STORAGE_KEY, []).map(normalizeReminder);
                const mergedReminders = mergeReleaseReminders(accountReminders, guestReminders);

                setReminders(mergedReminders);

                if (guestReminders.length > 0 && hasGuestMergeChanges(accountReminders, mergedReminders)) {
                    void saveUnsafeMetadata(user, { releaseReminders: mergedReminders }).then(() => {
                        clearStoredKeys([STORAGE_KEY]);
                    }).catch((error) => {
                        console.error("Failed to merge guest reminders into Clerk:", error);
                    });
                } else if (guestReminders.length > 0) {
                    clearStoredKeys([STORAGE_KEY]);
                }
            } else {
                setReminders(readStoredJson(STORAGE_KEY, []).map(normalizeReminder));
            }
        } catch (error) {
            console.error("Failed to load release reminders:", error);
            setReminders([]);
        } finally {
            setTimeout(() => { initialized.current = true; }, 100);
        }
    }, [user, isSignedIn, isLoaded]);

    useEffect(() => {
        if (!isLoaded || !initialized.current) return;
        if (saveTimeout.current) clearTimeout(saveTimeout.current);

        saveTimeout.current = setTimeout(() => {
            if (isSignedIn && user) {
                saveUnsafeMetadata(user, { releaseReminders: reminders }).catch((error) => {
                    console.error("Failed to save reminders to Clerk:", error);
                    try {
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
                    } catch { /* ignore */ }
                });
            } else {
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
                } catch { /* ignore */ }
            }
        }, 800);

        return () => {
            if (saveTimeout.current) clearTimeout(saveTimeout.current);
        };
    }, [reminders, user, isSignedIn, isLoaded]);

    const requestNotificationPermission = useCallback(async () => {
        if (typeof window === "undefined" || !("Notification" in window)) {
            setNotificationPermission("unsupported");
            return "unsupported";
        }

        const permission = await window.Notification.requestPermission();
        setNotificationPermission(permission);
        return permission;
    }, []);

    const addReminder = useCallback(async (item, date, note = "") => {
        if (!item?.id || !date) return null;
        const reminder = minifyReminder(item, date, note);
        setReminders((prev) => (
            prev.some((entry) => entry.key === reminder.key)
                ? prev
                : [reminder, ...prev].sort((a, b) => String(a.date).localeCompare(String(b.date)))
        ));
        return reminder;
    }, []);

    const removeReminder = useCallback(async (id, type = "movie", date = "") => {
        const key = reminderKey(id, type, date);
        setReminders((prev) => prev.filter((reminder) => reminder.key !== key));
    }, []);

    const toggleReminder = useCallback(async (item, date, note = "") => {
        const type = getType(item);
        const key = reminderKey(item.id, type, date);
        if (reminders.some((reminder) => reminder.key === key)) {
            await removeReminder(item.id, type, date);
            return false;
        }
        await addReminder({ ...item, type }, date, note);
        return true;
    }, [addReminder, removeReminder, reminders]);

    const hasReminder = useCallback((id, type = "movie", date = "") => {
        const key = reminderKey(id, type, date);
        return reminders.some((reminder) => reminder.key === key);
    }, [reminders]);

    useEffect(() => {
        if (notificationPermission !== "granted" || typeof window === "undefined" || !("Notification" in window)) return;

        const notifyDueReminders = () => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            setReminders((prev) => prev.map((reminder) => {
                if (reminder.notificationStatus === "sent" || !reminder.date) return reminder;

                const reminderDate = new Date(`${reminder.date}T00:00:00`);
                if (Number.isNaN(reminderDate.getTime()) || reminderDate > today) return reminder;

                try {
                    new window.Notification(`${reminder.title} is out`, {
                        body: reminder.type === "tv" ? "A saved episode or show release is due today." : "A saved movie release is due today.",
                        icon: reminder.poster_path ? `https://image.tmdb.org/t/p/w92${reminder.poster_path}` : "/movie.png",
                    });
                } catch {
                    return reminder;
                }

                return { ...reminder, notificationStatus: "sent", notifiedAt: new Date().toISOString() };
            }));
        };

        notifyDueReminders();
        const interval = window.setInterval(notifyDueReminders, 60 * 60 * 1000);
        return () => window.clearInterval(interval);
    }, [notificationPermission]);

    const upcomingReminders = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return reminders
            .filter((reminder) => {
                const date = new Date(`${reminder.date}T00:00:00`);
                return !Number.isNaN(date.getTime()) && date >= today;
            })
            .sort((a, b) => String(a.date).localeCompare(String(b.date)));
    }, [reminders]);

    const value = useMemo(() => ({
        reminders,
        upcomingReminders,
        notificationPermission,
        requestNotificationPermission,
        addReminder,
        removeReminder,
        toggleReminder,
        hasReminder,
    }), [reminders, upcomingReminders, notificationPermission, requestNotificationPermission, addReminder, removeReminder, toggleReminder, hasReminder]);

    return (
        <ReminderContext.Provider value={value}>
            {children}
        </ReminderContext.Provider>
    );
}

export function useReminders() {
    const context = useContext(ReminderContext);
    if (!context) {
        return {
            reminders: [],
            upcomingReminders: [],
            notificationPermission: "default",
            requestNotificationPermission: async () => "default",
            addReminder: async () => null,
            removeReminder: async () => {},
            toggleReminder: async () => false,
            hasReminder: () => false,
        };
    }
    return context;
}
