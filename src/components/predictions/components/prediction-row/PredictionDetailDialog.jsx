import React, { useState } from "react";
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
import { Ban, ExternalLink, TrendingUp, ChevronDown, ChevronUp, CheckCircle, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { CopyButton, ProbabilityBar, LongText, MonoBlock, NftHero, NftThumbStrip } from "../../PredictionUtils";
import { humanReadableFloat, ipfsUrl } from "@/lib/common.js";
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
    <div className={cn("rounded-xl border px-4 py-3 transition-all hover:brightness-110", accents[accent] || "border-white/[0.08] bg-white/[0.03]")}>
      <div className="text-[10px] uppercase tracking-wider font-semibold text-white/40 mb-1 flex items-center gap-1">
        {label}
        {help ? (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger>
                <QuestionMarkCircledIcon className="h-3 w-3 text-white/30" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-xs">{help}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : null}
      </div>
      <div className={cn("text-lg font-bold text-white leading-tight", mono && "font-mono tabular-nums")}>
        {value}
      </div>
    </div>
  );
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
      <span className="text-[11px] uppercase tracking-widest font-semibold text-white/50">{label}</span>
      <div className="h-px flex-1 bg-white/[0.06]" />
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
          {isOpen ? <ChevronUp className="h-3.5 w-3.5 text-white/30 group-hover:text-white/60 transition-colors" /> : <ChevronDown className="h-3.5 w-3.5 text-white/30 group-hover:text-white/60 transition-colors" />}
        </div>
      </button>
      <div className={cn("transition-all duration-300 overflow-hidden", isOpen ? "max-h-[3000px] opacity-100" : "max-h-0 opacity-0")}>
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
      <div className="text-sm text-white/50">
        {isYes ? "Buyers win — settlement price went to 1" : isNo ? "Sellers win — settlement price went to 0" : isExpiredState ? t("Predictions:outcome.expired_description") : "Awaiting resolution by price feeders"}
      </div>
    </div>
  );
}

export function PredictionDetailDialog({
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
  t,
}) {
  const [detailJsonDialogOpen, setDetailJsonDialogOpen] = useState(false);
  const [detailJsonPayload, setDetailJsonPayload] = useState(null);
  const [detailBlockConfirmOpen, setDetailBlockConfirmOpen] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  const {
    nftImages, heroIndex, setHeroIndex, ipfsGateway,
    relevantCallOrders, totalBets, settlementFundRaw, impliedYesPercent,
    isExpired, expiration, expirationHours, now, market, cleanedDescription,
    _backingAssetID, _backingPrecision, _issuer_permissions, _flags,
    backingAssetBalance, humanReadableBackingAssetBalance,
    humanReadablePredictionMarketAssetBalance, existingCollateral,
    parentPmoObject,
  } = tabProps;

  const descIsLong = cleanedDescription && cleanedDescription.length > 250;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col bg-slate-900 ring-1 ring-white/[0.08] border-white/[0.06] text-white shadow-2xl shadow-black/60">
          {/* ─── HEADER ─── */}
          <DialogHeader className="pb-3 border-b border-white/[0.06]">
            <DialogTitle className="text-base sm:text-lg font-semibold leading-snug line-clamp-2 text-white">
              {cleanedPrediction || symbol}
            </DialogTitle>
            <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs text-white/50">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-mono font-medium text-white/80">{symbol}</span>
                <span className="text-white/20">·</span>
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
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] pl-0.5 pr-2 py-0.5 text-[11px] font-medium">
                  <span className="inline-flex h-5 w-5 overflow-hidden rounded-full ring-1 ring-white/10">
                    <Avatar size={20} name={issuerDisplayName ?? house} extra="Issuer" expression={{ eye: "normal", mouth: "open" }} colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]} />
                  </span>
                  <span className="text-white/60">{issuerDisplayLabel ?? house}</span>
                </span>
                {issuerIsLtm ? <span className="inline-flex items-center rounded-full bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400">LTM</span> : null}
                {usr && usr.id && house && house !== usr.id ? (
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className={cn("h-6 w-6", userBlockedIDs.has(house) ? "text-red-600 hover:text-red-700" : "text-white/40 hover:text-red-400")} onClick={() => { userBlockedIDs.has(house) ? removeBlockedUser(usr.chain, { name: issuerDisplayLabel ?? username ?? house, id: house }) : setDetailBlockConfirmOpen(true); }}>
                          <Ban className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">{userBlockedIDs.has(house) ? t("Predictions:json.unblockIssuer") : t("Predictions:json.blockIssuer")}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : null}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 text-[10px] text-white/40 hover:text-white hover:bg-white/10">{t("Predictions:json.button")}</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-slate-900 border-white/[0.08] shadow-2xl shadow-black/40">
                    <DropdownMenuItem className="focus:bg-violet-500/20 focus:text-violet-200 hover:bg-white/10 text-white/70" onClick={() => { setDetailJsonPayload(res); setDetailJsonDialogOpen(true); }}>{t("Predictions:json.assetData")}</DropdownMenuItem>
                    {relevantBitassetData ? <DropdownMenuItem className="focus:bg-violet-500/20 focus:text-violet-200 hover:bg-white/10 text-white/70" onClick={() => { setDetailJsonPayload(relevantBitassetData); setDetailJsonDialogOpen(true); }}>{t("Predictions:json.bitassetData")}</DropdownMenuItem> : null}
                    {_desc ? <DropdownMenuItem className="focus:bg-violet-500/20 focus:text-violet-200 hover:bg-white/10 text-white/70" onClick={() => { setDetailJsonPayload(_desc); setDetailJsonDialogOpen(true); }}>{t("Predictions:json.descriptionData")}</DropdownMenuItem> : null}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            {/* ─── SCROLLABLE CONTENT ─── */}
            <div className="flex-1 overflow-y-auto pr-3 space-y-5 py-4">
              {/* ── HERO: Probability or Outcome ── */}
              {!isExpired && statusKey !== "awaiting" ? (
                <section>
                  <div className="rounded-xl border border-emerald-500/15 bg-gradient-to-br from-emerald-500/5 via-transparent to-rose-500/5 p-5">
                    <div className="text-[11px] uppercase tracking-wider font-semibold text-white/50 mb-3">{t("Predictions:market.impliedProbability")}</div>
                    <div className="scale-110 origin-left">
                      <ProbabilityBar yesPercent={impliedYesPercent} />
                    </div>
                    <div className="mt-3 text-[11px] text-white/40">{t("Predictions:market.impliedProbability_help")}</div>
                  </div>
                </section>
              ) : (
                <section>
                  <OutcomeBanner outcome={relevantBitassetData?.outcome} statusKey={statusKey} t={t} />
                </section>
              )}

              {/* ── KEY STATS ROW ── */}
              <CollapsibleSection title={t("Predictions:tab.overview")} accent="emerald" defaultOpen>
                {!isExpired ? (
                  <div className="grid grid-cols-3 gap-3">
                    <HeroStat label={t("Predictions:openInterest")} value={`${humanReadableFloat(totalBets, res.precision)} ${market}`} accent="amber" mono help={t("Predictions:openInterest_help")} />
                    <HeroStat label={t("Predictions:market.settlementFund")} value={`${humanReadableFloat(settlementFundRaw, res.precision)} ${market}`} accent="blue" mono help={t("Predictions:market.settlementFund_help")} />
                    <HeroStat label={t("Predictions:unique_sellers")} value={relevantCallOrders?.length || 0} accent="cyan" mono />
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    <HeroStat label={t("Predictions:prize_pool")} value={relevantBitassetData ? `${humanReadableFloat(relevantBitassetData.settlement_fund, res.precision)} ${market}` : `0 ${market}`} accent="amber" mono />
                    <HeroStat label={t("Predictions:winner.yourPmaBalance")} value={`${humanReadablePredictionMarketAssetBalance} ${symbol}`} accent="violet" mono />
                    <HeroStat label={isExpired ? t("Predictions:timeExpired") : t("Predictions:timeLeft")} value={formatTimeRemaining(expiration)} accent="blue" mono />
                  </div>
                )}
              </CollapsibleSection>

              {/* ── MARKET DETAILS ── */}
              <CollapsibleSection title={t("Predictions:tab.market")} accent="blue" defaultOpen>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <HeroStat label={t("Predictions:market.commission")} value={res.options?.market_fee_percent ? `${(res.options.market_fee_percent / 100).toFixed(2)}%` : "0%"} accent="violet" mono help={t("Predictions:market.commission_help")} />
                  <HeroStat label={t(`Predictions:${isExpired ? "expired_at" : "expiration"}`)} value={prettifyDate(expiration)} accent="white" mono />
                  <HeroStat label={t("Predictions:bettingAsset")} value={market} accent="white" mono />
                </div>
                {!isExpired ? (
                  <div className="mt-3">
                    <Button variant="outline" size="sm" asChild className="w-fit border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300">
                      <a href={`/dex.html?market=${res.symbol}_${market}`}>
                        <TrendingUp className="mr-2 h-3.5 w-3.5" />
                        {t("Predictions:market.tradeOnDex")}
                      </a>
                    </Button>
                  </div>
                ) : null}
              </CollapsibleSection>

              {/* ── DESCRIPTION (Collapsible) ── */}
              {cleanedDescription ? (
                <CollapsibleSection title={t("Predictions:description")} accent="indigo" defaultOpen={!descIsLong}>
                  <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
                    <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">{cleanedDescription}</p>
                  </div>
                </CollapsibleSection>
              ) : null}

              {/* ── NFT SECTION ── */}
              {hasNft ? (
                <CollapsibleSection title={t("Predictions:tab.nft")} accent="violet">
                  <div className="grid grid-cols-1 gap-3">
                    {nftImages && nftImages.length > 0 ? (
                      <>
                        <div>
                          <NftHero images={nftImages} heroIndex={heroIndex} ipfsGateway={ipfsGateway} />
                          {nftImages.length > 1 ? <NftThumbStrip images={nftImages} heroIndex={heroIndex} setHeroIndex={setHeroIndex} ipfsGateway={ipfsGateway} /> : null}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {_desc.nft_object.title ? <HeroStat label={t("Predictions:nft.title")} value={_desc.nft_object.title} /> : null}
                          {_desc.nft_object.artist ? <HeroStat label={t("Predictions:nft.artist")} value={_desc.nft_object.artist} /> : null}
                          {_desc.nft_object.type ? <HeroStat label={t("Predictions:nft.type")} value={_desc.nft_object.type} /> : null}
                          {_desc.nft_object.encoding ? <HeroStat label={t("Predictions:nft.encoding")} value={_desc.nft_object.encoding} mono /> : null}
                          {_desc.nft_object.license ? <HeroStat label={t("Predictions:nft.license")} value={_desc.nft_object.license} /> : null}
                          {_desc.nft_object.holder_license ? <HeroStat label={t("Predictions:nft.holderLicense")} value={_desc.nft_object.holder_license} /> : null}
                        </div>
                        {_desc.nft_object.tags ? (
                          <div>
                            <div className="text-[11px] uppercase tracking-wide text-white/50 mb-1.5">{t("Predictions:nft.tags")}</div>
                            <div className="flex flex-wrap gap-1">
                              {String(_desc.nft_object.tags).split(",").map((s) => s.trim()).filter(Boolean).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-[10px] py-0 border-white/[0.1] text-white/60">{tag}</Badge>
                              ))}
                            </div>
                          </div>
                        ) : null}
                        {_desc.nft_object.narrative ? <LongText label={t("Predictions:nft.narrative")} value={DOMPurify.sanitize(_desc.nft_object.narrative)} /> : null}
                        {_desc.nft_object.acknowledgements ? <LongText label={t("Predictions:nft.acknowledgements")} value={DOMPurify.sanitize(_desc.nft_object.acknowledgements)} /> : null}
                        {_desc.nft_object.attestation ? <LongText label={t("Predictions:nft.attestation")} value={DOMPurify.sanitize(_desc.nft_object.attestation)} /> : null}
                        {nftImages.length ? (
                          <Button variant="outline" size="sm" asChild className="self-start border-white/[0.12] text-white/70 hover:text-white hover:bg-white/[0.06]">
                            <a href={ipfsUrl(nftImages[heroIndex].url, ipfsGateway)} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-2 h-3.5 w-3.5" />
                              {t("Predictions:nft.viewOnIpfs")}
                            </a>
                          </Button>
                        ) : null}
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-32 rounded-md border border-dashed border-white/20 text-white/40 text-sm">
                        <ImageIcon className="mr-2 h-4 w-4" />
                        {t("Predictions:nft.noImage")}
                      </div>
                    )}
                    {(_desc.nft_signature || _desc.sig_pubkey_or_address) ? (
                      <div className="rounded-md border border-white/[0.08] bg-white/[0.03] p-3 grid grid-cols-1 gap-2 text-xs">
                        <div>
                          <div className="text-[11px] uppercase tracking-wide text-white/50 mb-0.5">{t("Predictions:nft.signature")}</div>
                          <MonoBlock value={_desc.nft_signature} truncate={32} copyable label={t("Predictions:nft.copySig")} />
                        </div>
                        <div>
                          <div className="text-[11px] uppercase tracking-wide text-white/50 mb-0.5">{t("Predictions:nft.sigPubkey")}</div>
                          <MonoBlock value={_desc.sig_pubkey_or_address} truncate={32} copyable label={t("Predictions:nft.copyPubkey")} />
                        </div>
                        <div className="text-[10px] text-white/40 italic">{t("Predictions:nft.verifyNote")}</div>
                      </div>
                    ) : null}
                  </div>
                </CollapsibleSection>
              ) : null}

              {/* ── ORG SECTION ── */}
              {hasPmo && parentPmoObject ? (
                <CollapsibleSection title={t("Predictions:tab.org")} accent="cyan" defaultOpen>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {parentPmoObject.name ? <HeroStat label={t("Predictions:org.name")} value={parentPmoObject.name} /> : null}
                      {parentPmoObject.website ? (
                        <HeroStat label={t("Predictions:org.website")} value={<a href={parentPmoObject.website} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline text-sm">{parentPmoObject.website}</a>} />
                      ) : null}
                      {parentPmoObject.manifest ? (
                        <HeroStat label={t("Predictions:org.manifest")} value={<a href={parentPmoObject.manifest} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline text-sm">{parentPmoObject.manifest}</a>} />
                      ) : null}
                      {parentPmoObject.onchain_account ? <HeroStat label={t("Predictions:org.onchainAccount")} value={parentPmoObject.onchain_account} mono /> : null}
                    </div>
                    {parentPmoObject.resolution_policy ? <LongText label={t("Predictions:org.resolutionPolicy")} value={DOMPurify.sanitize(parentPmoObject.resolution_policy)} /> : null}
                    {parentPmoObject.dispute_mechanism ? <LongText label={t("Predictions:org.disputeMechanism")} value={DOMPurify.sanitize(parentPmoObject.dispute_mechanism)} /> : null}
                    {parentPmoObject.attestation ? <LongText label={t("Predictions:org.attestation")} value={DOMPurify.sanitize(parentPmoObject.attestation)} /> : null}
                    {parentPmoObject.pmo_signature ? (
                      <div className="rounded-md border border-white/[0.08] bg-white/[0.03] p-3 text-xs">
                        <div className="text-[11px] uppercase tracking-wide text-white/50 mb-0.5">{t("Predictions:org.signature")}</div>
                        <MonoBlock value={parentPmoObject.pmo_signature} truncate={32} copyable label={t("Predictions:nft.copySig")} />
                      </div>
                    ) : null}
                    <Button variant="outline" size="sm" asChild className="self-start border-white/[0.12] text-white/70 hover:text-white hover:bg-white/[0.06]">
                      <a href={`/active-predictions.html?search=${res.symbol.split(".")[0]}.`}>
                        <ExternalLink className="mr-2 h-3.5 w-3.5" />
                        {t("Predictions:org.viewAll", { symbol: res.symbol.split(".")[0] })}
                      </a>
                    </Button>
                  </div>
                </CollapsibleSection>
              ) : null}

              {/* ── TECHNICAL DETAILS (Collapsible) ── */}
              <CollapsibleSection title={t("Predictions:tab.details")} accent="indigo">
                <div className="grid grid-cols-1 gap-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <HeroStat label={t("Predictions:permissions")} value={Object.keys(_issuer_permissions).length > 0 ? (
                      <HoverCard>
                        <HoverCardTrigger>
                          <span className="inline-flex items-center gap-1">{Object.keys(_issuer_permissions).length}<QuestionMarkCircledIcon className="h-3 w-3" /></span>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80 mt-1 bg-slate-900 border-white/[0.08] text-white z-[9999]" align="start">{Object.keys(_issuer_permissions).join(", ")}</HoverCardContent>
                      </HoverCard>
                    ) : "0"} />
                    <HeroStat label={t("Predictions:flags")} value={Object.keys(_flags).length > 0 ? (
                      <HoverCard>
                        <HoverCardTrigger>
                          <span className="inline-flex items-center gap-1">{Object.keys(_flags).length}<QuestionMarkCircledIcon className="h-3 w-3" /></span>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80 mt-1 bg-slate-900 border-white/[0.08] text-white z-[9999]" align="start">{Object.keys(_flags).join(", ")}</HoverCardContent>
                      </HoverCard>
                    ) : "0"} />
                    <HeroStat label={t("Predictions:details.precision")} value={res.precision} mono />
                    <HeroStat label={t("Predictions:details.maxSupply")} value={humanReadableFloat(res.options.max_supply, res.precision)} mono />
                  </div>
                  <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-white/40 mb-1">{t("Predictions:details.assetId")}</div>
                        <MonoBlock value={res.id} copyable label={t("Predictions:copyAssetId")} />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-white/40 mb-1">{t("Predictions:details.issuer")}</div>
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
                    <div className="grid grid-cols-4 gap-3 mt-1">
                      <ResolveDialog res={res} usr={usr} isExpired={isExpired} statusKey={statusKey} expirationHours={expirationHours} expiration={expiration} cleanedPrediction={cleanedPrediction} _backingAssetID={_backingAssetID} settlementFundRaw={settlementFundRaw} relevantBitassetData={relevantBitassetData} t={t} />
                      <PricefeederDialog res={res} usr={usr} isExpired={isExpired} statusKey={statusKey} settlementFundRaw={settlementFundRaw} relevantBitassetData={relevantBitassetData} t={t} />
                      <FeedPriceDialog res={res} usr={usr} _backingAssetID={_backingAssetID} isExpired={isExpired} statusKey={statusKey} settlementFundRaw={settlementFundRaw} relevantBitassetData={relevantBitassetData} t={t} />
                      {relevantBitassetData?.outcome !== 0 && relevantBitassetData?.outcome !== 1 ? (
                        <a href={`/create_prediction.html?asset_update=${res.symbol}&settlement=${settlementFundRaw ?? 0}`}>
                          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs">
                            {t("Predictions:update")}
                          </Button>
                        </a>
                      ) : (
                        <Button disabled className="w-full bg-blue-600 text-white text-xs cursor-not-allowed">
                          {t("Predictions:update")}
                        </Button>
                      )}
                    </div>
                  </div>
                </CollapsibleSection>
              ) : null}

              {/* Bottom padding for sticky footer clearance */}
              <div className="h-1" />
            </div>

            {/* ─── STICKY FOOTER ─── */}
            <div className="relative flex-shrink-0">
              <div className="absolute -top-4 left-0 right-0 h-4 bg-gradient-to-b from-transparent to-slate-900 pointer-events-none" />
              <div className="border-t border-white/[0.06] bg-slate-900 px-5 py-3">
                {statusKey === "active" ? (
                  <div>
                    <HoverInfo content={t("Predictions:seller_content")} header={t("Predictions:seller")} type="header" />
                    <div className="grid grid-cols-3 gap-3 mt-1">
                      <IssueDialog res={res} usr={usr} backingAssetBalance={backingAssetBalance} humanReadableBackingAssetBalance={humanReadableBackingAssetBalance} existingCollateral={existingCollateral} _backingAssetID={_backingAssetID} _backingPrecision={_backingPrecision} market={market} t={t} />
                      <SellDialog res={res} usr={usr} humanReadablePredictionMarketAssetBalance={humanReadablePredictionMarketAssetBalance} _backingAssetID={_backingAssetID} _backingPrecision={_backingPrecision} market={market} t={t} />
                      <BuyDialog res={res} usr={usr} humanReadableBackingAssetBalance={humanReadableBackingAssetBalance} _backingAssetID={_backingAssetID} _backingPrecision={_backingPrecision} market={market} t={t} />
                    </div>
                  </div>
                ) : statusKey === "resolvedYes" ? (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-white">{t("Predictions:winner_header")}</div>
                      <p className="text-xs text-white/50">{t("Predictions:winner_content")}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <ClaimDialog res={res} usr={usr} humanReadablePredictionMarketAssetBalance={humanReadablePredictionMarketAssetBalance} relevantBitassetData={relevantBitassetData} t={t} />
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <JsonDetailsDialog open={detailJsonDialogOpen} onOpenChange={setDetailJsonDialogOpen} data={detailJsonPayload} />

      {usr && usr.id && house && house !== usr.id ? (
        <AlertDialog open={detailBlockConfirmOpen} onOpenChange={setDetailBlockConfirmOpen}>
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
              <AlertDialogCancel className="bg-white/[0.05] border-white/[0.08] text-white/70 hover:bg-white/10 hover:text-white">{t("Predictions:blockConfirm.cancel")}</AlertDialogCancel>
              <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={() => addBlockedUser(usr.chain, { name: issuerDisplayLabel ?? username ?? house, id: house })}>{t("Predictions:blockConfirm.confirm")}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </>
  );
}
