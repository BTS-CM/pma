import React, { useState } from "react";
import { CheckIcon, CopyIcon, QuestionMarkCircledIcon, ImageIcon } from "@radix-ui/react-icons";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";
import { ipfsUrl } from "@/lib/common.js";

export function CopyButton({ value, label, className }) {
  const { t } = useTranslation(locale.get(), { i18n: i18nInstance });
  const [copied, setCopied] = useState(false);
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Button
            type="button"
            tabIndex={-1}
            variant="ghost"
            size="icon"
            className={cn("h-6 w-6", className)}
            onClick={async (e) => {
              e.stopPropagation();
              e.preventDefault();
              try {
                await navigator.clipboard.writeText(value);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              } catch (err) {
              }
            }}
            aria-label={label || t("Predictions:copy")}
          >
            {copied ? (
              <CheckIcon className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <CopyIcon className="h-3.5 w-3.5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          {copied ? t("Predictions:copied") : label || t("Predictions:copy")}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function MonoBlock({ value, truncate, copyable, label }) {
  const display =
    truncate && value && value.length > truncate
      ? `${value.slice(0, Math.floor(truncate / 2))}…${value.slice(-Math.floor(truncate / 2))}`
      : value;
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs">
      <span className="break-all">{display}</span>
      {copyable && value ? <CopyButton value={value} label={label} /> : null}
    </span>
  );
}

export function StatBlock({ label, value, help, mono, accent }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-accent/30 px-3 py-2 transition-all hover:bg-accent/50",
        accent ? "border-l-2 border-l-current" : "",
        accent === "emerald" && "border-emerald-500/50 bg-emerald-500/5",
        accent === "rose" && "border-rose-500/50 bg-rose-500/5",
        accent === "amber" && "border-amber-500/50 bg-amber-500/5",
      )}
    >
      <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1">
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
      <div className={cn("mt-1 text-sm font-semibold text-foreground", mono && "font-mono tabular-nums")}>
        {value}
      </div>
    </div>
  );
}

export function ProbabilityBar({ yesPercent }) {
  const clamped = Math.max(0, Math.min(100, Number(yesPercent) || 0));
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-medium">
        <span className="text-emerald-400">YES {clamped.toFixed(1)}%</span>
        <span className="text-rose-400">NO {(100 - clamped).toFixed(1)}%</span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-rose-500/20">
        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}

export function NftHero({ images, heroIndex, ipfsGateway }) {
  const { t } = useTranslation(locale.get(), { i18n: i18nInstance });
  const hero = images[heroIndex] || images[0];
  if (!hero) return null;
  const src = ipfsUrl(hero.url, ipfsGateway);
  return (
    <div className="rounded-md border border-border overflow-hidden bg-accent/30 dark:bg-white/5">
      {src ? (
        <img src={src} alt={hero.type} loading="lazy" className="w-full h-auto object-contain max-h-[420px]" onError={(e) => { e.currentTarget.style.display = "none"; }} />
      ) : (
        <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
          <ImageIcon className="mr-2 h-4 w-4" />
          {t("Predictions:nft.noImage")}
        </div>
      )}
    </div>
  );
}

export function NftThumbStrip({ images, heroIndex, setHeroIndex, ipfsGateway }) {
  if (!images || images.length <= 1) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {images.map((img, idx) => {
        const src = ipfsUrl(img.url, ipfsGateway);
        const active = idx === heroIndex;
        return (
          <button key={`thumb-${idx}-${img.url}`} type="button" onClick={() => setHeroIndex(idx)}
            className={cn("h-14 w-14 rounded-md overflow-hidden border-2 transition-colors",
              active ? "border-violet-500 ring-2 ring-violet-500/30" : "border-border hover:border-violet-500/40",
            )} aria-label={`Image ${idx + 1}`}>
            {src ? (
              <img src={src} alt={img.type} loading="lazy" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-accent/40 dark:bg-white/10 text-muted-foreground">
                <ImageIcon className="h-4 w-4" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function LongText({ label, value }) {
  if (!value) return null;
  return (
    <div className="rounded-md border border-border bg-accent/30 dark:bg-white/5 p-3">
      {label ? <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">{label}</div> : null}
      <div className="whitespace-pre-wrap break-words text-sm">{value}</div>
    </div>
  );
}