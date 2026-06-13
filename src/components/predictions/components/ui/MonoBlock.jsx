import React from "react";
import { CopyButton } from "./CopyButton";

export function MonoBlock({ value, truncate, copyable, label }) {
  const display =
    truncate && value && value.length > truncate
      ? `${value.slice(0, Math.floor(truncate / 2))}\u2026${value.slice(
          -Math.floor(truncate / 2),
        )}`
      : value;
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs">
      <span className="break-all">{display}</span>
      {copyable && value ? <CopyButton value={value} label={label} /> : null}
    </span>
  );
}