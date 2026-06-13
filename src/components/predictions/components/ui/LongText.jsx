import React from "react";

export function LongText({ label, value }) {
  if (!value) return null;
  return (
    <div className="rounded-md border border-white/10 bg-white/5 p-3">
      {label ? (
        <div className="text-[11px] uppercase tracking-wide text-white/60 mb-1">
          {label}
        </div>
      ) : null}
      <div className="whitespace-pre-wrap break-words text-sm">{value}</div>
    </div>
  );
}