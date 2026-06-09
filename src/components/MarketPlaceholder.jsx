import React, { useMemo } from "react";

import { ReloadIcon } from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function SkeletonBar({ className }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "h-4 w-full rounded-md bg-gradient-to-r from-white/[0.03] via-white/[0.08] to-white/[0.03] bg-[length:200%_100%] animate-shimmer",
        className,
      )}
    />
  );
}

function PlaceholderCard({ children, className, accent }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 backdrop-blur-xl shadow-xl shadow-black/30",
        className,
      )}
    >
      {accent ? (
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r to-transparent",
            accent,
          )}
        />
      ) : null}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-cyan-500/[0.06] blur-3xl"
      />
      {children}
    </div>
  );
}

export default function MarketPlaceholder(properties) {
  const { usr, assetA, assetB, assets, marketSearch } = properties;

  const { t, i18n } = useTranslation(locale.get(), { i18n: i18nInstance });

  const assetAData = useMemo(
    () => assets.find((a) => a.symbol === assetA),
    [assets, assetA],
  );
  const assetBData = useMemo(
    () => assets.find((a) => a.symbol === assetB),
    [assets, assetB],
  );

  return (
    <div className="container mx-auto mt-5 mb-5">
      <div className="grid grid-cols-2 gap-5">
        {/* ───────────── Left column ───────────── */}
        <div className="col-span-1">
          {/* Controls card */}
          <PlaceholderCard className="mb-5" accent="from-cyan-400/70">
            <div className="relative p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h3 className="text-sm font-semibold text-white/30 tracking-tight">
                  {usr.chain === "bitshares"
                    ? "Bitshares"
                    : "Bitshares (Testnet)"}
                  <span className="text-white/20 mx-1">·</span>
                  <span className="font-normal">DEX Market controls</span>
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  disabled
                  className="h-8 border-white/[0.08] bg-slate-950/40 text-white/40 text-xs"
                >
                  {assetA}
                </Button>
                <Button
                  variant="outline"
                  disabled
                  className="h-8 border-white/[0.08] bg-slate-950/40 text-white/40"
                >
                  <ReloadIcon className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  disabled
                  className="h-8 border-white/[0.08] bg-slate-950/40 text-white/40 text-xs"
                >
                  {assetB}
                </Button>
              </div>
            </div>
          </PlaceholderCard>

          {/* Buy / Sell pill toggle */}
          <div className="flex gap-2 mb-4">
            <div className="rounded-full border border-white/10 bg-slate-950/80 px-5 py-1.5 text-xs font-medium text-white/25 cursor-default">
              {t("MarketPlaceholder:buyTab")}
            </div>
            <div className="rounded-full border border-white/10 bg-slate-950/80 px-5 py-1.5 text-xs font-medium text-white/25 cursor-default">
              {t("MarketPlaceholder:sellTab")}
            </div>
          </div>

          {/* Limit order form card */}
          <PlaceholderCard>
            <div className="relative p-4 sm:p-5 space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-white/30">
                  {t("MarketPlaceholder:marketLimitOrderFormTitle")}
                </h4>
                <p className="text-xs text-white/20 mt-0.5">
                  {t("MarketPlaceholder:marketLimitOrderFormDescription")}
                </p>
              </div>

              {/* Price */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-white/35">
                    {t("MarketPlaceholder:priceLabel")}
                  </span>
                  <span className="text-[10px] text-white/20">?</span>
                </div>
                <SkeletonBar className="h-9" />
                <p className="text-[10px] text-white/20 mt-1">
                  {t("MarketPlaceholder:pricePerAsset")}
                </p>
              </div>

              {/* Amount */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-white/35">
                    {t("MarketPlaceholder:amountLabel")}
                  </span>
                  <span className="text-[10px] text-white/20">?</span>
                </div>
                <SkeletonBar className="h-9" />
                <p className="text-[10px] text-white/20 mt-1">
                  {t("MarketPlaceholder:amountDescription")}
                </p>
              </div>

              {/* Total */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-white/35">
                    {t("MarketPlaceholder:totalLabel")}
                  </span>
                  <span className="text-[10px] text-white/20">?</span>
                </div>
                <SkeletonBar className="h-9" />
                <p className="text-[10px] text-white/20 mt-1">
                  {t("MarketPlaceholder:totalDescription")}
                </p>
              </div>

              {/* Expiration */}
              <div>
                <span className="text-[11px] font-medium uppercase tracking-wider text-white/35 block mb-1.5">
                  {t("MarketPlaceholder:expirationLabel")}
                </span>
                <SkeletonBar className="h-9" />
                <p className="text-[10px] text-white/20 mt-1">
                  {t("MarketPlaceholder:expirationDescription")}
                </p>
              </div>

              {/* Fee */}
              <div>
                <span className="text-[11px] font-medium uppercase tracking-wider text-white/35 block mb-1.5">
                  {t("MarketPlaceholder:feeLabel")}
                </span>
                <SkeletonBar className="h-9" />
                <p className="text-[10px] text-white/20 mt-1">
                  {t("MarketPlaceholder:feeDescription")}
                </p>
              </div>

              {/* Submit button */}
              <Button
                disabled
                variant="outline"
                className="w-full border-white/[0.08] bg-slate-950/40 text-white/25 cursor-default"
              >
                {t("MarketPlaceholder:submitButton")}
              </Button>
            </div>
          </PlaceholderCard>
        </div>

        {/* ───────────── Right column ───────────── */}
        <div className="col-span-1 space-y-4">
          {/* Asset A card */}
          <PlaceholderCard accent="from-cyan-400/70">
            <div className="relative p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-white/40 tracking-tight">
                    {assetAData ? assetAData.id : "1.3.x"}
                  </h3>
                  <div className="text-xs text-white/25 mt-0.5">
                    {assetA}
                    <span className="text-white/20 mx-1">·</span>
                    <span>{t("Market:quoteAsset")}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <SkeletonBar className="h-4 w-[250px]" />
                <SkeletonBar className="h-4 w-[200px]" />
                <SkeletonBar className="h-4 w-[250px]" />
                <SkeletonBar className="h-4 w-[200px]" />
              </div>
            </div>
          </PlaceholderCard>

          {/* Asset B card */}
          <PlaceholderCard accent="from-emerald-400/70">
            <div className="relative p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-white/40 tracking-tight">
                    {assetBData ? assetBData.id : "1.3.x"}
                  </h3>
                  <div className="text-xs text-white/25 mt-0.5">
                    {assetB}
                    <span className="text-white/20 mx-1">·</span>
                    <span>{t("Market:baseAsset")}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <SkeletonBar className="h-4 w-[250px]" />
                <SkeletonBar className="h-4 w-[200px]" />
                <SkeletonBar className="h-4 w-[250px]" />
                <SkeletonBar className="h-4 w-[200px]" />
              </div>
            </div>
          </PlaceholderCard>

          {/* Market summary card */}
          <PlaceholderCard>
            <div className="relative p-4 sm:p-5">
              <h3 className="text-base sm:text-lg font-semibold text-white/40 tracking-tight">
                {t("MarketPlaceholder:marketSummaryTitle")}
              </h3>
              <p className="text-xs text-white/25 mt-0.5 mb-4">
                {assetA} / {assetB}
              </p>
              <div className="space-y-2">
                <SkeletonBar className="h-4 w-[250px]" />
                <SkeletonBar className="h-4 w-[200px]" />
                <SkeletonBar className="h-4 w-[250px]" />
                <SkeletonBar className="h-4 w-[200px]" />
              </div>
            </div>
          </PlaceholderCard>
        </div>
      </div>
    </div>
  );
}
