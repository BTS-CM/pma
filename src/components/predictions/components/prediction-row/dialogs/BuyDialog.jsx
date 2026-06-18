import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ExclamationTriangleIcon, CalendarIcon, PlusIcon } from "@radix-ui/react-icons";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Slider } from "@/components/ui/slider";
import DeepLinkDialog from "@/components/common/DeepLinkDialog.jsx";
import { assetAmountRegex, blockchainFloat } from "@/lib/common.js";
import { cn } from "@/lib/utils";

const DEFAULT_ORDER_PRICE = 0.5;
const MIN_ORDER_PRICE = 0.00001;
const MAX_ORDER_PRICE = 0.99999;

function clampOrderPrice(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return DEFAULT_ORDER_PRICE;
  }

  return Math.min(MAX_ORDER_PRICE, Math.max(MIN_ORDER_PRICE, numericValue));
}

function formatAmount(value, precision = 5) {
  const numericValue = Number(value || 0);
  if (!Number.isFinite(numericValue)) {
    return "0";
  }

  return numericValue.toFixed(precision).replace(/\.?0+$/, "");
}

function SectionHeader({ label, accent = "emerald" }) {
  const accentMap = { emerald: "bg-emerald-500/60" };
  return (
    <div className="flex items-center gap-2 mb-1.5">
      <div className={cn("h-3 w-1 rounded-full", accentMap[accent])} />
      <span className="text-[11px] uppercase tracking-wider font-semibold text-white/40">{label}</span>
    </div>
  );
}

function ExpirySelector({ expiryType, setExpiryType, date, setDate, t, expiration }) {
  return (
    <div className="space-y-3">
      <Select
        value={expiryType}
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
          <SelectValue placeholder={t("LimitOrderCard:expiry.specific")} />
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
            <PopoverContent className="w-80 p-0 bg-slate-900 border-white/[0.08]" align="start">
                  <Calendar
                    className="w-72"
                    mode="single"
                    selected={date}
                    fromDate={new Date()}
                    toDate={expiration ? new Date(expiration) : undefined}
                    onSelect={(e) => {
                      if (!e) {
                        return;
                      }

                      const selected = new Date(e);
                      const now = new Date();
                      if (selected < now) {
                        setDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
                        return;
                      }
                      if (expiration) {
                        const expDate = new Date(expiration);
                        if (selected > expDate) {
                          setDate(expDate);
                          return;
                        }
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

export function BuyDialog({ res, usr, humanReadableBackingAssetBalance, _backingAssetID, _backingPrecision, market, t, expiration, defaultPrice }) {
  const [buyPrompt, setBuyPrompt] = useState(false);
  const [buyAmount, setBuyAmount] = useState("");
  const [buyPrice, setBuyPrice] = useState(formatAmount(clampOrderPrice(defaultPrice ?? DEFAULT_ORDER_PRICE)));
  const [buyDialog, setBuyDialog] = useState(false);
  const [expiryType, setExpiryType] = useState("specific");
  const [date, setDate] = useState(expiration ? new Date(expiration) : new Date(Date.now() + 1 * 24 * 60 * 60 * 1000));

  const initialPrice = clampOrderPrice(defaultPrice ?? DEFAULT_ORDER_PRICE);

  // Reset dialog state when closed so reopened dialog is fresh
  useEffect(() => {
    if (!buyPrompt) {
      setBuyAmount("");
      setBuyPrice(formatAmount(initialPrice));
      setBuyDialog(false);
      setExpiryType("specific");
      setDate(expiration ? new Date(expiration) : new Date(Date.now() + 1 * 24 * 60 * 60 * 1000));
    }
  }, [buyPrompt, expiration, initialPrice]);

  const buyQuantity = Number(buyAmount || 0);
  const buyPriceValue = clampOrderPrice(buyPrice || initialPrice);
  const availableBackingBalance = Number(humanReadableBackingAssetBalance || 0);
  const totalCost = buyQuantity * buyPriceValue;
  const redeemableBacking = buyQuantity;
  const netIfYes = redeemableBacking - totalCost;
  const exceedsBalance = totalCost > availableBackingBalance;
  const isZero = buyQuantity <= 0;
  const hasValidPrice = buyPriceValue > 0 && buyPriceValue < 1;
  const canSubmit = !isZero && !exceedsBalance && hasValidPrice;

  return (
    <Dialog open={buyPrompt} onOpenChange={setBuyPrompt}>
      <DialogTrigger asChild>
        <Button onClick={() => setBuyPrompt(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-md shadow-emerald-500/20 w-full">{t("Predictions:buy")}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-slate-900 ring-1 ring-white/[0.08] border-white/[0.06] text-white shadow-2xl shadow-black/60">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/20">
              <PlusIcon className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-white">{t("Predictions:buyDialog.title")}</DialogTitle>
              <DialogDescription className="text-xs text-white/50">{t("Predictions:buyDialog.description")}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="h-px bg-white/[0.06]" />

        <div className="space-y-5">
          {/* Amount Section */}
          <section>
            <SectionHeader label={t("Predictions:buyDialog.qtyHeader")} accent="emerald" />
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Input
                  type="number"
                  value={buyAmount}
                  min={0}
                  step="any"
                  aria-label={t("Predictions:buyDialog.qtyHeader")}
                  className={cn("pr-16", exceedsBalance && "border-red-500/50 focus-visible:ring-red-500/30")}
                  onInput={(e) => {
                    const input = e.currentTarget.value;
                    if (input === "") {
                      setBuyAmount("");
                      return;
                    }

                    if (assetAmountRegex({ precision: res.precision }).test(input)) {
                      setBuyAmount(input);
                    }
                  }}
                />
                <Button
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 px-2 text-[10px] border border-white/[0.12] bg-white/[0.04] text-white/60 hover:bg-white/[0.08] hover:text-white"
                  onClick={() => {
                    const maxQuantity = buyPriceValue > 0 ? availableBackingBalance / buyPriceValue : 0;
                    setBuyAmount(formatAmount(maxQuantity, res.precision));
                  }}
                >
                  MAX
                </Button>
              </div>
              <Input type="text" value={`${res.symbol} (${res.id})`} disabled className="bg-white/[0.03] border-white/[0.06] text-white/50" />
            </div>
            <div className="mt-1 text-xs text-white/50">
              {t("Predictions:available_balance", { defaultValue: "Available" })}: {formatAmount(availableBackingBalance, _backingPrecision)} {res.backingAsset.symbol}
            </div>
          </section>

          <section>
            <SectionHeader label={t("Predictions:buyDialog.priceHeader", { defaultValue: "Bid price" })} accent="emerald" />
            <div className="space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_190px]">
                <div>
                  <Slider
                    variant="emerald"
                    min={0.01}
                    max={0.99}
                    step={0.01}
                    value={[Math.min(0.99, Math.max(0.01, buyPriceValue))]}
                    onValueChange={(value) => setBuyPrice(formatAmount(value[0]))}
                  />
                  <div className="mt-2 flex items-center justify-between text-[11px] text-white/40">
                    <span>0.01</span>
                    <span>{t("Predictions:buyDialog.priceHelp", { defaultValue: "Backing asset paid per 1 PMA" })}</span>
                    <span>0.99</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <Input
                    type="number"
                    value={buyPrice}
                    min={MIN_ORDER_PRICE}
                    max={MAX_ORDER_PRICE}
                    step={0.01}
                    aria-label={t("Predictions:buyDialog.priceHeader", { defaultValue: "Bid price" })}
                    onInput={(e) => {
                      const input = e.currentTarget.value;
                      if (input === "") {
                        setBuyPrice("");
                        return;
                      }

                      if (assetAmountRegex({ precision: Math.min(_backingPrecision || 5, 5) }).test(input)) {
                        setBuyPrice(input);
                      }
                    }}
                    onBlur={() => setBuyPrice(formatAmount(buyPriceValue))}
                  />
                  <div className="text-[11px] text-white/45">
                    {formatAmount(buyPriceValue)} {market} / {res.symbol}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Receiving Section */}
          <section>
            <SectionHeader label={t("Predictions:buyDialog.receivingHeader")} accent="emerald" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
                <div className="text-xs text-white/40 mb-0.5">{t("Predictions:buyDialog.receivingContent", { defaultValue: "Order cost if filled" })}</div>
                <div className="text-sm font-semibold text-white">{formatAmount(totalCost, _backingPrecision)} {res.backingAsset.symbol} ({res.backingAsset.id})</div>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
                <div className="text-xs text-emerald-200/60 mb-0.5">{t("Predictions:buyDialog.winEstimate", { defaultValue: "If YES resolves" })}</div>
                <div className="text-sm font-semibold text-emerald-100">{formatAmount(redeemableBacking, _backingPrecision)} {market}</div>
                <div className="mt-1 text-[11px] text-emerald-100/60">
                  {t("Predictions:buyDialog.winEstimateHelp", { defaultValue: "Redeem up to 1:1 backing collateral; net change" })}: {netIfYes >= 0 ? "+" : ""}{formatAmount(netIfYes, _backingPrecision)} {market}
                </div>
              </div>
            </div>
          </section>

          {/* Expiry Section */}
          <section>
            <SectionHeader label={t("Predictions:sellDialog.expiryHeader")} accent="emerald" />
            <ExpirySelector expiryType={expiryType} setExpiryType={setExpiryType} date={date} setDate={setDate} t={t} expiration={expiration} />
          </section>
        </div>

        <div className="h-px bg-white/[0.06]" />

        {/* Submit Section */}
        <div className="flex items-center gap-3">
          <Button
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-md shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!canSubmit}
            onClick={() => setBuyDialog(true)}
          >
            {t("Predictions:submit")}
          </Button>
          {exceedsBalance ? (
            <Badge variant="destructive" role="alert" className="flex-shrink-0">
              <ExclamationTriangleIcon className="mr-1.5 h-3.5 w-3.5" /> {t("Predictions:insufficient_funds")}
            </Badge>
          ) : null}
        </div>

        {buyDialog ? (
          <DeepLinkDialog
            operationNames={["limit_order_create"]}
            username={usr.username}
            usrChain={usr.chain}
            userID={usr.id}
            dismissCallback={setBuyDialog}
            key={`deeplink-buydialog-${res.id}`}
            headerText={t("Predictions:dialogContent.header_buy")}
            trxJSON={[{
              seller: usr.id,
              amount_to_sell: { amount: blockchainFloat(totalCost, _backingPrecision).toFixed(0), asset_id: _backingAssetID },
              min_to_receive: { amount: blockchainFloat(buyQuantity, res.precision).toFixed(0), asset_id: res.id },
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
