import React, { useState, useEffect, useMemo, memo } from "react";
import DOMPurify from "dompurify";
import { Ban, ExternalLink as ExternalLinkIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar } from "@/components/Avatar.tsx";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getNftImages, getFlagBooleans } from "@/lib/common.js";
import { cn } from "@/lib/utils";
import { CopyButton, StatBlock } from "../../PredictionUtils";
import { prettifyDate, formatTimeRemaining } from "../../utils/formatters";
import { humanReadableFloat } from "@/lib/common.js";
import { addBlockedUser, removeBlockedUser } from "@/stores/blocklist.ts";
import { PredictionDetailDialog } from "./PredictionDetailDialog";

const STATUS_STYLES = {
  active: { border: "border-l-emerald-500", bg: "bg-emerald-500/15", text: "text-emerald-400", i18nKey: "Predictions:status.active" },
  resolvedYes: { border: "border-l-emerald-500", bg: "bg-emerald-500/15", text: "text-emerald-400", i18nKey: "Predictions:status.resolvedYes" },
  resolvedNo: { border: "border-l-rose-500", bg: "bg-rose-500/15", text: "text-rose-400", i18nKey: "Predictions:status.resolvedNo" },
  awaiting: { border: "border-l-amber-500", bg: "bg-amber-500/15", text: "text-amber-400", i18nKey: "Predictions:status.awaiting" },
};

export const PredictionRow = memo(function PredictionRow({
  res,
  completedPMAs,
  callOrders,
  usrBalances,
  usr,
  marketSearch,
  combinedAssets,
  expiredPMAs,
  userBlockedIDs,
  ipfsGateway,
  view,
  now,
  setIssuerFilter,
  t,
}) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [blockConfirmOpen, setBlockConfirmOpen] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  useEffect(() => { setHeroIndex(0); }, [res?.id]);

  const nftImages = useMemo(() => {
    if (!res?.options?.description) return [];
    try {
      const _d = JSON.parse(res.options.description);
      return _d && _d.nft_object ? getNftImages(_d.nft_object) : [];
    } catch (_) { return []; }
  }, [res?.id]);

  const relevantBitassetData = res ? completedPMAs.find((x) => x.id === res.bitasset_data_id) : null;

  const _desc = useMemo(() => {
    if (!res?.options?.description) return null;
    try { return JSON.parse(res.options.description); } catch { return null; }
  }, [res?.options?.description]);

  const parentPmoObject = useMemo(() => {
    if (!_desc) return null;
    if (_desc.pmo_object) return _desc.pmo_object;
    const sym = res?.symbol;
    if (!sym || !sym.includes(".")) return null;
    const prefix = sym.split(".")[0];
    if (!prefix) return null;
    const parent = combinedAssets.find((a) => a.symbol === prefix);
    if (!parent?.options?.description) return null;
    try { const pd = JSON.parse(parent.options.description); return pd?.pmo_object || null; } catch { return null; }
  }, [res?.id, combinedAssets, _desc]);

  const cleanedPrediction = useMemo(() => DOMPurify.sanitize(_desc?.condition ?? ""), [_desc?.condition]);
  const cleanedDescription = useMemo(() => DOMPurify.sanitize(_desc?.main ?? ""), [_desc?.main]);

  const _flags = useMemo(() => getFlagBooleans(res?.options?.flags), [res?.options?.flags]);
  const _issuer_permissions = useMemo(() => getFlagBooleans(res?.options?.issuer_permissions), [res?.options?.issuer_permissions]);

  const _backingAssetID = res?.backingAsset?.id;
  const _backingPrecision = res?.backingAsset?.precision;
  const backingAssetBalance = useMemo(() => usrBalances?.find((x) => x.asset_id === _backingAssetID), [usrBalances, _backingAssetID]);
  const predictionMarketAssetBalance = useMemo(() => usrBalances?.find((x) => x.asset_id === res?.id), [usrBalances, res?.id]);

  const relevantCallOrders = callOrders[res?.id] || null;
  const existingCollateral = useMemo(() => {
    const usrCallOrder = relevantCallOrders?.filter((x) => x.borrower === usr?.id) || null;
    return usrCallOrder?.collateral || 0;
  }, [relevantCallOrders, usr?.id]);

  const totalBets = relevantCallOrders?.length ? relevantCallOrders.reduce((acc, val) => acc + val.collateral, 0) : 0;
  const settlementFundRaw = relevantBitassetData ? Number(relevantBitassetData.settlement_fund || 0) : 0;
  const totalCollateral = totalBets + settlementFundRaw;
  const humanReadableBackingAssetBalance = backingAssetBalance ? (backingAssetBalance.amount / Math.pow(10, _backingPrecision || 0)).toFixed(_backingPrecision || 0) : 0;
  const humanReadablePredictionMarketAssetBalance = predictionMarketAssetBalance ? (predictionMarketAssetBalance.amount / Math.pow(10, res?.precision || 0)).toFixed(res?.precision || 0) : 0;

  const isExpired = _desc ? new Date(_desc.expiry).getTime() <= now : false;
  const expirationHours = _desc ? Math.floor((new Date(_desc.expiry).getTime() - now) / 3600000) : 0;

  const tabProps = useMemo(() => ({
    res, usr, _desc, relevantBitassetData, relevantCallOrders, totalBets, settlementFundRaw,
    impliedYesPercent: totalCollateral > 0 ? (settlementFundRaw / totalCollateral) * 100 : 0,
    isExpired, expiration: _desc?.expiry, expirationHours, now, market: _desc?.market, view, t,
    cleanedPrediction, cleanedDescription, hasNft: !!(res?.options && _desc && _desc.nft_object), hasPmo: !!parentPmoObject, parentPmoObject, nftImages,
    heroIndex, setHeroIndex, ipfsGateway, backingAssetBalance, humanReadableBackingAssetBalance,
    humanReadablePredictionMarketAssetBalance, existingCollateral, _backingAssetID, _backingPrecision,
    _issuer_permissions, _flags, expiredPMAs, house: res?.issuer,
  }), [res?.id, usr?.id, _desc, relevantBitassetData, relevantCallOrders, totalBets, settlementFundRaw,
    isExpired, expirationHours, now, view, t,
    cleanedPrediction, cleanedDescription, nftImages,
    heroIndex, ipfsGateway, backingAssetBalance, humanReadableBackingAssetBalance,
    humanReadablePredictionMarketAssetBalance, existingCollateral, _backingAssetID, _backingPrecision,
    _issuer_permissions, _flags, expiredPMAs, totalCollateral]);

  if (!res || !relevantBitassetData) return null;

  const symbol = res.symbol;
  const house = res.issuer;

  let foundAsset = marketSearch?.length && symbol ? marketSearch.find((x) => x.s === symbol) : null;
  let username = foundAsset ? foundAsset.u : null;
  if (!username) {
    username = marketSearch?.length && house ? marketSearch.find((x) => x.u.includes(`(${house})`))?.u : null;
  }

  const issuerIsLtm = !!(username && username.includes("(LTM)"));
  const issuerDisplayLabel = username ? username.replace(/\s*\(LTM\)\s*$/, "").trim() : null;
  const issuerDisplayName = issuerDisplayLabel ? issuerDisplayLabel.split(" (")[0] : null;

  const expiration = _desc.expiry;
  const market = _desc.market;
  const hasNft = !!(res.options && _desc && _desc.nft_object);
  const hasPmo = !!parentPmoObject;

  const statusKey = !isExpired ? "active" : relevantBitassetData?.outcome === 1 ? "resolvedYes" : relevantBitassetData?.outcome === 0 ? "resolvedNo" : "awaiting";
  const status = STATUS_STYLES[statusKey];
  const statusLabel = t(status.i18nKey);

  return (
    <>
      <Card
        className={cn(
          "w-full overflow-hidden border-l-4 rounded-lg ring-1 ring-white/[0.06] shadow-md shadow-black/20 transition-all duration-200 hover:shadow-xl hover:shadow-black/40 hover:translate-x-1 hover:ring-white/[0.15] bg-slate-900/90 border-white/[0.10] backdrop-blur-sm cursor-pointer group",
          status.border,
        )}
        onClick={() => setDetailOpen(true)}
      >
        <CardHeader className="pb-2 pt-3">
          <CardTitle className="text-base sm:text-lg font-semibold leading-snug line-clamp-3 text-white">
            {cleanedPrediction || symbol}
          </CardTitle>
          <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs text-white/50">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-mono font-medium text-white/80">{symbol}</span>
              <span className="text-white/20">·</span>
              <span className="font-mono text-[10px]">{res.id}</span>
              <CopyButton value={res.id} label={t("Predictions:copyAssetId")} />
              <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", status.bg, status.text)}>
                <span className={cn("h-1.5 w-1.5 rounded-full", statusKey === "active" && "bg-emerald-500 animate-pulse", statusKey === "resolvedYes" && "bg-emerald-600", statusKey === "resolvedNo" && "bg-rose-500", statusKey === "awaiting" && "bg-amber-500")} />
                {statusLabel}
              </span>
              {hasNft ? <span className="inline-flex items-center rounded-full bg-violet-500/10 border border-violet-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-violet-400">NFT</span> : null}
              {hasPmo ? <span className="inline-flex items-center rounded-full bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-400">ORG</span> : null}
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span
                className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] pl-0.5 pr-2 py-0.5 text-[11px] font-medium cursor-pointer hover:bg-white/[0.08] transition-colors"
                onClick={(e) => { e.stopPropagation(); setIssuerFilter(house); }}
                title={t("Predictions:list.filterByIssuer")}
              >
                <span className="inline-flex h-5 w-5 overflow-hidden rounded-full ring-1 ring-white/10">
                  <Avatar size={20} name={issuerDisplayName ?? house} extra="Issuer" expression={{ eye: "normal", mouth: "open" }} colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]} />
                </span>
                <span className="text-white/60">{issuerDisplayLabel ?? house}</span>
              </span>
              {issuerIsLtm ? (
                <span className="inline-flex items-center rounded-full bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400">LTM</span>
              ) : null}
              {usr && usr.id && house && house !== usr.id ? (
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-6 w-6",
                          userBlockedIDs.has(house) ? "text-red-600 hover:text-red-700" : "text-white/40 hover:text-red-400",
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (userBlockedIDs.has(house)) {
                            removeBlockedUser(usr.chain, { name: issuerDisplayLabel ?? username ?? house, id: house });
                          } else {
                            setBlockConfirmOpen(true);
                          }
                        }}
                      >
                        <Ban className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      {userBlockedIDs.has(house) ? t("Predictions:json.unblockIssuer") : t("Predictions:json.blockIssuer")}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : null}
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-sm pb-3 text-white/70">
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            <StatBlock label={t(`Predictions:${isExpired ? "expired_at" : "expiration"}`)} value={prettifyDate(expiration)} mono />
            <StatBlock label={isExpired ? t("Predictions:timeExpired") : t("Predictions:timeLeft")} value={formatTimeRemaining(expiration)} mono />
            {view === "expired" ? (
              <StatBlock label={t("Predictions:outcome")} accent={relevantBitassetData?.outcome === 1 ? "emerald" : relevantBitassetData?.outcome === 0 ? "rose" : "amber"}
                value={relevantBitassetData?.outcome === 1 ? t("Predictions:outcome.yes") : relevantBitassetData?.outcome === 0 ? t("Predictions:outcome.no") : t("Predictions:outcome.unresolved")} />
            ) : view === "mine" || view === "portfolio" ? (
              <StatBlock label={t("Predictions:balance")} value={`${humanReadablePredictionMarketAssetBalance} ${symbol}`} mono />
            ) : (
              <StatBlock label={t("Predictions:unique_sellers")} value={relevantCallOrders?.length || 0} mono />
            )}
            <StatBlock label={t("Predictions:bettingAsset")} value={market} mono />
            {view === "expired" ? (
              <StatBlock label={t("Predictions:prize_pool")} value={relevantBitassetData ? `${humanReadableFloat(relevantBitassetData.settlement_fund, res.precision)} ${market}` : `0 ${market}`} mono />
            ) : view === "mine" || view === "portfolio" ? null : (
              <StatBlock label={t("Predictions:openInterest")} help={t("Predictions:openInterest_help")} value={`${humanReadableFloat(totalBets, res.precision)} ${market}`} mono />
            )}
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-white/30 group-hover:text-white/50 transition-colors">
            <ExternalLinkIcon className="h-3 w-3" />
            {t("Predictions:list.clickToView")}
          </div>
        </CardContent>
      </Card>

      <PredictionDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        tabProps={tabProps}
        res={res}
        _desc={_desc}
        relevantBitassetData={relevantBitassetData}
        cleanedPrediction={cleanedPrediction}
        symbol={symbol}
        house={house}
        status={status}
        statusKey={statusKey}
        hasNft={hasNft}
        hasPmo={hasPmo}
        view={view}
        usr={usr}
        userBlockedIDs={userBlockedIDs}
        issuerDisplayLabel={issuerDisplayLabel}
        issuerDisplayName={issuerDisplayName}
        username={username}
        issuerIsLtm={issuerIsLtm}
        t={t}
      />

      {usr && usr.id && house && house !== usr.id ? (
        <AlertDialog open={blockConfirmOpen} onOpenChange={setBlockConfirmOpen}>
          <AlertDialogContent className="bg-slate-900 ring-1 ring-white/[0.08] border-white/[0.06] text-white shadow-2xl shadow-black/60">
            <AlertDialogHeader>
              <AlertDialogTitle>{t("Predictions:blockConfirm.title")}</AlertDialogTitle>
              <AlertDialogDescription>{t("Predictions:blockConfirm.description")}</AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex items-center gap-3 rounded-md border border-white/[0.08] bg-white/[0.03] p-3">
              <span className="inline-flex h-10 w-10 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-white/10">
                <Avatar size={40} name={issuerDisplayName ?? house} extra="BlockConfirm" expression={{ eye: "normal", mouth: "unhappy" }} colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]} />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white truncate">{issuerDisplayName ?? house}</div>
                <div className="font-mono text-xs text-white/50">{house}</div>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white/[0.05] border-white/[0.08] text-white/70 hover:bg-white/10 hover:text-white">
                {t("Predictions:blockConfirm.cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => addBlockedUser(usr.chain, { name: issuerDisplayLabel ?? username ?? house, id: house })}
              >
                {t("Predictions:blockConfirm.confirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </>
  );
});