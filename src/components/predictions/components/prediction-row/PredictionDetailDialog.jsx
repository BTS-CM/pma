import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { addBlockedUser, removeBlockedUser } from "@/stores/blocklist.ts";
import { Ban, ChevronDown, ChevronUp, CheckCircle, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { CopyButton, ProbabilityBar, LongText, MonoBlock, NftHero, NftThumbStrip } from "../../PredictionUtils";
import { getNftMediaEntries, humanReadableFloat, ipfsUrl } from "@/lib/common.js";
import { prettifyDate, formatTimeRemaining } from "../../utils/formatters";
import DOMPurify from "dompurify";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ImageIcon, QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import HoverInfo from "@/components/common/HoverInfo.tsx";
import { IssueDialog } from "./dialogs/IssueDialog";
import { SellDialog } from "./dialogs/SellDialog";
import { BuyDialog } from "./dialogs/BuyDialog";
import { ClaimDialog } from "./dialogs/ClaimDialog";
import { ResolveDialog } from "./dialogs/ResolveDialog";
import { PricefeederDialog } from "./dialogs/PricefeederDialog";
import { FeedPriceDialog } from "./dialogs/FeedPriceDialog";

const AVATAR_COLORS = ["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"];
const AVATAR_EYES_OPEN = { eye: "normal", mouth: "open" };
const AVATAR_EYES_UNHAPPY = { eye: "normal", mouth: "unhappy" };

const MemoizedHeroStat = React.memo(HeroStat);

function HeroStat({ label, value, accent, mono, help }) {
  const accents = {
    amber: "border-amber-500/20 bg-amber-500/[0.07] text-amber-400",
    blue: "border-blue-500/20 bg-blue-500/[0.07] text-blue-400",
    cyan: "border-cyan-500/20 bg-cyan-500/[0.07] text-cyan-400",
    violet: "border-violet-500/20 bg-violet-500/[0.07] text-violet-400",
    emerald: "border-emerald-500/20 bg-emerald-500/[0.07] text-emerald-400",
    rose: "border-rose-500/20 bg-rose-500/[0.07] text-rose-400",
    indigo: "border-indigo-500/20 bg-indigo-500/[0.07] text-indigo-400",
  };
  return (
    <div className={cn("min-w-0 rounded-xl border px-4 py-3 transition-all hover:brightness-110", accents[accent] || "border-border bg-accent/30 dark:bg-white/[0.05]")}>
      <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1 flex items-center gap-1">
        {label}
        {help ? (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger>
                <QuestionMarkCircledIcon className="h-3 w-3 text-muted-foreground/60" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-xs">{help}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : null}
      </div>
      <div className={cn("break-words text-lg font-bold leading-tight text-foreground", mono && "font-mono tabular-nums")}>
        {value}
      </div>
    </div>
  );
}

function SubsectionLabel({ children }) {
  return (
    <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </div>
  );
}

function MediaUrlList({ title, entries }) {
  if (!entries || !entries.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border bg-accent/30 dark:bg-white/[0.05] p-3">
      <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </div>
      <div className="mt-2 grid grid-cols-1 gap-2">
        {entries.map((entry, index) => (
          <div key={`${entry.type}-${entry.url}-${index}`} className="min-w-0 rounded-lg border border-border/60 bg-black/10 px-3 py-2">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {entry.type}
            </div>
            <div className="mt-1 break-all font-mono text-xs text-foreground/70">
              {entry.url}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function normalizePmoMetadata(parentPmoObject) {
  if (!parentPmoObject) {
    return null;
  }

  return {
    identity: {
      name: parentPmoObject.identity?.name || parentPmoObject.name || null,
      website: parentPmoObject.identity?.website || parentPmoObject.website || null,
      manifest: parentPmoObject.identity?.manifest || parentPmoObject.manifest || null,
    },
    governance: {
      onchain_account:
        parentPmoObject.governance?.onchain_account ||
        parentPmoObject.onchain_account ||
        null,
      resolution_policy:
        parentPmoObject.governance?.resolution_policy ||
        parentPmoObject.resolution_policy ||
        null,
      dispute_mechanism:
        parentPmoObject.governance?.dispute_mechanism ||
        parentPmoObject.dispute_mechanism ||
        null,
    },
    attestation: parentPmoObject.attestation || null,
    pmo_signature: parentPmoObject.pmo_signature || null,
  };
}

function SectionHeader({ label, accent = "white" }) {
  const colors = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    blue: "bg-blue-500",
    cyan: "bg-cyan-500",
    violet: "bg-violet-500",
    rose: "bg-rose-500",
    indigo: "bg-indigo-500",
    white: "bg-white/30",
  };
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <div className={cn("h-4 w-1 rounded-full", colors[accent] || colors.white)} />
      <span className="text-[11px] uppercase tracking-widest font-semibold text-muted-foreground">{label}</span>
      <div className="h-px flex-1 bg-accent/50" />
    </div>
  );
}

function CollapsibleSection({ title, defaultOpen = false, accent = "white", children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <section>
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 w-full text-left group cursor-pointer">
        <SectionHeader label={title} accent={accent} />
        <div className="flex-shrink-0 mb-3">
          {isOpen ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors" />}
        </div>
      </button>
      <div className={cn("transition-[max-height,opacity] duration-300 overflow-hidden", isOpen ? "max-h-[3000px] opacity-100" : "max-h-0 opacity-0")}>
        {children}
      </div>
    </section>
  );
}

function OutcomeBanner({ outcome, statusKey, t }) {
  const isYes = statusKey === "resolvedYes" || outcome === 1;
  const isNo = statusKey === "resolvedNo" || outcome === 0;
  const isExpiredState = statusKey === "expired";
  return (
    <div
      className={cn(
        "rounded-xl border p-5 text-center",
        isYes && "border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent",
        isNo && "border-rose-500/30 bg-gradient-to-br from-rose-500/15 via-rose-500/5 to-transparent",
        isExpiredState && "border-indigo-500/30 bg-gradient-to-br from-indigo-500/15 via-indigo-500/5 to-transparent",
        !isYes && !isNo && !isExpiredState && "border-amber-500/30 bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent",
      )}
    >
      <div className="flex items-center justify-center gap-3 mb-1">
        {isYes ? <CheckCircle className="h-7 w-7 text-emerald-400" /> : isNo ? <XCircle className="h-7 w-7 text-rose-400" /> : isExpiredState ? <Clock className="h-7 w-7 text-indigo-400" /> : <Clock className="h-7 w-7 text-amber-400 animate-pulse" />}
        <span
          className={cn(
            "text-3xl font-black tracking-tight",
            isYes && "text-emerald-400",
            isNo && "text-rose-400",
            isExpiredState && "text-indigo-400",
            !isYes && !isNo && !isExpiredState && "text-amber-400",
          )}
        >
          {isYes ? t("Predictions:outcome.yes") : isNo ? t("Predictions:outcome.no") : isExpiredState ? t("Predictions:outcome.expired") : t("Predictions:outcome.unresolved")}
        </span>
      </div>
      <div className="text-sm text-muted-foreground">
        {isYes ? "Buyers win — settlement price went to 1" : isNo ? "Sellers win — settlement price went to 0" : isExpiredState ? t("Predictions:outcome.expired_description") : "Awaiting resolution by price feeders"}
      </div>
    </div>
  );
}

export const PredictionDetailDialog = React.memo(function PredictionDetailDialog({
  open,
  onOpenChange,
  tabProps,
  res,
  _desc,
  relevantBitassetData,
  cleanedPrediction,
  symbol,
  house,
  status,
  statusKey,
  hasNft,
  hasPmo,
  view,
  usr,
  userBlockedIDs,
  issuerDisplayLabel,
  issuerDisplayName,
  username,
  issuerIsLtm,
  now,
  isExpired,
  expirationHours,
  currentNode,
  t,
}) {
  const [detailJsonDialogOpen, setDetailJsonDialogOpen] = useState(false);
  const [detailJsonPayload, setDetailJsonPayload] = useState(null);
  const [detailJsonDialogTitle, setDetailJsonDialogTitle] = useState("");
  const [detailBlockConfirmOpen, setDetailBlockConfirmOpen] = useState(false);

  const {
    nftImages, heroIndex, setHeroIndex, ipfsGateway,
    relevantCallOrders, openInterestRaw, settlementFundRaw, prizePoolRaw, impliedYesPercent,
    expiration, market, cleanedDescription,
    _backingAssetID, _backingPrecision, _issuer_permissions, _flags,
    backingAssetBalance, humanReadableBackingAssetBalance,
    humanReadablePredictionMarketAssetBalance, existingCollateral, existingCollateralRaw,
    parentPmoObject, marketStats,
  } = tabProps;

  const marketPriceSourceLabel = useMemo(() => {
    switch (marketStats?.priceSourceKey) {
      case "midpoint":
        return t("Predictions:market.priceSource.midpoint", { defaultValue: "Midpoint of best bid and ask" });
      case "bestAsk":
        return t("Predictions:market.priceSource.bestAsk", { defaultValue: "Best ask" });
      case "bestBid":
        return t("Predictions:market.priceSource.bestBid", { defaultValue: "Best bid" });
      case "lastTrade":
        return t("Predictions:market.priceSource.lastTrade", { defaultValue: "Latest trade" });
      default:
        return null;
    }
  }, [marketStats?.priceSourceKey, t]);

  const descIsLong = cleanedDescription && cleanedDescription.length > 250;
  const nftObject = _desc?.nft_object || null;
  const previewableNftTypes = useMemo(
    () => new Set(["PNG", "JPEG", "JPG", "GIF", "WEBP", "AVIF", "BMP", "SVG", "TIFF"]),
    [],
  );
  const pmaNftMediaEntries = useMemo(() => getNftMediaEntries(nftObject), [nftObject]);
  const pmaNonPreviewableMedia = useMemo(
    () => pmaNftMediaEntries.filter((entry) => !previewableNftTypes.has(entry.type)),
    [pmaNftMediaEntries, previewableNftTypes],
  );
  const normalizedPmo = useMemo(
    () => normalizePmoMetadata(parentPmoObject),
    [parentPmoObject],
  );

  const expirationTime = useMemo(() => {
    if (!expiration) return null;
    try {
      const d = new Date(expiration);
      const hours = d.getHours() < 10 ? `0${d.getHours()}` : d.getHours();
      const minutes = d.getMinutes() < 10 ? `0${d.getMinutes()}` : d.getMinutes();
      return `${hours}:${minutes}`;
    } catch {
      return null;
    }
  }, [expiration]);

  const sanitizedNarrative = useMemo(() => _desc?.nft_object?.narrative ? DOMPurify.sanitize(_desc.nft_object.narrative) : null, [_desc?.nft_object?.narrative]);
  const sanitizedAcknowledgements = useMemo(() => _desc?.nft_object?.acknowledgements ? DOMPurify.sanitize(_desc.nft_object.acknowledgements) : null, [_desc?.nft_object?.acknowledgements]);
  const sanitizedNftAttestation = useMemo(() => _desc?.nft_object?.attestation ? DOMPurify.sanitize(_desc.nft_object.attestation) : null, [_desc?.nft_object?.attestation]);
  const sanitizedResolutionPolicy = useMemo(() => normalizedPmo?.governance?.resolution_policy ? DOMPurify.sanitize(normalizedPmo.governance.resolution_policy) : null, [normalizedPmo?.governance?.resolution_policy]);
  const sanitizedDisputeMechanism = useMemo(() => normalizedPmo?.governance?.dispute_mechanism ? DOMPurify.sanitize(normalizedPmo.governance.dispute_mechanism) : null, [normalizedPmo?.governance?.dispute_mechanism]);
  const sanitizedOrgAttestation = useMemo(() => normalizedPmo?.attestation ? DOMPurify.sanitize(normalizedPmo.attestation) : null, [normalizedPmo?.attestation]);


  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[calc(100vw-1rem)] sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col bg-card ring-1 dark:ring-white/[0.08] ring-border border-border/60 text-foreground shadow-2xl dark:shadow-black/60 shadow-black/25">
          <TooltipProvider delayDuration={200}>
          {/* ─── HEADER ─── */}
          <DialogHeader className="pb-3 border-b border-border/60">
            <DialogTitle className="text-base sm:text-lg font-semibold leading-snug line-clamp-2 text-foreground">
              {cleanedPrediction || symbol}
            </DialogTitle>
            <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-mono font-medium text-foreground/80">{symbol}</span>
                <span className="text-muted-foreground/40">·</span>
                <span className="font-mono text-[10px]">{res.id}</span>
                <CopyButton value={res.id} label={t("Predictions:copyAssetId")} />
                <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", status.bg, status.text)}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", statusKey === "active" && "bg-emerald-500 animate-pulse", statusKey === "resolvedYes" && "bg-emerald-600", statusKey === "resolvedNo" && "bg-rose-500", statusKey === "expired" && "bg-indigo-400", statusKey === "awaiting" && "bg-amber-500")} />
                  {t(status.i18nKey)}
                </span>
                {hasNft ? <span className="inline-flex items-center rounded-full bg-violet-500/10 border border-violet-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-violet-400">NFT</span> : null}
                {hasPmo ? <span className="inline-flex items-center rounded-full bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-400">ORG</span> : null}
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-accent/40 pl-0.5 pr-2 py-0.5 text-[11px] font-medium">
                  <span className="inline-flex h-5 w-5 overflow-hidden rounded-full ring-1 ring-white/10">
                    <Avatar size={20} name={issuerDisplayName ?? house} extra="Issuer" expression={AVATAR_EYES_OPEN} colors={AVATAR_COLORS} disableTracking />
                  </span>
                  <span className="text-muted-foreground">{issuerDisplayLabel ?? house}</span>
                </span>
                {issuerIsLtm ? <span className="inline-flex items-center rounded-full bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400">LTM</span> : null}
                {usr && usr.id && house && house !== usr.id ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className={cn("h-6 w-6", userBlockedIDs.has(house) ? "text-red-600 hover:text-red-700" : "text-muted-foreground hover:text-red-400")} onClick={() => { userBlockedIDs.has(house) ? removeBlockedUser(usr.chain, { name: issuerDisplayLabel ?? username ?? house, id: house }) : setDetailBlockConfirmOpen(true); }}>
                        <Ban className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">{userBlockedIDs.has(house) ? t("Predictions:json.unblockIssuer") : t("Predictions:json.blockIssuer")}</TooltipContent>
                  </Tooltip>
                ) : null}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 text-[10px] text-muted-foreground hover:text-accent-foreground hover:bg-accent/40 dark:hover:bg-white/10">{t("Predictions:json.button")}</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-card border-border shadow-2xl dark:shadow-black/40 shadow-black/15">
                    <DropdownMenuItem className="focus:bg-violet-500/20 focus:text-violet-200 hover:bg-accent/40 dark:hover:bg-white/10 text-foreground/70" onClick={() => { setDetailJsonPayload(res); setDetailJsonDialogTitle(t("Predictions:json.assetData")); setDetailJsonDialogOpen(true); }}>{t("Predictions:json.assetData")}</DropdownMenuItem>
                    {relevantBitassetData ? <DropdownMenuItem className="focus:bg-violet-500/20 focus:text-violet-200 hover:bg-accent/40 dark:hover:bg-white/10 text-foreground/70" onClick={() => { setDetailJsonPayload(relevantBitassetData); setDetailJsonDialogTitle(t("Predictions:json.bitassetData")); setDetailJsonDialogOpen(true); }}>{t("Predictions:json.bitassetData")}</DropdownMenuItem> : null}
                    {_desc ? <DropdownMenuItem className="focus:bg-violet-500/20 focus:text-violet-200 hover:bg-accent/40 dark:hover:bg-white/10 text-foreground/70" onClick={() => { setDetailJsonPayload(_desc); setDetailJsonDialogTitle(t("Predictions:json.descriptionData")); setDetailJsonDialogOpen(true); }}>{t("Predictions:json.descriptionData")}</DropdownMenuItem> : null}
                    {nftObject ? <DropdownMenuItem className="focus:bg-violet-500/20 focus:text-violet-200 hover:bg-accent/40 dark:hover:bg-white/10 text-foreground/70" onClick={() => { setDetailJsonPayload(nftObject); setDetailJsonDialogTitle(t("Predictions:json.nftData")); setDetailJsonDialogOpen(true); }}>{t("Predictions:json.nftData")}</DropdownMenuItem> : null}
                    {parentPmoObject ? <DropdownMenuItem className="focus:bg-violet-500/20 focus:text-violet-200 hover:bg-accent/40 dark:hover:bg-white/10 text-foreground/70" onClick={() => { setDetailJsonPayload(parentPmoObject); setDetailJsonDialogTitle(t("Predictions:json.orgData")); setDetailJsonDialogOpen(true); }}>{t("Predictions:json.orgData")}</DropdownMenuItem> : null}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            {/* ─── SCROLLABLE CONTENT ─── */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 sm:pr-3 space-y-5 py-4">
              {/* ── HERO: Probability or Outcome ── */}
              {!isExpired && statusKey !== "awaiting" && impliedYesPercent != null ? (
                <section>
                  <div className="rounded-xl border border-emerald-500/15 bg-gradient-to-br from-emerald-500/5 via-transparent to-rose-500/5 p-5">
                    <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-3">{t("Predictions:market.impliedProbability")}</div>
                    <div className="min-w-0 max-w-full overflow-hidden">
                      <ProbabilityBar yesPercent={impliedYesPercent} />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                      <span>
                        {t("Predictions:market.impliedProbability_market_help", { defaultValue: "Market-derived YES probability from live DEX pricing, falling back to the latest trade when no live orders are available." })}
                      </span>
                      {marketPriceSourceLabel ? (
                        <span className="font-mono text-muted-foreground">{marketPriceSourceLabel}</span>
                      ) : null}
                    </div>

                  </div>
                </section>
              ) : !isExpired && statusKey !== "awaiting" ? (
                <section>
                  <div className="rounded-xl border border-border bg-accent/30 dark:bg-white/5 p-5 text-sm text-muted-foreground">
                    {t("Predictions:market.noDexPriceEstimate", { defaultValue: "No live DEX price or recent trade is available to estimate current odds yet." })}
                  </div>
                </section>
              ) : (
                <section>
                  <OutcomeBanner outcome={relevantBitassetData?.outcome} statusKey={statusKey} t={t} />
                </section>
              )}

              {/* ── DESCRIPTION (Collapsible) ── */}
              {cleanedDescription ? (
                <CollapsibleSection title={t("Predictions:description")} accent="indigo" defaultOpen={!descIsLong}>
                  <div className="rounded-xl border border-border bg-accent/30 dark:bg-white/[0.05] px-4 py-3">
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap break-words">{cleanedDescription}</p>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="rounded-lg border border-border/60 bg-black/10 px-3 py-2">
                        <SubsectionLabel>{t(`Predictions:${isExpired ? "expired_at" : "expiration"}`)}</SubsectionLabel>
                        <div className="mt-1 font-mono text-sm text-foreground/80">{prettifyDate(expiration)}</div>
                      </div>
                      <div className="rounded-lg border border-border/60 bg-black/10 px-3 py-2">
                        <SubsectionLabel>{t("Predictions:time", { defaultValue: "Time" })}</SubsectionLabel>
                        <div className="mt-1 font-mono text-sm text-foreground/80">{expirationTime ?? "-"}</div>
                      </div>
                      <div className="rounded-lg border border-border/60 bg-black/10 px-3 py-2">
                        <SubsectionLabel>{t("Predictions:bettingAsset")}</SubsectionLabel>
                        <div className="mt-1 font-mono text-sm text-foreground/80">{market}</div>
                      </div>
                    </div>
                  </div>
                </CollapsibleSection>
              ) : null}

              {/* ── CLASSIFICATION ── */}
              {_desc?.category ? (
                <CollapsibleSection title={t("Predictions:tab.classification", { defaultValue: "Classification" })} accent="orange">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <MemoizedHeroStat label={t("Predictions:classification.category", { defaultValue: "Category" })} value={t("Predictions:categories." + _desc.category)} accent="orange" />
                    {_desc.subcategory ? (
                      <MemoizedHeroStat label={t("Predictions:classification.subcategory", { defaultValue: "Sub category" })} value={t("Predictions:subcategories." + _desc.subcategory)} accent="orange" />
                    ) : null}
                  </div>
                </CollapsibleSection>
              ) : null}

              {/* ── KEY STATS ROW ── */}
              <CollapsibleSection title={t("Predictions:tab.overview")} accent="emerald" defaultOpen>
                {!isExpired ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    <MemoizedHeroStat
                      label={t("Predictions:openInterest")}
                      value={`${humanReadableFloat(openInterestRaw, res.precision)} ${res.symbol}`}
                      accent="amber"
                      mono
                      help={t("Predictions:market.openInterestSupply_help", { defaultValue: "Current PMA token supply outstanding in the market." })}
                    />
                    <MemoizedHeroStat
                      label={t("Predictions:market.limitOrderBuyers", { defaultValue: "Limit order buyers" })}
                      value={marketStats?.buyOrderCount ?? 0}
                      accent="emerald"
                      mono
                    />
                    <MemoizedHeroStat
                      label={t("Predictions:market.limitOrderSellers", { defaultValue: "Limit order sellers" })}
                      value={marketStats?.sellOrderCount ?? 0}
                      accent="cyan"
                      mono
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    <MemoizedHeroStat label={t("Predictions:prize_pool")} value={prizePoolRaw > 0 ? `${humanReadableFloat(prizePoolRaw, _backingPrecision)} ${market}` : `0 ${market}`} accent="amber" mono />
                    <MemoizedHeroStat label={t("Predictions:winner.yourPmaBalance")} value={`${humanReadablePredictionMarketAssetBalance} ${symbol}`} accent="violet" mono />
                    <MemoizedHeroStat label={isExpired ? t("Predictions:timeExpired") : t("Predictions:timeLeft")} value={formatTimeRemaining(expiration)} accent="blue" mono />
                  </div>
                )}
              </CollapsibleSection>

              {/* ── MARKET DETAILS ── */}
              <CollapsibleSection title={t("Predictions:tab.market")} accent="blue" defaultOpen>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  <MemoizedHeroStat label={t("Predictions:market.commission")} value={res.options?.market_fee_percent ? `${(res.options.market_fee_percent / 100).toFixed(2)}%` : "0%"} accent="violet" mono help={t("Predictions:market.commission_help")} />
                  <MemoizedHeroStat
                    label={t("Predictions:market.yesPrice", { defaultValue: "YES price" })}
                    value={marketStats?.formattedPrice != null ? `${marketStats.formattedPrice} ${market}` : "-"}
                    accent="emerald"
                    mono
                  />
                  <MemoizedHeroStat
                    label={t("Predictions:market.sellPrice", { defaultValue: "Sell price" })}
                    value={marketStats?.bestAsk != null ? `${Number(marketStats.bestAsk).toFixed(Math.min(_backingPrecision || 5, 5))} ${market}` : "-"}
                    accent="cyan"
                    mono
                  />
                </div>
              </CollapsibleSection>

              {/* ── NFT SECTION ── */}
              {hasNft && nftObject ? (
                <CollapsibleSection title={t("Predictions:tab.nft")} accent="violet">
                  <div className="grid grid-cols-1 gap-3 min-w-0">
                    {nftImages && nftImages.length > 0 ? (
                      <>
                        <div>
                          <NftHero images={nftImages} heroIndex={heroIndex} ipfsGateway={ipfsGateway} />
                          {nftImages.length > 1 ? <NftThumbStrip images={nftImages} heroIndex={heroIndex} setHeroIndex={setHeroIndex} ipfsGateway={ipfsGateway} /> : null}
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-32 rounded-md border border-dashed border-border dark:border-white/20 text-muted-foreground text-sm px-4 text-center">
                        <ImageIcon className="mr-2 h-4 w-4" />
                        {t("Predictions:nft.noImage")}
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {_desc.nft_object.title ? <MemoizedHeroStat label={t("Predictions:nft.title")} value={_desc.nft_object.title} /> : null}
                      {_desc.nft_object.artist ? <MemoizedHeroStat label={t("Predictions:nft.artist")} value={_desc.nft_object.artist} /> : null}
                      {_desc.nft_object.type ? <MemoizedHeroStat label={t("Predictions:nft.type")} value={_desc.nft_object.type} /> : null}
                      {_desc.nft_object.encoding ? <MemoizedHeroStat label={t("Predictions:nft.encoding")} value={_desc.nft_object.encoding} mono /> : null}
                      {_desc.nft_object.license ? <MemoizedHeroStat label={t("Predictions:nft.license")} value={_desc.nft_object.license} /> : null}
                      {_desc.nft_object.holder_license ? <MemoizedHeroStat label={t("Predictions:nft.holderLicense")} value={_desc.nft_object.holder_license} /> : null}
                    </div>
                    {_desc.nft_object.tags ? (
                      <div>
                        <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">{t("Predictions:nft.tags")}</div>
                        <div className="flex flex-wrap gap-1">
                          {String(_desc.nft_object.tags).split(",").map((s) => s.trim()).filter(Boolean).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-[10px] py-0 border-border text-muted-foreground">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {sanitizedNarrative ? <LongText label={t("Predictions:nft.narrative")} value={sanitizedNarrative} /> : null}
                    {sanitizedAcknowledgements ? <LongText label={t("Predictions:nft.acknowledgements")} value={sanitizedAcknowledgements} /> : null}
                    {sanitizedNftAttestation ? <LongText label={t("Predictions:nft.attestation")} value={sanitizedNftAttestation} /> : null}
                    <MediaUrlList title="Media URLs" entries={pmaNonPreviewableMedia} />
                    {nftImages.length ? (
                      <div className="rounded-md border border-border bg-accent/30 dark:bg-white/[0.05] p-3">
                        <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">{t("Predictions:nft.viewOnIpfs")}</div>
                        <div className="font-mono text-xs break-all text-foreground/70">
                          <MonoBlock value={ipfsUrl(nftImages[heroIndex].url, ipfsGateway)} copyable label={t("Predictions:copy")} />
                        </div>
                      </div>
                    ) : null}
                    {(_desc.nft_signature || _desc.sig_pubkey_or_address) ? (
                      <div className="rounded-md border border-border bg-accent/30 dark:bg-white/[0.05] p-3 grid grid-cols-1 gap-2 text-xs">
                        <div>
                          <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-0.5">{t("Predictions:nft.signature")}</div>
                          <MonoBlock value={_desc.nft_signature} truncate={32} copyable label={t("Predictions:nft.copySig")} />
                        </div>
                        <div>
                          <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-0.5">{t("Predictions:nft.sigPubkey")}</div>
                          <MonoBlock value={_desc.sig_pubkey_or_address} truncate={32} copyable label={t("Predictions:nft.copyPubkey")} />
                        </div>
                        <div className="text-[10px] text-muted-foreground italic">{t("Predictions:nft.verifyNote")}</div>
                      </div>
                    ) : null}
                  </div>
                </CollapsibleSection>
              ) : null}

              {/* ── ORG SECTION ── */}
              {hasPmo && normalizedPmo ? (
                <CollapsibleSection title={t("Predictions:tab.org")} accent="cyan">
                  <div className="grid grid-cols-1 gap-4 min-w-0">
                    <div className="space-y-3">
                      <SubsectionLabel>Organization Identity</SubsectionLabel>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {normalizedPmo.identity.name ? <MemoizedHeroStat label={t("Predictions:org.name")} value={normalizedPmo.identity.name} /> : null}
                        {normalizedPmo.identity.website ? (
                          <MemoizedHeroStat label={t("Predictions:org.website")} value={normalizedPmo.identity.website} mono />
                        ) : null}
                        {normalizedPmo.identity.manifest ? (
                          <MemoizedHeroStat label={t("Predictions:org.manifest")} value={<a href={normalizedPmo.identity.manifest} target="_blank" rel="noopener noreferrer" className="break-all text-cyan-400 hover:underline text-sm">{normalizedPmo.identity.manifest}</a>} />
                        ) : null}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <SubsectionLabel>Organization Profile</SubsectionLabel>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {normalizedPmo.governance.onchain_account ? <MemoizedHeroStat label={t("Predictions:org.onchainAccount")} value={normalizedPmo.governance.onchain_account} mono /> : null}
                      </div>
                      {sanitizedResolutionPolicy ? <LongText label={t("Predictions:org.resolutionPolicy")} value={sanitizedResolutionPolicy} /> : null}
                      {sanitizedDisputeMechanism ? <LongText label={t("Predictions:org.disputeMechanism")} value={sanitizedDisputeMechanism} /> : null}
                      {sanitizedOrgAttestation ? <LongText label={t("Predictions:org.attestation")} value={sanitizedOrgAttestation} /> : null}
                    </div>

                    {normalizedPmo.pmo_signature ? (
                      <div className="rounded-md border border-border bg-accent/30 dark:bg-white/[0.05] p-3 text-xs">
                        <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-0.5">{t("Predictions:org.signature")}</div>
                        <MonoBlock value={normalizedPmo.pmo_signature} truncate={32} copyable label={t("Predictions:nft.copySig")} />
                      </div>
                    ) : null}
                  </div>
                </CollapsibleSection>
              ) : null}

              {/* ── TECHNICAL DETAILS (Collapsible) ── */}
              <CollapsibleSection title={t("Predictions:tab.details")} accent="indigo">
                <div className="grid grid-cols-1 gap-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
                    <MemoizedHeroStat label={t("Predictions:permissions")} value={Object.keys(_issuer_permissions).length > 0 ? (
                      <HoverCard>
                        <HoverCardTrigger>
                          <span className="inline-flex items-center gap-1">{Object.keys(_issuer_permissions).length}<QuestionMarkCircledIcon className="h-3 w-3" /></span>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80 mt-1 bg-card border-border text-foreground z-[9999]" align="start">{Object.keys(_issuer_permissions).join(", ")}</HoverCardContent>
                      </HoverCard>
                    ) : "0"} />
                    <MemoizedHeroStat label={t("Predictions:flags")} value={Object.keys(_flags).length > 0 ? (
                      <HoverCard>
                        <HoverCardTrigger>
                          <span className="inline-flex items-center gap-1">{Object.keys(_flags).length}<QuestionMarkCircledIcon className="h-3 w-3" /></span>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80 mt-1 bg-card border-border text-foreground z-[9999]" align="start">{Object.keys(_flags).join(", ")}</HoverCardContent>
                      </HoverCard>
                    ) : "0"} />
                    <MemoizedHeroStat label={t("Predictions:details.precision")} value={res.precision} mono />
                    <MemoizedHeroStat label={t("Predictions:details.maxSupply")} value={humanReadableFloat(res.options.max_supply, res.precision)} mono />
                  </div>
                  <div className="rounded-xl border border-border bg-accent/30 dark:bg-white/[0.05] p-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">{t("Predictions:details.assetId")}</div>
                        <MonoBlock value={res.id} copyable label={t("Predictions:copyAssetId")} />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">{t("Predictions:details.issuer")}</div>
                        <MonoBlock value={house} copyable label={t("Predictions:copyIssuerId")} />
                      </div>
                    </div>
                  </div>
                </div>
              </CollapsibleSection>

              {/* ── ADMIN SECTION ── */}
              {usr && usr.id === house ? (
                <CollapsibleSection title={t("Predictions:tab.admin")} accent="amber" defaultOpen={statusKey === "awaiting"}>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mt-1">
                      <ResolveDialog res={res} usr={usr} isExpired={isExpired} statusKey={statusKey} expirationHours={expirationHours} expiration={expiration} cleanedPrediction={cleanedPrediction} _backingAssetID={_backingAssetID} settlementFundRaw={settlementFundRaw} prizePoolRaw={prizePoolRaw} relevantBitassetData={relevantBitassetData} t={t} />
                      <PricefeederDialog res={res} usr={usr} isExpired={isExpired} statusKey={statusKey} settlementFundRaw={settlementFundRaw} prizePoolRaw={prizePoolRaw} relevantBitassetData={relevantBitassetData} t={t} />
                      <FeedPriceDialog res={res} usr={usr} _backingAssetID={_backingAssetID} isExpired={isExpired} statusKey={statusKey} settlementFundRaw={settlementFundRaw} prizePoolRaw={prizePoolRaw} relevantBitassetData={relevantBitassetData} t={t} />
                      <a href={`/create_prediction.html?asset_update=${res.symbol}&settlement=${prizePoolRaw ?? 0}`}>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-foreground text-xs">
                          {t("Predictions:update")}
                        </Button>
                      </a>
                    </div>
                  </div>
                </CollapsibleSection>
              ) : null}

              {/* Bottom padding for sticky footer clearance */}
              <div className="h-1" />
            </div>

            {/* ─── STICKY FOOTER ─── */}
            <div className="relative flex-shrink-0">
              <div className="absolute -top-4 left-0 right-0 h-4 bg-gradient-to-b from-transparent dark:to-slate-900 to-card pointer-events-none" />
              <div className="border-t border-border/60 bg-card px-5 py-3">
                {statusKey === "active" ? (
                  <div>
                    <HoverInfo content={t("Predictions:seller_content")} header={t("Predictions:seller")} type="header" />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1">
                      <IssueDialog res={res} usr={usr} backingAssetBalance={backingAssetBalance} humanReadableBackingAssetBalance={humanReadableBackingAssetBalance} existingCollateral={existingCollateral} existingCollateralRaw={existingCollateralRaw} _backingAssetID={_backingAssetID} _backingPrecision={_backingPrecision} market={market} t={t} />
                      <SellDialog res={res} usr={usr} humanReadablePredictionMarketAssetBalance={humanReadablePredictionMarketAssetBalance} _backingAssetID={_backingAssetID} _backingPrecision={_backingPrecision} market={market} t={t} expiration={expiration} defaultPrice={marketStats?.impliedYesPrice} marketStats={marketStats} />
                      <BuyDialog res={res} usr={usr} humanReadableBackingAssetBalance={humanReadableBackingAssetBalance} _backingAssetID={_backingAssetID} _backingPrecision={_backingPrecision} market={market} t={t} expiration={expiration} defaultPrice={marketStats?.impliedYesPrice} marketStats={marketStats} />
                    </div>
                  </div>
                ) : statusKey === "resolvedYes" ? (
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-foreground">{t("Predictions:winner_header")}</div>
                      <p className="text-xs text-muted-foreground">{t("Predictions:winner_content")}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <ClaimDialog res={res} usr={usr} humanReadablePredictionMarketAssetBalance={humanReadablePredictionMarketAssetBalance} relevantBitassetData={relevantBitassetData} t={t} />
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          </TooltipProvider>
        </DialogContent>
      </Dialog>

      <JsonDetailsDialog open={detailJsonDialogOpen} onOpenChange={setDetailJsonDialogOpen} data={detailJsonPayload} title={detailJsonDialogTitle} />

      {usr && usr.id && house && house !== usr.id ? (
        <AlertDialog open={detailBlockConfirmOpen} onOpenChange={setDetailBlockConfirmOpen}>
          <AlertDialogContent className="bg-card ring-1 dark:ring-white/[0.08] ring-border border-border/60 text-foreground shadow-2xl dark:shadow-black/60 shadow-black/25">
            <AlertDialogHeader>
              <AlertDialogTitle>{t("Predictions:blockConfirm.title")}</AlertDialogTitle>
              <AlertDialogDescription>{t("Predictions:blockConfirm.description")}</AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex items-center gap-3 rounded-md border border-border bg-accent/30 dark:bg-white/[0.05] p-3">
              <span className="inline-flex h-10 w-10 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-white/10">
                <Avatar size={40} name={issuerDisplayName ?? house} extra="BlockConfirm" expression={AVATAR_EYES_UNHAPPY} colors={AVATAR_COLORS} disableTracking />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground truncate">{issuerDisplayName ?? house}</div>
                <div className="font-mono text-xs text-muted-foreground">{house}</div>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-accent/30 dark:bg-white/[0.05] border-border text-foreground/70 hover:bg-accent/40 dark:hover:bg-white/10 hover:text-foreground">{t("Predictions:blockConfirm.cancel")}</AlertDialogCancel>
              <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-foreground" onClick={() => addBlockedUser(usr.chain, { name: issuerDisplayLabel ?? username ?? house, id: house })}>{t("Predictions:blockConfirm.confirm")}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </>
  );
});
