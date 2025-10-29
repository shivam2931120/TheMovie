export default function RatingBadge({ value }) {
  if (value == null) return null;
  const color = value >= 7.5 ? "bg-emerald-600" : value >= 6 ? "bg-yellow-600" : "bg-red-600";
  return (
    <div className={`absolute top-2 left-2 rounded-full px-2 py-1 text-xs font-semibold text-white ${color} bg-opacity-90`}>⭐ {value?.toFixed?.(1) ?? value}</div>
  );
}
