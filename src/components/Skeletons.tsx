export function MovieCardSkeleton() {
    return (
        <div className="relative rounded-xl overflow-hidden cursor-pointer animate-pulse">
            {/* Poster Skeleton */}
            <div className="relative aspect-[2/3] w-full bg-white/5">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80" />
            </div>

            {/* Title & Metadata Skeleton */}
            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
                <div className="flex items-center gap-2 mt-1">
                    <div className="h-3 bg-white/10 rounded w-12" />
                    <div className="h-3 bg-white/10 rounded w-12" />
                </div>
            </div>
        </div>
    );
}

export function MovieRowSkeleton({ count = 5 }: { count?: number }) {
    return (
        <div className="py-6 sm:py-8 space-y-3 sm:space-y-4">
            <div className="container mx-auto px-4 sm:px-6 lg:px-20 flex items-center justify-between">
                <div className="h-6 bg-white/10 rounded w-48 animate-pulse" />
            </div>

            <div className="flex gap-3 sm:gap-4 overflow-x-auto hide-scrollbar px-4 sm:px-6 lg:px-20">
                {[...Array(count)].map((_, i) => (
                    <div key={i} className="min-w-[140px] sm:min-w-[160px] md:min-w-[200px] lg:min-w-[240px]">
                        <MovieCardSkeleton />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function HeroSkeleton() {
    return (
        <section className="relative h-[70vh] sm:h-[85vh] w-full overflow-hidden bg-bg-card animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-bg-main via-bg-main/50 to-transparent z-10 opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-main via-transparent to-transparent z-10" />

            <div className="relative z-20 h-full container mx-auto px-4 sm:px-6 lg:px-20 flex flex-col justify-center">
                <div className="max-w-2xl space-y-4">
                    <div className="h-8 bg-white/10 rounded w-24" />
                    <div className="h-16 bg-white/10 rounded w-full" />
                    <div className="h-4 bg-white/10 rounded w-3/4" />
                    <div className="flex items-center gap-4 mt-6">
                        <div className="h-12 bg-white/10 rounded-lg w-40" />
                        <div className="h-12 bg-white/10 rounded-lg w-32" />
                    </div>
                </div>
            </div>
        </section>
    );
}
