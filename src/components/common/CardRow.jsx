import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";
import { Info } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Button } from "@/components/ui/button";

export default function CardRow(properties) {
  const { t, i18n } = useTranslation(locale.get(), { i18n: i18nInstance });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const handleTooltipClick = (e) => {
    e.stopPropagation();
    if (!dialogOpen) {
      setDialogOpen(true);
    }
  };

  return (
    <div className="col-span-1" key={`${properties.dialogtitle}`}>
      <div className="grid grid-cols-10 items-center gap-2">
        <div className="col-span-4 text-[11px] font-medium uppercase tracking-wider text-white/45">
          {properties.title}
        </div>
        <div className="col-span-5 mr-2 min-w-0">
          <div className="w-full rounded-md border border-white/[0.08] bg-slate-950/40 px-2.5 py-1 text-xs text-white/85 font-mono tabular-nums truncate">
            {properties.button}
          </div>
        </div>
        <div className="col-span-1">
          <TooltipProvider>
            <Dialog
              open={dialogOpen}
              onOpenChange={(open) => {
                setDialogOpen(open);
                setTooltipOpen(false);
              }}
            >
              <DialogContent
                style={{ backgroundColor: "#020617" }}
                className="sm:max-w-[400px] !bg-slate-950 border border-white/10 text-white/85"
              >
                <DialogHeader>
                  <DialogTitle className="text-white">
                    {properties.dialogtitle}
                  </DialogTitle>
                  <div className="text-white/65 [&_ul]:text-white/65 [&_li]:text-white/65">
                    {properties.dialogdescription}
                  </div>
                </DialogHeader>
              </DialogContent>
              <Tooltip>
                <TooltipTrigger
                  asChild
                  open={tooltipOpen}
                  onMouseOver={() => {
                    setTooltipOpen(true);
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6 border-white/[0.08] bg-slate-950/40 text-white/40 hover:text-cyan-200 hover:border-cyan-400/40 hover:bg-cyan-500/10"
                      onClick={handleTooltipClick}
                      aria-label={properties.tooltip}
                    >
                      <Info className="h-3 w-3" />
                    </Button>
                  </DialogTrigger>
                </TooltipTrigger>
                {tooltipOpen && (
                  <TooltipContent className="!bg-slate-950 border border-white/10 text-white/85">
                    {properties.tooltip}
                  </TooltipContent>
                )}
              </Tooltip>
            </Dialog>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
