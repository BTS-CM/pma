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
import { Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import { CopyButton } from "../../PredictionUtils";
import { OverviewTab, NftTab, OrgTab, MarketTab, DetailsTab, ActionsTab, WinnersTab, AdminTab } from "./tabs";

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
  const [detailTabView, setDetailTabView] = useState("overview");
  const [detailJsonDialogOpen, setDetailJsonDialogOpen] = useState(false);
  const [detailJsonPayload, setDetailJsonPayload] = useState(null);
  const [detailBlockConfirmOpen, setDetailBlockConfirmOpen] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col bg-slate-950 border-white/[0.08] text-white shadow-2xl shadow-black/40">
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
                    {status.label}
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
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-1 gap-2">
              <DetailTabBar
                detailTabView={detailTabView}
                setDetailTabView={setDetailTabView}
                hasNft={hasNft}
                hasPmo={hasPmo}
                view={view}
                usr={usr}
                house={house}
                setJsonPayload={setDetailJsonPayload}
                setJsonDialogOpen={setDetailJsonDialogOpen}
                res={res}
                relevantBitassetData={relevantBitassetData}
                _desc={_desc}
                t={t}
              />

              {detailTabView === "overview" && <OverviewTab {...tabProps} />}
              {detailTabView === "nft" && hasNft && <NftTab {...tabProps} />}
              {detailTabView === "org" && hasPmo && <OrgTab {...tabProps} />}
              {detailTabView === "market" && <MarketTab {...tabProps} />}
              {detailTabView === "details" && <DetailsTab {...tabProps} />}
              {detailTabView === "actions" && view !== "expired" && <ActionsTab {...tabProps} />}
              {detailTabView === "winners" && view === "expired" && <WinnersTab {...tabProps} />}
              {detailTabView === "admin" && usr.id === house && <AdminTab {...tabProps} />}
            </div>
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
          <AlertDialogContent className="bg-slate-950 border-white/[0.08] text-white shadow-2xl shadow-black/40">
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

function DetailTabBar({
  detailTabView,
  setDetailTabView,
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
  t,
}) {
  return (
    <div className="flex flex-wrap items-center gap-1 rounded-lg bg-white/[0.03] border border-white/[0.06] p-1">
      <Button onClick={() => setDetailTabView("overview")} variant={detailTabView === "overview" ? "default" : "ghost"} size="sm" className={cn("h-7 text-xs", detailTabView !== "overview" && "text-white/50 hover:text-white/80 hover:bg-white/[0.06]")}>
        {t("Predictions:tab.overview")}
      </Button>
      {hasNft ? (
        <Button onClick={() => setDetailTabView("nft")} variant={detailTabView === "nft" ? "default" : "ghost"} size="sm" className={cn("h-7 text-xs", detailTabView !== "nft" && "text-white/50 hover:text-white/80 hover:bg-white/[0.06]")}>
          {t("Predictions:tab.nft")}
        </Button>
      ) : null}
      {hasPmo ? (
        <Button onClick={() => setDetailTabView("org")} variant={detailTabView === "org" ? "default" : "ghost"} size="sm" className={cn("h-7 text-xs", detailTabView !== "org" && "text-white/50 hover:text-white/80 hover:bg-white/[0.06]")}>
          {t("Predictions:tab.org")}
        </Button>
      ) : null}
      <Button onClick={() => setDetailTabView("market")} variant={detailTabView === "market" ? "default" : "ghost"} size="sm" className={cn("h-7 text-xs", detailTabView !== "market" && "text-white/50 hover:text-white/80 hover:bg-white/[0.06]")}>
        {t("Predictions:tab.market")}
      </Button>
      <Button onClick={() => setDetailTabView("details")} variant={detailTabView === "details" ? "default" : "ghost"} size="sm" className={cn("h-7 text-xs", detailTabView !== "details" && "text-white/50 hover:text-white/80 hover:bg-white/[0.06]")}>
        {t("Predictions:tab.details")}
      </Button>
      {view !== "expired" ? (
        <Button onClick={() => setDetailTabView("actions")} variant={detailTabView === "actions" ? "default" : "ghost"} size="sm" className={cn("h-7 text-xs", detailTabView !== "actions" && "text-white/50 hover:text-white/80 hover:bg-white/[0.06]")}>
          {t("Predictions:tab.actions")}
        </Button>
      ) : (
        <Button onClick={() => setDetailTabView("winners")} variant={detailTabView === "winners" ? "default" : "ghost"} size="sm" className={cn("h-7 text-xs", detailTabView !== "winners" && "text-white/50 hover:text-white/80 hover:bg-white/[0.06]")}>
          {t("Predictions:tab.winners")}
        </Button>
      )}
      {usr.id === house ? (
        <Button onClick={() => setDetailTabView("admin")} variant={detailTabView === "admin" ? "default" : "ghost"} size="sm" className={cn("h-7 text-xs", detailTabView !== "admin" && "text-white/50 hover:text-white/80 hover:bg-white/[0.06]")}>
          {t("Predictions:tab.admin")}
        </Button>
      ) : null}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 text-xs text-white/40 hover:text-white hover:bg-white/10">
            {t("Predictions:json.button")}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-slate-950 border-white/[0.08] shadow-2xl shadow-black/40">
          <DropdownMenuItem className="focus:bg-violet-500/20 focus:text-violet-200 hover:bg-white/10 text-white/70" onClick={() => { setJsonPayload(res); setJsonDialogOpen(true); }}>
            {t("Predictions:json.assetData")}
          </DropdownMenuItem>
          {relevantBitassetData ? (
            <DropdownMenuItem className="focus:bg-violet-500/20 focus:text-violet-200 hover:bg-white/10 text-white/70" onClick={() => { setJsonPayload(relevantBitassetData); setJsonDialogOpen(true); }}>
              {t("Predictions:json.bitassetData")}
            </DropdownMenuItem>
          ) : null}
          {_desc ? (
            <DropdownMenuItem className="focus:bg-violet-500/20 focus:text-violet-200 hover:bg-white/10 text-white/70" onClick={() => { setJsonPayload(_desc); setJsonDialogOpen(true); }}>
              {t("Predictions:json.descriptionData")}
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}