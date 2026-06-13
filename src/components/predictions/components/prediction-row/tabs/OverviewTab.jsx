import React from "react";
import { StatBlock } from "../../ui";
import { prettifyDate, formatTimeRemaining } from "../../../../utils/formatters";
import { humanReadableFloat } from "@/lib/common.js";

export function OverviewTab({
  res,
  relevantBitassetData,
  relevantCallOrders,
  view,
  isExpired,
  expiration,
  now,
  market,
  totalBets,
  t,
}) {
  return (
    <div className="grid grid-cols-1 gap-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatBlock
          label={t(`Predictions:${isExpired ? "expired_at" : "expiration"}`)}
          value={prettifyDate(expiration)}
          mono
        />
        <StatBlock
          label={isExpired ? t("Predictions:timeExpired") : t("Predictions:timeLeft")}
          value={formatTimeRemaining(expiration)}
          mono
        />
        {view === "expired" || view === "mine" ? (
          <StatBlock
            label={t("Predictions:outcome")}
            accent={
              relevantBitassetData?.outcome === 1
                ? "emerald"
                : relevantBitassetData?.outcome === 0
                ? "rose"
                : "amber"
            }
            value={
              relevantBitassetData?.outcome === 1
                ? t("Predictions:outcome.yes")
                : relevantBitassetData?.outcome === 0
                ? t("Predictions:outcome.no")
                : t("Predictions:outcome.unresolved")
            }
          />
        ) : (
          <StatBlock
            label={t("Predictions:unique_sellers")}
            value={relevantCallOrders ? relevantCallOrders.length : 0}
            mono
          />
        )}
        <StatBlock label={t("Predictions:bettingAsset")} value={market} mono />
      </div>
      {view === "expired" || view === "mine" ? (
        <StatBlock
          label={t("Predictions:prize_pool")}
          value={
            relevantBitassetData
              ? `${humanReadableFloat(relevantBitassetData.settlement_fund, res.precision)} ${market}`
              : `0 ${market}`
          }
          mono
        />
      ) : (
        <StatBlock
          label={t("Predictions:openInterest")}
          help={t("Predictions:openInterest_help")}
          value={`${humanReadableFloat(totalBets, res.precision)} ${market}`}
          mono
        />
      )}
    </div>
  );
}