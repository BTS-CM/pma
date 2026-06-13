import React from "react";
import { StatBlock } from "../../ui";
import { ClaimDialog } from "../dialogs/ClaimDialog";
import { humanReadableFloat } from "@/lib/common.js";

export function WinnersTab({ res, relevantBitassetData, humanReadablePredictionMarketAssetBalance, symbol, market, usr, t }) {
  return (
    <div className="grid grid-cols-1 gap-3">
      <div className="rounded-md border border-white/10 bg-white/5 p-3 text-sm">
        <div className="font-medium text-white mb-1">{t("Predictions:winner_header")}</div>
        <p className="text-white/50">{t("Predictions:winner_content")}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <StatBlock
          label={t("Predictions:prize_pool")}
          help={t("Predictions:winner.settlementFund_help")}
          value={relevantBitassetData ? `${humanReadableFloat(relevantBitassetData.settlement_fund, res.precision)} ${market}` : `0 ${market}`}
          mono
        />
        <StatBlock
          label={t("Predictions:winner.yourPmaBalance")}
          help={t("Predictions:winner.yourPmaBalance_help")}
          value={`${humanReadablePredictionMarketAssetBalance} ${symbol}`}
          mono
        />
      </div>
      <div className="flex justify-start">
        <ClaimDialog
          res={res}
          usr={usr}
          humanReadablePredictionMarketAssetBalance={humanReadablePredictionMarketAssetBalance}
          relevantBitassetData={relevantBitassetData}
          t={t}
        />
      </div>
    </div>
  );
}