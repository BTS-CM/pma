import React, {
  useState,
  useEffect,
  useSyncExternalStore,
  useMemo,
  useCallback,
} from "react";
import { useStore } from "@nanostores/react";
import { List } from "react-window";
import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";
import {
  Hash,
  Image as ImageIcon,
  Send,
  Sparkles,
  HelpCircle,
  Info,
  CheckCircle2,
  AlertCircle,
  Link2,
  X,
  Plus,
  ShieldCheck,
  FileText,
  Globe,
  Pen,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import DeepLinkDialog from "@/components/common/DeepLinkDialog.jsx";
import ExternalLink from "@/components/common/ExternalLink.jsx";

import { useInitCache } from "@/nanoeffects/Init.ts";
import { createUserBalancesStore } from "@/nanoeffects/UserBalances.ts";

import { $currentUser } from "@/stores/users.ts";
import { $currentNode } from "@/stores/node.ts";
import { blockchainFloat } from "@/bts/common";
import { debounce } from "@/lib/common.js";

function getImages(nft_object) {
  if (!nft_object) return [];
  const object_keys = Object.keys(nft_object);
  if (
    object_keys.find((x) => x.includes("media_") && x.includes("_multihashes"))
  ) {
    return (
      object_keys
        .filter((key) => key.includes("media_") && key.includes("_multihashes"))
        .map((key) => {
          const current = nft_object[key];
          const type = key.split("_")[1].toUpperCase();
          return current.map((image) => ({ url: image.url, type }));
        })
        .flat() || []
    );
  }
  return (
    object_keys
      .filter((key) => key.includes("media_") && !key.includes("_multihash"))
      .map((key) => {
        const current = nft_object[key];
        const type = key.split("_")[1].toUpperCase();
        return { url: current, type };
      })
      .flat() || []
  );
}

const STEP_COLORS = {
  1: { icon: "bg-violet-500/15 text-violet-400 ring-violet-500/30", badge: "bg-violet-500/15 text-violet-400", border: "border-violet-500/20" },
  2: { icon: "bg-cyan-500/15 text-cyan-400 ring-cyan-500/30", badge: "bg-cyan-500/15 text-cyan-400", border: "border-cyan-500/20" },
  3: { icon: "bg-amber-500/15 text-amber-400 ring-amber-500/30", badge: "bg-amber-500/15 text-amber-400", border: "border-amber-500/20" },
};

function SectionHeader({ icon: Icon, title, description, step, optional, recommended }) {
  const { t } = useTranslation(null, { i18n: i18nInstance });
  const colors = STEP_COLORS[step] || STEP_COLORS[1];
  return (
    <div className="flex items-start gap-3 border-b border-white/10 px-6 py-4">
      <div className={"flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 " + colors.icon}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {step && (
            <span className={"inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider " + colors.badge}>
              {t("CreatePMAOrg:sectionHeader.step", { number: step })}
              {recommended ? ` · ${t("CreatePMAOrg:sectionHeader.recommended")}` : ""}
              {optional ? ` · ${t("CreatePMAOrg:sectionHeader.optional")}` : ""}
            </span>
          )}
        </div>
        <h3 className="mt-0.5 text-base font-semibold leading-tight text-white">
          {title}
        </h3>
        {description && (
          <p className="mt-0.5 text-sm text-white/50">{description}</p>
        )}
      </div>
    </div>
  );
}

function Field({ label, help, required, htmlFor, children, className, error }) {
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-center gap-1.5">
        <Label
          htmlFor={htmlFor}
          className="text-sm font-medium text-white/90"
        >
          {label}
        </Label>
        {required && <span className="text-rose-400">*</span>}
        {help && (
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  tabIndex={-1}
                  className="inline-flex items-center justify-center text-white/30 transition-colors hover:text-white/70 focus:outline-none"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-xs text-xs leading-relaxed bg-slate-900 border-white/10 text-white/80"
              >
                <p>{help}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      {children}
      {error && (
        <p className="mt-1 flex items-center gap-1 text-xs text-rose-400">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}


export default function CreatePMAOrg(properties) {
  const { t, i18n } = useTranslation(locale.get(), { i18n: i18nInstance });
  const usr = useSyncExternalStore(
    $currentUser.subscribe,
    $currentUser.get,
    () => true
  );
  const currentNode = useStore($currentNode);

  const { _assetsBTS, _assetsTEST, _feeScheduleBTS, _feeScheduleTEST } = properties;

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

  // Fee schedule for asset creation (operation 10)
  const feeSchedule = useMemo(() => {
    const schedule = _chain === "bitshares" ? _feeScheduleBTS : _feeScheduleTEST;
    if (!schedule) return null;
    const op10 = schedule.find((op) => op.id === 10);
    return op10 ? op10.data : null;
  }, [_chain, _feeScheduleBTS, _feeScheduleTEST]);

  const [balanceCounter, setBalanceCounter] = useState(0);
  const [balances, setBalances] = useState();
  useEffect(() => {
    async function fetchBalances() {
      if (usr && usr.id && currentNode && assets && assets.length) {
        const userBalancesStore = createUserBalancesStore([
          usr.chain,
          usr.id,
          currentNode ? currentNode.url : null,
        ]);
        userBalancesStore.subscribe(({ data, error, loading }) => {
          if (data && !error && !loading) {
            const filteredData = data.filter((balance) =>
              assets.find((x) => x.id === balance.asset_id)
            );
            setBalances(filteredData);
          }
        });
      }
    }
    fetchBalances();
  }, [usr, assets, currentNode, balanceCounter]);

  // Asset fields
  const [symbol, setSymbol] = useState("");
  const [desc, setDesc] = useState("");

  // Estimate asset creation fee
  const [estimatedFee, setEstimatedFee] = useState(0);
  const [feeCalculating, setFeeCalculating] = useState(false);
  // Market auto-derived from chain (needed for fee data size estimation)
  const market = useMemo(() => {
    return _chain === "bitshares" ? "BTS" : "TEST";
  }, [_chain]);

  const debouncedCalculateFee = useCallback(
    debounce(() => {
      if (!feeSchedule || !usr || !usr.id) return;
      setFeeCalculating(true);

      // Symbol length fee
      let symbolFee = 0;
      const symLen = symbol.length;
      if (symLen <= 3) {
        symbolFee = parseInt(feeSchedule.symbol3 || "0", 10);
      } else if (symLen === 4) {
        symbolFee = parseInt(feeSchedule.symbol4 || "0", 10);
      } else if (symLen >= 5) {
        symbolFee = parseInt(feeSchedule.long_symbol || "0", 10);
      }

      // Data size fee (description, PMO object, NFT data, etc.)
      const dataStr = JSON.stringify({ main: desc, short_name: symbol, market });
      const dataSizeKB = new Blob([dataStr]).size / 1024;
      const pricePerKbyte = parseInt(feeSchedule.price_per_kbyte || "0", 10);
      const dataFee = Math.ceil(dataSizeKB * pricePerKbyte);

      // Core exchange rate data (always included)
      const coreExchangeRateFee = Math.ceil(0.5 * pricePerKbyte); // ~0.5 KB estimate

      const totalFee = symbolFee + dataFee + coreExchangeRateFee;
      setEstimatedFee(totalFee);
      setFeeCalculating(false);
    }, 1000),
    [feeSchedule, usr, symbol, desc, market]
  );

  useEffect(() => {
    debouncedCalculateFee();
  }, [debouncedCalculateFee]);


  // Fixed values (hidden from user)
  const precision = 0;
  const maxSupply = 1;

  // Edit mode: read ?asset_update=SYMBOL from URL
  const updateSymbol = useMemo(() => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    return params.get("asset_update") || null;
  }, []);
  const isEditMode = !!updateSymbol;

  // Find the existing asset when in edit mode
  const existingAsset = useMemo(() => {
    if (!updateSymbol || !assets || !assets.length) return null;
    return assets.find((a) => a.symbol === updateSymbol) || null;
  }, [updateSymbol, assets]);

  // NFT fields
  const [enabledNFT, setEnabledNFT] = useState(false);
  const [acknowledgements, setAcknowledgements] = useState("");
  const [artist, setArtist] = useState("");
  const [attestation, setAttestation] = useState("");
  const [holderLicense, setHolderLicense] = useState("");
  const [license, setLicense] = useState("");
  const [narrative, setNarrative] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [type, setType] = useState("NFT/ART/VISUAL");
  const [nftMedia, setNFTMedia] = useState([]);
  const [newMediaType, setNewMediaType] = useState("");
  const [newMediaUrl, setNewMediaUrl] = useState("");

  // PMO object fields
  const [enabledPMO, setEnabledPMO] = useState(false);
  const [pmoOrgName, setPmoOrgName] = useState("");
  const [pmoWebsite, setPmoWebsite] = useState("");
  const [pmoManifest, setPmoManifest] = useState("");
  const [pmoResolutionPolicy, setPmoResolutionPolicy] = useState("");
  const [pmoDisputeMechanism, setPmoDisputeMechanism] = useState("");
  const [pmoOnchainAccount, setPmoOnchainAccount] = useState("");
  const [pmoAttestation, setPmoAttestation] = useState("");

  // CER
  const [cerBaseAmount, setCerBaseAmount] = useState(1);
  const [cerQuoteAmount, setCerQuoteAmount] = useState(1);

  // Pre-fill form when in edit mode
  useEffect(() => {
    if (!existingAsset || !isEditMode) return;
    setSymbol(existingAsset.symbol);
    try {
      const d = JSON.parse(existingAsset.options?.description || "{}");
      setDesc(d.main || "");
      if (d.nft_object) {
        setEnabledNFT(true);
        setAcknowledgements(d.nft_object.acknowledgements || "");
        setArtist(d.nft_object.artist || "");
        setAttestation(d.nft_object.attestation || "");
        setHolderLicense(d.nft_object.holder_license || "");
        setLicense(d.nft_object.license || "");
        setNarrative(d.nft_object.narrative || "");
        setTitle(d.nft_object.title || "");
        setTags(d.nft_object.tags || "");
        setType(d.nft_object.type || "NFT/ART/VISUAL");
        const media = [];
        for (const t of ["PNG", "JPEG", "WEBP", "GIF", "TIFF"]) {
          const url = d.nft_object[`media_${t}_multihash`];
          if (url) media.push({ type: t, url });
        }
        if (media.length) setNFTMedia(media);
      }
      if (d.pmo_object) {
        setEnabledPMO(true);
        const pmo = d.pmo_object;
        setPmoOrgName(pmo.identity?.name || "");
        setPmoWebsite(pmo.identity?.website || "");
        setPmoManifest(pmo.identity?.manifest || "");
        setPmoResolutionPolicy(pmo.governance?.resolution_policy || "");
        setPmoDisputeMechanism(pmo.governance?.dispute_mechanism || "");
        setPmoOnchainAccount(pmo.governance?.onchain_account || "");
        setPmoAttestation(pmo.attestation?.issuer_attestation || "");
      }
    } catch {}
  }, [existingAsset, isEditMode]);

  const description = useMemo(() => {
    let _description = { main: desc,         short_name: symbol, market };

    if (enabledNFT) {
      const nft_object = {
        acknowledgements,
        artist,
        attestation,
        encoding: "ipfs",
        holder_license: holderLicense,
        license,
        narrative,
        title,
        tags,
        type,
      };

      nftMedia.forEach((image) => {
        const imageType = image.type;
        if (!nft_object[`media_${imageType}_multihash`]) {
          nft_object[`media_${imageType}_multihash`] = image.url;
        }
        const sameTypeFiles = nftMedia.filter((img) => img.type === imageType);
        if (sameTypeFiles && sameTypeFiles.length > 1) {
          if (!nft_object[`media_${imageType}_multihashes`]) {
            nft_object[`media_${imageType}_multihashes`] = [{ url: image.url }];
          } else {
            nft_object[`media_${imageType}_multihashes`].push({ url: image.url });
          }
        }
      });

      _description["nft_object"] = nft_object;
    }

    if (enabledPMO) {
      _description["pmo_object"] = {
        type: "PMO/ORGANIZATION@1.0",
        identity: {
          name: pmoOrgName,
          website: pmoWebsite,
          manifest: pmoManifest,
        },
        governance: {
          resolution_policy: pmoResolutionPolicy,
          dispute_mechanism: pmoDisputeMechanism,
          onchain_account: pmoOnchainAccount,
        },
        attestation: pmoAttestation,
      };
    }

    return JSON.stringify(_description);
  }, [
    enabledNFT,
    acknowledgements,
    artist,
    attestation,
    holderLicense,
    license,
    narrative,
    title,
    tags,
    type,
    nftMedia,
    desc,
    symbol,
    enabledPMO,
    pmoOrgName,
    pmoWebsite,
    pmoManifest,
    pmoResolutionPolicy,
    pmoDisputeMechanism,
    pmoOnchainAccount,
    pmoAttestation,
  ]);

  const trx = useMemo(() => {
    if (isEditMode && existingAsset) {
      return {
        issuer: usr.id,
        asset_to_update: existingAsset.id,
        new_options: {
          description,
          max_supply: blockchainFloat(maxSupply, precision),
          market_fee_percent: 0,
          max_market_fee: 0,
          issuer_permissions: 0,
          flags: 0,
          core_exchange_rate: {
            base: {
              amount: blockchainFloat(cerBaseAmount, 5),
              asset_id: "1.3.0",
            },
            quote: {
              amount: blockchainFloat(cerQuoteAmount, precision),
              asset_id: "1.3.1",
            },
          },
          whitelist_authorities: [],
          blacklist_authorities: [],
          whitelist_markets: [],
          blacklist_markets: [],
          extensions: {},
        },
        extensions: [],
      };
    }
    return {
      issuer: usr.id,
      symbol: symbol,
      precision: precision,
      common_options: {
        description,
        max_supply: blockchainFloat(maxSupply, precision),
        market_fee_percent: 0,
        max_market_fee: 0,
        issuer_permissions: 0,
        flags: 0,
        core_exchange_rate: {
          base: {
            amount: blockchainFloat(cerBaseAmount, 5),
            asset_id: "1.3.0",
          },
          quote: {
            amount: blockchainFloat(cerQuoteAmount, precision),
            asset_id: "1.3.1",
          },
        },
        whitelist_authorities: [],
        blacklist_authorities: [],
        whitelist_markets: [],
        blacklist_markets: [],
        extensions: {},
      },
      is_prediction_market: false,
      extensions: null,
    };
  }, [usr, symbol, description, cerBaseAmount, cerQuoteAmount, isEditMode, existingAsset]);

  const symbolError = useMemo(() => {
    if (symbol.length === 0) return null;
    if (symbol.includes(".")) return "Organization symbol cannot contain a dot";
    if (symbol.length > 11) return "Symbol is too long (max 11 characters)";
    if (!/^[a-zA-Z0-9]+$/.test(symbol))
      return "Symbol can only contain letters and digits";
    return null;
  }, [symbol]);

  const isFormValid = useMemo(() => {
    if (!symbol || symbolError) return false;
    return true;
  }, [symbol, symbolError]);

  const [showDialog, setShowDialog] = useState(false);

  const MediaRow = ({ index, style }) => {
    if (!nftMedia || !nftMedia.length || !nftMedia[index]) return;
    let res = nftMedia[index];
    return (
      <div
        style={{ ...style }}
        key={`dialogrow-${index}`}
        className="grid grid-cols-4"
      >
        <div className="col-span-1 text-white/60">{res.type}</div>
        <div className="col-span-1">
          <Dialog>
            <DialogTrigger>
              <Button className="h-5 border-white/10 bg-white/5 text-white/70 hover:bg-white/10" variant="outline">
                Full URL
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-950 backdrop-blur-2xl border-white/10 text-white w-full max-w-4xl">
              <DialogHeader>
                <DialogTitle className="text-white">Full IPFS URL</DialogTitle>
              </DialogHeader>
              <p className="text-white/70 font-mono text-sm">{res.url}</p>
            </DialogContent>
          </Dialog>
        </div>
        <div className="col-span-1 text-white/50 text-sm">{res.url.split("/").pop()}</div>
        <div className="col-span-1">
          <Button
            variant="outline"
            className="w-5 h-5 border-white/10 bg-white/5 text-white/50 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30"
            onClick={() => setNFTMedia(nftMedia.filter((x) => x.url !== res.url))}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-16">
      {/* Page header */}
      <div className="container mx-auto max-w-4xl px-4 pt-6 sm:pt-8">
        <div className="rounded-xl border border-white/10 bg-slate-950/60 backdrop-blur-xl px-6 py-5 shadow-lg shadow-black/20 ring-1 ring-white/[0.06]">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400 shadow-md shadow-violet-500/10 ring-1 ring-violet-500/30">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                {t(isEditMode ? "CreatePMAOrg:card.updateTitle" : "CreatePMAOrg:card.title")}
              </h1>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-white/50">
                {t(isEditMode ? "CreatePMAOrg:card.updateDescription" : "CreatePMAOrg:card.description")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form sections */}
      <div className="container mx-auto max-w-4xl space-y-6 px-4 py-6">
        {/* Step 1 — Organization identity */}
        <Card className="overflow-hidden border-white/10 bg-slate-950/60 backdrop-blur-xl shadow-lg shadow-black/20">
          <SectionHeader
            step={1}
            icon={Hash}
            title={t("CreatePMAOrg:steps.identity.title")}
            description={t("CreatePMAOrg:steps.identity.description")}
          />
          <CardContent className="space-y-5 pt-6">
            <Field
              label={t("CreatePMAOrg:symbol.label")}
              help={t("CreatePMAOrg:symbol.help")}
              htmlFor="org-symbol"
              required
              error={symbolError}
            >
              <div className="relative">
                <Input
                  id="org-symbol"
                  placeholder={t("CreatePMAOrg:symbol.placeholder")}
                  value={symbol}
                  type="text"
                  disabled={isEditMode}
                  className="pr-14 font-mono bg-slate-950/60 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-violet-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  onInput={(e) => {
                    const value = e.currentTarget.value;
                    const regex = /^[a-zA-Z0-9]*$/;
                    if (regex.test(value)) {
                      setSymbol(value.toUpperCase());
                    }
                  }}
                  maxLength={11}
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-mono text-xs text-white/40">
                  {symbol.length}/11
                </span>
              </div>
            </Field>

            <Field
              label={t("CreatePMAOrg:description.label")}
              help={t("CreatePMAOrg:description.help")}
              htmlFor="org-desc"
            >
              <Textarea
                id="org-desc"
                placeholder={t("CreatePMAOrg:description.placeholder")}
                value={desc}
                rows={3}
                className="bg-slate-950/60 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-violet-500/50"
                onInput={(e) => setDesc(e.currentTarget.value)}
              />
            </Field>
          </CardContent>
        </Card>

        {/* Step 2 — PMO Organization Profile (recommended) */}
        <Card
          className={
            "overflow-hidden border-white/10 bg-slate-950/60 backdrop-blur-xl shadow-lg shadow-black/20 transition-colors " +
            (enabledPMO ? "ring-1 ring-cyan-500/30" : "")
          }
        >
          <div className="flex items-start gap-3 border-b border-white/10 px-6 py-4">
            <div
              className={
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ring-1 " +
                (enabledPMO
                  ? "bg-cyan-500/15 text-cyan-400 ring-cyan-500/30"
                  : "bg-white/5 text-white/40 ring-white/10")
              }
            >
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-400">
                  {t("CreatePMAOrg:sectionHeader.step", { number: 2 })} · {t("CreatePMAOrg:sectionHeader.recommended")}
                </span>
              </div>
              <h3 className="mt-0.5 text-base font-semibold leading-tight text-white">
                {t("CreatePMAOrg:steps.pmo.title")}
              </h3>
              <p className="mt-0.5 text-sm text-white/50">
                {t("CreatePMAOrg:steps.pmo.description")}
              </p>
            </div>
            <Switch
              checked={enabledPMO}
              onCheckedChange={setEnabledPMO}
              className="mt-1 shrink-0 data-[state=checked]:bg-cyan-500 data-[state=unchecked]:bg-white/20 [&>span]:bg-white"
            />
          </div>

          {enabledPMO && (
            <CardContent className="space-y-5 pt-6">
              {/* Identity section */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                  <Globe className="h-3.5 w-3.5" />
                  {t("CreatePMAOrg:pmo.identity.heading")}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field
                  label={t("CreatePMAOrg:pmo.identity.name.label")}
                  help={t("CreatePMAOrg:pmo.identity.name.help")}
                  htmlFor="pmo-name"
                  required
                >
                  <Input
                    id="pmo-name"
                    placeholder={t("CreatePMAOrg:pmo.identity.name.placeholder")}
                    value={pmoOrgName}
                    type="text"
                    className="bg-slate-950/60 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-cyan-500/50"
                    onInput={(e) => setPmoOrgName(e.currentTarget.value)}
                  />
                </Field>
                <Field
                  label={t("CreatePMAOrg:pmo.identity.website.label")}
                  help={t("CreatePMAOrg:pmo.identity.website.help")}
                  htmlFor="pmo-website"
                >
                  <Input
                    id="pmo-website"
                    placeholder="https://organization.com"
                    value={pmoWebsite}
                    type="url"
                    className="bg-slate-950/60 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-cyan-500/50"
                    onInput={(e) => setPmoWebsite(e.currentTarget.value)}
                  />
                </Field>
              </div>
              <Field
                label={t("CreatePMAOrg:pmo.identity.manifest.label")}
                help={t("CreatePMAOrg:pmo.identity.manifest.help")}
                htmlFor="pmo-manifest"
              >
                <Input
                  id="pmo-manifest"
                  placeholder="https://organization.com/bitshares-pmo.json"
                  value={pmoManifest}
                  type="url"
                  className="bg-slate-950/60 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-cyan-500/50"
                  onInput={(e) => setPmoManifest(e.currentTarget.value)}
                />
              </Field>

              {/* Governance section */}
              <div className="space-y-1 pt-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                  <FileText className="h-3.5 w-3.5" />
                  {t("CreatePMAOrg:pmo.governance.heading")}
                </div>
              </div>
              <Field
                label={t("CreatePMAOrg:pmo.governance.resolution.label")}
                help={t("CreatePMAOrg:pmo.governance.resolution.help")}
                htmlFor="pmo-resolution"
              >
                <Textarea
                  id="pmo-resolution"
                  placeholder={t("CreatePMAOrg:pmo.governance.resolution.placeholder")}
                  value={pmoResolutionPolicy}
                  rows={3}
                  className="bg-slate-950/60 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-cyan-500/50"
                  onInput={(e) => setPmoResolutionPolicy(e.currentTarget.value)}
                />
              </Field>
              <Field
                label={t("CreatePMAOrg:pmo.governance.dispute.label")}
                help={t("CreatePMAOrg:pmo.governance.dispute.help")}
                htmlFor="pmo-dispute"
              >
                <Textarea
                  id="pmo-dispute"
                  placeholder={t("CreatePMAOrg:pmo.governance.dispute.placeholder")}
                  value={pmoDisputeMechanism}
                  rows={3}
                  className="bg-slate-950/60 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-cyan-500/50"
                  onInput={(e) => setPmoDisputeMechanism(e.currentTarget.value)}
                />
              </Field>
              <Field
                label={t("CreatePMAOrg:pmo.governance.account.label")}
                help={t("CreatePMAOrg:pmo.governance.account.help")}
                htmlFor="pmo-account"
              >
                <Input
                  id="pmo-account"
                  placeholder={t("CreatePMAOrg:pmo.governance.account.placeholder")}
                  value={pmoOnchainAccount}
                  type="text"
                  className="font-mono bg-slate-950/60 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-cyan-500/50"
                  onInput={(e) => setPmoOnchainAccount(e.currentTarget.value)}
                />
              </Field>

              {/* Attestation section */}
              <div className="space-y-1 pt-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                  <Pen className="h-3.5 w-3.5" />
                  {t("CreatePMAOrg:pmo.attestation.heading")}
                </div>
              </div>
              <Field
                label={t("CreatePMAOrg:pmo.attestation.label")}
                help={t("CreatePMAOrg:pmo.attestation.help")}
                htmlFor="pmo-attestation"
              >
                <Textarea
                  id="pmo-attestation"
                  placeholder={t("CreatePMAOrg:pmo.attestation.placeholder")}
                  value={pmoAttestation}
                  rows={3}
                  className="bg-slate-950/60 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-cyan-500/50"
                  onInput={(e) => setPmoAttestation(e.currentTarget.value)}
                />
              </Field>
            </CardContent>
          )}
        </Card>


        {/* Step 3 — NFT options (optional) */}
        <Card
          className={
            "overflow-hidden border-white/10 bg-slate-950/60 backdrop-blur-xl shadow-lg shadow-black/20 transition-colors " +
            (enabledNFT ? "ring-1 ring-amber-500/30" : "")
          }
        >
          <div className="flex items-start gap-3 border-b border-white/10 px-6 py-4">
            <div
              className={
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ring-1 " +
                (enabledNFT
                  ? "bg-amber-500/15 text-amber-400 ring-amber-500/30"
                  : "bg-white/5 text-white/40 ring-white/10")
              }
            >
              <ImageIcon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                  {t("CreatePMAOrg:sectionHeader.step", { number: 3 })} · {t("CreatePMAOrg:sectionHeader.optional")}
                </span>
              </div>
              <h3 className="mt-0.5 text-base font-semibold leading-tight text-white">
                {t("CreatePMAOrg:steps.nft.title")}
              </h3>
              <p className="mt-0.5 text-sm text-white/50">
                {t("CreatePMAOrg:steps.nft.description")}
              </p>
            </div>
            <Switch
              checked={enabledNFT}
              onCheckedChange={setEnabledNFT}
              className="mt-1 shrink-0 data-[state=checked]:bg-amber-500 data-[state=unchecked]:bg-white/20 [&>span]:bg-white"
            />
          </div>

          {enabledNFT && (
            <CardContent className="space-y-5 pt-6">
              {/* Media section */}
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">
                        {t("AssetCommon:nft.currentIPFSFiles", {
                          count: nftMedia.length,
                        })}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-white/40">
                      {t("AssetCommon:nft.supportedFiletypes")}
                    </p>
                  </div>
                  <Dialog
                    onOpenChange={(open) => {
                      if (!open) setNewMediaUrl("");
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white">
                        {t("AssetCommon:nft.modifyMultimediaContents")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-950 backdrop-blur-2xl border-white/10 text-white w-full max-w-4xl">
                      <DialogHeader>
                        <DialogTitle className="text-white">
                          {t("AssetCommon:nft.modifyingMultimediaContents")}
                        </DialogTitle>
                      </DialogHeader>
                      <Card className="bg-slate-900/60 border-white/10">
                        <CardHeader>
                          <CardTitle className="text-white">
                            {t("AssetCommon:nft.currentIPFSMedia")}
                          </CardTitle>
                          <CardDescription className="text-white/50">
                            {t("AssetCommon:nft.referencesIPFSObjects", {
                              count: nftMedia.length,
                            })}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {!nftMedia || !nftMedia.length ? (
                            <p className="text-sm text-white/40">
                              {t("AssetCommon:nft.noIPFSMediaFound")}
                            </p>
                          ) : (
                            <>
                              <div className="grid grid-cols-4 gap-2 border-b border-white/10 pb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                                <div className="col-span-1">
                                  {t("AssetCommon:nft.type")}
                                </div>
                                <div className="col-span-1">
                                  {t("AssetCommon:nft.contentIdentifier")}
                                </div>
                                <div className="col-span-1">
                                  {t("AssetCommon:nft.filename")}
                                </div>
                                <div className="col-span-1 text-right">
                                  {t("AssetCommon:nft.delete")}
                                </div>
                              </div>
                              <div className="max-h-[125px] w-full overflow-auto">
                                <List
                                  rowComponent={MediaRow}
                                  rowCount={nftMedia.length}
                                  rowHeight={25}
                                  rowProps={{}}
                                />
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>

                      <Card className="bg-slate-900/60 border-white/10">
                        <CardHeader>
                          <CardTitle className="text-white">
                            {t("AssetCommon:nft.addNewIPFSMedia")}
                          </CardTitle>
                          <CardDescription className="text-white/50">
                            {t("AssetCommon:nft.noIPFSGateway")}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-4 gap-3">
                            <div className="col-span-3">
                              <Input
                                placeholder={t("AssetCommon:nft.mediaURLPlaceholder")}
                                type="text"
                                className="bg-slate-950/60 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-violet-500/50"
                                onInput={(e) => setNewMediaUrl(e.currentTarget.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && newMediaUrl && newMediaType) {
                                    const temp_urls = nftMedia.map((x) => x.url);
                                    if (temp_urls.includes(newMediaUrl)) {
                                      setNewMediaUrl("");
                                      return;
                                    }
                                    setNFTMedia(
                                      nftMedia && nftMedia.length
                                        ? [...nftMedia, { url: newMediaUrl, type: newMediaType }]
                                        : [{ url: newMediaUrl, type: newMediaType }]
                                    );
                                    setNewMediaUrl("");
                                  }
                                }}
                                value={newMediaUrl}
                              />
                            </div>
                            <div className="col-span-1">
                              <Select onValueChange={setNewMediaType}>
                                <SelectTrigger className="w-full bg-slate-950/60 border-white/10 text-white">
                                  <SelectValue
                                    placeholder={t("AssetCommon:nft.fileTypePlaceholder")}
                                  />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-950 border-white/10 text-white">
                                  <SelectGroup>
                                    <SelectLabel>{t("AssetCommon:nft.imageFormats")}</SelectLabel>
                                    <SelectItem value="PNG">PNG</SelectItem>
                                    <SelectItem value="WEBP">WEBP</SelectItem>
                                    <SelectItem value="JPEG">JPEG</SelectItem>
                                    <SelectItem value="GIF">GIF</SelectItem>
                                    <SelectItem value="TIFF">TIFF</SelectItem>
                                    <SelectItem value="BMP">BMP</SelectItem>
                                    <SelectLabel>{t("AssetCommon:nft.audioFormats")}</SelectLabel>
                                    <SelectItem value="MP3">MP3</SelectItem>
                                    <SelectItem value="MP4">MP4</SelectItem>
                                    <SelectItem value="M4A">M4A</SelectItem>
                                    <SelectItem value="OGG">OGG</SelectItem>
                                    <SelectItem value="FLAC">FLAC</SelectItem>
                                    <SelectItem value="WAV">WAV</SelectItem>
                                    <SelectItem value="WMA">WMA</SelectItem>
                                    <SelectItem value="AAC">AAC</SelectItem>
                                    <SelectLabel>{t("AssetCommon:nft.videoFormats")}</SelectLabel>
                                    <SelectItem value="WEBM">WEBM</SelectItem>
                                    <SelectItem value="MOV">MOV</SelectItem>
                                    <SelectItem value="QT">QT</SelectItem>
                                    <SelectItem value="AVI">AVI</SelectItem>
                                    <SelectItem value="WMV">WMV</SelectItem>
                                    <SelectItem value="MPEG">MPEG</SelectItem>
                                    <SelectLabel>{t("AssetCommon:nft.documentFormats")}</SelectLabel>
                                    <SelectItem value="PDF">PDF</SelectItem>
                                    <SelectItem value="DOCX">DOCX</SelectItem>
                                    <SelectItem value="ODT">ODT</SelectItem>
                                    <SelectItem value="XLSX">XLSX</SelectItem>
                                    <SelectItem value="ODS">ODS</SelectItem>
                                    <SelectItem value="PPTX">PPTX</SelectItem>
                                    <SelectItem value="TXT">TXT</SelectItem>
                                    <SelectLabel>{t("AssetCommon:nft.threeDFormats")}</SelectLabel>
                                    <SelectItem value="OBJ">OBJ</SelectItem>
                                    <SelectItem value="FBX">FBX</SelectItem>
                                    <SelectItem value="GLTF">GLTF</SelectItem>
                                    <SelectItem value="3DS">3DS</SelectItem>
                                    <SelectItem value="STL">STL</SelectItem>
                                    <SelectItem value="COLLADA">COLLADA</SelectItem>
                                    <SelectItem value="3MF">3MF</SelectItem>
                                    <SelectItem value="BLEND">BLEND</SelectItem>
                                    <SelectItem value="SKP">SKP</SelectItem>
                                    <SelectItem value="VOX">VOX</SelectItem>
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="col-span-4 flex flex-wrap gap-2">
                              {newMediaType && newMediaType.length && newMediaUrl && newMediaUrl.length ? (
                                <Button
                                  className="bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:brightness-110"
                                  onClick={() => {
                                    const temp_urls = nftMedia.map((x) => x.url);
                                    if (temp_urls.includes(newMediaUrl)) {
                                      setNewMediaUrl("");
                                      return;
                                    }
                                    setNFTMedia([
                                      ...nftMedia,
                                      { url: newMediaUrl, type: newMediaType },
                                    ]);
                                    setNewMediaUrl("");
                                  }}
                                >
                                  {t("AssetCommon:nft.submit")}
                                </Button>
                              ) : (
                                <Button disabled className="bg-white/10 text-white/40 cursor-not-allowed">
                                  {t("AssetCommon:nft.submit")}
                                </Button>
                              )}
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" className="border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white">
                                    {t("AssetCommon:nft.ipfsHostingSolutions")}
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-slate-950 backdrop-blur-2xl border-white/10 text-white">
                                  <DialogHeader>
                                    <DialogTitle className="text-white">
                                      {t("AssetCommon:nft.ipfsHostingSolutions")}
                                    </DialogTitle>
                                    <DialogDescription className="text-white/50">
                                      {t("AssetCommon:nft.ipfsHostingDescription")}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                    <ExternalLink classnamecontents="hover:text-violet-400 text-white/60" type="button" text={"Pinata.cloud"} hyperlink={"https://www.pinata.cloud/"} />
                                    <ExternalLink classnamecontents="hover:text-violet-400 text-white/60" type="button" text={"NFT.storage"} hyperlink={"https://nft.storage/"} />
                                    <ExternalLink classnamecontents="hover:text-violet-400 text-white/60" type="button" text={"Web3.storage"} hyperlink={"https://web3.storage/"} />
                                    <ExternalLink classnamecontents="hover:text-violet-400 text-white/60" type="button" text={"Fleek.co"} hyperlink={"https://fleek.co/ipfs-gateway/"} />
                                    <ExternalLink classnamecontents="hover:text-violet-400 text-white/60" type="button" text={"Infura.io"} hyperlink={"https://infura.io/product/ipfs"} />
                                    <ExternalLink classnamecontents="hover:text-violet-400 text-white/60" type="button" text={"StorJ"} hyperlink={"https://landing.storj.io/permanently-pin-with-storj-dcs"} />
                                    <ExternalLink classnamecontents="hover:text-violet-400 text-white/60" type="button" text={"Eternum.io"} hyperlink={"https://www.eternum.io/"} />
                                    <ExternalLink classnamecontents="hover:text-violet-400 text-white/60" type="button" text={"IPFS Docs"} hyperlink={"https://blog.ipfs.io/2021-04-05-storing-nfts-on-ipfs/"} />
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </DialogContent>
                  </Dialog>
                </div>
                {nftMedia.length > 0 ? (
                  <div className="space-y-1.5">
                    {nftMedia.map((m) => (
                      <div
                        key={m.url}
                        className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm"
                      >
                        <Link2 className="h-3.5 w-3.5 text-white/40" />
                        <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white/50">
                          {m.type}
                        </span>
                        <span className="truncate font-mono text-xs text-white">
                          {m.url}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-white/40">
                    {t("AssetCommon:nft.noIPFSMediaFound")}
                  </p>
                )}
              </div>

              {/* NFT metadata fields */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field label={t("AssetCommon:nft.NFTTitleHeader")} help={t("AssetCommon:nft.NFTTitleContent")} htmlFor="org-nft-title">
                  <Input id="org-nft-title" placeholder={t("AssetCommon:nft.TitlePlaceholder")} value={title} className="bg-slate-950/60 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-violet-500/50" onInput={(e) => setTitle(e.currentTarget.value)} />
                </Field>
                <Field label={t("AssetCommon:nft.NFTArtistHeader")} help={t("AssetCommon:nft.NFTArtistContent")} htmlFor="org-nft-artist">
                  <Input id="org-nft-artist" placeholder={t("AssetCommon:nft.ArtistPlaceholder")} value={artist} className="bg-slate-950/60 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-violet-500/50" onInput={(e) => setArtist(e.currentTarget.value)} />
                </Field>
                <Field label={t("AssetCommon:nft.NFTNarrativeHeader")} help={t("AssetCommon:nft.NFTNarrativeContent")} htmlFor="org-nft-narrative">
                  <Input id="org-nft-narrative" placeholder={t("AssetCommon:nft.NarrativePlaceholder")} value={narrative} className="bg-slate-950/60 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-violet-500/50" onInput={(e) => setNarrative(e.currentTarget.value)} />
                </Field>
                <Field label={t("AssetCommon:nft.NFTTagsHeader")} help={t("AssetCommon:nft.NFTTagsContent")} htmlFor="org-nft-tags">
                  <Input id="org-nft-tags" placeholder={t("AssetCommon:nft.TagsPlaceholder")} value={tags} className="bg-slate-950/60 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-violet-500/50" onInput={(e) => setTags(e.currentTarget.value)} />
                </Field>
                <Field label={t("AssetCommon:nft.NFTTypeHeader")} help={t("AssetCommon:nft.NFTTypeContent")} htmlFor="org-nft-type">
                  <Input id="org-nft-type" placeholder={t("AssetCommon:nft.TypePlaceholder")} value={type} className="bg-slate-950/60 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-violet-500/50" onInput={(e) => setType(e.currentTarget.value)} />
                </Field>
                <Field label={t("AssetCommon:nft.NFTAttestationHeader")} help={t("AssetCommon:nft.NFTAttestationContent")} htmlFor="org-nft-attestation">
                  <Input id="org-nft-attestation" placeholder={t("AssetCommon:nft.AttestationPlaceholder")} value={attestation} className="bg-slate-950/60 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-violet-500/50" onInput={(e) => setAttestation(e.currentTarget.value)} />
                </Field>
                <Field label={t("AssetCommon:nft.NFTAcknowledgementsHeader")} help={t("AssetCommon:nft.NFTAcknowledgementsContent")} htmlFor="org-nft-ack">
                  <Input id="org-nft-ack" placeholder={t("AssetCommon:nft.AcknowledgementsPlaceholder")} value={acknowledgements} className="bg-slate-950/60 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-violet-500/50" onInput={(e) => setAcknowledgements(e.currentTarget.value)} />
                </Field>
                <Field label={t("AssetCommon:nft.NFTHolderLicenseHeader")} help={t("AssetCommon:nft.NFTHolderLicenseContent")} htmlFor="org-nft-holderlic">
                  <Input id="org-nft-holderlic" placeholder={t("AssetCommon:nft.HolderLicensePlaceholder")} value={holderLicense} className="bg-slate-950/60 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-violet-500/50" onInput={(e) => setHolderLicense(e.currentTarget.value)} />
                </Field>
                <Field label={t("AssetCommon:nft.NFTLicenseHeader")} help={t("AssetCommon:nft.NFTLicenseContent")} htmlFor="org-nft-license">
                  <Input id="org-nft-license" placeholder={t("AssetCommon:nft.LicensePlaceholder")} value={license} className="bg-slate-950/60 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-violet-500/50" onInput={(e) => setLicense(e.currentTarget.value)} />
                </Field>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Submit area */}
        <div className="space-y-4">
          {isFormValid ? (
            <div className="flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <p className="text-sm font-medium text-emerald-400">
                {t("CreatePMAOrg:ready")}
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <p className="text-sm font-medium text-amber-400">
                {t("CreatePMAOrg:fieldsRequired")}
              </p>
            </div>
          )}

          <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white">
                {t("CreatePMAOrg:tips.title")}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-white/50">
                {t("CreatePMAOrg:tips.hint")}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4">
            {feeSchedule && (
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 text-sm cursor-help">
                      <Zap className="h-4 w-4 text-amber-400" />
                      <span className="font-mono text-amber-400">
                        {feeCalculating
                          ? t("CreatePrediction:fee.calculating")
                          : `${(estimatedFee / 100000).toFixed(5)} BTS`}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="bg-slate-900 border-white/10 text-white max-w-xs"
                  >
                    <p className="text-xs">{t("CreatePrediction:fee.hover")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <Button
              size="lg"
              disabled={!isFormValid}
              onClick={() => setShowDialog(true)}
              className="gap-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold shadow-lg shadow-violet-500/25 hover:brightness-110 active:scale-[0.99] transition-all"
            >
              <Send className="h-4 w-4" />
              {t(isEditMode ? "CreatePMAOrg:buttons.update" : "CreatePMAOrg:buttons.submit")}
            </Button>
          </div>
        </div>
      </div>

      {showDialog ? (
        <DeepLinkDialog
          operationNames={[isEditMode ? "asset_update" : "asset_create"]}
          username={usr.username}
          usrChain={usr.chain}
          userID={usr.id}
          dismissCallback={setShowDialog}
          key={`${isEditMode ? "Updating" : "Creating"}PMAOrg-${usr.id}-${symbol}`}
          headerText={t(isEditMode ? "CreatePMAOrg:dialogContent.updateHeaderText" : "CreatePMAOrg:dialogContent.headerText", { symbol })}
          trxJSON={[trx]}
        />
      ) : null}
    </div>
  );
}
