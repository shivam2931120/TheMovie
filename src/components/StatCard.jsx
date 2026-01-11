export default function StatCard({
    title,
    value,
    subtitle,
    Icon,
    color = "red",
    className = ""
}) {
    const colorClasses = {
        red: "from-[#E10600]/20 to-[#B80500]/10 border-[#E10600]/30",
        green: "from-[#22C55E]/20 to-[#16A34A]/10 border-[#22C55E]/30",
        amber: "from-[#F59E0B]/20 to-[#D97706]/10 border-[#F59E0B]/30",
        blue: "from-[#3B82F6]/20 to-[#2563EB]/10 border-[#3B82F6]/30",
        purple: "from-[#8B5CF6]/20 to-[#7C3AED]/10 border-[#8B5CF6]/30",
    };

    const iconColors = {
        red: "text-[#E10600]",
        green: "text-[#22C55E]",
        amber: "text-[#F59E0B]",
        blue: "text-[#3B82F6]",
        purple: "text-[#8B5CF6]",
    };

    return (
        <div
            className={`rounded-xl border bg-gradient-to-br p-5 ${colorClasses[color]} ${className}`}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-neutral-400">{title}</p>
                    <p className="mt-1 text-3xl font-bold text-white">{value}</p>
                    {subtitle && (
                        <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>
                    )}
                </div>
                {Icon && (
                    <Icon className={`w-7 h-7 ${iconColors[color]}`} />
                )}
            </div>
        </div>
    );
}
