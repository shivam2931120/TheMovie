"use client";

import { trapDialogFocus } from "@/lib/dialogFocus";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export function TrailerDialog({ videoKey, title, onClose }: { videoKey: string; title: string; onClose: () => void }) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    useEffect(() => {
        const dialog = dialogRef.current;
        const trigger = document.activeElement as HTMLElement | null;
        const overflow = document.body.style.overflow;
        dialog?.showModal();
        document.body.style.overflow = "hidden";
        return () => {
            dialog?.close();
            document.body.style.overflow = overflow;
            if (trigger?.isConnected) trigger.focus();
        };
    }, []);
    return (
        <dialog onKeyDown={trapDialogFocus} ref={dialogRef} aria-label={`Trailer for ${title}`} onCancel={event => { event.preventDefault(); onClose(); }}
            onClick={event => { if (event.target === event.currentTarget) onClose(); }}
            className="m-auto w-[calc(100%_-_2rem)] max-w-6xl max-h-[90dvh] overflow-auto rounded-2xl border border-white/15 bg-bg-main p-0 text-white backdrop:bg-black/90 backdrop:backdrop-blur-sm">
            <header className="flex items-center justify-between gap-4 px-4 py-2">
                <h2 className="truncate text-sm font-medium">{title} — Trailer</h2>
                <button autoFocus type="button" onClick={onClose} aria-label="Close trailer" className="flex min-h-11 min-w-11 items-center justify-center rounded-full hover:bg-white/10"><X size={22} /></button>
            </header>
            <iframe key={videoKey} src={`https://www.youtube.com/embed/${encodeURIComponent(videoKey)}?autoplay=1&rel=0`}
                title={`Trailer for ${title}`} className="aspect-video w-full border-0" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
        </dialog>
    );
}
