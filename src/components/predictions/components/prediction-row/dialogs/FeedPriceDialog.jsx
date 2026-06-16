import React, { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import HoverInfo from "@/components/common/HoverInfo.tsx";
import DeepLinkDialog from "@/components/common/DeepLinkDialog.jsx";

export function FeedPriceDialog({ res, usr, _backingAssetID, isExpired, statusKey, settlementFundRaw, relevantBitassetData, t }) {
  const [priceFeedPrompt, setPriceFeedPrompt] = useState(false);
  const [priceFeedOutcome, setPriceFeedOutcome] = useState();
  const [priceFeedDialog, setPriceFeedDialog] = useState(false);

  const settlementFund = Number(settlementFundRaw ?? relevantBitassetData?.settlement_fund ?? 0);
  const canFeed = isExpired && statusKey === "awaiting" && settlementFund > 0;

  return (
    <Dialog open={priceFeedPrompt} onOpenChange={setPriceFeedPrompt}>
      <DialogTrigger asChild>
        {!canFeed ? (
          <Button disabled className="bg-emerald-600 text-white cursor-not-allowed">{t("Predictions:feed")}</Button>
        ) : (
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setPriceFeedPrompt(true)}>{t("Predictions:feed")}</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-slate-950 border-white/[0.08] text-white shadow-2xl shadow-black/40">
        <DialogHeader>
          <DialogTitle>{t("Predictions:feederDialog.title")}</DialogTitle>
          <DialogDescription>{t("Predictions:feederDialog.description")}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-2">
          <HoverInfo content={t("Predictions:resolveDialog.outcomeContent")} header={t("Predictions:resolveDialog.outcomeHeader")} type="header" />
          <div className="grid grid-cols-2 gap-2">
            <RadioGroup
              defaultValue={priceFeedOutcome ?? ""}
              onClick={(e) => { const value = e.target.value; if (value) setPriceFeedOutcome(value); }}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="feed-1" />
                <Label htmlFor="feed-1">{t("Predictions:outcome.yes")}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2" id="feed-2" />
                <Label htmlFor="feed-2">{t("Predictions:outcome.no")}</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button className="h-6 mt-1 w-1/2" onClick={() => setPriceFeedDialog(true)}>
              {t("Predictions:submit")}
            </Button>
          </div>
          {priceFeedDialog && priceFeedOutcome ? (
            <DeepLinkDialog
              operationNames={["asset_publish_feed"]}
              username={usr.username}
              usrChain={usr.chain}
              userID={usr.id}
              dismissCallback={setPriceFeedDialog}
              key={`deeplink-feedpricedialog-${res.id}`}
              headerText={t("Predictions:dialogContent.header_feedprice")}
              trxJSON={[{
                publisher: usr.id,
                asset_id: res.id,
                feed: {
                  settlement_price: {
                    base: { amount: 1, asset_id: res.id },
                    quote: { amount: priceFeedOutcome === "1" ? 1 : 0, asset_id: _backingAssetID },
                  },
                  maintenance_collateral_ratio: 100,
                  maximum_short_squeeze_ratio: 100,
                  core_exchange_rate: {
                    base: { amount: 1, asset_id: res.id },
                    quote: { amount: priceFeedOutcome === "1" ? 1 : 0, asset_id: _backingAssetID },
                  },
                },
                extensions: {},
              }]}
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}