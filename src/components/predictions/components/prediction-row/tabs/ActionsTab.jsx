import React from "react";
import HoverInfo from "@/components/common/HoverInfo.tsx";
import { IssueDialog } from "../dialogs/IssueDialog";
import { SellDialog } from "../dialogs/SellDialog";
import { BuyDialog } from "../dialogs/BuyDialog";

export function ActionsTab({
  res,
  usr,
  backingAssetBalance,
  humanReadableBackingAssetBalance,
  humanReadablePredictionMarketAssetBalance,
  existingCollateral,
  _backingAssetID,
  _backingPrecision,
  market,
  t,
  expiration,
}) {
  return (
    <div className="grid grid-cols-1 gap-2">
      <HoverInfo content={t("Predictions:seller_content")} header={t("Predictions:seller")} type="header" />
      <div className="grid grid-cols-3 gap-3">
        <IssueDialog
          res={res}
          usr={usr}
          backingAssetBalance={backingAssetBalance}
          humanReadableBackingAssetBalance={humanReadableBackingAssetBalance}
          existingCollateral={existingCollateral}
          _backingAssetID={_backingAssetID}
          _backingPrecision={_backingPrecision}
          market={market}
          t={t}
        />
        <SellDialog
          res={res}
          usr={usr}
          humanReadablePredictionMarketAssetBalance={humanReadablePredictionMarketAssetBalance}
          _backingAssetID={_backingAssetID}
          _backingPrecision={_backingPrecision}
          market={market}
          t={t}
          expiration={expiration}
        />
      </div>
      <HoverInfo content={t("Predictions:buyer_content")} header={t("Predictions:buyer")} type="header" />
      <div className="grid grid-cols-3 gap-3">
        <BuyDialog
          res={res}
          usr={usr}
          humanReadableBackingAssetBalance={humanReadableBackingAssetBalance}
          _backingAssetID={_backingAssetID}
          _backingPrecision={_backingPrecision}
          market={market}
          t={t}
        />
      </div>
    </div>
  );
}