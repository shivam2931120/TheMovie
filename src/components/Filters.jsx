import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { enhancedGenres } from "../api/enhanced";
import { queryKeys } from "../lib/queryClient";

export default function Filters({ value, onChange, onClear }) {
  const { data: genres = [] } = useQuery({
    queryKey: queryKeys.genres,
    queryFn: enhancedGenres,
    staleTime: 1000 * 60 * 60,
  });

  const [local, setLocal] = useState(value || {});
  useEffect(() => setLocal(value || {}), [value]);

  const apply = () => onChange?.(local);
  const clear = () => onClear?.();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <div className="mb-6 rounded-xl border border-[#1A1A1A] bg-[#0D0D0D] p-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {/* Genre */}
        <Select
          label="Genre"
          value={local.genreId || ""}
          onChange={(v) => setLocal({ ...local, genreId: v || undefined })}
        >
          <option value="">All Genres</option>
          {genres.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </Select>

        {/* Year */}
        <Select
          label="Year"
          value={local.year || ""}
          onChange={(v) => setLocal({ ...local, year: v || undefined })}
        >
          <option value="">Any Year</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </Select>

        {/* Min Rating */}
        <Select
          label="Min Rating"
          value={local.rating || ""}
          onChange={(v) => setLocal({ ...local, rating: v || undefined })}
        >
          <option value="">Any Rating</option>
          <option value="9">9+ Excellent</option>
          <option value="8">8+ Great</option>
          <option value="7">7+ Good</option>
          <option value="6">6+ Above Average</option>
          <option value="5">5+ Average</option>
        </Select>

        {/* Sort By */}
        <Select
          label="Sort By"
          value={local.sortBy || "popularity.desc"}
          onChange={(v) => setLocal({ ...local, sortBy: v })}
        >
          <option value="popularity.desc">Most Popular</option>
          <option value="vote_average.desc">Highest Rated</option>
          <option value="primary_release_date.desc">Newest First</option>
          <option value="primary_release_date.asc">Oldest First</option>
          <option value="revenue.desc">Highest Grossing</option>
        </Select>
      </div>

      <div className="mt-4 flex items-center gap-3 flex-wrap">
        <button
          className="rounded-lg bg-gradient-to-r from-[#E10600] to-[#B80500] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[#E10600]/20 hover:shadow-[#E10600]/40 transition"
          onClick={apply}
        >
          Apply Filters
        </button>
        <button
          className="rounded-lg border border-[#2A2A2A] bg-[#141414] px-5 py-2 text-sm text-neutral-300 hover:border-[#E10600] hover:text-white transition"
          onClick={clear}
        >
          Clear All
        </button>

        {/* Active filters display */}
        {(local.genreId || local.year || local.rating) && (
          <div className="flex flex-wrap gap-2 ml-2">
            {local.genreId && (
              <span className="rounded-full bg-[#E10600]/20 border border-[#E10600]/30 px-3 py-1 text-xs text-[#FF4444]">
                {genres.find(g => g.id == local.genreId)?.name || 'Genre'}
              </span>
            )}
            {local.year && (
              <span className="rounded-full bg-[#E10600]/20 border border-[#E10600]/30 px-3 py-1 text-xs text-[#FF4444]">
                {local.year}
              </span>
            )}
            {local.rating && (
              <span className="rounded-full bg-[#E10600]/20 border border-[#E10600]/30 px-3 py-1 text-xs text-[#FF4444]">
                {local.rating}+ ⭐
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Select({ label, value, onChange, children }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-neutral-400">{label}</span>
      <select
        className="w-full rounded-lg border border-[#2A2A2A] bg-[#141414] px-3 py-2 text-white focus:border-[#E10600] focus:outline-none transition"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      >
        {children}
      </select>
    </label>
  );
}
