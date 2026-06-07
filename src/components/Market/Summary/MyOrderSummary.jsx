import React, { useMemo, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";

import { ScrollArea } from "@/components/ui/scroll-area";
import { humanReadableFloat, isInvertedMarket } from "@/lib/common";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowRight, ClipboardList, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

import { $currentUser } from "@/stores/users.ts";

export default function MyOrderSummary(properties) {
  const { type, assetAData, assetBData, usrLimitOrders } = properties;
  const { t, i18n } = useTranslation(locale.get(), { i18n: i18nInstance });
  const usr = useSyncExternalStore(
    $currentUser.subscribe,
    $currentUser.get,
    () => true
  );

  const isBuy = type === "buy";
  const accent = isBuy ? "text-emerald-300" : "text-rose-300";

  const filteredUsrLimitOrders = useMemo(
    () =>
      usrLimitOrders
        .filter((x) =>
          isBuy
            ? x.sell_price.base.asset_id === assetAData.id
            : x.sell_price.base.asset_id === assetBData.id
        )
        .map((res) => {
          const basePrecision = [assetAData, assetBData].find(
            (x) => x.id === res.sell_price.base.asset_id
          ).precision;

          const quotePrecision = [assetAData, assetBData].find(
            (x) => x.id === res.sell_price.quote.asset_id
          ).precision;

          const isInverted = isInvertedMarket(
            res.sell_price.base.asset_id,
            res.sell_price.quote.asset_id
          );

          let parsedBaseAmount = humanReadableFloat(
            res.sell_price.base.amount,
            basePrecision
          );
          let parsedQuoteAmount = humanReadableFloat(
            res.sell_price.quote.amount,
            quotePrecision
          );

          let price = parseFloat(
            !isInverted
              ? parsedBaseAmount * parsedQuoteAmount
              : parsedBaseAmount / parsedQuoteAmount
          );

          let receiving = 0;
          let paying = 0;
          const _paying = humanReadableFloat(res.for_sale, basePrecision);

          if (isBuy && !isInverted) {
            paying = (price * _paying).toFixed(quotePrecision);
            receiving = _paying.toFixed(basePrecision);
          } else if (isBuy && isInverted) {
            receiving = (price * _paying).toFixed(basePrecision);
            paying = _paying.toFixed(quotePrecision);
          } else if (!isBuy && !isInverted) {
            receiving = _paying.toFixed(quotePrecision);
            paying = (price * _paying).toFixed(basePrecision);
          } else if (!isBuy && isInverted) {
            receiving = (_paying / price).toFixed(quotePrecision);
            paying = _paying.toFixed(basePrecision);
          }

          return {
            ...res,
            price,
            paying,
            receiving,
            basePrecision,
            quotePrecision,
          };
        })
        .sort((a, b) => {
          return a.price - b.price;
        }),
    [usrLimitOrders, isBuy, assetAData, assetBData]
  );

  const orderElements = useMemo(
    () =>
      filteredUsrLimitOrders.map((res, index) => {
        const minBaseAmount = humanReadableFloat(1, res.basePrecision);
        const minQuoteAmount = humanReadableFloat(1, res.quotePrecision);

        const priceToShow =
          isBuy && res.price < minQuoteAmount
            ? `< ${minQuoteAmount}`
            : !isBuy && res.price < minBaseAmount
            ? `< ${minBaseAmount}`
            : isBuy
            ? res.price.toFixed(res.quotePrecision)
            : res.price.toFixed(res.basePrecision);

        const isSubMin =
          (isBuy && res.price < minQuoteAmount) ||
          (!isBuy && res.price < minBaseAmount);

        return (
          <Dialog key={`${type}Dialog${index}`}>
            <DialogTrigger asChild>
              <button
                type="button"
                className="grid grid-cols-4 gap-2 w-full text-left px-3 py-1.5 text-xs font-mono tabular-nums border-b border-white/[0.04] hover:bg-white/[0.04] transition-colors cursor-pointer"
                key={`mos_${index}_${type}`}
              >
                <div className={cn("text-right font-semibold", accent)}>
                  {isSubMin ? (
                    <TooltipProvider delayDuration={150}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help underline decoration-dotted underline-offset-2">
                            {priceToShow}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="!bg-slate-950 border border-white/10 text-white">
                          {res.price}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    priceToShow
                  )}
                </div>
                <div className="text-right text-white/80">{res.receiving}</div>
                <div className="text-right text-white/65">{res.paying}</div>
                <div className="text-right text-white/55 flex items-center justify-end gap-1">
                  <Clock className="h-3 w-3" />
                  <span className="font-sans">
                    {res.expiration.replace("T", " ")}
                  </span>
                </div>
              </button>
            </DialogTrigger>
            <DialogContent
              className="sm:max-w-[640px] !bg-slate-950 border border-white/10 text-white"
              style={{ backgroundColor: "#020617" }}
            >
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] text-white/70">
                    <ClipboardList className="h-4 w-4" />
                  </div>
                  <div>
                    <DialogTitle className="text-white">
                      {t("MyOrderSummary:editLimitOrderTitle")}
                    </DialogTitle>
                    <DialogDescription className="text-white/60">
                      {t("MyOrderSummary:editLimitOrderDescription")}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="mt-3 space-y-3">
                <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                  <p className="text-xs text-white/55 mb-2">
                    {t("MyOrderSummary:selectedOpenOrderData")}
                  </p>
                  <ScrollArea className="h-72 rounded-md border border-white/10 text-xs">
                    <pre className="text-white/80 p-2">{JSON.stringify(res, null, 2)}</pre>
                  </ScrollArea>
                </div>
                <div className="text-left">
                  <a href={`/order/index.html?id=${res.id}`}>
                    <Button className="mt-2 mr-2 gap-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 text-white hover:brightness-110 active:scale-[0.99] transition-all">
                      {t("MyOrderSummary:proceedToUpdateButton")}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </a>
                  <span className="text-xs text-white/50">
                    {t("MyOrderSummary:viewObjectOnbitshares")}
                  </span>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        );
      }),
    [filteredUsrLimitOrders, isBuy, accent, type, t]
  );

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] overflow-hidden">
      <div className="grid grid-cols-4 gap-2 px-3 py-2 border-b border-white/[0.06] bg-white/[0.02] text-[10px] font-semibold uppercase tracking-wider text-white/40">
        <div className="text-right">
          {t("MyOrderSummary:priceColumnTitle")}
        </div>
        <div className="text-right">{assetAData.symbol}</div>
        <div className="text-right">{assetBData.symbol}</div>
        <div className="text-right">
          {t("MyOrderSummary:expirationDateColumnTitle")}
        </div>
      </div>
      <ScrollArea className="h-72 w-full">
        <div className="flex flex-col">{orderElements}</div>
      </ScrollArea>
    </div>
  );
}
