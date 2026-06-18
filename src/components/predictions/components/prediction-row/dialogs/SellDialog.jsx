import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ExclamationTriangleIcon, CalendarIcon, Cross2Icon, ChevronDownIcon } from "@radix-ui/react-icons";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
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

function SectionHeader({ label, accent = "rose" }) {
  const accentMap = { rose: "bg-rose-500/60" };
  return (
    <div className="flex items-center gap-2 mb-1.5">
      <div className={cn("h-3 w-1 rounded-full", accentMap[accent])} />
      <span className="text-[11px] uppercase tracking-wider font-semibold text-white/40">{label}</span>
    </div>
  );
}

function ExpirySelector({ expiryType, setExpiryType, date, setDate, t, expiration }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
      ) : (
        <span className="flex items-center text-xs text-white/40 italic">
          {expiryType === "fkill" ? t("LimitOrderCard:expiry.fkillDescription") : t("LimitOrderCard:expiry.generalDescription", { expiryType })}
        </span>
      )}
    </div>
  );
}

export function SellDialog({ res, usr, humanReadablePredictionMarketAssetBalance, _backingAssetID, _backingPrecision, market, t, expiration, defaultPrice, marketStats }) {
  const [sellPrompt, setSellPrompt] = useState(false);
  const [sellAmount, setSellAmount] = useState("");
  const [sellPrice, setSellPrice] = useState(formatAmount(clampOrderPrice(defaultPrice ?? DEFAULT_ORDER_PRICE)));
  const [sellDialog, setSellDialog] = useState(false);
  const [expiryType, setExpiryType] = useState("specific");
  const [date, setDate] = useState(expiration ? new Date(expiration) : new Date(Date.now() + 1 * 24 * 60 * 60 * 1000));

  const initialPrice = clampOrderPrice(defaultPrice ?? DEFAULT_ORDER_PRICE);

  // Reset dialog state when closed so reopened dialog is fresh
  useEffect(() => {
    if (!sellPrompt) {
      setSellAmount("");
      setSellPrice(formatAmount(initialPrice));
      setSellDialog(false);
      setExpiryType("specific");
      setDate(expiration ? new Date(expiration) : new Date(Date.now() + 1 * 24 * 60 * 60 * 1000));
    }
  }, [sellPrompt, expiration, initialPrice]);

  const sellQuantity = Number(sellAmount || 0);
  const sellPriceValue = clampOrderPrice(sellPrice || initialPrice);
  const availablePmaBalance = Number(humanReadablePredictionMarketAssetBalance || 0);
  const orderProceeds = sellQuantity * sellPriceValue;
  const totalBackingIfNo = sellQuantity + orderProceeds;
  const exceedsBalance = sellQuantity > availablePmaBalance;
  const isZero = sellQuantity <= 0;
  const hasValidPrice = sellPriceValue > 0 && sellPriceValue < 1;
  const canSubmit = !isZero && !exceedsBalance && hasValidPrice;

  // Odds calculations (seller is betting against YES)
  const userNoProbability = 1 - sellPriceValue;
  const decimalOddsNo = userNoProbability > 0 ? 1 / userNoProbability : 0;
  const fractionalNumerator = Math.round(userNoProbability * 100);
  const fractionalDenominator = Math.round(sellPriceValue * 100);
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  const fracGcd = gcd(fractionalNumerator, fractionalDenominator);
  const fracNum = fractionalNumerator / fracGcd;
  const fracDen = fractionalDenominator / fracGcd;
  const americanOddsNo = userNoProbability >= 0.5
    ? Math.round((userNoProbability / sellPriceValue) * 100)
    : Math.round(-100 / decimalOddsNo);
  const impliedProbabilityNo = userNoProbability * 100;


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
            <SectionHeader label={t("Predictions:sellDialog.quantityToSell", { defaultValue: "Quantity to sell" })} accent="rose" />
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Input
                  type="number"
                  value={sellAmount}
                  min={0}
                  step="any"
                  aria-label={t("Predictions:sellDialog.quantityToSell", { defaultValue: "Quantity to sell" })}
                  className={cn("pr-16", exceedsBalance && "border-red-500/50 focus-visible:ring-red-500/30")}
                  onInput={(e) => {
                    const input = e.currentTarget.value;
                    if (input === "") {
                      setSellAmount("");
                      return;
                    }

                    if (assetAmountRegex({ precision: res.precision }).test(input)) {
                      setSellAmount(input);
                    }
                  }}
                />
                <Button
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 px-2 text-[10px] border border-white/[0.12] bg-white/[0.04] text-white/60 hover:bg-white/[0.08] hover:text-white"
                  onClick={() => setSellAmount(formatAmount(availablePmaBalance, res.precision))}
                >
                  MAX
                </Button>
              </div>
              <Input type="text" value={`${res.symbol} (${res.id})`} disabled className="bg-white/[0.03] border-white/[0.06] text-white/50" />
            </div>
            <div className="mt-1 text-xs text-white/50">
              {t("Predictions:available_balance", { defaultValue: "Available" })}: {formatAmount(availablePmaBalance, res.precision)} {res.symbol}
            </div>
          </section>

          <section>
            <SectionHeader label={t("Predictions:sellDialog.priceHeader", { defaultValue: "Asking price" })} accent="rose" />
            <div className="space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
              <Slider
                variant="rose"
                min={0.01}
                max={0.99}
                step={0.01}
                value={[Math.min(0.99, Math.max(0.01, sellPriceValue))]}
                onValueChange={(value) => setSellPrice(formatAmount(value[0]))}
              />
              <div className="flex items-center justify-between text-[11px] text-white/40">
                <span>0.01</span>
                <span>{formatAmount(sellPriceValue)} {res.backingAsset.symbol} / {res.symbol}</span>
                <span>0.99</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  value={sellPrice}
                  min={MIN_ORDER_PRICE}
                  max={MAX_ORDER_PRICE}
                  step={0.01}
                  aria-label={t("Predictions:sellDialog.priceHeader", { defaultValue: "Asking price" })}
                  onInput={(e) => {
                    const input = e.currentTarget.value;
                    if (input === "") {
                      setSellPrice("");
                      return;
                    }

                    if (assetAmountRegex({ precision: Math.min(_backingPrecision || 5, 5) }).test(input)) {
                      setSellPrice(input);
                    }
                  }}
                  onBlur={() => setSellPrice(formatAmount(sellPriceValue))}
                />
                <Input
                  type="text"
                  value={`${res.backingAsset.symbol} (${res.backingAsset.id})`}
                  disabled
                  className="bg-white/[0.03] border-white/[0.06] text-white/50"
                />
              </div>
            </div>
          </section>

          {/* Expiry Section */}
          <section>
            <SectionHeader label={t("Predictions:sellDialog.expiryHeader")} accent="rose" />
            <ExpirySelector expiryType={expiryType} setExpiryType={setExpiryType} date={date} setDate={setDate} t={t} expiration={expiration} />
          </section>

          {/* Estimated Odds Section */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center gap-2 w-full group">
              <SectionHeader label={t("Predictions:sellDialog.oddsHeader", { defaultValue: "Estimated odds" })} accent="rose" />
              <ChevronDownIcon className="h-4 w-4 text-white/40 group-data-[state=open]:rotate-180 transition-transform" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-white/40 mb-1">{t("Predictions:sellDialog.oddsFractional", { defaultValue: "Fraction" })}</div>
                    <div className="text-sm font-semibold text-white">{fracNum}:{fracDen}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-white/40 mb-1">{t("Predictions:sellDialog.oddsDecimal", { defaultValue: "Decimal" })}</div>
                    <div className="text-sm font-semibold text-white">{decimalOddsNo.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-white/40 mb-1">{t("Predictions:sellDialog.oddsAmerican", { defaultValue: "American" })}</div>
                    <div className="text-sm font-semibold text-white">{americanOddsNo > 0 ? "+" : ""}{americanOddsNo}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-white/40 mb-1">{t("Predictions:sellDialog.oddsProbability", { defaultValue: "Implied prob." })}</div>
                    <div className="text-sm font-semibold text-white">{impliedProbabilityNo.toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Market Context Section */}
          {marketStats && (marketStats.bestAsk != null || marketStats.bestBid != null || (marketStats.latestTrade != null && marketStats.latestTrade > 0)) ? (
            <Collapsible defaultOpen>
              <CollapsibleTrigger className="flex items-center gap-2 w-full group">
                <SectionHeader label={t("Predictions:sellDialog.marketHeader", { defaultValue: "Market context" })} accent="rose" />
                <ChevronDownIcon className="h-4 w-4 text-white/40 group-data-[state=open]:rotate-180 transition-transform" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 space-y-2">
                  {marketStats.bestBid != null && marketStats.buyOrderCount > 0 ? (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/50">{t("Predictions:sellDialog.marketBestBid", { defaultValue: "Best bid" })} <span className="text-white/30">({t("Predictions:sellDialog.trueBet", { defaultValue: "true bet" })})</span></span>
                      <span className="text-xs font-mono text-white/70">{formatAmount(marketStats.bestBid, Math.min(_backingPrecision || 5, 5))} {market}</span>
                    </div>
                  ) : null}
                  {marketStats.bestAsk != null && marketStats.sellOrderCount > 0 ? (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/50">{t("Predictions:sellDialog.marketBestAsk", { defaultValue: "Best ask" })} <span className="text-white/30">({t("Predictions:sellDialog.falseBet", { defaultValue: "false bet" })})</span></span>
                      <span className="text-xs font-mono text-white/70">{formatAmount(marketStats.bestAsk, Math.min(_backingPrecision || 5, 5))} {market}</span>
                    </div>
                  ) : null}
                  {marketStats.latestTrade != null && marketStats.latestTrade > 0 ? (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/50">{t("Predictions:sellDialog.marketLastTrade", { defaultValue: "Last trade" })}</span>
                      <span className="text-xs font-mono text-white/70">{formatAmount(marketStats.latestTrade, Math.min(_backingPrecision || 5, 5))} {market}</span>
                    </div>
                  ) : null}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ) : null}

          {/* Potential Outcome Section */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center gap-2 w-full group">
              <SectionHeader label={t("Predictions:sellDialog.outcomeHeader", { defaultValue: "Potential outcome" })} accent="rose" />
              <ChevronDownIcon className="h-4 w-4 text-white/40 group-data-[state=open]:rotate-180 transition-transform" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3">
                <div className="text-xs text-rose-200/60 mb-0.5">{t("Predictions:sellDialog.outcomeIfWin", { defaultValue: "If the prediction resolves in your favour (False)" })}</div>
                <div className="text-sm font-semibold text-rose-100">{formatAmount(totalBackingIfNo, _backingPrecision)} {res.backingAsset.symbol}</div>
                <div className="mt-1 text-[11px] text-rose-100/60">
                  {t("Predictions:sellDialog.outcomeIfWinHelp", { defaultValue: "You receive your sale proceeds plus 1:1 collateral returned on your issued PMA." })}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
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
              amount_to_sell: { amount: blockchainFloat(sellQuantity, res.precision).toFixed(0), asset_id: res.id },
              min_to_receive: { amount: blockchainFloat(orderProceeds, _backingPrecision).toFixed(0), asset_id: _backingAssetID },
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
