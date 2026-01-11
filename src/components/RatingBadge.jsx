export default function RatingBadge({ value }) {
  if (!value || value === "N/A") return null;

  const numValue = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(numValue)) return null;

  // Color based on rating
  const getColor = () => {
    if (numValue >= 8) return "from-[#22C55E] to-[#16A34A]"; // Green for excellent
    if (numValue >= 6) return "from-[#E10600] to-[#B80500]"; // Red for good
    if (numValue >= 4) return "from-[#F59E0B] to-[#D97706]"; // Orange for average
    return "from-[#6B7280] to-[#4B5563]"; // Gray for poor
  };

  return (
    <div className={`absolute left-2 bottom-2 z-10 flex items-center gap-1 rounded-lg bg-gradient-to-r ${getColor()} px-2 py-1 text-xs font-bold text-white shadow-lg`}>
      <span className="text-[10px]">⭐</span>
      <span>{numValue.toFixed(1)}</span>
    </div>
  );
}
