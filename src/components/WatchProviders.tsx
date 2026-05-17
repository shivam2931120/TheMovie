"use client";

import Image from "next/image";
import { ExternalLink, MapPin } from "lucide-react";

interface Provider {
    provider_id: number;
    provider_name: string;
    logo_path: string;
}

interface ProviderRegion {
    link?: string;
    flatrate?: Provider[];
    free?: Provider[];
    ads?: Provider[];
    rent?: Provider[];
    buy?: Provider[];
}

interface WatchProvidersProps {
    providers?: ProviderRegion | null;
    availableRegions: string[];
    selectedRegion: string;
    onRegionChange: (region: string) => void;
}

const PROVIDER_GROUPS: Array<{ key: keyof ProviderRegion; label: string }> = [
    { key: "flatrate", label: "Stream" },
    { key: "free", label: "Free" },
    { key: "ads", label: "Ads" },
    { key: "rent", label: "Rent" },
    { key: "buy", label: "Buy" },
];

export function WatchProviders({ providers, availableRegions, selectedRegion, onRegionChange }: WatchProvidersProps) {
    const hasProviders = PROVIDER_GROUPS.some(({ key }) => Array.isArray(providers?.[key]) && providers?.[key]?.length);

    return (
        <section className="bg-bg-card border border-white/10 rounded-xl p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                    <h3 className="text-lg font-bold text-white">Where to Watch</h3>
                    <p className="text-xs text-text-muted">Availability changes by region</p>
                </div>
                <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-text-muted" />
                    <select
                        value={selectedRegion}
                        onChange={(event) => onRegionChange(event.target.value)}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-accent-primary focus:outline-none"
                    >
                        {availableRegions.map((region) => (
                            <option key={region} value={region} className="bg-bg-card">
                                {region}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {hasProviders ? (
                <div className="space-y-4">
                    {PROVIDER_GROUPS.map(({ key, label }) => {
                        const items = providers?.[key] as Provider[] | undefined;
                        if (!items?.length) return null;

                        return (
                            <div key={key}>
                                <div className="mb-2 text-xs font-semibold uppercase text-text-muted">{label}</div>
                                <div className="flex flex-wrap gap-3">
                                    {items.map((provider) => (
                                        <div key={`${key}-${provider.provider_id}`} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-2">
                                            <Image
                                                src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                                                alt={provider.provider_name}
                                                width={32}
                                                height={32}
                                                className="rounded-md"
                                            />
                                            <span className="max-w-[120px] truncate text-xs font-medium text-white">
                                                {provider.provider_name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {providers?.link && (
                        <a
                            href={providers.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-xs font-medium text-accent-primary hover:underline"
                        >
                            Open provider page
                            <ExternalLink size={14} />
                        </a>
                    )}
                </div>
            ) : (
                <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-text-secondary">
                    No providers are listed for this region.
                </div>
            )}
        </section>
    );
}
