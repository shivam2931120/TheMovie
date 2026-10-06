"use client";
import { DiaryInsights } from '@/components/DiaryInsights';
import { LibraryNav } from '@/components/LibraryNav';
import { useDiary } from '@/context/DiaryContext';

export default function DiaryInsightsPage() {
    const { owner } = useDiary();
    return <main className="min-h-screen bg-bg-main pb-28 pt-28"><div className="container mx-auto space-y-6 px-4 sm:px-6 lg:px-20">
        <LibraryNav active="insights" />
        <header><h1 className="font-display text-3xl font-bold text-white">Diary insights</h1><p className="mt-2 text-text-secondary">Explore your watches, ratings and favourites over time.</p></header>
        <DiaryInsights key={owner} />
    </div></main>;
}
