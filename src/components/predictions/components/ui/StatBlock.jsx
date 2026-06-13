import React from "react";
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function StatBlock({ label, value, help, mono, accent }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 transition-all hover:bg-white/[0.06]",
        accent
          ? "border-l-2 border-l-current"
          : "",
        accent === "emerald" && "border-emerald-500/50 bg-emerald-500/5",
        accent === "rose" && "border-rose-500/50 bg-rose-500/5",
        accent === "amber" && "border-amber-500/50 bg-amber-500/5",
      )}
    >
      <div className="text-[10px] uppercase tracking-wider font-semibold text-white/60 flex items-center gap-1">
        {label}
        {help ? (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger>
                <QuestionMarkCircledIcon className="h-3 w-3" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                {help}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : null}
      </div>
      <div
        className={cn(
          "mt-1 text-sm font-semibold text-white",
          mono && "font-mono tabular-nums",
        )}
      >
        {value}
      </div>
    </div>
  );
}