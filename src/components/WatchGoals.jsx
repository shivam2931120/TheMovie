import { useState } from "react";
import { useGoals } from "../context/GoalsContext";
import { TargetIcon, EditIcon, CheckIcon } from "./Icons";

export default function WatchGoals({ currentCount, period = "monthly" }) {
    const { goals, updateGoals } = useGoals();
    const [editing, setEditing] = useState(false);
    const [inputValue, setInputValue] = useState(
        period === "monthly" ? goals.monthly : goals.yearly
    );

    const goal = period === "monthly" ? goals.monthly : goals.yearly;
    const progress = Math.min((currentCount / goal) * 100, 100);
    const remaining = Math.max(goal - currentCount, 0);

    const handleSave = () => {
        const value = parseInt(inputValue) || 1;
        updateGoals({
            [period]: Math.max(1, value),
        });
        setEditing(false);
    };

    const getProgressColor = () => {
        if (progress >= 100) return "from-[#22C55E] to-[#16A34A]";
        if (progress >= 70) return "from-[#22C55E] to-[#16A34A]";
        if (progress >= 40) return "from-[#F59E0B] to-[#D97706]";
        return "from-[#E10600] to-[#B80500]";
    };

    return (
        <div className="rounded-xl border border-[#1A1A1A] bg-[#0D0D0D] p-5">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white capitalize flex items-center gap-2">
                    <TargetIcon className="w-5 h-5 text-[#E10600]" />
                    {period} Goal
                </h3>
                <button
                    onClick={() => setEditing(!editing)}
                    className="text-xs text-[#E10600] hover:text-[#FF4444] transition flex items-center gap-1"
                >
                    <EditIcon className="w-3 h-3" />
                    {editing ? "Cancel" : "Edit"}
                </button>
            </div>

            {editing ? (
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        min="1"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="w-20 rounded-lg border border-[#2A2A2A] bg-[#141414] px-2 py-1 text-white focus:border-[#E10600]"
                    />
                    <span className="text-neutral-400">movies</span>
                    <button
                        onClick={handleSave}
                        className="ml-auto rounded-lg bg-gradient-to-r from-[#E10600] to-[#B80500] px-3 py-1 text-sm text-white hover:shadow-[0_0_15px_rgba(225,6,0,0.3)] flex items-center gap-1"
                    >
                        <CheckIcon className="w-4 h-4" /> Save
                    </button>
                </div>
            ) : (
                <>
                    <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-4xl font-bold text-white">{currentCount}</span>
                        <span className="text-neutral-400">/ {goal}</span>
                    </div>

                    {/* Progress bar */}
                    <div className="h-3 w-full rounded-full bg-[#1A1A1A] overflow-hidden">
                        <div
                            className={`h-full rounded-full bg-gradient-to-r ${getProgressColor()} transition-all duration-500 shadow-lg`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="mt-3 flex justify-between text-sm">
                        <span className="text-neutral-400">
                            {progress >= 100 ? (
                                <span className="text-[#22C55E] flex items-center gap-1">
                                    <CheckIcon className="w-4 h-4" /> Goal achieved!
                                </span>
                            ) : (
                                `${remaining} more to go`
                            )}
                        </span>
                        <span className="font-medium text-[#E10600]">{progress.toFixed(0)}%</span>
                    </div>
                </>
            )}
        </div>
    );
}
