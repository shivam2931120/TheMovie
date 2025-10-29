export default function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;
  const canPrev = page > 1;
  const canNext = page < totalPages;
  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <button
        className="rounded border border-neutral-700 px-3 py-1 text-sm text-neutral-200 disabled:opacity-40"
        disabled={!canPrev}
        onClick={() => onChange(page - 1)}
      >
        Previous
      </button>
      <span className="text-sm text-neutral-400">Page {page} of {Math.min(totalPages, 500)}</span>
      <button
        className="rounded border border-neutral-700 px-3 py-1 text-sm text-neutral-200 disabled:opacity-40"
        disabled={!canNext}
        onClick={() => onChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
}
