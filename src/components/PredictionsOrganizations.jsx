import React, {
  useMemo,
  useEffect,
  useState,
} from "react";
import { useStore } from "@nanostores/react";
import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";
import {
  ShieldCheck,
  Globe,
  FileText,
  ExternalLink,
  Search,
  ArrowUpDown,
  X as XIcon,
  Pen,
  Plus,
  FileJson,
  Eye,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import {
  StarIcon,
  StarFilledIcon,
} from "@radix-ui/react-icons";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

import { $currentUser } from "@/stores/users.ts";
import { $currentNode } from "@/stores/node.ts";
import {
  $favouriteOrganisations,
  addFavouriteOrganisation,
  removeFavouriteOrganisation,
} from "@/stores/favourites.ts";
import { useInitCache } from "@/nanoeffects/Init.ts";
import {
  createEveryObjectStore,
  createObjectStore,
} from "@/nanoeffects/Objects.ts";
import { createFullAssetFromSymbolStore } from "@/nanoeffects/Assets.ts";

import { debounce } from "@/lib/common.js";
import { Avatar } from "./Avatar.tsx";

function StatBlock({ label, value, mono, accent }) {
  const accentColors = {
    emerald: "text-emerald-400",
    rose: "text-rose-400",
    cyan: "text-cyan-400",
    amber: "text-amber-400",
  };
  return (
    <div className="rounded-lg border border-border/60 bg-accent/30 dark:bg-white/[0.05] p-2.5">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
        {label}
      </div>
      <div
        className={cn(
          "text-sm font-medium break-words",
          mono && "font-mono",
          accent ? accentColors[accent] || "text-foreground" : "text-foreground",
        )}
      >
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
      <div className={cn("transition-all duration-300 overflow-hidden", isOpen ? "max-h-[3000px] opacity-100" : "max-h-0 opacity-0")}>
        {children}
      </div>
    </section>
  );
}

function HeroStat({ label, value, mono }) {
  return (
    <div className="rounded-md border border-border bg-accent/30 dark:bg-white/[0.05] p-2.5">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">{label}</div>
      <div className={cn("text-sm text-foreground break-words", mono && "font-mono")}>{value}</div>
    </div>
  );
}

function PmoDetailsDialog({ open, onOpenChange, org, t }) {
  const desc = (() => {
    try {
      return JSON.parse(org.options?.description || "{}");
    } catch {
      return {};
    }
  })();
  const pmo = desc.pmo_object;
  const nft = desc.nft_object;
  if (!pmo) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] bg-card border-border text-foreground shadow-2xl shadow-black/40">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-cyan-400" />
            {pmo.identity?.name || org.symbol}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-mono text-xs">
            {org.symbol}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-5 pr-4">
            {/* Organization Identity */}
            <CollapsibleSection title={t("PredictionsOrganizations:pmoDetails.identity")} accent="cyan" defaultOpen>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                {pmo.identity?.name ? <HeroStat label={t("Predictions:org.name")} value={pmo.identity.name} /> : null}
                {pmo.identity?.website ? <HeroStat label={t("Predictions:org.website")} value={pmo.identity.website} mono /> : null}
                {pmo.identity?.manifest ? <HeroStat label={t("Predictions:org.manifest")} value={pmo.identity.manifest} mono /> : null}
              </div>
            </CollapsibleSection>

            {/* Organization Profile */}
            <CollapsibleSection title={t("PredictionsOrganizations:pmoDetails.orgProfile")} accent="emerald">
              <div className="space-y-2 mb-3">
                {pmo.governance?.onchain_account ? <HeroStat label={t("Predictions:org.onchainAccount")} value={pmo.governance.onchain_account} mono /> : null}
                {pmo.governance?.resolution_policy ? (
                  <div className="rounded-md border border-border bg-accent/30 dark:bg-white/[0.05] p-2.5">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">{t("Predictions:org.resolutionPolicy")}</div>
                    <div className="text-xs text-foreground/70 whitespace-pre-wrap">{pmo.governance.resolution_policy}</div>
                  </div>
                ) : null}
                {pmo.governance?.dispute_mechanism ? (
                  <div className="rounded-md border border-border bg-accent/30 dark:bg-white/[0.05] p-2.5">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">{t("Predictions:org.disputeMechanism")}</div>
                    <div className="text-xs text-foreground/70 whitespace-pre-wrap">{pmo.governance.dispute_mechanism}</div>
                  </div>
                ) : null}
                {pmo.attestation ? (
                  <div className="rounded-md border border-border bg-accent/30 dark:bg-white/[0.05] p-2.5">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">{t("Predictions:org.attestation")}</div>
                    <div className="text-xs text-foreground/70 whitespace-pre-wrap">{pmo.attestation}</div>
                  </div>
                ) : null}
              </div>
            </CollapsibleSection>

            {/* NFT Details */}
            {nft ? (
              <CollapsibleSection title={t("PredictionsOrganizations:pmoDetails.nftDetails")} accent="violet">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                  {nft.title ? <HeroStat label={t("Predictions:nft.title")} value={nft.title} /> : null}
                  {nft.artist ? <HeroStat label={t("Predictions:nft.artist")} value={nft.artist} /> : null}
                  {nft.type ? (
                    <HeroStat label={t("Predictions:nft.type")} value={
                      <span className="inline-flex items-center rounded-full bg-accent/50 border border-border px-2 py-0.5 text-xs font-medium text-foreground/70">{nft.type}</span>
                    } />
                  ) : null}
                  {nft.encoding ? <HeroStat label={t("Predictions:nft.encoding")} value={<span className="font-mono text-xs">{nft.encoding}</span>} /> : null}
                  {nft.license ? <HeroStat label={t("Predictions:nft.license")} value={nft.license} /> : null}
                  {nft.holder_license ? <HeroStat label={t("Predictions:nft.holderLicense")} value={nft.holder_license} /> : null}
                  {nft.narrative ? (
                    <div className="col-span-full rounded-md border border-border bg-accent/30 dark:bg-white/[0.05] p-2.5">
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">{t("Predictions:nft.narrative")}</div>
                      <div className="text-xs text-foreground/70 whitespace-pre-wrap">{nft.narrative}</div>
                    </div>
                  ) : null}
                  {nft.acknowledgements ? (
                    <div className="col-span-full rounded-md border border-border bg-accent/30 dark:bg-white/[0.05] p-2.5">
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">{t("Predictions:nft.acknowledgements")}</div>
                      <div className="text-xs text-foreground/70 whitespace-pre-wrap">{nft.acknowledgements}</div>
                    </div>
                  ) : null}
                  {nft.attestation ? (
                    <div className="col-span-full rounded-md border border-border bg-accent/30 dark:bg-white/[0.05] p-2.5">
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">{t("Predictions:nft.attestation")}</div>
                      <div className="text-xs text-foreground/70 whitespace-pre-wrap">{nft.attestation}</div>
                    </div>
                  ) : null}
                  {nft.tags ? (
                    <div className="col-span-full rounded-md border border-border bg-accent/30 dark:bg-white/[0.05] p-2.5">
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">{t("Predictions:nft.tags")}</div>
                      <div className="flex flex-wrap gap-1">
                        {String(nft.tags).split(",").map((s) => s.trim()).filter(Boolean).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-[10px] py-0">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </CollapsibleSection>
            ) : null}

            {/* Issuer */}
            <div className="rounded-md border border-border bg-accent/30 dark:bg-white/[0.05] p-2.5">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Issuer</div>
              <div className="text-sm text-foreground font-mono">{org.issuer}</div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function OrganizationCard({ org, pmaCount, t, usr, marketSearch }) {
  const currentNode = useStore($currentNode);
  const _chain = useMemo(() => {
    if (usr && usr.chain) return usr.chain;
    return "bitshares";
  }, [usr]);

  const symbol = org.symbol;
  const isOwner = usr && usr.id && org.issuer === usr.id;

  const [fullOrgAsset, setFullOrgAsset] = useState(null);
  useEffect(() => {
    if (!symbol || !currentNode?.url) return;
    let cancelled = false;
    const store = createFullAssetFromSymbolStore([_chain, symbol, currentNode.url]);
    const unsub = store.subscribe(({ data, error, loading }) => {
      if (cancelled) return;
      if (!loading && data) {
        setFullOrgAsset(data);
      }
    });
    return () => {
      cancelled = true;
      if (unsub) unsub();
    };
  }, [_chain, symbol, currentNode]);

  const source = fullOrgAsset || org;
  const desc = (() => {
    try {
      return JSON.parse(source.options?.description || "{}");
    } catch {
      return {};
    }
  })();
  const pmo = desc.pmo_object;

  const issuerAccountId = org.issuer;
  let issuerUsername = null;
  if (marketSearch && marketSearch.length && issuerAccountId) {
    const found = marketSearch.find((x) => x.u && x.u.includes(`(${issuerAccountId})`));
    if (found) {
      issuerUsername = found.u.replace(/\s*\(LTM\)\s*$/, "").replace(/\s*\([^)]*\)\s*$/, "").trim();
    }
  }

  const [jsonDialogOpen, setJsonDialogOpen] = useState(false);
  const [jsonPayload, setJsonPayload] = useState(null);
  const [pmoDetailsOpen, setPmoDetailsOpen] = useState(false);

  const favouriteOrganisations = useStore($favouriteOrganisations);
  const isFavourited = useMemo(() => {
    if (!favouriteOrganisations) return false;
    const chainOrgs = favouriteOrganisations[_chain] ?? [];
    return chainOrgs.some((o) => o.symbol === symbol);
  }, [favouriteOrganisations, _chain, symbol]);

  const onToggleFavourite = () => {
    if (isFavourited) {
      removeFavouriteOrganisation(_chain, { symbol, id: org.id, issuer: org.issuer });
    } else {
      addFavouriteOrganisation(_chain, { symbol, id: org.id, issuer: org.issuer });
    }
  };

  return (
    <Card className="bg-card/80 border-border shadow-md shadow-black/20 hover:shadow-xl hover:shadow-black/30 transition-all hover:translate-x-1 border-l-4 border-l-cyan-500">
      <CardHeader className="pb-2 pt-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2 flex-wrap">
              <ShieldCheck className="h-5 w-5 text-cyan-400 flex-shrink-0" />
              <span>{pmo?.identity?.name || symbol}</span>
              <span className="text-xs font-mono text-muted-foreground/70 font-normal">- {symbol} ({source.id})</span>
            </CardTitle>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 flex-shrink-0">
            <Badge variant="outline" className="text-[10px] border-cyan-500/30 text-cyan-400 bg-cyan-500/10">
              {pmaCount} PMAs
            </Badge>
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={onToggleFavourite}
                    className="inline-flex items-center justify-center h-6 w-6 rounded-md hover:bg-accent/40 dark:hover:bg-white/10 transition-colors"
                    aria-label={isFavourited ? "Unfavourite" : "Favourite"}
                    title={isFavourited ? "Unfavourite" : "Favourite"}
                  >
                    {isFavourited ? (
                      <StarFilledIcon className="h-4 w-4 text-amber-400" />
                    ) : (
                      <StarIcon className="h-4 w-4 text-muted-foreground/60 hover:text-amber-400" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {isFavourited ? t("PredictionsOrganizations:unfavourite") : t("PredictionsOrganizations:favourite")}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-accent/40 dark:bg-white/[0.08] pl-0.5 pr-2 py-0.5 text-[11px] font-medium"
              title={issuerAccountId}
            >
              <span className="inline-flex h-5 w-5 overflow-hidden rounded-full ring-1 ring-white/10">
                <Avatar size={20} name={issuerUsername ?? issuerAccountId} extra="Issuer" expression={{ eye: "normal", mouth: "open" }} colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]} />
              </span>
              <span className="text-muted-foreground">{issuerUsername ?? issuerAccountId}</span>
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="text-sm pb-3 text-foreground/70">
        <div className="flex flex-wrap gap-1.5 mt-1">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-7 px-2.5 py-1 text-xs border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/15 hover:border-cyan-400/60 hover:text-cyan-300 hover:shadow-[0_0_12px_-3px_rgba(34,211,238,0.4)] active:scale-[0.97] transition-all duration-200 backdrop-blur-sm"
          >
            <a href={`/active-predictions.html?search=${symbol}`}>
              <ExternalLink className="h-3.5 w-3.5" />
              {t("PredictionsOrganizations:viewActive")}
            </a>
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-7 px-2.5 py-1 text-xs border-border text-muted-foreground hover:bg-accent/50 hover:border-muted-foreground/50 hover:text-foreground/80 hover:shadow-md active:scale-[0.97] transition-all duration-200 backdrop-blur-sm"
          >
            <a href={`/expired-predictions.html?search=${symbol}`}>
              <ExternalLink className="h-3.5 w-3.5" />
              {t("PredictionsOrganizations:viewExpired")}
            </a>
          </Button>
          {pmo ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPmoDetailsOpen(true)}
              className="h-7 px-2.5 py-1 text-xs border-violet-500/30 text-violet-400 hover:bg-violet-500/15 hover:border-violet-400/60 hover:text-violet-300 hover:shadow-[0_0_12px_-3px_rgba(167,139,250,0.4)] active:scale-[0.97] transition-all duration-200 backdrop-blur-sm"
            >
              <Eye className="h-3.5 w-3.5" />
              {t("PredictionsOrganizations:viewPmoDetails")}
            </Button>
          ) : null}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2.5 py-1 text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/15 hover:border-amber-400/60 hover:text-amber-300 hover:shadow-[0_0_12px_-3px_rgba(251,191,36,0.4)] active:scale-[0.97] transition-all duration-200 backdrop-blur-sm"
              >
                <FileJson className="h-3.5 w-3.5" />
                {t("PredictionsOrganizations:viewJson")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-card border-border shadow-2xl shadow-black/40">
              <DropdownMenuItem
                className="focus:bg-violet-500/20 focus:text-violet-200 hover:bg-accent/40 dark:hover:bg-white/10 text-foreground/70"
                onClick={() => { setJsonPayload(source); setJsonDialogOpen(true); }}
              >
                {t("PredictionsOrganizations:json.assetData")}
              </DropdownMenuItem>
              {desc && Object.keys(desc).length > 0 ? (
                <DropdownMenuItem
                  className="focus:bg-violet-500/20 focus:text-violet-200 hover:bg-accent/40 dark:hover:bg-white/10 text-foreground/70"
                  onClick={() => { setJsonPayload(desc); setJsonDialogOpen(true); }}
                >
                  {t("PredictionsOrganizations:json.descriptionData")}
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
          {isOwner ? (
            <>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="h-7 px-2.5 py-1 text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/15 hover:border-amber-400/60 hover:text-amber-300 hover:shadow-[0_0_12px_-3px_rgba(251,191,36,0.4)] active:scale-[0.97] transition-all duration-200 backdrop-blur-sm"
              >
                <a href={`/create_pma_org.html?asset_update=${symbol}`}>
                  <Pen className="h-3.5 w-3.5" />
                  {t("PredictionsOrganizations:editOrg")}
                </a>
              </Button>
              {pmo ? (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-7 px-2.5 py-1 text-xs border-fuchsia-500/30 text-fuchsia-400 hover:bg-fuchsia-500/15 hover:border-fuchsia-400/60 hover:text-fuchsia-300 hover:shadow-[0_0_12px_-3px_rgba(217,70,239,0.4)] active:scale-[0.97] transition-all duration-200 backdrop-blur-sm"
                >
                  <a href={`/create_prediction.html?org=${symbol}`}>
                    <Plus className="h-3.5 w-3.5" />
                    {t("PredictionsOrganizations:createPrediction")}
                  </a>
                </Button>
              ) : null}
            </>
          ) : null}
        </div>
      </CardContent>
      <Dialog open={jsonDialogOpen} onOpenChange={setJsonDialogOpen}>
        <DialogContent className="sm:max-w-[750px] bg-card border-border text-foreground shadow-2xl shadow-black/40">
          <DialogHeader>
            <DialogTitle>{t("PredictionsOrganizations:json.title")}</DialogTitle>
            <DialogDescription className="text-muted-foreground">{t("PredictionsOrganizations:json.description")}</DialogDescription>
          </DialogHeader>
          <div className="font-mono text-xs bg-accent/30 dark:bg-white/[0.05] border border-border rounded-md p-3 max-h-[50vh] overflow-auto">
            <pre className="text-foreground/80 whitespace-pre-wrap break-words">{JSON.stringify(jsonPayload, null, 2)}</pre>
          </div>
          <Button
            className="w-1/4 mt-2 bg-accent/40 dark:bg-white/10 hover:bg-accent/50 dark:hover:bg-white/15 text-foreground border-border"
            onClick={() => {
              if (jsonPayload) navigator.clipboard.writeText(JSON.stringify(jsonPayload, null, 2));
            }}
          >
            {t("Predictions:json.copy")}
          </Button>
        </DialogContent>
      </Dialog>
      <PmoDetailsDialog open={pmoDetailsOpen} onOpenChange={setPmoDetailsOpen} org={source} t={t} />
    </Card>
  );
}

export default function PredictionsOrganizations(properties) {
  const usr = useStore($currentUser);
  const currentNode = useStore($currentNode);

  const { _assetsBTS, _assetsTEST, _marketSearchBTS, _marketSearchTEST } = properties;

  const _chain = useMemo(() => {
    if (usr && usr.chain) return usr.chain;
    return "bitshares";
  }, [usr]);

  useInitCache(_chain ?? "bitshares", []);

  const assets = useMemo(() => {
    if (_chain && (_assetsBTS || _assetsTEST)) {
      return _chain === "bitshares" ? _assetsBTS : _assetsTEST;
    }
    return [];
  }, [_assetsBTS, _assetsTEST, _chain]);

  const marketSearch = useMemo(() => {
    if (_chain && (_marketSearchBTS || _marketSearchTEST)) {
      return _chain === "bitshares" ? _marketSearchBTS : _marketSearchTEST;
    }
    return [];
  }, [_marketSearchBTS, _marketSearchTEST, _chain]);

  const [combinedAssets, setCombinedAssets] = useState([]);
  useEffect(() => {
    if (!_chain || !assets?.length || !currentNode) return;

    let cancelled = false;
    let unsubscribeCombined = null;

    async function fetching() {
      const lastAsset = assets.reduce((max, x) => {
        const n = parseInt(x.id.split(".")[2], 10);
        const m = parseInt(max.id.split(".")[2], 10);
        return n > m ? x : max;
      });

      const requiredStore = createEveryObjectStore([
        _chain,
        parseInt(lastAsset.id.split(".")[0]),
        parseInt(lastAsset.id.split(".")[1]),
        parseInt(lastAsset.id.split(".")[2]),
        currentNode.url,
      ]);

      unsubscribeCombined = requiredStore.subscribe(({ data, error, loading }) => {
        if (cancelled) return;
        if (data && !error && !loading) {
          console.log({data, lastAsset});
          setCombinedAssets(!data.length ? assets : [...assets, ...data]);
        }
      });
    }

    fetching();

    return () => {
      cancelled = true;
      if (unsubscribeCombined) {
        unsubscribeCombined();
        unsubscribeCombined = null;
      }
    };
  }, [_chain, assets, currentNode]);

  const [hasLoaded, setHasLoaded] = useState(false);
  useEffect(() => {
    if (combinedAssets && combinedAssets.length) {
      setHasLoaded(true);
    }
  }, [combinedAssets]);

  const predictionMarketAssets = useMemo(() => {
    if (!_chain || !combinedAssets || !combinedAssets.length) return [];

    return combinedAssets.filter((x) => x.bitasset_data_id);
  }, [_chain, combinedAssets]);

  const [pmaData, setPmaData] = useState([]);
  const [hasLoadedPmas, setHasLoadedPmas] = useState(false);
  useEffect(() => {
    if (!predictionMarketAssets?.length || !currentNode) {
      setPmaData([]);
      setHasLoadedPmas(true);
      return;
    }

    let cancelled = false;
    let unsubscribePma = null;

    async function fetching() {
      const _store = createObjectStore([
        _chain,
        JSON.stringify(predictionMarketAssets.map((x) => x.id)),
        currentNode.url,
      ]);

      unsubscribePma = _store.subscribe(({ data, error, loading }) => {
        if (cancelled) return;
        if (data && !error && !loading) {
          const now = new Date();
          const processedData = data
            .filter(Boolean)
            .map((x) => {
              let description;
              try {
                description = JSON.parse(x.options?.description || "{}");
              } catch {
                return null;
              }

              if (
                !description ||
                !description.market ||
                !description.expiry ||
                !description.condition
              ) {
                // Invalid PMA
                return null;
              }
              
              const expiration = new Date(description.expiry);
              return { ...x, expired: now > expiration };
            })
            .filter(Boolean);
          setPmaData(processedData);
          setHasLoadedPmas(true);
        }
      });
    }

    fetching();

    return () => {
      cancelled = true;
      if (unsubscribePma) {
        unsubscribePma();
        unsubscribePma = null;
      }
    };
  }, [predictionMarketAssets, _chain, currentNode]);

  const organizations = useMemo(() => {
    if (!pmaData || !pmaData.length) return [];

    let _orgs = [];
    pmaData.forEach((pma) => {
      if (pma.symbol && pma.symbol.includes(".")) {
        const prefix = pma.symbol.split(".")[0];
        if (!_orgs.find((o) => o.symbol === prefix)) {
          const orgAsset = combinedAssets.find((a) => a.symbol === prefix);
          if (orgAsset) {
            _orgs.push(orgAsset);
          }
        }
      }
    });

    console.log({_orgs})
    return _orgs;
  }, [pmaData, combinedAssets]);

  const totalPmaCounts = useMemo(() => {
    if (!organizations || !organizations.length || !pmaData || !pmaData.length) return {};
    const counts = {};
    for (const org of organizations) {
      const prefix = org.symbol;
      let total = 0;
      for (const pma of pmaData) {
        if (pma.symbol.includes(prefix + ".")) {
          total++;
        }
      }
      counts[org.symbol] = total;
    }

    return counts;
  }, [organizations, pmaData]);

  const { t } = useTranslation(locale.get(), { i18n: i18nInstance });

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("alpha");

  const onSearchInput = useMemo(
    () =>
      debounce((e) => {
        setSearchQuery(e.target.value);
      }, 200),
    [],
  );

  const filteredOrgs = useMemo(() => {
    let result = organizations;
    if (searchQuery && searchQuery.trim().length) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((org) => {
        if (org.symbol && org.symbol.toLowerCase().includes(q)) return true;
        const desc = (() => {
          try {
            return JSON.parse(org.options?.description || "{}");
          } catch {
            return {};
          }
        })();
        const pmo = desc.pmo_object;
        if (pmo?.identity?.name && pmo.identity.name.toLowerCase().includes(q)) return true;
        if (pmo?.identity?.website && pmo.identity.website.toLowerCase().includes(q)) return true;
        return false;
      });
    }

    result = [...result].sort((a, b) => {
      const aCount = totalPmaCounts[a.symbol] || 0;
      const bCount = totalPmaCounts[b.symbol] || 0;
      if (sortBy === "alpha") return a.symbol.localeCompare(b.symbol);
      if (sortBy === "pmaCount") return bCount - aCount;
      if (sortBy === "newest") {
        return (
          new Date(b.creation_time || 0) - new Date(a.creation_time || 0)
        );
      }
      return 0;
    });

    return result;
  }, [organizations, searchQuery, sortBy, totalPmaCounts]);

  return (
    <div className="container mx-auto mt-5 mb-5 text-foreground">
      <div className="grid grid-cols-1 gap-3">
        <Card className="bg-card/60 border-border shadow-lg shadow-black/20 backdrop-blur-sm border-l-2 border-l-cyan-500">
          <CardHeader className="pb-1">
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-cyan-500/15">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
              </span>
              {t("PredictionsOrganizations:title")}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {organizations.length
                ? t("PredictionsOrganizations:showing", {
                    count: filteredOrgs.length,
                    total: organizations.length,
                  })
                : t("PredictionsOrganizations:description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!hasLoaded ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Spinner className="size-6 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  {t("PredictionsOrganizations:loading")}
                </div>
              </div>
            ) : null}

            {hasLoaded && filteredOrgs && filteredOrgs.length ? (
              <div className="grid grid-cols-1 gap-3 mt-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    <Input
                      type="text"
                      value={searchInput}
                      onChange={onSearchInput}
                      placeholder={t(
                        "PredictionsOrganizations:searchPlaceholder",
                      )}
                      className="pl-7 h-8 text-sm bg-accent/30 dark:bg-white/[0.05] border-border text-foreground placeholder:text-muted-foreground/60"
                    />
                    {searchInput ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchInput("");
                          setSearchQuery("");
                        }}
                        className="absolute right-1 top-1/2 -translate-y-1/2 p-1 hover:text-accent-foreground text-muted-foreground"
                        aria-label="Clear"
                      >
                        <XIcon className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                  </div>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="h-8 w-[160px] text-xs bg-accent/30 dark:bg-white/[0.05] border-border text-foreground/70">
                      <ArrowUpDown className="mr-1.5 h-3.5 w-3.5" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border shadow-2xl shadow-black/40">
                      <SelectItem value="alpha">
                        {t("PredictionsOrganizations:sort.alpha")}
                      </SelectItem>
                      <SelectItem value="pmaCount">
                        {t("PredictionsOrganizations:sort.pmaCount")}
                      </SelectItem>
                      <SelectItem value="newest">
                        {t("PredictionsOrganizations:sort.newest")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div
                  className="w-full max-h-[60vh] md:max-h-[70vh] overflow-auto pr-1"
                  key={`org-list-${sortBy}-${searchQuery}`}
                >
                  <div className="grid grid-cols-1 gap-3 pb-2">
                    {filteredOrgs.map((org) => (
                      <OrganizationCard
                        key={org.id}
                        org={org}
                        pmaCount={totalPmaCounts[org.symbol] || 0}
                        t={t}
                        usr={usr}
                        marketSearch={marketSearch}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {hasLoaded && filteredOrgs && !filteredOrgs.length ? (
              <Empty className="mt-5 border-border/60">
                <EmptyHeader>
                  <EmptyMedia
                    variant="icon"
                    className="bg-cyan-500/15 text-cyan-400"
                  >
                    <ShieldCheck className="w-6 h-6" />
                  </EmptyMedia>
                  <EmptyTitle className="text-foreground/80">
                    {t("PredictionsOrganizations:empty")}
                  </EmptyTitle>
                </EmptyHeader>
                <EmptyContent>
                  <a href="/create_pma_org.html">
                    <Button className="bg-cyan-600 hover:bg-cyan-500 text-foreground">
                      {t("PredictionsOrganizations:createOrg")}
                    </Button>
                  </a>
                </EmptyContent>
              </Empty>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
