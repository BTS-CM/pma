import React, { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { HoverInfo } from "@/components/common/HoverInfo.tsx";
import { DeepLinkDialog } from "@/components/common/DeepLinkDialog.jsx";
import { assetAmountRegex, blockchainFloat, humanReadableFloat } from "@/lib/common.js";

export function IssueDialog({ res, usr, backingAssetBalance, humanReadableBackingAssetBalance, existingCollateral, _backingAssetID, _backingPrecision, market, t }) {
  const [issuePrompt, setIssuePrompt] = useState(false);
  const [issueAmount, setIssueAmount] = useState(0);
  const [issueDialog, setIssueDialog] = useState(false);

  return (
    <Dialog open={issuePrompt} onOpenChange={setIssuePrompt}>
      <DialogTrigger asChild>
        <Button type="button" onClick={() => setIssuePrompt(true)}>
          {t("Predictions:issue")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-slate-950 border-white/[0.08] text-white shadow-2xl shadow-black/40">
        <DialogHeader>
          <DialogTitle>{t("Predictions:issueDialog.title")}</DialogTitle>
          <DialogDescription>{t("Predictions:issueDialog.description")}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-2">
          <div className="grid grid-cols-2 gap-2">
            <HoverInfo content={t("Predictions:issueDialog.qtyContent")} header={t("Predictions:issueDialog.qtyHeader")} type="header" />
            <Button
              className="h-6 mt-1 ml-3 hover:shadow-md"
              onClick={() => {
                setIssueAmount(backingAssetBalance ? humanReadableFloat(backingAssetBalance.amount, _backingPrecision) : 0);
              }}
              variant="outline"
            >
              {t("Predictions:issueDialog.balance")}
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              value={issueAmount}
              min={1}
              step={1}
              onInput={(e) => {
                const input = e.currentTarget.value;
                const regex = assetAmountRegex({ precision: _backingPrecision });
                if (regex.test(input)) {
                  setIssueAmount(e.currentTarget.value);
                }
              }}
            />
            <Input type="text" value={`${res.backingAsset.symbol} (${res.backingAsset.id})`} disabled />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <HoverInfo content={t("Predictions:issueDialog.existingContent")} header={t("Predictions:issueDialog.existingHeader")} type="header" />
              <Input type="text" value={`${existingCollateral} ${res.backingAsset.symbol} (${res.backingAsset.id})`} className="mt-1" disabled />
            </div>
            <div>
              <HoverInfo content={t("Predictions:issueDialog.totalContent")} header={t("Predictions:issueDialog.totalHeader")} type="header" />
              <Input type="text" value={`${existingCollateral + issueAmount} ${res.backingAsset.symbol} (${res.backingAsset.id})`} className="mt-1" disabled />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button className="h-6 mt-1 w-1/2" onClick={() => setIssueDialog(true)}>
              {t("Predictions:submit")}
            </Button>
            {issueAmount > humanReadableBackingAssetBalance ? (
              <Badge variant="destructive">
                <ExclamationTriangleIcon className="mr-2" /> {t("Predictions:insufficient_funds")}
              </Badge>
            ) : null}
          </div>
        </div>
        {issueDialog ? (
          <DeepLinkDialog
            operationNames={["call_order_update"]}
            username={usr.username}
            usrChain={usr.chain}
            userID={usr.id}
            dismissCallback={setIssueDialog}
            key={`deeplink-dialog-${res.id}`}
            headerText={t("Predictions:dialogContent.header_issue")}
            trxJSON={[{
              funding_account: usr.id,
              delta_collateral: {
                amount: blockchainFloat(existingCollateral + issueAmount, res.precision),
                asset_id: res.id,
              },
              delta_debt: {
                amount: blockchainFloat(existingCollateral + issueAmount, _backingPrecision),
                asset_id: _backingAssetID,
              },
              extensions: {},
            }]}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}