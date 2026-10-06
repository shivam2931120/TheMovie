"use client";
import Link from "next/link";

export function LibraryNav({ active }: { active: string }) {
    return <nav aria-label="Library sections" className="mb-6 flex gap-2 overflow-x-auto border-b border-white/10 pb-3">
        {[['watchlist', 'Watchlist', '/library'], ['watched', 'Watched', '/library?view=watched'], ['lists', 'Lists', '/lists'], ['diary', 'Diary', '/diary'], ['tv', 'TV progress', '/library?view=tv']].map(([key, label, href]) =>
            <Link key={key} href={href} aria-current={active === key ? 'page' : undefined} className={`inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm ${active === key ? 'bg-accent-surface text-white' : 'bg-white/5 text-text-secondary hover:bg-white/10'}`}>{label}</Link>)}
    </nav>;
}
