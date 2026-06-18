import React, { useState, useEffect } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ExclamationTriangleIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import DeepLinkDialog from "@/components/common/DeepLinkDialog.jsx";
import { assetAmountRegex, blockchainFloat, humanReadableFloat } from "@/lib/common.js";
import { cn } from "@/lib/utils";

function SectionHeader({ label, accent = "rose" }) {
  const accentMap = { rose: "bg-rose-500/60", amber: "bg-amber-500/60" };
  return (
    <div className="flex items-center gap-2 mb-1.5">
      <div className={cn("h-3 w-1 rounded-full", accentMap[accent])} />
      <span className="text-[11px] uppercase tracking-wider font-semibold text-white/40">{label}</span>
    </div>
  );
}

export function IssueDialog({ res, usr, backingAssetBalance, humanReadableBackingAssetBalance, existingCollateral, existingCollateralRaw, _backingAssetID, _backingPrecision, market, t }) {
  const [issuePrompt, setIssuePrompt] = useState(false);
  const [issueAmount, setIssueAmount] = useState(0);
  const [issueDialog, setIssueDialog] = useState(false);

  // Reset dialog state when closed so reopened dialog is fresh
  useEffect(() => {
    if (!issuePrompt) {
      setIssueAmount(0);
      setIssueDialog(false);
    }
  }, [issuePrompt]);

  const exceedsBalance = Number(issueAmount) > Number(humanReadableBackingAssetBalance || 0);
  const isZero = !issueAmount || issueAmount <= 0;
  const canSubmit = !isZero && !exceedsBalance;

  return (
    <Dialog open={issuePrompt} onOpenChange={setIssuePrompt}>
      <DialogTrigger asChild>
        <Button type="button" onClick={() => setIssuePrompt(true)} className="bg-rose-600 hover:bg-rose-700 text-white border-0 shadow-md shadow-rose-500/20 w-full">
          {t("Predictions:issue")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-slate-900 ring-1 ring-white/[0.08] border-white/[0.06] text-white shadow-2xl shadow-black/60">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/15 ring-1 ring-rose-500/20">
              <PlusCircledIcon className="h-5 w-5 text-rose-400" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-white">{t("Predictions:issueDialog.title")}</DialogTitle>
              <DialogDescription className="text-xs text-white/50">{t("Predictions:issueDialog.description")}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="h-px bg-white/[0.06]" />

        <div className="space-y-5">
          {/* Amount Section */}
          <section>
            <SectionHeader label={t("Predictions:issueDialog.qtyHeader")} accent="rose" />
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Input
                  type="number"
                  value={issueAmount}
                  min={0}
                  step={1}
                  aria-label={t("Predictions:issueDialog.qtyHeader")}
                  className={cn("pr-16", exceedsBalance && "border-red-500/50 focus-visible:ring-red-500/30")}
                  onInput={(e) => {
                    const input = e.currentTarget.value;
                    if (input === "") {
                      setIssueAmount(0);
                      return;
                    }
                    const regex = assetAmountRegex({ precision: res?.precision });
                    if (regex.test(input)) {
                      const num = Number(input);
                      if (!Number.isNaN(num)) setIssueAmount(num);
                    }
                  }}
                />
                <Button
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 px-2 text-[10px] border border-white/[0.12] bg-white/[0.04] text-white/60 hover:bg-white/[0.08] hover:text-white"
                  onClick={() => setIssueAmount(backingAssetBalance ? humanReadableFloat(backingAssetBalance.amount, _backingPrecision) : 0)}
                >
                  MAX
                </Button>
              </div>
              <Input type="text" value={`${res.symbol} (${res.id})`} disabled className="bg-white/[0.03] border-white/[0.06] text-white/50" />
            </div>
            <div className="mt-1 text-xs text-white/50">
              {t("Predictions:issueDialog.available", { defaultValue: "Available" })}: {humanReadableBackingAssetBalance} {res.backingAsset?.symbol}
            </div>
          </section>

          {/* Collateral Section */}
          <section>
            <SectionHeader label={t("Predictions:issueDialog.collateralHeader")} accent="amber" />
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
                <div className="text-[10px] uppercase tracking-wide text-white/40 mb-1">{t("Predictions:issueDialog.existingHeader")}</div>
                <div className="text-sm font-semibold text-white/80">{existingCollateral} {res.backingAsset.symbol}</div>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                <div className="text-[10px] uppercase tracking-wide text-amber-400/60 mb-1">{t("Predictions:issueDialog.totalHeader")}</div>
                <div className="text-sm font-semibold text-amber-300">
                  {humanReadableFloat((Number(existingCollateralRaw || 0) + blockchainFloat(Number(issueAmount || 0), _backingPrecision)), _backingPrecision)} {res.backingAsset.symbol}
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="h-px bg-white/[0.06]" />

        {/* Submit Section */}
        <div className="flex items-center gap-3">
          <Button
            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white border-0 shadow-md shadow-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!canSubmit}
            onClick={() => setIssueDialog(true)}
          >
            {t("Predictions:submit")}
          </Button>
          {exceedsBalance ? (
            <Badge variant="destructive" role="alert" className="flex-shrink-0">
              <ExclamationTriangleIcon className="mr-1.5 h-3.5 w-3.5" /> {t("Predictions:insufficient_funds")}
            </Badge>
          ) : null}
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
              // delta_collateral is the backing asset amount (added collateral)
              delta_collateral: {
                amount: blockchainFloat(Number(issueAmount || 0), _backingPrecision),
                asset_id: _backingAssetID,
              },
              // delta_debt is the PMA amount (new debt)
              delta_debt: {
                amount: blockchainFloat(Number(issueAmount || 0), res.precision),
                asset_id: res.id,
              },
              extensions: {},
            }]}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
