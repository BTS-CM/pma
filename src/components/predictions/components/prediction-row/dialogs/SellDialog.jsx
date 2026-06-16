import React, { useState } from "react";
import { format } from "date-fns";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ExclamationTriangleIcon, CalendarIcon, Cross2Icon } from "@radix-ui/react-icons";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import DeepLinkDialog from "@/components/common/DeepLinkDialog.jsx";
import { assetAmountRegex, blockchainFloat } from "@/lib/common.js";
import { cn } from "@/lib/utils";

function SectionHeader({ label, accent = "rose" }) {
  const accentMap = { rose: "bg-rose-500/60" };
  return (
    <div className="flex items-center gap-2 mb-1.5">
      <div className={cn("h-3 w-1 rounded-full", accentMap[accent])} />
      <span className="text-[11px] uppercase tracking-wider font-semibold text-white/40">{label}</span>
    </div>
  );
}

function ExpirySelector({ expiryType, setExpiryType, date, setDate, t }) {
  return (
    <div className="space-y-3">
      <Select
        onValueChange={(selectedExpiry) => {
          setExpiryType(selectedExpiry);
          const oneHour = 60 * 60 * 1000;
          const oneDay = 24 * oneHour;
          if (selectedExpiry !== "specific" && selectedExpiry !== "fkill") {
            let expiryDate;
            if (selectedExpiry === "1hr") expiryDate = new Date(Date.now() + oneHour);
            else if (selectedExpiry === "12hr") expiryDate = new Date(Date.now() + oneHour * 12);
            else if (selectedExpiry === "24hr") expiryDate = new Date(Date.now() + oneDay);
            else if (selectedExpiry === "7d") expiryDate = new Date(Date.now() + oneDay * 7);
            else if (selectedExpiry === "30d") expiryDate = new Date(Date.now() + oneDay * 30);
            if (expiryDate) setDate(expiryDate);
          } else if (selectedExpiry === "fkill") {
            setDate(new Date(Date.now() + oneDay));
          }
        }}
      >
        <SelectTrigger className="w-full bg-white/[0.04] border-white/[0.08] text-white/80 hover:text-white hover:bg-white/[0.06]">
          <SelectValue placeholder="1hr" />
        </SelectTrigger>
        <SelectContent className="bg-slate-900 border-white/[0.08] shadow-2xl shadow-black/40">
          <SelectItem value="1hr">{t("LimitOrderCard:expiry.1hr")}</SelectItem>
          <SelectItem value="12hr">{t("LimitOrderCard:expiry.12hr")}</SelectItem>
          <SelectItem value="24hr">{t("LimitOrderCard:expiry.24hr")}</SelectItem>
          <SelectItem value="7d">{t("LimitOrderCard:expiry.7d")}</SelectItem>
          <SelectItem value="30d">{t("LimitOrderCard:expiry.30d")}</SelectItem>
          <SelectItem value="specific">{t("LimitOrderCard:expiry.specific")}</SelectItem>
          <SelectItem value="fkill">{t("LimitOrderCard:expiry.fkill")}</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-3">
        {expiryType === "specific" ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full justify-start text-left font-normal border-white/[0.08] bg-white/[0.04] text-white/70 hover:bg-white/[0.06] hover:text-white", !date && "text-white/40")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>{t("LimitOrderCard:expiry.pickDate")}</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-slate-900 border-white/[0.08]" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(e) => {
                  if (new Date(e) < new Date()) {
                    setDate(new Date(Date.now() + 1 * 24 * 60 * 60 * 1000));
                    return;
                  }
                  setDate(e);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        ) : null}

        <span className="text-xs text-white/40 italic">
          {expiryType === "fkill" ? t("LimitOrderCard:expiry.fkillDescription") : null}
          {expiryType !== "specific" && expiryType !== "fkill" ? t("LimitOrderCard:expiry.generalDescription", { expiryType }) : null}
        </span>
      </div>
    </div>
  );
}

export function SellDialog({ res, usr, humanReadablePredictionMarketAssetBalance, _backingAssetID, _backingPrecision, market, t }) {
  const [sellPrompt, setSellPrompt] = useState(false);
  const [sellAmount, setSellAmount] = useState(0);
  const [sellDialog, setSellDialog] = useState(false);
  const [expiryType, setExpiryType] = useState("1hr");
  const [date, setDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

  const exceedsBalance = sellAmount > humanReadablePredictionMarketAssetBalance;
  const isZero = !sellAmount || sellAmount <= 0;
  const canSubmit = !isZero && !exceedsBalance;

  return (
    <Dialog open={sellPrompt} onOpenChange={setSellPrompt}>
      <DialogTrigger asChild>
        <Button onClick={() => setSellPrompt(true)} className="bg-rose-600 hover:bg-rose-700 text-white border-0 shadow-md shadow-rose-500/20 w-full">{t("Predictions:sell")}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-slate-900 ring-1 ring-white/[0.08] border-white/[0.06] text-white shadow-2xl shadow-black/60">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/15 ring-1 ring-rose-500/20">
              <Cross2Icon className="h-5 w-5 text-rose-400" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-white">{t("Predictions:sellDialog.title")}</DialogTitle>
              <DialogDescription className="text-xs text-white/50">{t("Predictions:sellDialog.description")}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="h-px bg-white/[0.06]" />

        <div className="space-y-5">
          {/* Amount Section */}
          <section>
            <SectionHeader label={t("Predictions:sellDialog.qtyHeader")} accent="rose" />
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Input
                  type="number"
                  value={sellAmount}
                  min={1}
                  step={1}
                  aria-label={t("Predictions:sellDialog.qtyHeader")}
                  className={cn("pr-16", exceedsBalance && "border-red-500/50 focus-visible:ring-red-500/30")}
                  onInput={(e) => { if (assetAmountRegex({ precision: res.precision }).test(e.currentTarget.value)) setSellAmount(e.currentTarget.value); }}
                />
                <Button
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 px-2 text-[10px] border border-white/[0.12] bg-white/[0.04] text-white/60 hover:bg-white/[0.08] hover:text-white"
                  onClick={() => setSellAmount(humanReadablePredictionMarketAssetBalance || 0)}
                >
                  MAX
                </Button>
              </div>
              <Input type="text" value={`${res.symbol} (${res.id})`} disabled className="bg-white/[0.03] border-white/[0.06] text-white/50" />
            </div>
          </section>

          {/* Receiving Section */}
          <section>
            <SectionHeader label={t("Predictions:sellDialog.receivingHeader")} accent="rose" />
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
              <div className="text-xs text-white/40 mb-0.5">{t("Predictions:sellDialog.receivingContent")}</div>
              <div className="text-sm font-semibold text-white">{sellAmount ?? 0} {res.backingAsset.symbol} ({res.backingAsset.id})</div>
            </div>
          </section>

          {/* Expiry Section */}
          <section>
            <SectionHeader label={t("Predictions:sellDialog.expiryHeader")} accent="rose" />
            <ExpirySelector expiryType={expiryType} setExpiryType={setExpiryType} date={date} setDate={setDate} t={t} />
          </section>
        </div>

        <div className="h-px bg-white/[0.06]" />

        {/* Submit Section */}
        <div className="flex items-center gap-3">
          <Button
            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white border-0 shadow-md shadow-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!canSubmit}
            onClick={() => setSellDialog(true)}
          >
            {t("Predictions:submit")}
          </Button>
          {exceedsBalance ? (
            <Badge variant="destructive" role="alert" className="flex-shrink-0">
              <ExclamationTriangleIcon className="mr-1.5 h-3.5 w-3.5" /> {t("Predictions:insufficient_funds")}
            </Badge>
          ) : null}
        </div>

        {sellDialog ? (
          <DeepLinkDialog
            operationNames={["limit_order_create"]}
            username={usr.username}
            usrChain={usr.chain}
            userID={usr.id}
            dismissCallback={setSellDialog}
            key={`deeplink-selldialog-${res.id}`}
            headerText={t("Predictions:dialogContent.header_sell")}
            trxJSON={[{
              seller: usr.id,
              amount_to_sell: { amount: blockchainFloat(sellAmount, res.precision).toFixed(0), asset_id: res.id },
              min_to_receive: { amount: blockchainFloat(sellAmount, _backingPrecision).toFixed(0), asset_id: _backingAssetID },
              expiration: date,
              fill_or_kill: expiryType === "fkill",
              extensions: {},
            }]}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
