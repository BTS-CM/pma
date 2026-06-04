import React, {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { useStore } from "@nanostores/react";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex as toHex, utf8ToBytes } from "@noble/hashes/utils.js";
import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";

import {
  Card,
  CardContent,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import { List } from "react-window";

import {
  ArrowLeftRight,
  Copy,
  ListOrdered,
  Loader2Icon,
  Pencil,
  RefreshCw,
  XCircle,
} from "lucide-react";

import { useInitCache } from "@/nanoeffects/Init.ts";
import { createAccountLimitOrderStore } from "@/nanoeffects/AccountLimitOrders.ts";
import { revalidateAccountLimitOrders } from "@/nanoeffects/AccountLimitOrders.ts";

import { $currentUser } from "@/stores/users.ts";
import { $blockList } from "@/stores/blocklist.ts";
import { $currentNode } from "@/stores/node.ts";

import DeepLinkDialog from "./common/DeepLinkDialog.jsx";
import { humanReadableFloat } from "@/lib/common";

const TIME_TICK_MS = 30_000;

function formatTimeRemaining(expiration, now) {
  const expirationDate = new Date(expiration);
  const timeDiff = expirationDate - now;
  if (timeDiff <= 0) {
    return "0d 0h 0m";
  }
  const minutes = Math.floor((timeDiff / 1000 / 60) % 60);
  const hours = Math.floor((timeDiff / 1000 / 60 / 60) % 24);
  const days = Math.floor(timeDiff / 1000 / 60 / 60 / 24);
  return `${days}d ${hours}h ${minutes}m`;
}

function CopyIdButton({ orderId, t }) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => {
              if (typeof navigator !== "undefined" && navigator.clipboard) {
                navigator.clipboard.writeText(orderId).catch(() => {});
              }
            }}
            aria-label={t("PortfolioTabs:copyOrderIdTooltip")}
            className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-slate-700 transition-colors max-w-[140px] truncate"
          >
            <span className="truncate">{orderId}</span>
            <Copy className="h-3 w-3 flex-shrink-0" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>{t("PortfolioTabs:copyOrderIdTooltip")}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function ActionIconLink({ href, icon: Icon, label, accent = "slate" }) {
  const palette = {
    slate: "text-slate-600 hover:bg-slate-100",
    destructive: "text-rose-600 hover:bg-rose-50",
  }[accent];
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            href={href}
            aria-label={label}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors ${palette}`}
          >
            <Icon className="h-4 w-4" />
          </a>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function ActionLabelLink({
  href,
  icon: Icon,
  children,
  accent = "outline",
  onClick,
}) {
  const palette = {
    outline:
      "border border-slate-200 text-slate-700 hover:bg-slate-100",
    destructive: "bg-rose-600 text-white hover:bg-rose-700",
  }[accent];
  const className = `inline-flex h-8 items-center justify-center gap-1.5 px-3 rounded-full text-sm font-medium transition-colors ${palette}`;
  if (onClick && !href) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={className}
      >
        <Icon className="h-3.5 w-3.5" />
        <span>{children}</span>
      </button>
    );
  }
  return (
    <a href={href} className={className}>
      <Icon className="h-3.5 w-3.5" />
      <span>{children}</span>
    </a>
  );
}

export default function PortfolioOpenOrders({
  _assetsBTS,
  _assetsTEST,
  _poolsBTS,
  _poolsTEST,
}) {
  const { t } = useTranslation(locale.get(), { i18n: i18nInstance });
  const usr = useSyncExternalStore(
    $currentUser.subscribe,
    $currentUser.get,
    () => true
  );
  const blocklist = useSyncExternalStore(
    $blockList.subscribe,
    $blockList.get,
    () => true
  );
  useStore($currentNode); // keep reactive to node changes (orders store doesn't take node url)

  const _chain = useMemo(
    () => (usr && usr.chain ? usr.chain : "bitshares"),
    [usr]
  );

  const assets = useMemo(() => {
    if (!_chain || (!_assetsBTS && !_assetsTEST)) return [];
    if (_chain !== "bitshares") return _assetsTEST;
    const relevantAssets = _assetsBTS.filter((asset) => {
      return !blocklist.users.includes(
        toHex(sha256(utf8ToBytes(asset.issuer)))
      );
    });
    return relevantAssets;
  }, [blocklist, _assetsBTS, _assetsTEST, _chain]);

  useInitCache(_chain ?? "bitshares", []);

  const [openOrderCounter, setOpenOrderCounter] = useState(0);
  const [openOrders, setOpenOrders] = useState();
  const [openOrdersLoading, setOpenOrdersLoading] = useState(false);
  const [orderID, setOrderID] = useState();
  const [showDialog, setShowDialog] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [rowHeight, setRowHeight] = useState(108);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), TIME_TICK_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => {
      setRowHeight(window.innerWidth < 768 ? 184 : 108);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    async function fetchLimitOrders() {
      if (usr && usr.id) {
        const limitOrdersStore = createAccountLimitOrderStore([
          usr.chain,
          usr.id,
        ]);
        limitOrdersStore.subscribe(({ data, error, loading }) => {
          setOpenOrdersLoading(Boolean(loading));
          if (data && !error && !loading) {
            setOpenOrders(data);
          }
          if (!data && !loading && error) {
            setOpenOrders([]);
          }
        });
      }
    }
    fetchLimitOrders();
  }, [usr, openOrderCounter]);

  // Refresh the list whenever a cancel dialog closes (broadcast or cancel).
  // The store is cached by nanoquery on the same (chain, accountID) tuple, so
  // we have to bump the counter to force a re-fetch.
  useEffect(() => {
    if (!showDialog && orderID) {
      setOpenOrderCounter((c) => c + 1);
      setOrderID(undefined);
    }
  }, [showDialog, orderID]);

  const sortedOpenOrders = useMemo(() => {
    if (!openOrders || !openOrders.length) return openOrders;
    // Sort newest first. Bitshares order IDs are chain-allocated so a
    // lexicographic descending sort on `id` is a good proxy for creation time.
    return [...openOrders].sort((a, b) => {
      if (a.id < b.id) return 1;
      if (a.id > b.id) return -1;
      return 0;
    });
  }, [openOrders]);

  const OpenOrdersRow = ({ index, style }) => {
    const order = sortedOpenOrders[index];
    if (!order) return null;

    const sellPriceBaseAmount = order.sell_price.base.amount;
    const sellPriceBaseAssetId = order.sell_price.base.asset_id;
    const sellPriceQuoteAmount = order.sell_price.quote.amount;
    const sellPriceQuoteAssetId = order.sell_price.quote.asset_id;
    const orderId = order.id;
    const expiration = order.expiration;

    const sellAsset =
      assets.find((asset) => asset.id === sellPriceBaseAssetId) || null;
    const buyAsset =
      assets.find((asset) => asset.id === sellPriceQuoteAssetId) || null;

    const readableBaseAmount = sellAsset
      ? humanReadableFloat(sellPriceBaseAmount, sellAsset.precision)
      : sellPriceBaseAmount;
    const readableQuoteAmount = buyAsset
      ? humanReadableFloat(sellPriceQuoteAmount, buyAsset.precision)
      : sellPriceQuoteAmount;

    // Price as QUOTE per BASE
    let priceDisplay = "-";
    if (sellAsset && buyAsset && Number(readableBaseAmount) > 0) {
      const price = Number(readableQuoteAmount) / Number(readableBaseAmount);
      priceDisplay = price.toLocaleString(undefined, {
        maximumFractionDigits: 8,
      });
    }

    const expiryText = formatTimeRemaining(expiration, now);

    const marketHref = `/dex/index.html?market=${sellAsset?.symbol ?? "?"}_${
      buyAsset?.symbol ?? "?"
    }`;
    const updateHref = `/order/index.html?id=${orderId}`;

    const isCancelOpen = showDialog && orderId === orderID;
    const cancelOfferKey = t("PortfolioTabs:cancelOffer", {
      baseAmount: readableBaseAmount,
      baseSymbol: sellAsset?.symbol,
      quoteAmount: readableQuoteAmount,
      quoteSymbol: buyAsset?.symbol,
    });

    return (
      <div style={{ ...style, paddingRight: "10px" }}>
        {/* Mobile: stacked card */}
        <Card className="group bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all rounded-xl block md:hidden">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1 min-w-0">
                <div className="text-sm font-semibold text-slate-900 truncate">
                  {readableBaseAmount} {sellAsset?.symbol ?? "?"} →{" "}
                  {readableQuoteAmount} {buyAsset?.symbol ?? "?"}
                </div>
                <CopyIdButton orderId={orderId} t={t} />
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-semibold text-slate-900">
                  {priceDisplay}
                </div>
                <div className="text-xs text-slate-400">
                  {buyAsset?.symbol}/{sellAsset?.symbol}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="font-semibold text-slate-900">
                {expiryText}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <ActionLabelLink href={marketHref} icon={ArrowLeftRight} accent="outline">
                {t("PortfolioTabs:tradeButton")}
              </ActionLabelLink>
              <ActionLabelLink href={updateHref} icon={Pencil} accent="outline">
                {t("PortfolioTabs:updateButton")}
              </ActionLabelLink>
              <ActionLabelLink
                icon={XCircle}
                accent="destructive"
                onClick={() => {
                  setOrderID(orderId);
                  setShowDialog(true);
                }}
              >
                {t("PortfolioTabs:cancelButton")}
              </ActionLabelLink>
            </div>
          </CardContent>
        </Card>

        {/* Desktop: 4-col row */}
        <Card className="group bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all rounded-xl hidden md:block">
          <CardContent className="p-4">
            <div className="grid grid-cols-[1.5fr_1fr_1fr_auto] gap-4 items-center">
              <div className="space-y-1.5 min-w-0">
                <div className="text-sm font-semibold text-slate-900 truncate">
                  {readableBaseAmount} {sellAsset?.symbol ?? "?"} →{" "}
                  {readableQuoteAmount} {buyAsset?.symbol ?? "?"}
                </div>
                <CopyIdButton orderId={orderId} t={t} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900">
                  {priceDisplay}
                </div>
                <div className="text-xs text-slate-400">
                  {buyAsset?.symbol}/{sellAsset?.symbol}
                </div>
              </div>
              <div className="text-sm font-semibold text-slate-900">
                {expiryText}
              </div>
              <div className="flex items-center gap-1">
                <ActionIconLink
                  href={marketHref}
                  icon={ArrowLeftRight}
                  label={t("PortfolioTabs:tradeButton")}
                />
                <ActionIconLink
                  href={updateHref}
                  icon={Pencil}
                  label={t("PortfolioTabs:updateButton")}
                />
                <button
                  type="button"
                  aria-label={t("PortfolioTabs:cancelButton")}
                  onClick={() => {
                    setOrderID(orderId);
                    setShowDialog(true);
                  }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {isCancelOpen ? (
          <DeepLinkDialog
            operationNames={["limit_order_cancel"]}
            username={usr.username}
            usrChain={usr.chain}
            userID={usr.id}
            dismissCallback={setShowDialog}
            key={`Cancelling${orderId}`}
            headerText={cancelOfferKey}
            trxJSON={[
              {
                fee_paying_account: usr.id,
                order: orderId,
                extensions: [],
              },
            ]}
          />
        ) : null}
      </div>
    );
  };

  const hasOrders =
    sortedOpenOrders && sortedOpenOrders.length > 0;

  return (
    <div className="container mx-auto mt-5 mb-5 max-w-5xl">
      {/* Page header bar */}
      <div className="flex items-center justify-between gap-3 px-5 py-4 mb-4 rounded-xl bg-white border border-slate-200">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 flex-shrink-0">
            <ListOrdered className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-xl font-bold tracking-tight text-slate-900 truncate">
              {t("PortfolioTabs:openOrdersTitle")}
            </CardTitle>
            {hasOrders ? (
              <p className="text-xs text-slate-500 mt-0.5">
                {t("PortfolioTabs:orderSummaryCount", {
                  count: sortedOpenOrders.length,
                })}
              </p>
            ) : null}
          </div>
        </div>
        <Button
          variant="default"
          size="sm"
          onClick={() => {
            setOpenOrders(undefined);
            if (usr && usr.id) {
              revalidateAccountLimitOrders(usr.chain, usr.id);
            }
            setOpenOrderCounter((c) => c + 1);
          }}
          disabled={openOrdersLoading}
          aria-busy={openOrdersLoading}
          className="gap-2"
        >
          {openOrdersLoading ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span>{t("PortfolioTabs:refreshOpenOrdersButton")}</span>
        </Button>
      </div>

      <Card>
        <CardContent>
          {openOrdersLoading && !hasOrders ? (
            <div
              className="space-y-2"
              aria-busy="true"
              aria-live="polite"
            >
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white"
                >
                  <Skeleton className="h-4 w-14 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <div className="flex gap-1">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : hasOrders ? (
            <div className="max-h-[600px] overflow-auto -mx-2 pt-2">
              <List
                rowComponent={OpenOrdersRow}
                rowCount={sortedOpenOrders.length}
                rowHeight={rowHeight}
                rowProps={{}}
              />
            </div>
          ) : (
            <Empty className="mt-2 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ListOrdered className="h-6 w-6" />
                </EmptyMedia>
                <EmptyTitle>{t("PortfolioTabs:noOpenOrdersTitle")}</EmptyTitle>
                <EmptyDescription>
                  {t("PortfolioTabs:noOpenOrdersDescription")}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button asChild>
                  <a href="/dex/index.html">
                    {t("PortfolioTabs:noOpenOrdersCta")}
                  </a>
                </Button>
              </EmptyContent>
            </Empty>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
