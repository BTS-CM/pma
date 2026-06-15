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
import { Ban, ExternalLink, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { CopyButton, StatBlock, ProbabilityBar, LongText, MonoBlock, NftHero, NftThumbStrip } from "../../PredictionUtils";
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

function SectionHeader({ label }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="h-px flex-1 bg-white/[0.06]" />
      <span className="text-[11px] uppercase tracking-widest font-semibold text-white/40">{label}</span>
      <div className="h-px flex-1 bg-white/[0.06]" />
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

  const {
    nftImages, heroIndex, setHeroIndex, ipfsGateway,
    relevantCallOrders, totalBets, settlementFundRaw, impliedYesPercent,
    isExpired, expiration, expirationHours, now, market, cleanedDescription,
    _backingAssetID, _backingPrecision, _issuer_permissions, _flags,
    backingAssetBalance, humanReadableBackingAssetBalance,
    humanReadablePredictionMarketAssetBalance, existingCollateral,
    parentPmoObject,
  } = tabProps;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col bg-slate-900 ring-1 ring-white/[0.08] border-white/[0.06] text-white shadow-2xl shadow-black/60">
          <DialogHeader className="pb-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <DialogTitle className="text-base sm:text-lg font-semibold leading-snug line-clamp-2 text-white">
                  {cleanedPrediction || symbol}
                </DialogTitle>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/50">
                  <span className="font-mono font-medium text-white/80">{symbol}</span>
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
                    {t(status.i18nKey)}
                  </span>
                  {hasNft ? (
                    <span className="inline-flex items-center rounded-full bg-violet-500/10 border border-violet-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-violet-400">NFT</span>
                  ) : null}
                  {hasPmo ? (
                    <span className="inline-flex items-center rounded-full bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-400">ORG</span>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] pl-0.5 pr-2 py-0.5 text-[11px] font-medium">
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
                            "h-7 w-7",
                            userBlockedIDs.has(house) ? "text-red-600 hover:text-red-700" : "text-white/40 hover:text-red-400",
                          )}
                          onClick={() => {
                            if (userBlockedIDs.has(house)) {
                              removeBlockedUser(usr.chain, { name: issuerDisplayLabel ?? username ?? house, id: house });
                            } else {
                              setDetailBlockConfirmOpen(true);
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-white/40 hover:text-white hover:bg-white/10">
                      {t("Predictions:json.button")}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-slate-900 border-white/[0.08] shadow-2xl shadow-black/40">
                    <DropdownMenuItem className="focus:bg-violet-500/20 focus:text-violet-200 hover:bg-white/10 text-white/70" onClick={() => { setDetailJsonPayload(res); setDetailJsonDialogOpen(true); }}>
                      {t("Predictions:json.assetData")}
                    </DropdownMenuItem>
                    {relevantBitassetData ? (
                      <DropdownMenuItem className="focus:bg-violet-500/20 focus:text-violet-200 hover:bg-white/10 text-white/70" onClick={() => { setDetailJsonPayload(relevantBitassetData); setDetailJsonDialogOpen(true); }}>
                        {t("Predictions:json.bitassetData")}
                      </DropdownMenuItem>
                    ) : null}
                    {_desc ? (
                      <DropdownMenuItem className="focus:bg-violet-500/20 focus:text-violet-200 hover:bg-white/10 text-white/70" onClick={() => { setDetailJsonPayload(_desc); setDetailJsonDialogOpen(true); }}>
                        {t("Predictions:json.descriptionData")}
                      </DropdownMenuItem>
                    ) : null}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-1 space-y-5">
            {/* Overview Section */}
            <section>
              <SectionHeader label={t("Predictions:tab.overview")} />
              <div className="grid grid-cols-1 gap-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <StatBlock label={t(`Predictions:${isExpired ? "expired_at" : "expiration"}`)} value={prettifyDate(expiration)} mono />
                  <StatBlock label={isExpired ? t("Predictions:timeExpired") : t("Predictions:timeLeft")} value={formatTimeRemaining(expiration)} mono />
                  {view === "expired" || view === "mine" ? (
                    <StatBlock label={t("Predictions:outcome")}
                      accent={relevantBitassetData?.outcome === 1 ? "emerald" : relevantBitassetData?.outcome === 0 ? "rose" : "amber"}
                      value={relevantBitassetData?.outcome === 1 ? t("Predictions:outcome.yes") : relevantBitassetData?.outcome === 0 ? t("Predictions:outcome.no") : t("Predictions:outcome.unresolved")} />
                  ) : (
                    <StatBlock label={t("Predictions:unique_sellers")} value={relevantCallOrders ? relevantCallOrders.length : 0} mono />
                  )}
                  <StatBlock label={t("Predictions:bettingAsset")} value={market} mono />
                </div>
                {view === "expired" || view === "mine" ? (
                  <StatBlock label={t("Predictions:prize_pool")} value={relevantBitassetData ? `${humanReadableFloat(relevantBitassetData.settlement_fund, res.precision)} ${market}` : `0 ${market}`} mono />
                ) : (
                  <StatBlock label={t("Predictions:openInterest")} help={t("Predictions:openInterest_help")} value={`${humanReadableFloat(totalBets, res.precision)} ${market}`} mono />
                )}
              </div>
            </section>

            {/* Market Section */}
            <section>
              <SectionHeader label={t("Predictions:tab.market")} />
              <div className="grid grid-cols-1 gap-3">
                {!isExpired ? (
                  <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <div className="text-[11px] uppercase tracking-wide text-white/60 mb-1.5">{t("Predictions:market.impliedProbability")}</div>
                    <ProbabilityBar yesPercent={impliedYesPercent} />
                    <div className="mt-1.5 text-[11px] text-white/40">{t("Predictions:market.impliedProbability_help")}</div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
                    <span className="text-white/50">{t("Predictions:market.expiredNote")}</span>
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <StatBlock label={t("Predictions:openInterest")} help={t("Predictions:openInterest_help")} value={`${humanReadableFloat(totalBets, res.precision)} ${market}`} mono />
                  <StatBlock label={t("Predictions:market.settlementFund")} help={t("Predictions:market.settlementFund_help")} value={`${humanReadableFloat(settlementFundRaw, res.precision)} ${market}`} mono />
                  <StatBlock label={t("Predictions:unique_sellers")} value={relevantCallOrders ? relevantCallOrders.length : 0} mono />
                  <StatBlock label={t("Predictions:market.commission")} help={t("Predictions:market.commission_help")} value={res.options?.market_fee_percent ? `${(res.options.market_fee_percent / 100).toFixed(2)}%` : "0%"} mono />
                </div>
                {!isExpired ? (
                  <Button variant="outline" size="sm" asChild className="w-fit">
                    <a href={`/dex.html?market=${res.symbol}_${market}`}>
                      <TrendingUp className="mr-2 h-3.5 w-3.5" />
                      {t("Predictions:market.tradeOnDex")}
                    </a>
                  </Button>
                ) : null}
              </div>
            </section>

            {/* Details Section */}
            <section>
              <SectionHeader label={t("Predictions:tab.details")} />
              <div className="grid grid-cols-1 gap-2">
                {cleanedDescription ? <LongText label={t("Predictions:description")} value={cleanedDescription} /> : null}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <StatBlock label={t("Predictions:permissions")} value={Object.keys(_issuer_permissions).length > 0 ? (
                    <HoverCard>
                      <HoverCardTrigger>
                        <span className="inline-flex items-center gap-1">
                          {Object.keys(_issuer_permissions).length}
                          <QuestionMarkCircledIcon className="h-3 w-3" />
                        </span>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80 mt-1 bg-slate-900 border-white/[0.08] text-white z-[9999]" align="start">
                        {Object.keys(_issuer_permissions).join(", ")}
                      </HoverCardContent>
                    </HoverCard>
                  ) : "0"} />
                  <StatBlock label={t("Predictions:flags")} value={Object.keys(_flags).length > 0 ? (
                    <HoverCard>
                      <HoverCardTrigger>
                        <span className="inline-flex items-center gap-1">
                          {Object.keys(_flags).length}
                          <QuestionMarkCircledIcon className="h-3 w-3" />
                        </span>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80 mt-1 bg-slate-900 border-white/[0.08] text-white z-[9999]" align="start">
                        {Object.keys(_flags).join(", ")}
                      </HoverCardContent>
                    </HoverCard>
                  ) : "0"} />
                </div>
                <div className="rounded-md border border-white/10 bg-white/5 p-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-white/60">{t("Predictions:details.assetId")}</div>
                      <MonoBlock value={res.id} copyable label={t("Predictions:copyAssetId")} />
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-white/60">{t("Predictions:details.issuer")}</div>
                      <MonoBlock value={house} copyable label={t("Predictions:copyIssuerId")} />
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-white/60">{t("Predictions:details.precision")}</div>
                      <span className="font-mono">{res.precision}</span>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-white/60">{t("Predictions:details.maxSupply")}</div>
                      <span className="font-mono">{humanReadableFloat(res.options.max_supply, res.precision)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* NFT Section */}
            {hasNft ? (
              <section>
                <SectionHeader label={t("Predictions:tab.nft")} />
                <div className="grid grid-cols-1 gap-3">
                  {nftImages && nftImages.length > 0 ? (
                    <>
                      <div>
                        <NftHero images={nftImages} heroIndex={heroIndex} ipfsGateway={ipfsGateway} />
                        {nftImages.length > 1 ? (
                          <NftThumbStrip images={nftImages} heroIndex={heroIndex} setHeroIndex={setHeroIndex} ipfsGateway={ipfsGateway} />
                        ) : null}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {_desc.nft_object.title ? <StatBlock label={t("Predictions:nft.title")} value={_desc.nft_object.title} /> : null}
                        {_desc.nft_object.artist ? <StatBlock label={t("Predictions:nft.artist")} value={_desc.nft_object.artist} /> : null}
                        {_desc.nft_object.type ? (
                          <StatBlock label={t("Predictions:nft.type")} value={
                            <span className="inline-flex items-center rounded-full bg-white/[0.06] border border-white/[0.08] px-2 py-0.5 text-xs font-medium text-white/70">
                              {_desc.nft_object.type}
                            </span>
                          } />
                        ) : null}
                        {_desc.nft_object.encoding ? <StatBlock label={t("Predictions:nft.encoding")} value={<span className="font-mono text-xs">{_desc.nft_object.encoding}</span>} /> : null}
                        {_desc.nft_object.license ? <StatBlock label={t("Predictions:nft.license")} value={<span className="text-xs">{_desc.nft_object.license}</span>} /> : null}
                        {_desc.nft_object.holder_license ? <StatBlock label={t("Predictions:nft.holderLicense")} value={<span className="text-xs">{_desc.nft_object.holder_license}</span>} /> : null}
                      </div>
                      {_desc.nft_object.tags ? (
                        <div>
                          <div className="text-[11px] uppercase tracking-wide text-white/60 mb-1">{t("Predictions:nft.tags")}</div>
                          <div className="flex flex-wrap gap-1">
                            {String(_desc.nft_object.tags).split(",").map((s) => s.trim()).filter(Boolean).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-[10px] py-0">{tag}</Badge>
                            ))}
                          </div>
                        </div>
                      ) : null}
                      {_desc.nft_object.narrative ? <LongText label={t("Predictions:nft.narrative")} value={DOMPurify.sanitize(_desc.nft_object.narrative)} /> : null}
                      {_desc.nft_object.acknowledgements ? <LongText label={t("Predictions:nft.acknowledgements")} value={DOMPurify.sanitize(_desc.nft_object.acknowledgements)} /> : null}
                      {_desc.nft_object.attestation ? <LongText label={t("Predictions:nft.attestation")} value={DOMPurify.sanitize(_desc.nft_object.attestation)} /> : null}
                      {nftImages && nftImages.length ? (
                        <Button variant="outline" size="sm" asChild className="self-start">
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
                    <div className="rounded-md border border-white/10 bg-white/5 p-3 grid grid-cols-1 gap-2 text-xs">
                      <div>
                        <div className="text-[11px] uppercase tracking-wide text-white/60 mb-0.5">{t("Predictions:nft.signature")}</div>
                        <MonoBlock value={_desc.nft_signature} truncate={32} copyable label={t("Predictions:nft.copySig")} />
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-wide text-white/60 mb-0.5">{t("Predictions:nft.sigPubkey")}</div>
                        <MonoBlock value={_desc.sig_pubkey_or_address} truncate={32} copyable label={t("Predictions:nft.copyPubkey")} />
                      </div>
                      <div className="text-[10px] text-white/40 italic">{t("Predictions:nft.verifyNote")}</div>
                    </div>
                  ) : null}
                </div>
              </section>
            ) : null}

            {/* Organization Section */}
            {hasPmo && parentPmoObject ? (
              <section>
                <SectionHeader label={t("Predictions:tab.org")} />
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-white">{t("Predictions:org.title")}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {parentPmoObject.name ? <StatBlock label={t("Predictions:org.name")} value={parentPmoObject.name} /> : null}
                    {parentPmoObject.website ? (
                      <StatBlock label={t("Predictions:org.website")} value={
                        <a href={parentPmoObject.website} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline inline-flex items-center gap-1">
                          {parentPmoObject.website}
                        </a>
                      } />
                    ) : null}
                    {parentPmoObject.manifest ? (
                      <StatBlock label={t("Predictions:org.manifest")} value={
                        <a href={parentPmoObject.manifest} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline inline-flex items-center gap-1">
                          {parentPmoObject.manifest}
                        </a>
                      } />
                    ) : null}
                    {parentPmoObject.onchain_account ? <StatBlock label={t("Predictions:org.onchainAccount")} value={parentPmoObject.onchain_account} mono /> : null}
                  </div>
                  {parentPmoObject.resolution_policy ? <LongText label={t("Predictions:org.resolutionPolicy")} value={DOMPurify.sanitize(parentPmoObject.resolution_policy)} /> : null}
                  {parentPmoObject.dispute_mechanism ? <LongText label={t("Predictions:org.disputeMechanism")} value={DOMPurify.sanitize(parentPmoObject.dispute_mechanism)} /> : null}
                  {parentPmoObject.attestation ? <LongText label={t("Predictions:org.attestation")} value={DOMPurify.sanitize(parentPmoObject.attestation)} /> : null}
                  {parentPmoObject.pmo_signature ? (
                    <div className="rounded-md border border-white/10 bg-white/5 p-3 text-xs">
                      <div className="text-[11px] uppercase tracking-wide text-white/60 mb-0.5">{t("Predictions:org.signature")}</div>
                      <MonoBlock value={parentPmoObject.pmo_signature} truncate={32} copyable label={t("Predictions:nft.copySig")} />
                    </div>
                  ) : null}
                  <Button variant="outline" size="sm" asChild className="self-start">
                    <a href={`/active-predictions.html?search=${res.symbol.split(".")[0]}.`}>
                      <TrendingUp className="mr-2 h-3.5 w-3.5" />
                      {t("Predictions:org.viewAll", { symbol: res.symbol.split(".")[0] })}
                    </a>
                  </Button>
                </div>
              </section>
            ) : null}

            {/* Actions Section */}
            {view !== "expired" ? (
              <section>
                <SectionHeader label={t("Predictions:tab.actions")} />
                <div className="grid grid-cols-1 gap-2">
                  <HoverInfo content={t("Predictions:seller_content")} header={t("Predictions:seller")} type="header" />
                  <div className="grid grid-cols-3 gap-3">
                    <IssueDialog
                      res={res}
                      usr={usr}
                      backingAssetBalance={backingAssetBalance}
                      humanReadableBackingAssetBalance={humanReadableBackingAssetBalance}
                      existingCollateral={existingCollateral}
                      _backingAssetID={_backingAssetID}
                      _backingPrecision={_backingPrecision}
                      market={market}
                      t={t}
                    />
                    <SellDialog
                      res={res}
                      usr={usr}
                      humanReadablePredictionMarketAssetBalance={humanReadablePredictionMarketAssetBalance}
                      _backingAssetID={_backingAssetID}
                      _backingPrecision={_backingPrecision}
                      market={market}
                      t={t}
                    />
                  </div>
                  <HoverInfo content={t("Predictions:buyer_content")} header={t("Predictions:buyer")} type="header" />
                  <div className="grid grid-cols-3 gap-3">
                    <BuyDialog
                      res={res}
                      usr={usr}
                      humanReadableBackingAssetBalance={humanReadableBackingAssetBalance}
                      _backingAssetID={_backingAssetID}
                      _backingPrecision={_backingPrecision}
                      market={market}
                      t={t}
                    />
                  </div>
                </div>
              </section>
            ) : (
              <section>
                <SectionHeader label={t("Predictions:tab.winners")} />
                <div className="grid grid-cols-1 gap-3">
                  <div className="rounded-md border border-white/10 bg-white/5 p-3 text-sm">
                    <div className="font-medium text-white mb-1">{t("Predictions:winner_header")}</div>
                    <p className="text-white/50">{t("Predictions:winner_content")}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <StatBlock label={t("Predictions:prize_pool")} help={t("Predictions:winner.settlementFund_help")} value={relevantBitassetData ? `${humanReadableFloat(relevantBitassetData.settlement_fund, res.precision)} ${market}` : `0 ${market}`} mono />
                    <StatBlock label={t("Predictions:winner.yourPmaBalance")} help={t("Predictions:winner.yourPmaBalance_help")} value={`${humanReadablePredictionMarketAssetBalance} ${symbol}`} mono />
                  </div>
                  <div className="flex justify-start">
                    <ClaimDialog
                      res={res}
                      usr={usr}
                      humanReadablePredictionMarketAssetBalance={humanReadablePredictionMarketAssetBalance}
                      relevantBitassetData={relevantBitassetData}
                      t={t}
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Admin Section */}
            {usr && usr.id === house ? (
              <section>
                <SectionHeader label={t("Predictions:tab.admin")} />
                <div className="grid grid-cols-1 gap-2">
                  <HoverInfo content={t("Predictions:admin_content")} header={t("Predictions:admin")} type="header" />
                  <div className="grid grid-cols-3 gap-3 mt-1">
                    <ResolveDialog
                      res={res}
                      usr={usr}
                      isExpired={isExpired}
                      expirationHours={expirationHours}
                      expiration={expiration}
                      cleanedPrediction={cleanedPrediction}
                      _backingAssetID={_backingAssetID}
                      t={t}
                    />
                    <PricefeederDialog res={res} usr={usr} t={t} />
                  </div>
                  <HoverInfo content={t("Predictions:price_feeders_content")} header={t("Predictions:price_feeders")} type="header" />
                  <div className="grid grid-cols-3 gap-3 mt-1">
                    <FeedPriceDialog res={res} usr={usr} _backingAssetID={_backingAssetID} t={t} />
                  </div>
                </div>
              </section>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <JsonDetailsDialog
        open={detailJsonDialogOpen}
        onOpenChange={setDetailJsonDialogOpen}
        data={detailJsonPayload}
      />

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
}