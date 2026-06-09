import React from "react";
import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";
import { Coins, ExternalLink, FileJson, Info, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import CardRowPlaceholder from "../common/CardRowPlaceholder.jsx";

export default function MarketAssetCard(properties) {
  const { type } = properties;
  const { t, i18n } = useTranslation(locale.get(), { i18n: i18nInstance });

  const typeAccent = {
    buy: "from-cyan-400/70",
    sell: "from-emerald-400/70",
    pool: "from-amber-400/70",
  }[type] || "from-cyan-400/70";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 backdrop-blur-xl shadow-xl shadow-black/30">
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r to-transparent",
          typeAccent,
        )}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-cyan-500/[0.06] blur-3xl"
      />
      <div className="relative p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-semibold text-white/40 tracking-tight">
                1.3.x
              </h3>
            </div>
            <div className="text-xs text-white/30 mt-0.5">
              {type === "buy" ? (
                <>
                  <span>{t("MarketAssetCard:quoteAsset")}</span>
                  <span className="text-white/20"> · </span>
                  <span>{t("MarketAssetCard:buying")}</span>
                </>
              ) : null}
              {type === "sell" ? (
                <>
                  <span>{t("MarketAssetCard:baseAsset")}</span>
                  <span className="text-white/20"> · </span>
                  <span>{t("MarketAssetCard:selling")}</span>
                </>
              ) : null}
              {type === "pool" ? (
                <span>{t("MarketAssetCard:poolStakeAsset")}</span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            disabled
            className="h-8 gap-1.5 border-white/[0.08] bg-slate-950/40 text-white/30 text-xs"
          >
            <Coins className="h-3 w-3 text-cyan-300/50" />
            {t("MarketAssetCard:supply")}
          </Button>

          <Button
            variant="outline"
            disabled
            className="h-8 gap-1.5 border-white/[0.08] bg-slate-950/40 text-white/30 text-xs"
          >
            <ExternalLink className="h-3 w-3 text-violet-300/50" />
            {t("MarketAssetCard:links")}
          </Button>

          <Button
            variant="outline"
            disabled
            className="h-8 gap-1.5 border-white/[0.08] bg-slate-950/40 text-white/30 text-xs"
          >
            <FileJson className="h-3 w-3 text-amber-300/50" />
            {t("MarketAssetCard:json")}
          </Button>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-1.5 w-full">
          <CardRowPlaceholder
            title={t("MarketAssetCard:yourBalance")}
            dialogtitle={"balance"}
          />

          <CardRowPlaceholder
            title={t("MarketAssetCard:assetType")}
            dialogtitle={"assetType"}
          />

          <CardRowPlaceholder
            title={t("MarketAssetCard:issuer")}
            dialogtitle={"issuer"}
          />

          <CardRowPlaceholder
            title={t("MarketAssetCard:precision")}
            dialogtitle={"precision"}
          />
        </div>
      </div>
    </div>
  );
}
