import React from "react";
import { TrendingUp } from "lucide-react";
import { StatBlock, ProbabilityBar } from "../../ui";
import { Button } from "@/components/ui/button";
import { humanReadableFloat } from "@/lib/common.js";

export function MarketTab({ res, isExpired, relevantCallOrders, totalBets, settlementFundRaw, impliedYesPercent, market, t }) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {!isExpired ? (
        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
          <div className="text-[11px] uppercase tracking-wide text-white/60 mb-1.5">{t("Predictions:market.impliedProbability")}</div>
          <ProbabilityBar yesPercent={impliedYesPercent} />
          <div className="mt-1.5 text-[11px] text-white/40">{t("Predictions:market.impliedProbability_help")}</div>
        </div>
      ) : (
        <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
          <span className="text-white/50">{t("Predictions:market.expiredNote")}</span>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatBlock label={t("Predictions:openInterest")} help={t("Predictions:openInterest_help")} value={`${humanReadableFloat(totalBets, res.precision)} ${market}`} mono />
        <StatBlock label={t("Predictions:market.settlementFund")} help={t("Predictions:market.settlementFund_help")} value={`${humanReadableFloat(settlementFundRaw, res.precision)} ${market}`} mono />
        <StatBlock label={t("Predictions:unique_sellers")} value={relevantCallOrders ? relevantCallOrders.length : 0} mono />
        <StatBlock
          label={t("Predictions:market.commission")}
          help={t("Predictions:market.commission_help")}
          value={res.options?.market_fee_percent ? `${(res.options.market_fee_percent / 100).toFixed(2)}%` : "0%"}
          mono
        />
      </div>
      {!isExpired ? (
        <Button variant="outline" size="sm" asChild className="w-fit">
          <a href={`/dex.html?market=${res.symbol}_${market}`}>
            <TrendingUp className="mr-2 h-3.5 w-3.5" />
            {t("Predictions:market.tradeOnDex")}
          </a>
        </Button>
      ) : null}
    </div>
  );
}