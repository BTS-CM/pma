import React, { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ExclamationTriangleIcon, CheckCircledIcon } from "@radix-ui/react-icons";
import DeepLinkDialog from "@/components/common/DeepLinkDialog.jsx";
import { assetAmountRegex, blockchainFloat, humanReadableFloat } from "@/lib/common.js";
import { cn } from "@/lib/utils";

function SectionHeader({ label, accent = "amber" }) {
  const accentMap = { amber: "bg-amber-500/60" };
  return (
    <div className="flex items-center gap-2 mb-1.5">
      <div className={cn("h-3 w-1 rounded-full", accentMap[accent])} />
      <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">{label}</span>
    </div>
  );
}

export function ClaimDialog({ res, usr, humanReadablePredictionMarketAssetBalance, relevantBitassetData, t }) {
  const [claimPrompt, setClaimPrompt] = useState(false);
  const [claimAmount, setClaimAmount] = useState(0);
  const [claimDialog, setClaimDialog] = useState(false);

  const exceedsBalance = Number(claimAmount) > Number(humanReadablePredictionMarketAssetBalance);

  return (
    <Dialog open={claimPrompt} onOpenChange={setClaimPrompt}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setClaimPrompt(true)}
          disabled={!humanReadablePredictionMarketAssetBalance || humanReadablePredictionMarketAssetBalance <= 0 || relevantBitassetData?.outcome !== 1}
          className="bg-amber-600 hover:bg-amber-700 text-foreground border-0 shadow-md shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t("Predictions:winner_claim")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-card ring-1 dark:ring-white/[0.08] ring-border border-border/60 text-foreground shadow-2xl dark:shadow-black/60 shadow-black/25">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 ring-1 ring-amber-500/20">
              <CheckCircledIcon className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-foreground">{t("Predictions:winner_claim")}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">{t("Predictions:winner_content")}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="h-px bg-accent/50" />

        <div className="space-y-5">
          {/* Amount Section */}
          <section>
            <SectionHeader label={t("Predictions:claimDialog.qtyHeader")} accent="amber" />
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Input
                  type="number"
                  value={claimAmount}
                  min={1}
                  step={1}
                  aria-label={t("Predictions:claimDialog.qtyHeader")}
                  className={cn("pr-16", exceedsBalance && "border-red-500/50 focus-visible:ring-red-500/30")}
                  onInput={(e) => {
                    const regex = assetAmountRegex({ precision: res.precision });
                    if (regex.test(e.currentTarget.value)) setClaimAmount(e.currentTarget.value);
                  }}
                />
                <Button
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 px-2 text-[10px] border border-border bg-accent/40 text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  onClick={() => setClaimAmount(humanReadablePredictionMarketAssetBalance ? humanReadablePredictionMarketAssetBalance : 0)}
                >
                  MAX
                </Button>
              </div>
              <Input type="text" value={`${res.symbol} (${res.id})`} disabled className="bg-accent/30 dark:bg-white/[0.05] border-border/60 text-muted-foreground" />
            </div>
            <div className="text-[11px] text-muted-foreground mt-1.5">
              {t("Predictions:claimDialog.balance", { defaultValue: "Balance" })}: {humanReadablePredictionMarketAssetBalance ?? "0"} {res.symbol}
            </div>

          </section>

          {/* Validation */}
          {exceedsBalance ? (
            <div role="alert" className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0" />
              {t("Predictions:insufficient_funds")}
            </div>
          ) : null}

          {/* Submit */}
          <Button
            onClick={() => setClaimDialog(true)}
            disabled={!claimAmount || Number(claimAmount) <= 0 || exceedsBalance}
            className="w-full bg-amber-600 hover:bg-amber-700 text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("Predictions:submit")}
          </Button>
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
