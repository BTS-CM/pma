import React from "react";

export function ProbabilityBar({ yesPercent }) {
  const clamped = Math.max(0, Math.min(100, Number(yesPercent) || 0));
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-medium">
        <span className="text-emerald-400">
          YES {clamped.toFixed(1)}%
        </span>
        <span className="text-rose-400">
          NO {(100 - clamped).toFixed(1)}%
        </span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-rose-500/20">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}