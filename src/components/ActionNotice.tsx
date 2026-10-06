"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { X } from "lucide-react";

type Notice = { message: string; undo: () => void; owner: string; id: number };
type Notify = (message: string, undo: () => void) => void;
const Context = createContext<Notify>(() => {});
export function ActionNoticeProvider({ children }: { children: React.ReactNode }) {
    const { user } = useUser();
    const owner = user?.id || 'guest';
    const [notice, setNotice] = useState<Notice | null>(null);
    const notify = useCallback<Notify>((message, undo) => setNotice({ message, undo, owner, id: Date.now() }), [owner]);
    useEffect(() => {
        if (!notice) return;
        const timer = setTimeout(() => setNotice(null), 10000);
        return () => clearTimeout(timer);
    }, [notice]);
    return <Context.Provider value={notify}>{children}
        {notice && notice.owner === owner && <aside className="fixed bottom-24 right-4 z-[80] flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-xl border border-white/20 bg-bg-surface p-3 text-sm text-white shadow-2xl lg:bottom-6">
            <p className="min-w-0 break-words" role="status" aria-live="polite">{notice.message}</p>
            <button type="button" className="min-h-11 shrink-0 px-2 text-accent-primary underline" onClick={() => { notice.undo(); setNotice(null); }}>Undo</button>
            <button type="button" aria-label="Dismiss notification" className="flex min-h-11 min-w-11 items-center justify-center" onClick={() => setNotice(null)}><X size={18} /></button>
        </aside>}
    </Context.Provider>;
}
export function useActionNotice() { return useContext(Context); }
