import React, { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { HoverInfo } from "@/components/common/HoverInfo.tsx";
import { DeepLinkDialog } from "@/components/common/DeepLinkDialog.jsx";
import { assetAmountRegex, blockchainFloat, humanReadableFloat } from "@/lib/common.js";

export function ClaimDialog({ res, usr, humanReadablePredictionMarketAssetBalance, relevantBitassetData, t }) {
  const [claimPrompt, setClaimPrompt] = useState(false);
  const [claimAmount, setClaimAmount] = useState(0);
  const [claimDialog, setClaimDialog] = useState(false);

  return (
    <Dialog open={claimPrompt} onOpenChange={setClaimPrompt}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setClaimPrompt(true)}
          disabled={!humanReadablePredictionMarketAssetBalance || humanReadablePredictionMarketAssetBalance <= 0}
        >
          {t("Predictions:winner_claim")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-slate-950 border-white/[0.08] text-white shadow-2xl shadow-black/40">
        <DialogHeader>
          <DialogTitle>{t("Predictions:winner_claim")}</DialogTitle>
          <DialogDescription>{t("Predictions:winner_content")}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-2">
          <div className="grid grid-cols-2 gap-2">
            <HoverInfo content={t("Predictions:claimDialog.qtyContent")} header={t("Predictions:claimDialog.qtyHeader")} type="header" />
            <Button
              className="h-6 mt-1 ml-3 hover:shadow-md"
              onClick={() => setClaimAmount(humanReadableFloat(relevantBitassetData.settlement_fund, res.precision))}
              variant="outline"
            >
              {t("Predictions:issueDialog.balance")}
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              value={claimAmount}
              min={1}
              step={1}
              onInput={(e) => {
                const regex = assetAmountRegex({ precision: res.precision });
                if (regex.test(e.currentTarget.value)) setClaimAmount(e.currentTarget.value);
              }}
            />
            <Input type="text" value={`${res.symbol} (${res.id})`} disabled />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button className="h-6 mt-1 w-1/2" onClick={() => setClaimDialog(true)}>{t("Predictions:submit")}</Button>
            {claimAmount > humanReadablePredictionMarketAssetBalance ? (
              <Badge variant="destructive"><ExclamationTriangleIcon className="mr-2" /> {t("Predictions:insufficient_funds")}</Badge>
            ) : null}
          </div>
        </div>
        {claimDialog ? (
          <DeepLinkDialog
            operationNames={["asset_settle"]}
            username={usr.username}
            usrChain={usr.chain}
            userID={usr.id}
            dismissCallback={setClaimDialog}
            key={`deeplink-claimdialog-${res.id}`}
            headerText={t("Predictions:dialogContent.header_claim")}
            trxJSON={[{
              account: usr.id,
              amount: { amount: blockchainFloat(claimAmount, res.precision).toFixed(0), asset_id: res.id },
              extensions: {},
            }]}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}