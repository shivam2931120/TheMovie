"use client";

import { Bell, BellOff } from "lucide-react";
import clsx from "clsx";
import { useReminders } from "@/context/ReminderContext";

interface ReminderItem {
    id: number;
    title?: string;
    name?: string;
    poster_path?: string | null;
    type?: "movie" | "tv";
}

interface ReminderButtonProps {
    item: ReminderItem;
    date?: string | null;
    note?: string;
    className?: string;
}

export function ReminderButton({ item, date, note = "", className }: ReminderButtonProps) {
    const { hasReminder, toggleReminder, requestNotificationPermission, notificationPermission } = useReminders() as any;
    const type = item.type || (item.name && !item.title ? "tv" : "movie");
    const isSaved = date ? hasReminder(item.id, type, date) : false;

    const handleClick = async () => {
        if (!date) return;
        const added = await toggleReminder({ ...item, type }, date, note);
        if (added && notificationPermission === "default") {
            await requestNotificationPermission();
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={!date}
            className={clsx(
                "inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50",
                isSaved
                    ? "border-accent-primary bg-accent-primary text-white"
                    : "border-white/10 bg-white/5 text-text-secondary hover:bg-white/10 hover:text-white",
                className
            )}
        >
            {isSaved ? <BellOff size={16} /> : <Bell size={16} />}
            {isSaved ? "Reminder Set" : "Remind Me"}
        </button>
    );
}
