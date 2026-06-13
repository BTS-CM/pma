import React from "react";
import { HoverInfo } from "@/components/common/HoverInfo.tsx";
import { ResolveDialog } from "../dialogs/ResolveDialog";
import { PricefeederDialog } from "../dialogs/PricefeederDialog";
import { FeedPriceDialog } from "../dialogs/FeedPriceDialog";

export function AdminTab({ res, usr, isExpired, expirationHours, expiration, cleanedPrediction, _backingAssetID, t }) {
  return (
    <div className="grid grid-cols-1 gap-2">
      <HoverInfo content={t("Predictions:admin_content")} header={t("Predictions:admin")} type="header" />
      <div className="grid grid-cols-3 gap-3 mt-1">
        <ResolveDialog
          res={res}
          usr={usr}
          isExpired={isExpired}
          expirationHours={expirationHours}
          expiration={expiration}
          cleanedPrediction={cleanedPrediction}
          _backingAssetID={_backingAssetID}
          t={t}
        />
        <PricefeederDialog res={res} usr={usr} t={t} />
      </div>
      <HoverInfo content={t("Predictions:feeder_content")} header={t("Predictions:price_feeders")} type="header" />
      <div className="grid grid-cols-3 gap-3 mt-1">
        <FeedPriceDialog res={res} usr={usr} _backingAssetID={_backingAssetID} t={t} />
      </div>
    </div>
  );
}