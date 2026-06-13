import React, { useState, useEffect, useMemo, memo } from "react";
import DOMPurify from "dompurify";
import { Ban } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Avatar } from "@/components/Avatar.tsx";
import JsonDetailsDialog from "@/components/common/JsonDetailsDialog.jsx";
import {
  addBlockedUser,
  removeBlockedUser,
} from "@/stores/blocklist.ts";
import { getNftImages, getFlagBooleans } from "@/lib/common.js";
import { cn } from "@/lib/utils";
import { CopyButton } from "../../PredictionUtils";
import { OverviewTab, NftTab, OrgTab, MarketTab, DetailsTab, ActionsTab, WinnersTab, AdminTab } from "./tabs";

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
  const [rowView, setRowView] = useState("overview");
  const [heroIndex, setHeroIndex] = useState(0);
  useEffect(() => {
    setHeroIndex(0);
  }, [res?.id]);

  const nftImages = useMemo(() => {
    if (!res?.options?.description) return [];
    try {
      const _d = JSON.parse(res.options.description);
      return _d && _d.nft_object ? getNftImages(_d.nft_object) : [];
    } catch (_) {
      return [];
    }
  }, [res?.id]);

  const [jsonDialogOpen, setJsonDialogOpen] = useState(false);
  const [jsonPayload, setJsonPayload] = useState(null);
  const [blockConfirmOpen, setBlockConfirmOpen] = useState(false);

  const relevantBitassetData = res
    ? completedPMAs.find((x) => x.id === res.bitasset_data_id)
    : null;

  if (!res || !relevantBitassetData) {
    return null;
  }

  const symbol = res.symbol;
  const house = res.issuer;

  let foundAsset =
    marketSearch && marketSearch.length && symbol
      ? marketSearch.find((x) => x.s === symbol)
      : null;
  let username = foundAsset ? foundAsset.u : null;
  if (!username) {
    username =
      marketSearch && marketSearch.length && house
        ? marketSearch.find((x) => x.u.includes(`(${house})`))?.u
        : null;
  }

  const issuerIsLtm = !!(username && username.includes("(LTM)"));
  const issuerDisplayLabel = username
    ? username.replace(/\s*\(LTM\)\s*$/, "").trim()
    : null;
  const issuerDisplayName = issuerDisplayLabel
    ? issuerDisplayLabel.split(" (")[0]
    : null;

  const _desc = JSON.parse(res.options.description);
  const prediction_conditions = _desc.condition;
  const main_description = _desc.main;
  const expiration = _desc.expiry;
  const expirationMs = new Date(expiration).getTime();
  const isExpired = expirationMs <= now;
  const expirationHours = Math.floor((expirationMs - now) / 3600000);
  const market = _desc.market;
  const cleanedPrediction = DOMPurify.sanitize(prediction_conditions ?? "");
  const cleanedDescription = DOMPurify.sanitize(main_description ?? "");
  const hasNft = !!(res.options && _desc && _desc.nft_object);

  const parentPmoObject = useMemo(() => {
    if (!_desc) return null;
    if (_desc.pmo_object) return _desc.pmo_object;
    const sym = res?.symbol;
    if (!sym || !sym.includes(".")) return null;
    const prefix = sym.split(".")[0];
    if (!prefix) return null;
    const parent = combinedAssets.find((a) => a.symbol === prefix);
    if (!parent?.options?.description) return null;
    try {
      const pd = JSON.parse(parent.options.description);
      return pd?.pmo_object || null;
    } catch {
      return null;
    }
  }, [res?.id, combinedAssets]);
  const hasPmo = !!parentPmoObject;

  let relevantCallOrders = callOrders[res.id] || null;
  const totalBets =
    relevantCallOrders && relevantCallOrders.length
      ? relevantCallOrders.reduce((acc, val) => acc + val.collateral, 0)
      : 0;

  const usrCallOrder =
    relevantCallOrders && relevantCallOrders.length
      ? relevantCallOrders.filter((x) => x.borrower === usr.id)
      : null;
  const existingCollateral = usrCallOrder?.collateral || 0;

  const settlementFundRaw = relevantBitassetData
    ? Number(relevantBitassetData.settlement_fund || 0)
    : 0;
  const totalCollateral = totalBets + settlementFundRaw;
  const impliedYesPercent =
    totalCollateral > 0 ? (settlementFundRaw / totalCollateral) * 100 : 0;

  const _backingAssetID = res.backingAsset.id;
  const _backingPrecision = res.backingAsset.precision;
  const backingAssetBalance = usrBalances?.find(
    (x) => x.asset_id === _backingAssetID,
  );
  const humanReadableBackingAssetBalance = backingAssetBalance
    ? (backingAssetBalance.amount / Math.pow(10, _backingPrecision)).toFixed(
        _backingPrecision,
      )
    : 0;

  const predictionMarketAssetBalance = usrBalances?.find(
    (x) => x.asset_id === res.id,
  );
  const humanReadablePredictionMarketAssetBalance =
    predictionMarketAssetBalance
      ? (
          predictionMarketAssetBalance.amount / Math.pow(10, res.precision)
        ).toFixed(res.precision)
      : 0;

  const _flags = getFlagBooleans(res.options.flags);
  const _issuer_permissions = getFlagBooleans(res.options.issuer_permissions);

  const statusKey = (() => {
    if (!isExpired) return "active";
    if (relevantBitassetData?.outcome === 1) return "resolvedYes";
    if (relevantBitassetData?.outcome === 0) return "resolvedNo";
    return "awaiting";
  })();

  const statusStyles = {
    active: {
      border: "border-l-emerald-500",
      bg: "bg-emerald-500/15",
      text: "text-emerald-400",
      label: t("Predictions:status.active"),
    },
    resolvedYes: {
      border: "border-l-emerald-500",
      bg: "bg-emerald-500/15",
      text: "text-emerald-400",
      label: t("Predictions:status.resolvedYes"),
    },
    resolvedNo: {
      border: "border-l-rose-500",
      bg: "bg-rose-500/15",
      text: "text-rose-400",
      label: t("Predictions:status.resolvedNo"),
    },
    awaiting: {
      border: "border-l-amber-500",
      bg: "bg-amber-500/15",
      text: "text-amber-400",
      label: t("Predictions:status.awaiting"),
    },
  };

  const status = statusStyles[statusKey];

  const tabProps = {
    res,
    usr,
    _desc,
    relevantBitassetData,
    relevantCallOrders,
    totalBets,
    settlementFundRaw,
    impliedYesPercent,
    isExpired,
    expiration,
    expirationHours,
    now,
    market,
    view,
    t,
    cleanedPrediction,
    cleanedDescription,
    hasNft,
    hasPmo,
    parentPmoObject,
    nftImages,
    heroIndex,
    setHeroIndex,
    ipfsGateway,
    backingAssetBalance,
    humanReadableBackingAssetBalance,
    humanReadablePredictionMarketAssetBalance,
    existingCollateral,
    _backingAssetID,
    _backingPrecision,
    _issuer_permissions,
    _flags,
    expiredPMAs,
    house,
  };

  return (
    <Card
      className={cn(
        "w-full overflow-hidden border-l-4 shadow-md shadow-black/20 transition-all hover:shadow-xl hover:shadow-black/30 hover:-translate-y-0.5 bg-slate-900/80 border-white/[0.08] backdrop-blur-sm",
        status.border,
      )}
    >
      <CardHeader className="pb-2 pt-3">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 items-start">
          <div className="min-w-0">
            <CardTitle className="text-base sm:text-lg font-semibold leading-snug line-clamp-3 text-white">
              {cleanedPrediction || symbol}
            </CardTitle>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/50">
              <span className="font-mono font-medium text-white/80">
                {symbol}
              </span>
              <span className="text-white/20">·</span>
              <span className="font-mono text-[10px]">{res.id}</span>
              <CopyButton value={res.id} label={t("Predictions:copyAssetId")} />
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                  status.bg,
                  status.text,
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    statusKey === "active" && "bg-emerald-500 animate-pulse",
                    statusKey === "resolvedYes" && "bg-emerald-600",
                    statusKey === "resolvedNo" && "bg-rose-500",
                    statusKey === "awaiting" && "bg-amber-500",
                  )}
                />
                {status.label}
              </span>
              {hasNft ? (
                <span className="inline-flex items-center rounded-full bg-violet-500/10 border border-violet-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-violet-400">
                  NFT
                </span>
              ) : null}
              {hasPmo ? (
                <span className="inline-flex items-center rounded-full bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-400">
                  ORG
                </span>
              ) : null}
            </div>
          </div>
          <div className="md:text-right text-xs flex flex-wrap items-center md:justify-end gap-x-2 gap-y-1">
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] pl-0.5 pr-2 py-0.5 text-[11px] font-medium cursor-pointer hover:bg-white/[0.08] transition-colors"
              onClick={() => setIssuerFilter(house)}
              title={t("Predictions:list.filterByIssuer")}
            >
              <span className="inline-flex h-5 w-5 overflow-hidden rounded-full ring-1 ring-white/10">
                <Avatar
                  size={20}
                  name={issuerDisplayName ?? house}
                  extra="Issuer"
                  expression={{ eye: "normal", mouth: "open" }}
                  colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
                />
              </span>
              <span className="text-white/60">
                {issuerDisplayLabel ?? house}
              </span>
            </span>
            {issuerIsLtm ? (
              <span className="inline-flex items-center rounded-full bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400">
                LTM
              </span>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="text-sm pb-3 mt-1 text-white/70">
        <div className="grid grid-cols-1 gap-2">
          <TabBar
            rowView={rowView}
            setRowView={setRowView}
            hasNft={hasNft}
            hasPmo={hasPmo}
            view={view}
            usr={usr}
            house={house}
            setJsonPayload={setJsonPayload}
            setJsonDialogOpen={setJsonDialogOpen}
            res={res}
            relevantBitassetData={relevantBitassetData}
            _desc={_desc}
            userBlockedIDs={userBlockedIDs}
            blockConfirmOpen={blockConfirmOpen}
            setBlockConfirmOpen={setBlockConfirmOpen}
            usrDisplayLabel={issuerDisplayLabel}
            usrDisplayName={issuerDisplayName}
            username={username}
            t={t}
          />

          {rowView === "overview" && <OverviewTab {...tabProps} />}
          {rowView === "nft" && hasNft && <NftTab {...tabProps} />}
          {rowView === "org" && hasPmo && <OrgTab {...tabProps} />}
          {rowView === "market" && <MarketTab {...tabProps} />}
          {rowView === "details" && <DetailsTab {...tabProps} />}
          {rowView === "actions" && view !== "expired" && <ActionsTab {...tabProps} />}
          {rowView === "winners" && view === "expired" && <WinnersTab {...tabProps} />}
          {rowView === "admin" && usr.id === house && <AdminTab {...tabProps} />}
        </div>
        <JsonDetailsDialog
          open={jsonDialogOpen}
          onOpenChange={setJsonDialogOpen}
          data={jsonPayload}
        />
      </CardContent>
    </Card>
  );
});

function TabBar({
  rowView,
  setRowView,
  hasNft,
  hasPmo,
  view,
  usr,
  house,
  setJsonPayload,
  setJsonDialogOpen,
  res,
  relevantBitassetData,
  _desc,
  userBlockedIDs,
  blockConfirmOpen,
  setBlockConfirmOpen,
  usrDisplayLabel,
  usrDisplayName,
  username,
  t,
}) {
  return (
    <div className="flex flex-wrap items-center gap-1 mt-1 rounded-lg bg-white/[0.03] border border-white/[0.06] p-1 self-start">
      <Button
        onClick={() => setRowView("overview")}
        variant={rowView === "overview" ? "default" : "ghost"}
        size="sm"
        className={cn("h-7 text-xs", rowView !== "overview" && "text-white/50 hover:text-white/80 hover:bg-white/[0.06]")}
      >
        {t("Predictions:tab.overview")}
      </Button>
      {hasNft ? (
        <Button
          onClick={() => setRowView("nft")}
          variant={rowView === "nft" ? "default" : "ghost"}
          size="sm"
          className={cn("h-7 text-xs", rowView !== "nft" && "text-white/50 hover:text-white/80 hover:bg-white/[0.06]")}
        >
          {t("Predictions:tab.nft")}
        </Button>
      ) : null}
      {hasPmo ? (
        <Button
          onClick={() => setRowView("org")}
          variant={rowView === "org" ? "default" : "ghost"}
          size="sm"
          className={cn("h-7 text-xs", rowView !== "org" && "text-white/50 hover:text-white/80 hover:bg-white/[0.06]")}
        >
          {t("Predictions:tab.org")}
        </Button>
      ) : null}
      <Button
        onClick={() => setRowView("market")}
        variant={rowView === "market" ? "default" : "ghost"}
        size="sm"
        className={cn("h-7 text-xs", rowView !== "market" && "text-white/50 hover:text-white/80 hover:bg-white/[0.06]")}
      >
        {t("Predictions:tab.market")}
      </Button>
      <Button
        onClick={() => setRowView("details")}
        variant={rowView === "details" ? "default" : "ghost"}
        size="sm"
        className={cn("h-7 text-xs", rowView !== "details" && "text-white/50 hover:text-white/80 hover:bg-white/[0.06]")}
      >
        {t("Predictions:tab.details")}
      </Button>
      {view !== "expired" ? (
        <Button
          onClick={() => setRowView("actions")}
          variant={rowView === "actions" ? "default" : "ghost"}
          size="sm"
          className={cn("h-7 text-xs", rowView !== "actions" && "text-white/50 hover:text-white/80 hover:bg-white/[0.06]")}
        >
          {t("Predictions:tab.actions")}
        </Button>
      ) : (
        <Button
          onClick={() => setRowView("winners")}
          variant={rowView === "winners" ? "default" : "ghost"}
          size="sm"
          className={cn("h-7 text-xs", rowView !== "winners" && "text-white/50 hover:text-white/80 hover:bg-white/[0.06]")}
        >
          {t("Predictions:tab.winners")}
        </Button>
      )}
      {usr.id === house ? (
        <Button
          onClick={() => setRowView("admin")}
          variant={rowView === "admin" ? "default" : "ghost"}
          size="sm"
          className={cn("h-7 text-xs", rowView !== "admin" && "text-white/50 hover:text-white/80 hover:bg-white/[0.06]")}
        >
          {t("Predictions:tab.admin")}
        </Button>
      ) : null}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-white/40 hover:text-white hover:bg-white/10"
          >
            {t("Predictions:json.button")}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-slate-950 border-white/[0.08] shadow-2xl shadow-black/40">
          <DropdownMenuItem
            className="focus:bg-violet-500/20 focus:text-violet-200 hover:bg-white/10 text-white/70"
            onClick={() => {
              setJsonPayload(res);
              setJsonDialogOpen(true);
            }}
          >
            {t("Predictions:json.assetData")}
          </DropdownMenuItem>
          {relevantBitassetData ? (
            <DropdownMenuItem
              className="focus:bg-violet-500/20 focus:text-violet-200 hover:bg-white/10 text-white/70"
              onClick={() => {
                setJsonPayload(relevantBitassetData);
                setJsonDialogOpen(true);
              }}
            >
              {t("Predictions:json.bitassetData")}
            </DropdownMenuItem>
          ) : null}
          {_desc ? (
            <DropdownMenuItem
              className="focus:bg-violet-500/20 focus:text-violet-200 hover:bg-white/10 text-white/70"
              onClick={() => {
                setJsonPayload(_desc);
                setJsonDialogOpen(true);
              }}
            >
              {t("Predictions:json.descriptionData")}
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
      {usr && usr.id && house && house !== usr.id ? (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-7 w-7",
                  userBlockedIDs.has(house)
                    ? "text-red-600 hover:text-red-700"
                    : "text-white/40 hover:text-red-400",
                )}
                onClick={() => {
                  if (userBlockedIDs.has(house)) {
                    removeBlockedUser(usr.chain, {
                      name: usrDisplayLabel ?? username ?? house,
                      id: house,
                    });
                  } else {
                    setBlockConfirmOpen(true);
                  }
                }}
                aria-label={
                  userBlockedIDs.has(house)
                    ? t("Predictions:json.unblockIssuer")
                    : t("Predictions:json.blockIssuer")
                }
              >
                <Ban className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {userBlockedIDs.has(house)
                ? t("Predictions:json.unblockIssuer")
                : t("Predictions:json.blockIssuer")}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : null}

      {usr && usr.id && house && house !== usr.id ? (
        <AlertDialog
          open={blockConfirmOpen}
          onOpenChange={setBlockConfirmOpen}
        >
          <AlertDialogContent className="bg-slate-950 border-white/[0.08] text-white shadow-2xl shadow-black/40">
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t("Predictions:blockConfirm.title")}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t("Predictions:blockConfirm.description")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex items-center gap-3 rounded-md border border-white/[0.08] bg-white/[0.03] p-3">
              <span className="inline-flex h-10 w-10 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-white/10">
                <Avatar
                  size={40}
                  name={usrDisplayName ?? house}
                  extra="BlockConfirm"
                  expression={{ eye: "normal", mouth: "unhappy" }}
                  colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
                />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white truncate">
                  {usrDisplayName ?? house}
                </div>
                <div className="font-mono text-xs text-white/50">{house}</div>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white/[0.05] border-white/[0.08] text-white/70 hover:bg-white/10 hover:text-white">
                {t("Predictions:blockConfirm.cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => {
                  addBlockedUser(usr.chain, {
                    name: usrDisplayLabel ?? username ?? house,
                    id: house,
                  });
                }}
              >
                {t("Predictions:blockConfirm.confirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </div>
  );
}