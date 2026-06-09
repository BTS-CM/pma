import React from "react";

import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

export default function CardRowPlaceholder(properties) {
  return (
    <div className="col-span-1" key={`${properties.dialogtitle}`}>
      <div className="grid grid-cols-10 items-center gap-2">
        <div className="col-span-4 text-[11px] font-medium uppercase tracking-wider text-white/45">
          {properties.title}
        </div>
        <div className="col-span-5 mr-2 min-w-0">
          <div className="h-5 w-full rounded-md border border-white/[0.08] bg-slate-950/40 animate-pulse" />
        </div>
        <div className="col-span-1">
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6 border-white/[0.08] bg-slate-950/40 text-white/40 cursor-default"
            disabled
            aria-label="Help"
          >
            <Info className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
