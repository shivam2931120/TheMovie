export default function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-lg bg-neutral-900 ring-1 ring-neutral-800">
      <div className="aspect-[2/3] w-full bg-neutral-800" />
      <div className="p-2">
        <div className="h-4 w-3/4 rounded bg-neutral-800" />
      </div>
    </div>
  );
}
