import { useEffect, useState } from "react";
import { getGenres } from "../api/omdb";

export default function Filters({ value, onChange, onClear }) {
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    getGenres().then(setGenres).catch(() => setGenres([]));
  }, []);

  const [local, setLocal] = useState(value || {});
  useEffect(() => setLocal(value || {}), [value]);

  const apply = () => onChange?.(local);
  const clear = () => onClear?.();

  return (
    <div className="mb-6 rounded-lg border border-neutral-800 bg-neutral-900/60 p-3">
      <div className="grid grid-cols-1 gap-3">
        <Select label="Genre" value={local.genreId || ""} onChange={(v) => setLocal({ ...local, genreId: v || undefined })}>
          <option value="">All</option>
          {genres.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </Select>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button className="rounded border border-neutral-700 px-3 py-1 text-sm text-neutral-200 hover:bg-neutral-800" onClick={apply}>Apply</button>
        <button className="rounded border border-neutral-700 px-3 py-1 text-sm text-neutral-300 hover:bg-neutral-800" onClick={clear}>Clear</button>
      </div>
    </div>
  );
}

function Select({ label, value, onChange, children }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-neutral-400">{label}</span>
      <select
        className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1 text-neutral-100"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      >
        {children}
      </select>
    </label>
  );
}
