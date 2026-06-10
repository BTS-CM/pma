import React, {
  useState,
  useEffect,
  useSyncExternalStore,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useStore } from "@nanostores/react";
import { List } from "react-window";
import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";
import {
  Hash,
  Target,
  Image as ImageIcon,
  Settings2,
  ShieldCheck,
  UserCheck,
  Send,
  Sparkles,
  HelpCircle,
  Plus,
  X,
  Info,
  CheckCircle2,
  ImagePlus,
  Link2,
  Calendar,
  Percent,
  Coins,
  Tag,
  FileText,
  AlertCircle,
  Zap,
} from "lucide-react";

import { DateTimePicker, TimePicker } from "@/components/ui/datetime-picker";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import AssetPermission from "@/components/common/AssetPermission.tsx";
import AssetFlag from "@/components/common/AssetFlag.tsx";
import DeepLinkDialog from "@/components/common/DeepLinkDialog.jsx";
import AssetDropDown from "@/components/Market/AssetDropDownCard.jsx";

import AccountSearch from "@/components/AccountSearch.jsx";
import { Avatar } from "./Avatar.tsx";

import { useInitCache } from "@/nanoeffects/Init.ts";
import { createUserBalancesStore } from "@/nanoeffects/UserBalances.ts";

import { $currentUser } from "@/stores/users.ts";
import { $currentNode } from "@/stores/node.ts";
import {
  getPermissions,
  getFlags,
  debounce,
  humanReadableFloat,
} from "@/lib/common.js";

import { blockchainFloat } from "@/bts/common";
import ExternalLink from "./common/ExternalLink.jsx";

const STEP_COLORS = {
  1: { icon: "bg-violet-500/15 text-violet-400 ring-violet-500/30", badge: "bg-violet-500/15 text-violet-400", border: "border-violet-500/20" },
  2: { icon: "bg-cyan-500/15 text-cyan-400 ring-cyan-500/30", badge: "bg-cyan-500/15 text-cyan-400", border: "border-cyan-500/20" },
  3: { icon: "bg-amber-500/15 text-amber-400 ring-amber-500/30", badge: "bg-amber-500/15 text-amber-400", border: "border-amber-500/20" },
  4: { icon: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/30", badge: "bg-emerald-500/15 text-emerald-400", border: "border-emerald-500/20" },
  5: { icon: "bg-rose-500/15 text-rose-400 ring-rose-500/30", badge: "bg-rose-500/15 text-rose-400", border: "border-rose-500/20" },
  6: { icon: "bg-indigo-500/15 text-indigo-400 ring-indigo-500/30", badge: "bg-indigo-500/15 text-indigo-400", border: "border-indigo-500/20" },
};

function SectionHeader({ icon: Icon, title, description, step, optional, recommended, right }) {
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
              {t("CreatePrediction:sectionHeader.step", { number: step })}
              {recommended ? ` · ${t("CreatePrediction:sectionHeader.recommended")}` : ""}
              {optional ? ` · ${t("CreatePrediction:sectionHeader.optional")}` : ""}
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
      {right && (
        <div className="shrink-0 ml-auto">{right}</div>
      )}
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

function SuffixInput({ suffix, ...props }) {
  return (
    <div className="relative">
      <Input {...props} className={(props.className || "") + " pr-10 bg-slate-950/60 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-violet-500/50"} />
      {suffix && (
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-white/40">
          {suffix}
        </span>
      )}
    </div>
  );
}

function ToggleCard({ enabled, onToggle, title, description, enabledTitle, enabledDescription, icon: Icon, accent = "violet" }) {
  const accents = {
    violet: { border: "border-violet-500/30", bg: "bg-violet-500/10", iconBg: "bg-violet-500/20 text-violet-400" },
    cyan: { border: "border-cyan-500/30", bg: "bg-cyan-500/10", iconBg: "bg-cyan-500/20 text-cyan-400" },
    emerald: { border: "border-emerald-500/30", bg: "bg-emerald-500/10", iconBg: "bg-emerald-500/20 text-emerald-400" },
    rose: { border: "border-rose-500/30", bg: "bg-rose-500/10", iconBg: "bg-rose-500/20 text-rose-400" },
  };
  const a = accents[accent] || accents.violet;
  return (
    <div
      className={
        "flex items-center justify-between gap-4 rounded-lg border px-4 py-3 transition-colors " +
        (enabled
          ? a.border + " " + a.bg
          : "border-white/10 bg-white/[0.03] hover:border-white/20")
      }
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <div
            className={
              "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors " +
              (enabled
                ? a.iconBg
                : "bg-white/5 text-white/40")
            }
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div>
          <div className="text-sm font-medium text-white">{enabled ? (enabledTitle || title) : title}</div>
          {description && (
            <div className="mt-0.5 text-xs text-white/50">
              {enabled ? (enabledDescription || description) : description}
            </div>
          )}
        </div>
      </div>
      <Switch checked={enabled} onCheckedChange={onToggle} className="shrink-0 data-[state=checked]:bg-violet-500 data-[state=unchecked]:bg-white/20 [&>span]:bg-white" />
    </div>
  );
}

function AuthorityList({
  title,
  help,
  list,
  onRemove,
  dialogOpen,
  setDialogOpen,
  onChoose,
  chain,
}) {
  const { t } = useTranslation(locale.get(), { i18n: i18nInstance });
  return (
    <Field label={title} help={help}>
      <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]">
        {list.length > 0 ? (
          <div className="max-h-[210px] divide-y divide-white/10 overflow-auto">
            {list.map((res, i) => (
              <div
                key={`auth-${title}-${res.id}`}
                className="flex items-center gap-3 px-3 py-2 hover:bg-white/5"
              >
                <Avatar
                  size={32}
                  name={res.name}
                  extra={title.replaceAll(" ", "")}
                  expression={{ eye: "normal", mouth: "open" }}
                  colors={[
                    "#92A1C6",
                    "#146A7C",
                    "#F0AB3D",
                    "#C271B4",
                    "#C20D90",
                  ]}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-white">
                    {res.name || `#${i + 1}`}
                  </div>
                  <div className="truncate font-mono text-[10px] text-white/50">
                    {res.id}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(res.id)}
                  className="text-white/40 hover:text-rose-400"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-8 text-center">
            <UserCheck className="mx-auto h-6 w-6 text-white/20" />
            <p className="mt-2 text-sm text-white/40">
              No accounts added yet
            </p>
          </div>
        )}
        <div className="border-t border-white/10 p-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white">
                <Plus className="h-3.5 w-3.5" />
                {t("Favourites:addUser")}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-950 backdrop-blur-2xl border-white/10 text-white sm:max-w-[375px]">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {!chain ? t("Transfer:bitsharesAccountSearch") : null}
                  {chain === "bitshares"
                    ? t("Transfer:bitsharesAccountSearchBTS")
                    : null}
                  {chain !== "bitshares"
                    ? t("Transfer:bitsharesAccountSearchTEST")
                    : null}
                </DialogTitle>
              </DialogHeader>
              <AccountSearch
                chain={chain || "bitshares"}
                excludedUsers={[]}
                setChosenAccount={(_account) => {
                  onChoose(_account);
                  setDialogOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Field>
  );
}

function SummaryRow({ icon: Icon, label, value, mono }) {
  return (
    <div className="flex items-start gap-3 py-2">
      {Icon && (
        <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/40" />
      )}
      <div className="min-w-0 flex-1">
        <div className="text-xs uppercase tracking-wider text-white/40">
          {label}
        </div>
        <div
          className={
            "mt-0.5 truncate text-sm text-white " + (mono ? "font-mono" : "")
          }
        >
          {value || <span className="text-white/20">—</span>}
        </div>
      </div>
    </div>
  );
}

export default function Prediction(properties) {
  const { t, i18n } = useTranslation(locale.get(), { i18n: i18nInstance });
  const usr = useSyncExternalStore(
    $currentUser.subscribe,
    $currentUser.get,
    () => true
  );
  const currentNode = useStore($currentNode);

  const { _assetsBTS, _assetsTEST, _marketSearchBTS, _marketSearchTEST, _feeScheduleBTS, _feeScheduleTEST } =
    properties;

  const _chain = useMemo(() => {
    if (usr && usr.chain) {
      return usr.chain;
    }
    return "bitshares";
  }, [usr]);

  const marketSearch = useMemo(() => {
    if (usr && usr.chain && (_marketSearchBTS || _marketSearchTEST)) {
      return usr.chain === "bitshares" ? _marketSearchBTS : _marketSearchTEST;
    }
    return [];
  }, [_marketSearchBTS, _marketSearchTEST, usr]);

  // Fee schedule for asset creation (operation 10)
  const feeSchedule = useMemo(() => {
    const schedule = _chain === "bitshares" ? _feeScheduleBTS : _feeScheduleTEST;
    if (!schedule) return null;
    const op10 = schedule.find((op) => op.id === 10);
    return op10 ? op10.data : null;
  }, [_chain, _feeScheduleBTS, _feeScheduleTEST]);

  useInitCache(_chain ?? "bitshares", []);

  const assets = useMemo(() => {
    if (_chain && (_assetsBTS || _assetsTEST)) {
      return _chain === "bitshares" ? _assetsBTS : _assetsTEST;
    }
    return [];
  }, [_assetsBTS, _assetsTEST, _chain]);

  const [balanceCounter, setBalanceCoutner] = useState(0);
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

  // Asset info
  const [shortName, setShortName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [desc, setDesc] = useState("");
  const [precision, setPrecision] = useState("5");
  const precisionNum = parseInt(precision, 10) || 0;
  const [maxSupply, setMaxSupply] = useState("1000000000");

  // Creation mode: "manual" (default) or "organization"
  const [creationMode, setCreationMode] = useState("manual");
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [subAssetName, setSubAssetName] = useState("");

  // Default to organization mode when user owns PMO assets
  useEffect(() => {
    if (userOrgs.length > 0 && creationMode === "manual") {
      setCreationMode("organization");
    }
  }, [userOrgs]);

  // In org mode, shortName auto-fills from the sub-asset name
  useEffect(() => {
    if (creationMode === "organization" && subAssetName) {
      setShortName(subAssetName);
    } else if (creationMode === "manual") {
      // reset shortName only if it was auto-filled
      // (leave user-typed value untouched)
    }
  }, [creationMode, subAssetName]);

  // Maximum supply is constrained by the asset's precision: total digits
  // (excluding the decimal point) cap at 15. If precision is N, the integer
  // part is capped at (15 - N) digits and the decimal part is capped at N
  // digits. For precision 0, no decimal point is allowed.
  const sanitizeMaxSupply = useCallback(
    (raw) => {
      let cleaned = String(raw).replace(/[^0-9.]/g, "");
      const firstDot = cleaned.indexOf(".");
      if (firstDot !== -1) {
        cleaned =
          cleaned.slice(0, firstDot + 1) +
          cleaned.slice(firstDot + 1).replace(/\./g, "");
      }
      if (precisionNum === 0) {
        return cleaned.replace(/\./g, "").slice(0, 15);
      }
      const [intPart = "", decPart = ""] = cleaned.split(".");
      const intLimited = intPart.slice(0, 15 - precisionNum);
      const decLimited = decPart.slice(0, precisionNum);
      return decPart.length > 0 || cleaned.endsWith(".")
        ? `${intLimited}.${decLimited}`
        : intLimited;
    },
    [precisionNum]
  );

  useEffect(() => {
    setMaxSupply((prev) => sanitizeMaxSupply(prev));
  }, [precisionNum, sanitizeMaxSupply]);

  const sanitizeCommission = useCallback((raw) => {
    let cleaned = String(raw).replace(/[^0-9.]/g, "");
    const firstDot = cleaned.indexOf(".");
    if (firstDot !== -1) {
      cleaned =
        cleaned.slice(0, firstDot + 1) +
        cleaned.slice(firstDot + 1).replace(/\./g, "");
    }
    cleaned = cleaned.replace(/^0+(?=\d)/, "");
    if (firstDot !== -1) {
      const [intPart = "", decPart = ""] = cleaned.split(".");
      cleaned = `${intPart}.${decPart.slice(0, 2)}`;
    }
    const num = parseFloat(cleaned);
    if (!Number.isNaN(num) && num > 100) {
      cleaned = "100";
    }
    return cleaned;
  }, []);

  // Prediction market info
  const [condition, setCondition] = useState("");
  const [date, setDate] = useState();
  const [backingAsset, setBackingAsset] = useState(
    usr.chain === "bitshares" ? "BTS" : "TEST"
  );
  const [commission, setCommission] = useState("0");
  const commissionNum = parseFloat(commission) || 0;

  const backingAssetData = useMemo(() => {
    if (assets && backingAsset) {
      return assets.find((asset) => asset.symbol === backingAsset);
    }
    return null;
  }, [assets, backingAsset]);

  // Filter PMO organizations owned by the current user
  const userOrgs = useMemo(() => {
    if (!assets || !assets.length || !usr || !usr.id) return [];
    return assets.filter((a) => {
      if (a.issuer !== usr.id) return false;
      if (a.symbol && a.symbol.includes(".")) return false;
      if (!a.options || !a.options.description) return false;
      try {
        const d = JSON.parse(a.options.description);
        return d && d.pmo_object;
      } catch {
        return false;
      }
    });
  }, [assets, usr]);

  // Compute the full symbol based on creation mode
  const fullSymbol = useMemo(() => {
    if (creationMode === "organization" && selectedOrg && subAssetName) {
      return `${selectedOrg.symbol}.${subAssetName}`;
    }
    return symbol;
  }, [creationMode, selectedOrg, subAssetName, symbol]);

  // Initializing permissions
  const [permWhiteList, setPermWhiteList] = useState(true);
  const [permTransferRestricted, setPermTransferRestricted] = useState(true);
  const [permDisableConfidential, setPermDisableConfidential] = useState(true);
  const [permWitnessFedAsset, setPermWitnessFedAsset] = useState(true);
  const [permCommitteeFedAsset, setPermCommitteeFedAsset] = useState(true);

  // Initializing flags
  const [flagWhiteList, setFlagWhiteList] = useState(false);
  const [flagTransferRestricted, setFlagTransferRestricted] = useState(false);
  const [flagDisableConfidential, setFlagDisableConfidential] = useState(false);
  const [flagWitnessFedAsset, setFlagWitnessFedAsset] = useState(false);
  const [flagCommitteeFedAsset, setFlagCommitteeFedAsset] = useState(false);

  const [whitelistAuthorities, setWhitelistAuthorities] = useState([]); // whitelist_authorities
  const [blacklistAuthorities, setBlacklistAuthorities] = useState([]); // blacklist_authorities

  // Extensions
  const [enabledReferrerReward, setEnabledReferrerReward] = useState(false); // reward_percent
  const [enabledFeeSharingWhitelist, setEnabledFeeSharingWhitelist] =
    useState(false); // whitelist_market_fee_sharing
  const [enabledTakerFee, setEnabledTakerFee] = useState(false); // taker_fee_percent

  const [referrerReward, setReferrerReward] = useState(0); // reward_percent
  const [feeSharingWhitelist, setFeeSharingWhitelist] = useState([]); // whitelist_market_fee_sharing
  const [takerFee, setTakerFee] = useState(0); // taker_fee_percent

  // NFT info
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

  // Estimate asset creation fee based on symbol length, sub-asset, and data size
  const [estimatedFee, setEstimatedFee] = useState(0);
  const [feeCalculating, setFeeCalculating] = useState(false);

  // Debounced fee calculation
  const debouncedCalculateFee = useCallback(
    debounce(() => {
      if (!feeSchedule || !usr || !usr.id) return;
      setFeeCalculating(true);

      // Symbol length fee
      let symbolFee = 0;
      const symLen = fullSymbol.length;
      if (symLen === 3) {
        symbolFee = parseInt(feeSchedule.symbol3 || "0", 10);
      } else if (symLen === 4) {
        symbolFee = parseInt(feeSchedule.symbol4 || "0", 10);
      } else if (symLen >= 5) {
        symbolFee = parseInt(feeSchedule.long_symbol || "0", 10);
      }

      // Sub-asset (dot in symbol) - additional base fee
      const isSubAsset = fullSymbol.includes(".");
      const subAssetFee = isSubAsset ? parseInt(feeSchedule.symbol3 || "0", 10) : 0;

      // Data size fee (description, condition, NFT data, etc.)
      const dataStr = JSON.stringify({
        main: desc,
        market: backingAsset,
        condition: condition,
        short_name: shortName,
        expiry: date ? date.toISOString() : "",
        ...(enabledNFT && {
          nft_object: {
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
            media_PNG_multihash: nftMedia.find((m) => m.type === "PNG")?.url,
            media_JPEG_multihash: nftMedia.find((m) => m.type === "JPEG")?.url,
            media_WEBP_multihash: nftMedia.find((m) => m.type === "WEBP")?.url,
            media_GIF_multihash: nftMedia.find((m) => m.type === "GIF")?.url,
          },
        }),
      });
      const dataSizeKB = new Blob([dataStr]).size / 1024;
      const pricePerKbyte = parseInt(feeSchedule.price_per_kbyte || "0", 10);
      const dataFee = Math.ceil(dataSizeKB * pricePerKbyte);

      // Core exchange rate data (always included)
      const coreExchangeRateFee = Math.ceil(0.5 * pricePerKbyte); // ~0.5 KB estimate

      const totalFee = symbolFee + subAssetFee + dataFee + coreExchangeRateFee;
      setEstimatedFee(totalFee);
      setFeeCalculating(false);
    }, 1500), // 1.5s debounce
    [
      feeSchedule,
      usr,
      fullSymbol,
      desc,
      backingAsset,
      condition,
      shortName,
      date,
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
    ]
  );

  // Trigger fee recalculation when relevant fields change
  useEffect(() => {
    debouncedCalculateFee();
  }, [debouncedCalculateFee]);

  useEffect(() => {
    if (!permWhiteList) {
      setFlagWhiteList(false);
    }
  }, [permWhiteList]);

  useEffect(() => {
    if (!permTransferRestricted) {
      setFlagTransferRestricted(false);
    }
  }, [permTransferRestricted]);

  useEffect(() => {
    if (!permDisableConfidential) {
      setFlagDisableConfidential(false);
    }
  }, [permDisableConfidential]);

  useEffect(() => {
    if (!permWitnessFedAsset) {
      setFlagWitnessFedAsset(false);
    }
  }, [permWitnessFedAsset]);

  useEffect(() => {
    if (!permCommitteeFedAsset) {
      setFlagCommitteeFedAsset(false);
    }
  }, [permCommitteeFedAsset]);

  useEffect(() => {
    if (flagWitnessFedAsset) {
      setFlagCommitteeFedAsset(false); // if witness fed selected, disable committee fed
    }
  }, [flagWitnessFedAsset]);

  useEffect(() => {
    if (flagCommitteeFedAsset) {
      setFlagWitnessFedAsset(false); // if committee fed selected, disable witness fed
    }
  }, [flagCommitteeFedAsset]);

  const [showDialog, setShowDialog] = useState(false);

  const issuer_permissions = useMemo(() => {
    return getPermissions(
      {
        // user configurable
        white_list: permWhiteList,
        transfer_restricted: permTransferRestricted,
        disable_confidential: permDisableConfidential,
        // static
        charge_market_fee: true,
        override_authority: false,
        disable_force_settle: true,
        global_settle: true,
        // optional
        witness_fed_asset: permWitnessFedAsset,
        committee_fed_asset: permCommitteeFedAsset,
      },
      true
    );
  }, [
    permWhiteList,
    permTransferRestricted,
    permDisableConfidential,
    permWitnessFedAsset,
    permCommitteeFedAsset,
  ]);

  const flags = useMemo(() => {
    return getFlags({
      // user configurable
      white_list: flagWhiteList,
      transfer_restricted: flagTransferRestricted,
      disable_confidential: flagDisableConfidential,
      // static
      charge_market_fee: true,
      override_authority: false,
      disable_force_settle: true,
      global_settle: false,
      // optional
      witness_fed_asset: flagWitnessFedAsset,
      committee_fed_asset: flagCommitteeFedAsset,
    });
  }, [
    flagWhiteList,
    flagTransferRestricted,
    flagDisableConfidential,
    flagWitnessFedAsset,
    flagCommitteeFedAsset,
  ]);

  const description = useMemo(() => {
    let _description = {
      main: desc,
      market: backingAsset,
      condition: condition,
      short_name: shortName,
      expiry: date ? date.toISOString() : "",
    };

    if (enabledNFT) {
      const nft_object = {
        acknowledgements: acknowledgements,
        artist: artist,
        attestation: attestation,
        encoding: "ipfs",
        holder_license: holderLicense,
        license: license,
        narrative: narrative,
        title: title,
        tags: tags,
        type: type,
      };

      nftMedia.forEach((image) => {
        // Supports png, jpeg & gif, following the NFT spec
        const imageType = image.type;
        if (!nft_object[`media_${imageType}_multihash`]) {
          // only the first image is used for the main image
          nft_object[`media_${imageType}_multihash`] = image.url;
        }

        const sameTypeFiles = nftMedia.filter((img) => img.type === imageType);
        if (sameTypeFiles && sameTypeFiles.length > 1) {
          if (!nft_object[`media_${imageType}_multihashes`]) {
            // initialise the ipfs multihashes array
            nft_object[`media_${imageType}_multihashes`] = [
              {
                url: image.url,
              },
            ];
          } else {
            // add the image to the ipfs multihashes array
            nft_object[`media_${imageType}_multihashes`].push({
              url: image.url,
            });
          }
        }
      });

      _description["nft_object"] = nft_object;
    }

    return JSON.stringify(_description);
  }, [
    desc,
    condition,
    backingAsset,
    shortName,
    date,
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
  ]);

  const trx = useMemo(() => {
    let _extensions = {};
    if (enabledReferrerReward) {
      _extensions.reward_percent = referrerReward ? referrerReward * 100 : 0;
    }
    if (enabledFeeSharingWhitelist) {
      _extensions.whitelist_market_fee_sharing = feeSharingWhitelist.map(
        (x) => x.id
      );
    }
    if (enabledTakerFee) {
      _extensions.taker_fee_percent = takerFee ? takerFee * 100 : 0;
    }

    return {
      issuer: usr.id,
      symbol: fullSymbol,
      precision: precisionNum,
      common_options: {
        // user configured
        description,
        max_supply: blockchainFloat(parseFloat(maxSupply) || 0, precisionNum),
        market_fee_percent: commissionNum ? Math.round(commissionNum * 100) : 0,
        max_market_fee: blockchainFloat(parseFloat(maxSupply) || 0, precisionNum),
        issuer_permissions,
        flags,
        // static
        core_exchange_rate: {
          base: {
            amount: blockchainFloat(
              1,
              backingAssetData ? backingAssetData.precision : 5
            ),
            asset_id: backingAssetData ? backingAssetData.id : "1.3.0",
          },
          quote: {
            amount: blockchainFloat(1, precisionNum),
            asset_id: "1.3.1",
          },
        },
        whitelist_authorities:
          flagWhiteList && whitelistAuthorities && whitelistAuthorities.length
            ? whitelistAuthorities.map((x) => x.id)
            : [],
        blacklist_authorities:
          flagWhiteList && blacklistAuthorities && blacklistAuthorities.length
            ? blacklistAuthorities.map((x) => x.id)
            : [],
        whitelist_markets: [],
        blacklist_markets: [],
        extensions: _extensions,
      },
      bitasset_opts: {
        feed_lifetime_sec: 60 * 60 * 24 * 356,
        minimum_feeds: 1,
        force_settlement_delay_sec: 60,
        force_settlement_offset_percent: 0,
        maximum_force_settlement_volume: 10000,
        short_backing_asset: backingAssetData ? backingAssetData.id : "1.3.0",
      },
      is_prediction_market: true, // enables prediction market asset functionality
      extensions: null,
    };
  }, [
    usr,
    fullSymbol,
    precisionNum,
    description,
    maxSupply,
    commissionNum,
    issuer_permissions,
    flags,
    backingAssetData,
    enabledReferrerReward,
    enabledFeeSharingWhitelist,
    enabledTakerFee,
  ]);

  const debouncedPercent = useCallback(
    debounce((input, setCommissionFunction) => {
      let parsedInput = parseFloat(input);
      if (isNaN(parsedInput) || parsedInput <= 0) {
        setCommissionFunction(0);
        return;
      }

      const split = parsedInput.toString().split(".");
      if (split.length > 1) {
        const decimals = split[1].length;
        if (decimals > 2) {
          parsedInput = parseFloat(parsedInput.toFixed(2));
        }
      }

      if (parsedInput > 100) {
        setCommissionFunction(100);
      } else if (parsedInput < 0.01) {
        setCommissionFunction(0.01);
      } else {
        setCommissionFunction(parsedInput);
      }
    }, 500),
    []
  );

  // Form validity — used by the summary card and submit button.
  const isFormValid = useMemo(() => {
    if (creationMode === "organization") {
      if (!selectedOrg || !subAssetName) return false;
    } else {
      if (!symbol) return false;
    }
    if (!condition) return false;
    if (!date) return false;
    return true;
  }, [symbol, condition, date, creationMode, selectedOrg, subAssetName]);

  // Days until resolution — used by the summary card to render a relative
  // hint next to the absolute resolution date.
  const daysUntil = useMemo(() => {
    if (!date) return 0;
    const diff = date.getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [date]);

  const symbolError = useMemo(() => {
    if (creationMode === "organization") {
      if (!subAssetName || subAssetName.length === 0) return null;
      if (subAssetName.length > 16) return "Sub-asset name is too long (max 16 characters)";
      if (!/^[a-zA-Z0-9]+$/.test(subAssetName))
        return "Sub-asset name can only contain letters and digits";
      const full = `${selectedOrg?.symbol || ""}.${subAssetName}`;
      if (full.length > 16) return "Full symbol is too long (max 16 characters)";
      return null;
    }
    if (symbol.length === 0) return null;
    if (symbol.length > 16) return "Symbol is too long (max 16 characters)";
    if (!/^[a-zA-Z0-9]*\.?[a-zA-Z0-9]*$/.test(symbol))
      return "Symbol can only contain letters, digits and a single dot";
    return null;
  }, [symbol, creationMode, subAssetName, selectedOrg]);

  const commissionError = useMemo(() => {
    if (commission === "" || commission === "." || parseFloat(commission) === 0)
      return null;
    const n = parseFloat(commission);
    if (Number.isNaN(n)) return "Commission must be a number";
    if (n < 0) return "Commission cannot be negative";
    if (n > 100) return "Commission cannot exceed 100%";
    return null;
  }, [commission]);

  // Reference for scrolling the summary card into view on submit.
  const summaryRef = useRef(null);

  const [
    whitelistMarketFeeSharingDialogOpen,
    setWhitelistMarketFeeSharingDialogOpen,
  ] = useState(false);
  const [whitelistAuthorityDialogOpen, setWhitelistAuthorityDialogOpen] =
    useState(false);
  const [blacklistAuthorityDialogOpen, setBlacklistAuthorityDialogOpen] =
    useState(false);

  const MediaRow = ({ index, style }) => {
    if (!nftMedia || !nftMedia.length || !nftMedia[index]) {
      return;
    }

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
            onClick={() => {
              setNFTMedia(nftMedia.filter((x) => x.url !== res.url));
            }}
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
                {t("CreatePrediction:card.title")}
              </h1>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-white/50">
                {t("CreatePrediction:card.description")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form sections */}
      <div className="container mx-auto max-w-4xl space-y-6 px-4 py-6">
        {/* Step 1 — Asset identity */}
        <Card className="overflow-hidden border-white/10 bg-slate-950/60 backdrop-blur-xl shadow-lg shadow-black/20">
          <SectionHeader
            step={1}
            icon={Hash}
            title={t("CreatePrediction:steps.asset.title")}
            description={t("CreatePrediction:steps.asset.description")}
            right={
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                  {t("CreatePrediction:creationMode.label")}
                </span>
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setCreationMode("manual");
                      setSelectedOrg(null);
                      setSubAssetName("");
                    }}
                    className={`rounded-md px-3 py-1 text-[11px] font-medium transition-colors ${
                      creationMode === "manual"
                        ? "bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/40"
                        : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    {t("CreatePrediction:creationMode.manual")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCreationMode("organization");
                      setSymbol("");
                    }}
                    disabled={userOrgs.length === 0}
                    title={userOrgs.length === 0 ? t("CreatePrediction:creationMode.noOrgs") : ""}
                    className={`rounded-md px-3 py-1 text-[11px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                      creationMode === "organization"
                        ? "bg-fuchsia-500/20 text-fuchsia-300 ring-1 ring-fuchsia-500/40"
                        : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    {t("CreatePrediction:creationMode.organization")}
                  </button>
                </div>
              </div>
            }
          />
          <CardContent className="space-y-5 pt-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {creationMode === "organization" ? (
                <>
                  <Field
                    label={t("CreatePrediction:fields.org.label")}
                    help={t("CreatePrediction:fields.org.help")}
                    htmlFor="cp-org-select"
                    required
                  >
                    <Select
                      value={selectedOrg?.symbol || ""}
                      onValueChange={(val) => {
                        const org = userOrgs.find((o) => o.symbol === val);
                        setSelectedOrg(org || null);
                      }}
                    >
                      <SelectTrigger
                        id="cp-org-select"
                        className="bg-slate-950/60 border-white/10 text-white"
                      >
                        <SelectValue placeholder="Select an organization...">
                          {selectedOrg?.symbol}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-slate-950 border-white/10 text-white">
                        <SelectGroup>
                          <SelectLabel className="text-white/50 text-xs">
                            {t("CreatePrediction:fields.org.selectLabel")}
                          </SelectLabel>
                          {userOrgs.map((org) => (
                            <SelectItem key={org.symbol} value={org.symbol}>
                              {org.symbol}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field
                    label={t("CreatePrediction:fields.subAssetName.label")}
                    help={t("CreatePrediction:fields.subAssetName.help")}
                    htmlFor="cp-subassetname"
                    required
                    error={symbolError}
                  >
                    <div className="relative">
                      <Input
                        id="cp-subassetname"
                        placeholder={t("CreatePrediction:fields.subAssetName.placeholder")}
                        value={subAssetName}
                        type="text"
                        className="pr-14 font-mono bg-slate-950/60 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-fuchsia-500/50"
                        onInput={(e) => {
                          const value = e.currentTarget.value;
                          const regex = /^[a-zA-Z0-9]*$/;
                          if (regex.test(value)) {
                            setSubAssetName(value);
                          }
                        }}
                        maxLength={16}
                      />
                      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-mono text-xs text-white/40">
                        {subAssetName.length}/16
                      </span>
                    </div>
                  </Field>
                </>
              ) : (
                <>
                  <Field
                    label={t("AssetCommon:asset_details.symbol.header")}
                    help={t("AssetCommon:asset_details.symbol.header_content")}
                    htmlFor="cp-symbol"
                    required
                    error={symbolError}
                  >
                    <div className="relative">
                      <Input
                        id="cp-symbol"
                        placeholder={t(
                          "AssetCommon:asset_details.symbol.placeholder"
                        )}
                        value={symbol}
                        type="text"
                        className="pr-14 font-mono bg-slate-950/60 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-violet-500/50"
                        onInput={(e) => {
                          const value = e.currentTarget.value;
                          const regex = /^[a-zA-Z0-9]*\.?[a-zA-Z0-9]*$/;
                          if (regex.test(value)) {
                            setSymbol(value);
                          }
                        }}
                        maxLength={16}
                      />
                      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-mono text-xs text-white/40">
                        {symbol.length}/16
                      </span>
                    </div>
                  </Field>

                  <Field
                    label={t("AssetCommon:asset_details.shortName.header")}
                    help={t(
                      "AssetCommon:asset_details.shortName.header_content"
                    )}
                    htmlFor="cp-shortname"
                    required
                  >
                    <Input
                      id="cp-shortname"
                      placeholder={t(
                        "AssetCommon:asset_details.shortName.placeholder"
                      )}
                      value={shortName}
                      type="text"
                      className="bg-slate-950/60 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-violet-500/50"
                      onInput={(e) => setShortName(e.currentTarget.value)}
                    />
                  </Field>
                </>
              )}
            </div>

            {creationMode === "organization" && fullSymbol && (
              <div className="rounded-lg border border-fuchsia-500/20 bg-fuchsia-500/5 px-4 py-2.5">
                <span className="text-xs text-white/50">
                  {t("CreatePrediction:fields.fullSymbol.label")}:{" "}
                </span>
                <span className="font-mono text-sm font-medium text-fuchsia-300">
                  {fullSymbol}
                </span>
                <span className="ml-2 text-xs text-white/30">
                  ({fullSymbol.length}/16)
                </span>
              </div>
            )}

            <Field
              label={t("AssetCommon:asset_details.description.header")}
              help={t(
                "AssetCommon:asset_details.description.header_content"
              )}
              htmlFor="cp-desc"
            >
              <Textarea
                id="cp-desc"
                placeholder={t(
                  "AssetCommon:asset_details.description.placeholder"
                )}
                value={desc}
                rows={3}
                className="bg-slate-950/60 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-violet-500/50"
                onInput={(e) => setDesc(e.currentTarget.value)}
              />
            </Field>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field
                label={t("AssetCommon:asset_details.max_supply.header")}
                help={t(
                  "AssetCommon:asset_details.max_supply.header_content"
                )}
                htmlFor="cp-maxsupply"
              >
                <div className="relative">
                  <Input
                    id="cp-maxsupply"
                    placeholder={t(
                      "AssetCommon:asset_details.max_supply.placeholder"
                    )}
                    value={maxSupply}
                    type="text"
                    inputMode="decimal"
                    className="pr-14 font-mono bg-slate-950/60 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-violet-500/50"
                    onInput={(e) => {
                      setMaxSupply(sanitizeMaxSupply(e.currentTarget.value));
                    }}
                  />
                  {parseFloat(maxSupply) > 0 && (
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-mono text-xs text-white/40">
                      {parseFloat(maxSupply).toLocaleString()}
                    </span>
                  )}
                </div>
              </Field>
              <Field
                label={t("AssetCommon:asset_details.precision.header")}
                help={t("AssetCommon:asset_details.precision.header_content")}
                htmlFor="cp-precision"
              >
                  <Input
                    id="cp-precision"
                    placeholder={t(
                      "AssetCommon:asset_details.precision.placeholder"
                    )}
                    value={precision}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="font-mono bg-slate-950/60 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-violet-500/50"
                  onInput={(e) => {
                    const cleaned = e.currentTarget.value
                      .replace(/\D/g, "")
                      .slice(0, 1);
                    if (cleaned === "") {
                      setPrecision("");
                    } else {
                      const num = parseInt(cleaned, 10);
                      setPrecision(num > 8 ? "8" : cleaned);
                    }
                  }}
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        {/* Step 2 — Prediction market details */}
        <Card className="overflow-hidden border-white/10 bg-slate-950/60 backdrop-blur-xl shadow-lg shadow-black/20">
          <SectionHeader
            step={2}
            icon={Target}
            title={t("CreatePrediction:steps.pma.title")}
            description={t("CreatePrediction:steps.pma.description")}
          />
          <CardContent className="space-y-5 pt-6">
            <Field
              label={t("CreatePrediction:pma.condition.header")}
              help={t("CreatePrediction:pma.condition.header_content")}
              htmlFor="cp-condition"
              required
            >
              <Textarea
                id="cp-condition"
                placeholder={t(
                  "CreatePrediction:pma.condition.placeholder"
                )}
                value={condition}
                rows={3}
                className="bg-slate-950/60 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-violet-500/50"
                onInput={(e) => setCondition(e.currentTarget.value)}
              />
            </Field>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
              <Field
                label={t("CreatePrediction:pma.commission.header")}
                help={t("CreatePrediction:pma.commission.header_content")}
                htmlFor="cp-commission"
                error={commissionError}
                className="md:col-span-1"
              >
                <SuffixInput
                  id="cp-commission"
                  suffix="%"
                  placeholder={t(
                    "CreatePrediction:pma.commission.placeholder"
                  )}
                  value={commission}
                  type="text"
                  inputMode="decimal"
                  onInput={(e) => {
                    setCommission(sanitizeCommission(e.currentTarget.value));
                  }}
                />
              </Field>

              <Field
                label={t("CreatePrediction:pma.backing_asset.header")}
                help={t("CreatePrediction:pma.backing_asset.header_content")}
                htmlFor="cp-backing"
                className="md:col-span-3"
              >
                <div className="flex gap-2">
                  <Input
                    id="cp-backing"
                    disabled
                    value={
                      backingAssetData
                        ? `${backingAssetData.symbol} (${backingAssetData.id})`
                        : backingAsset
                    }
                    type="text"
                    className="flex-1 font-mono bg-slate-950/60 border-white/10 text-white disabled:opacity-100 placeholder:text-white/30"
                  />
                  <AssetDropDown
                    assetSymbol={backingAsset ?? ""}
                    assetData={null}
                    storeCallback={setBackingAsset}
                    otherAsset={null}
                    marketSearch={marketSearch}
                    type={"backing"}
                    chain={usr && usr.chain ? usr.chain : "bitshares"}
                    balances={balances}
                    triggerClassName="!w-auto shrink-0"
                  />
                </div>
              </Field>
            </div>

            <Field
              label={t("CreatePrediction:pma.resolution.header")}
              help={t("CreatePrediction:pma.resolution.header_content")}
              required
            >
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 [&_button]:bg-slate-950/60 [&_button]:border-white/10 [&_button]:text-white [&_button]:hover:bg-white/10 [&_[role=gridcell]]:text-white [&_[data-selected]]:bg-violet-500 [&_[data-selected]]:text-white [&_.rdp-day]:text-white [&_.rdp-caption_label]:text-white [&_.rdp-button_previous]:text-white/60 [&_.rdp-button_next]:text-white/60 [&_input]:bg-slate-950/60 [&_input]:border-white/10 [&_input]:text-white [&_input]:focus:bg-violet-500/20 [&_input]:focus:text-white [&_.border-t]:border-white/10">
                <DateTimePicker
                  granularity="day"
                  value={date}
                  onChange={(newDate) => {
                    const now = new Date();
                    if (newDate >= now) {
                      setDate(newDate);
                    } else {
                      now.setDate(now.getDate() + 7); // default a week ahead
                      setDate(now);
                    }
                  }}
                />
                <TimePicker date={date} onChange={setDate} />
              </div>
            </Field>
          </CardContent>
        </Card>

        {/* Step 3 — Non-fungible token (optional) */}
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
                  {t("CreatePrediction:sectionHeader.step", { number: 3 })} · {t("CreatePrediction:sectionHeader.optional")}
                </span>
              </div>
              <h3 className="mt-0.5 text-base font-semibold leading-tight text-white">
                {t("CreatePrediction:steps.nft.title")}
              </h3>
              <p className="mt-0.5 text-sm text-white/50">
                {t("CreatePrediction:steps.nft.description")}
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
                      <ImagePlus className="h-4 w-4 text-white/40" />
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
                                placeholder={t(
                                  "AssetCommon:nft.mediaURLPlaceholder"
                                )}
                                type="text"
                                className="bg-slate-950/60 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-violet-500/50"
                                onInput={(e) =>
                                  setNewMediaUrl(e.currentTarget.value)
                                }
                                onKeyDown={(e) => {
                                  if (
                                    e.key === "Enter" &&
                                    newMediaUrl &&
                                    newMediaType
                                  ) {
                                    const temp_urls = nftMedia.map(
                                      (x) => x.url
                                    );
                                    if (temp_urls.includes(newMediaUrl)) {
                                      setNewMediaUrl("");
                                      return;
                                    }
                                    setNFTMedia(
                                      nftMedia && nftMedia.length
                                        ? [
                                            ...nftMedia,
                                            {
                                              url: newMediaUrl,
                                              type: newMediaType,
                                            },
                                          ]
                                        : [
                                            {
                                              url: newMediaUrl,
                                              type: newMediaType,
                                            },
                                          ]
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
                                    placeholder={t(
                                      "AssetCommon:nft.fileTypePlaceholder"
                                    )}
                                  />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-950 border-white/10 text-white">
                                  <SelectGroup>
                                    <SelectLabel>
                                      {t("AssetCommon:nft.imageFormats")}
                                    </SelectLabel>
                                    <SelectItem value="PNG">PNG</SelectItem>
                                    <SelectItem value="WEBP">WEBP</SelectItem>
                                    <SelectItem value="JPEG">JPEG</SelectItem>
                                    <SelectItem value="GIF">GIF</SelectItem>
                                    <SelectItem value="TIFF">TIFF</SelectItem>
                                    <SelectItem value="BMP">BMP</SelectItem>
                                    <SelectLabel>
                                      {t("AssetCommon:nft.audioFormats")}
                                    </SelectLabel>
                                    <SelectItem value="MP3">MP3</SelectItem>
                                    <SelectItem value="MP4">MP4</SelectItem>
                                    <SelectItem value="M4A">M4A</SelectItem>
                                    <SelectItem value="OGG">OGG</SelectItem>
                                    <SelectItem value="FLAC">FLAC</SelectItem>
                                    <SelectItem value="WAV">WAV</SelectItem>
                                    <SelectItem value="WMA">WMA</SelectItem>
                                    <SelectItem value="AAC">AAC</SelectItem>
                                    <SelectLabel>
                                      {t("AssetCommon:nft.videoFormats")}
                                    </SelectLabel>
                                    <SelectItem value="WEBM">WEBM</SelectItem>
                                    <SelectItem value="MOV">MOV</SelectItem>
                                    <SelectItem value="QT">QT</SelectItem>
                                    <SelectItem value="AVI">AVI</SelectItem>
                                    <SelectItem value="WMV">WMV</SelectItem>
                                    <SelectItem value="MPEG">MPEG</SelectItem>
                                    <SelectLabel>
                                      {t("AssetCommon:nft.documentFormats")}
                                    </SelectLabel>
                                    <SelectItem value="PDF">PDF</SelectItem>
                                    <SelectItem value="DOCX">DOCX</SelectItem>
                                    <SelectItem value="ODT">ODT</SelectItem>
                                    <SelectItem value="XLSX">XLSX</SelectItem>
                                    <SelectItem value="ODS">ODS</SelectItem>
                                    <SelectItem value="PPTX">PPTX</SelectItem>
                                    <SelectItem value="TXT">TXT</SelectItem>
                                    <SelectLabel>
                                      {t("AssetCommon:nft.threeDFormats")}
                                    </SelectLabel>
                                    <SelectItem value="OBJ">OBJ</SelectItem>
                                    <SelectItem value="FBX">FBX</SelectItem>
                                    <SelectItem value="GLTF">GLTF</SelectItem>
                                    <SelectItem value="3DS">3DS</SelectItem>
                                    <SelectItem value="STL">STL</SelectItem>
                                    <SelectItem value="COLLADA">
                                      COLLADA
                                    </SelectItem>
                                    <SelectItem value="3MF">3MF</SelectItem>
                                    <SelectItem value="BLEND">BLEND</SelectItem>
                                    <SelectItem value="SKP">SKP</SelectItem>
                                    <SelectItem value="VOX">VOX</SelectItem>
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="col-span-4 flex flex-wrap gap-2">
                              {newMediaType &&
                              newMediaType.length &&
                              newMediaUrl &&
                              newMediaUrl.length ? (
                                <Button
                                  className="bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:brightness-110"
                                  onClick={() => {
                                    const temp_urls = nftMedia.map(
                                      (x) => x.url
                                    );
                                    if (temp_urls.includes(newMediaUrl)) {
                                      setNewMediaUrl("");
                                      return;
                                    }
                                    setNFTMedia([
                                      ...nftMedia,
                                      {
                                        url: newMediaUrl,
                                        type: newMediaType,
                                      },
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
                                      {t(
                                        "AssetCommon:nft.ipfsHostingDescription"
                                      )}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                    <ExternalLink
                                      classnamecontents="hover:text-violet-400 text-white/60"
                                      type="button"
                                      text={"Pinata.cloud"}
                                      hyperlink={"https://www.pinata.cloud/"}
                                    />
                                    <ExternalLink
                                      classnamecontents="hover:text-violet-400 text-white/60"
                                      type="button"
                                      text={"NFT.storage"}
                                      hyperlink={"https://nft.storage/"}
                                    />
                                    <ExternalLink
                                      classnamecontents="hover:text-violet-400 text-white/60"
                                      type="button"
                                      text={"Web3.storage"}
                                      hyperlink={"https://web3.storage/"}
                                    />
                                    <ExternalLink
                                      classnamecontents="hover:text-violet-400 text-white/60"
                                      type="button"
                                      text={"Fleek.co"}
                                      hyperlink={
                                        "https://fleek.co/ipfs-gateway/"
                                      }
                                    />
                                    <ExternalLink
                                      classnamecontents="hover:text-violet-400 text-white/60"
                                      type="button"
                                      text={"Infura.io"}
                                      hyperlink={"https://infura.io/product/ipfs"}
                                    />
                                    <ExternalLink
                                      classnamecontents="hover:text-violet-400 text-white/60"
                                      type="button"
                                      text={"StorJ"}
                                      hyperlink={
                                        "https://landing.storj.io/permanently-pin-with-storj-dcs"
                                      }
                                    />
                                    <ExternalLink
                                      classnamecontents="hover:text-violet-400 text-white/60"
                                      type="button"
                                      text={"Eternum.io"}
                                      hyperlink={"https://www.eternum.io/"}
                                    />
                                    <ExternalLink
                                      classnamecontents="hover:text-violet-400 text-white/60"
                                      type="button"
                                      text={"IPFS Docs"}
                                      hyperlink={
                                        "https://blog.ipfs.io/2021-04-05-storing-nfts-on-ipfs/"
                                      }
                                    />
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
                <Field
                  label={t("AssetCommon:nft.NFTTitleHeader")}
                  help={t("AssetCommon:nft.NFTTitleContent")}
                  htmlFor="cp-nft-title"
                >
                  <Input
                    id="cp-nft-title"
                    placeholder={t("AssetCommon:nft.TitlePlaceholder")}
                    value={title}
                    className="bg-slate-950/60 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-violet-500/50"
                    onInput={(e) => setTitle(e.currentTarget.value)}
                  />
                </Field>
                <Field
                  label={t("AssetCommon:nft.NFTArtistHeader")}
                  help={t("AssetCommon:nft.NFTArtistContent")}
                  htmlFor="cp-nft-artist"
                >
                  <Input
                    id="cp-nft-artist"
                    placeholder={t("AssetCommon:nft.ArtistPlaceholder")}
                    value={artist}
                    className="bg-slate-950/60 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-violet-500/50"
                    onInput={(e) => setArtist(e.currentTarget.value)}
                  />
                </Field>
                <Field
                  label={t("AssetCommon:nft.NFTNarrativeHeader")}
                  help={t("AssetCommon:nft.NFTNarrativeContent")}
                  htmlFor="cp-nft-narrative"
                >
                  <Input
                    id="cp-nft-narrative"
                    placeholder={t("AssetCommon:nft.NarrativePlaceholder")}
                    value={narrative}
                    className="bg-slate-950/60 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-violet-500/50"
                    onInput={(e) => setNarrative(e.currentTarget.value)}
                  />
                </Field>
                <Field
                  label={t("AssetCommon:nft.NFTTagsHeader")}
                  help={t("AssetCommon:nft.NFTTagsContent")}
                  htmlFor="cp-nft-tags"
                >
                  <Input
                    id="cp-nft-tags"
                    placeholder={t("AssetCommon:nft.TagsPlaceholder")}
                    value={tags}
                    className="bg-slate-950/60 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-violet-500/50"
                    onInput={(e) => setTags(e.currentTarget.value)}
                  />
                </Field>
                <Field
                  label={t("AssetCommon:nft.NFTTypeHeader")}
                  help={t("AssetCommon:nft.NFTTypeContent")}
                  htmlFor="cp-nft-type"
                >
                  <Input
                    id="cp-nft-type"
                    placeholder={t("AssetCommon:nft.TypePlaceholder")}
                    value={type}
                    className="bg-slate-950/60 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-violet-500/50"
                    onInput={(e) => setType(e.currentTarget.value)}
                  />
                </Field>
                <Field
                  label={t("AssetCommon:nft.NFTAttestationHeader")}
                  help={t("AssetCommon:nft.NFTAttestationContent")}
                  htmlFor="cp-nft-attestation"
                >
                  <Input
                    id="cp-nft-attestation"
                    placeholder={t("AssetCommon:nft.AttestationPlaceholder")}
                    value={attestation}
                    className="bg-slate-950/60 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-violet-500/50"
                    onInput={(e) => setAttestation(e.currentTarget.value)}
                  />
                </Field>
                <Field
                  label={t("AssetCommon:nft.NFTAcknowledgementsHeader")}
                  help={t("AssetCommon:nft.NFTAcknowledgementsContent")}
                  htmlFor="cp-nft-ack"
                >
                  <Input
                    id="cp-nft-ack"
                    placeholder={t(
                      "AssetCommon:nft.AcknowledgementsPlaceholder"
                    )}
                    value={acknowledgements}
                    className="bg-slate-950/60 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-violet-500/50"
                    onInput={(e) =>
                      setAcknowledgements(e.currentTarget.value)
                    }
                  />
                </Field>
                <Field
                  label={t("AssetCommon:nft.NFTHolderLicenseHeader")}
                  help={t("AssetCommon:nft.NFTHolderLicenseContent")}
                  htmlFor="cp-nft-holderlic"
                >
                  <Input
                    id="cp-nft-holderlic"
                    placeholder={t(
                      "AssetCommon:nft.HolderLicensePlaceholder"
                    )}
                    value={holderLicense}
                    className="bg-slate-950/60 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-violet-500/50"
                    onInput={(e) => setHolderLicense(e.currentTarget.value)}
                  />
                </Field>
                <Field
                  label={t("AssetCommon:nft.NFTLicenseHeader")}
                  help={t("AssetCommon:nft.NFTLicenseContent")}
                  htmlFor="cp-nft-license"
                >
                  <Input
                    id="cp-nft-license"
                    placeholder={t("AssetCommon:nft.LicensePlaceholder")}
                    value={license}
                    className="bg-slate-950/60 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-violet-500/50"
                    onInput={(e) => setLicense(e.currentTarget.value)}
                  />
                </Field>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Step 4 — Market fee extensions */}
        <Card className="overflow-hidden border-white/10 bg-slate-950/60 backdrop-blur-xl shadow-lg shadow-black/20">
          <SectionHeader
            step={4}
            icon={Settings2}
            title={t("CreatePrediction:steps.extensions.title")}
            description={t("CreatePrediction:steps.extensions.description")}
          />
          <CardContent className="space-y-4 pt-6">
            <ToggleCard
              icon={Settings2}
              enabled={enabledReferrerReward}
              onToggle={() => setEnabledReferrerReward(!enabledReferrerReward)}
              title={t("AssetCommon:extensions.reward_percent.disabled")}
              description={t(
                "AssetCommon:extensions.reward_percent.disabledInfo"
              )}
              enabledTitle={t("AssetCommon:extensions.reward_percent.enabled")}
              enabledDescription={t(
                "AssetCommon:extensions.reward_percent.enabledInfo"
              )}
            />
            {enabledReferrerReward && (
              <div className="ml-4 border-l-2 border-emerald-500/30 pl-4">
                <Field
                  label={t(
                    "AssetCommon:extensions.reward_percent.header"
                  )}
                  help={t(
                    "AssetCommon:extensions.reward_percent.header_content"
                  )}
                  htmlFor="cp-reward-percent"
                >
                  <div className="max-w-[120px]">
                    <SuffixInput
                      id="cp-reward-percent"
                      suffix="%"
                      placeholder="0"
                      value={referrerReward}
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      onInput={(e) => {
                        setReferrerReward(e.currentTarget.value);
                        debouncedPercent(
                          e.currentTarget.value,
                          setReferrerReward
                        );
                      }}
                    />
                  </div>
                </Field>
              </div>
            )}

            <ToggleCard
              icon={UserCheck}
              enabled={enabledFeeSharingWhitelist}
              onToggle={() =>
                setEnabledFeeSharingWhitelist(!enabledFeeSharingWhitelist)
              }
              title={t(
                "AssetCommon:extensions.whitelist_market_fee_sharing.disabled"
              )}
              description={t(
                "AssetCommon:extensions.whitelist_market_fee_sharing.disabledInfo"
              )}
              enabledTitle={t(
                "AssetCommon:extensions.whitelist_market_fee_sharing.enabled"
              )}
              enabledDescription={t(
                "AssetCommon:extensions.whitelist_market_fee_sharing.enabledInfo"
              )}
            />
            {enabledFeeSharingWhitelist && (
              <div className="ml-4 space-y-3 border-l-2 border-emerald-500/30 pl-4">
                <p className="text-xs text-white/40">
                  {t(
                    "AssetCommon:extensions.whitelist_market_fee_sharing.header_content"
                  )}
                </p>
                <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]">
                  {feeSharingWhitelist.length > 0 && (
                    <div className="max-h-[210px] divide-y divide-white/10 overflow-auto">
                      {feeSharingWhitelist.map((res, i) => (
                        <div
                          key={`fsw-${res.id}`}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-white/5"
                        >
                          <Avatar
                            size={32}
                            name={res.name}
                            extra="Whitelisted"
                            expression={{ eye: "normal", mouth: "open" }}
                            colors={[
                              "#92A1C6",
                              "#146A7C",
                              "#F0AB3D",
                              "#C271B4",
                              "#C20D90",
                            ]}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-white">
                              {res.name}
                            </div>
                            <div className="truncate font-mono text-[10px] text-white/50">
                              {res.id}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setFeeSharingWhitelist(
                                feeSharingWhitelist.filter(
                                  (x) => x.id !== res.id
                                )
                              );
                            }}
                            className="text-white/40 hover:text-rose-400"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="border-t border-white/10 p-2">
                    <Dialog
                      open={whitelistMarketFeeSharingDialogOpen}
                      onOpenChange={setWhitelistMarketFeeSharingDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white">
                          <Plus className="h-3.5 w-3.5" />
                          {t("Favourites:addUser")}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-950 backdrop-blur-2xl border-white/10 text-white sm:max-w-[375px]">
                        <DialogHeader>
                          <DialogTitle className="text-white">
                            {!usr || !usr.chain
                              ? t("Transfer:bitsharesAccountSearch")
                              : null}
                            {usr && usr.chain === "bitshares"
                              ? t("Transfer:bitsharesAccountSearchBTS")
                              : null}
                            {usr && usr.chain !== "bitshares"
                              ? t("Transfer:bitsharesAccountSearchTEST")
                              : null}
                          </DialogTitle>
                        </DialogHeader>
                        <AccountSearch
                          chain={
                            usr && usr.chain ? usr.chain : "bitshares"
                          }
                          excludedUsers={[]}
                          setChosenAccount={(_account) => {
                            if (
                              _account &&
                              !feeSharingWhitelist.find(
                                (_usr) => _usr.id === _account.id
                              )
                            ) {
                              setFeeSharingWhitelist(
                                feeSharingWhitelist && feeSharingWhitelist.length
                                  ? [...feeSharingWhitelist, _account]
                                  : [_account]
                              );
                            }
                            setWhitelistMarketFeeSharingDialogOpen(false);
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            )}

            <ToggleCard
              icon={Settings2}
              enabled={enabledTakerFee}
              onToggle={() => setEnabledTakerFee(!enabledTakerFee)}
              title={t("AssetCommon:extensions.taker_fee_percent.disabled")}
              description={t(
                "AssetCommon:extensions.taker_fee_percent.disabledInfo"
              )}
              enabledTitle={t("AssetCommon:extensions.taker_fee_percent.enabled")}
              enabledDescription={t(
                "AssetCommon:extensions.taker_fee_percent.enabledInfo"
              )}
            />
            {enabledTakerFee && (
              <div className="ml-4 border-l-2 border-emerald-500/30 pl-4">
                <Field
                  label={t("AssetCommon:extensions.taker_fee_percent.header")}
                  help={t(
                    "AssetCommon:extensions.taker_fee_percent.header_content"
                  )}
                  htmlFor="cp-taker-fee"
                >
                  <div className="max-w-[120px]">
                    <SuffixInput
                      id="cp-taker-fee"
                      suffix="%"
                      placeholder={t(
                        "AssetCommon:extensions.taker_fee_percent.placeholder"
                      )}
                      value={takerFee}
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      onInput={(e) => {
                        setTakerFee(e.currentTarget.value);
                        debouncedPercent(e.currentTarget.value, setTakerFee);
                      }}
                    />
                  </div>
                </Field>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 5 — Permissions and flags */}
        <Card className="overflow-hidden border-white/10 bg-slate-950/60 backdrop-blur-xl shadow-lg shadow-black/20">
          <SectionHeader
            step={5}
            icon={ShieldCheck}
            title={t("CreatePrediction:steps.permissions.title")}
            description={t("CreatePrediction:steps.permissions.description")}
          />
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">
                  {t("AssetCommon:permissions.header")}
                </h4>
                <div className="rounded-lg border border-white/10 bg-white/[0.03] [&_button[role=checkbox]]:border-white/30 [&_button[role=checkbox]]:bg-white/5 [&_button[role=checkbox][data-state=checked]]:bg-violet-500 [&_button[role=checkbox][data-state=checked]]:border-violet-500 [&_button[role=checkbox][data-state=checked]]:text-white">
                  <AssetPermission
                    alreadyDisabled={false}
                    id={"white_list"}
                    allowedText={t(
                      "AssetCommon:permissions.white_list.about"
                    )}
                    enabledInfo={t(
                      "AssetCommon:permissions.white_list.enabledInfo"
                    )}
                    disabledText={t(
                      "AssetCommon:permissions.white_list.about"
                    )}
                    disabledInfo={t(
                      "AssetCommon:permissions.white_list.disabledInfo"
                    )}
                    permission={permWhiteList}
                    setPermission={setPermWhiteList}
                    flag={flagWhiteList}
                    setFlag={setFlagWhiteList}
                  />
                  <AssetPermission
                    alreadyDisabled={false}
                    id={"transfer_restricted"}
                    allowedText={t(
                      "AssetCommon:permissions.transfer_restricted.about"
                    )}
                    enabledInfo={t(
                      "AssetCommon:permissions.transfer_restricted.enabledInfo"
                    )}
                    disabledText={t(
                      "AssetCommon:permissions.transfer_restricted.about"
                    )}
                    disabledInfo={t(
                      "AssetCommon:permissions.transfer_restricted.disabledInfo"
                    )}
                    permission={permTransferRestricted}
                    setPermission={setPermTransferRestricted}
                    flag={flagTransferRestricted}
                    setFlag={setFlagTransferRestricted}
                  />
                  <AssetPermission
                    alreadyDisabled={false}
                    id={"disable_confidential"}
                    allowedText={t(
                      "AssetCommon:permissions.disable_confidential.about"
                    )}
                    enabledInfo={t(
                      "AssetCommon:permissions.disable_confidential.enabledInfo"
                    )}
                    disabledText={t(
                      "AssetCommon:permissions.disable_confidential.about"
                    )}
                    disabledInfo={t(
                      "AssetCommon:permissions.disable_confidential.disabledInfo"
                    )}
                    permission={permDisableConfidential}
                    setPermission={setPermDisableConfidential}
                    flag={flagDisableConfidential}
                    setFlag={setFlagDisableConfidential}
                  />
                  <AssetPermission
                    alreadyDisabled={false}
                    id={"witness_fed_asset"}
                    allowedText={t(
                      "AssetCommon:permissions.witness_fed_asset.about"
                    )}
                    enabledInfo={t(
                      "AssetCommon:permissions.witness_fed_asset.enabledInfo"
                    )}
                    disabledText={t(
                      "AssetCommon:permissions.witness_fed_asset.about"
                    )}
                    disabledInfo={t(
                      "AssetCommon:permissions.witness_fed_asset.disabledInfo"
                    )}
                    permission={permWitnessFedAsset}
                    setPermission={setPermWitnessFedAsset}
                    flag={flagWitnessFedAsset}
                    setFlag={setFlagWitnessFedAsset}
                  />
                  <AssetPermission
                    alreadyDisabled={false}
                    id={"committee_fed_asset"}
                    allowedText={t(
                      "AssetCommon:permissions.committee_fed_asset.about"
                    )}
                    enabledInfo={t(
                      "AssetCommon:permissions.committee_fed_asset.enabledInfo"
                    )}
                    disabledText={t(
                      "AssetCommon:permissions.committee_fed_asset.about"
                    )}
                    disabledInfo={t(
                      "AssetCommon:permissions.committee_fed_asset.disabledInfo"
                    )}
                    permission={permCommitteeFedAsset}
                    setPermission={setPermCommitteeFedAsset}
                    flag={flagCommitteeFedAsset}
                    setFlag={setFlagCommitteeFedAsset}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">
                  {t("AssetCommon:flags.header")}
                </h4>
                <div className="rounded-lg border border-white/10 bg-white/[0.03] [&_button[role=checkbox]]:border-white/30 [&_button[role=checkbox]]:bg-white/5 [&_button[role=checkbox][data-state=checked]]:bg-violet-500 [&_button[role=checkbox][data-state=checked]]:border-violet-500 [&_button[role=checkbox][data-state=checked]]:text-white">
                  <AssetFlag
                    alreadyDisabled={false}
                    id={"white_list_flag"}
                    allowedText={t("AssetCommon:flags.white_list.about")}
                    enabledInfo={t(
                      "AssetCommon:flags.white_list.enabledInfo"
                    )}
                    disabledText={t("AssetCommon:flags.white_list.about")}
                    disabledInfo={t(
                      "AssetCommon:flags.white_list.disabledInfo"
                    )}
                    permission={permWhiteList}
                    flag={flagWhiteList}
                    setFlag={setFlagWhiteList}
                  />
                  <AssetFlag
                    alreadyDisabled={false}
                    id={"transfer_restricted_flag"}
                    allowedText={t(
                      "AssetCommon:flags.transfer_restricted.about"
                    )}
                    enabledInfo={t(
                      "AssetCommon:flags.transfer_restricted.enabledInfo"
                    )}
                    disabledText={t(
                      "AssetCommon:flags.transfer_restricted.about"
                    )}
                    disabledInfo={t(
                      "AssetCommon:flags.transfer_restricted.disabledInfo"
                    )}
                    permission={permTransferRestricted}
                    flag={flagTransferRestricted}
                    setFlag={setFlagTransferRestricted}
                  />
                  <AssetFlag
                    alreadyDisabled={false}
                    id={"disable_confidential_flag"}
                    allowedText={t(
                      "AssetCommon:flags.disable_confidential.about"
                    )}
                    enabledInfo={t(
                      "AssetCommon:flags.disable_confidential.enabledInfo"
                    )}
                    disabledText={t(
                      "AssetCommon:flags.disable_confidential.about"
                    )}
                    disabledInfo={t(
                      "AssetCommon:flags.disable_confidential.disabledInfo"
                    )}
                    permission={permDisableConfidential}
                    flag={flagDisableConfidential}
                    setFlag={setFlagDisableConfidential}
                  />
                  <AssetFlag
                    alreadyDisabled={false}
                    id={"witness_fed_asset_flag"}
                    allowedText={t(
                      "AssetCommon:flags.witness_fed_asset.about"
                    )}
                    enabledInfo={t(
                      "AssetCommon:flags.witness_fed_asset.enabledInfo"
                    )}
                    disabledText={t(
                      "AssetCommon:flags.witness_fed_asset.about"
                    )}
                    disabledInfo={t(
                      "AssetCommon:flags.witness_fed_asset.disabledInfo"
                    )}
                    permission={permWitnessFedAsset}
                    flag={flagWitnessFedAsset}
                    setFlag={setFlagWitnessFedAsset}
                  />
                  <AssetFlag
                    alreadyDisabled={false}
                    id={"committee_fed_asset_flag"}
                    allowedText={t(
                      "AssetCommon:flags.committee_fed_asset.about"
                    )}
                    enabledInfo={t(
                      "AssetCommon:flags.committee_fed_asset.enabledInfo"
                    )}
                    disabledText={t(
                      "AssetCommon:flags.committee_fed_asset.about"
                    )}
                    disabledInfo={t(
                      "AssetCommon:flags.committee_fed_asset.disabledInfo"
                    )}
                    permission={permCommitteeFedAsset}
                    flag={flagCommitteeFedAsset}
                    setFlag={setFlagCommitteeFedAsset}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 6 — Authorization (only visible when white_list is on) */}
        {flagWhiteList && (
          <Card className="overflow-hidden border-white/10 bg-slate-950/60 backdrop-blur-xl shadow-lg shadow-black/20">
            <SectionHeader
              step={6}
              icon={UserCheck}
              title={t("CreatePrediction:steps.authorization.title")}
              description={t(
                "CreatePrediction:steps.authorization.description"
              )}
            />
            <CardContent className="space-y-6 pt-6">
              <AuthorityList
                title={t("AssetCommon:whitelist.header")}
                help={t("AssetCommon:whitelist.header_content")}
                list={whitelistAuthorities}
                onRemove={(id) =>
                  setWhitelistAuthorities(
                    whitelistAuthorities.filter((x) => x.id !== id)
                  )
                }
                dialogOpen={whitelistAuthorityDialogOpen}
                setDialogOpen={setWhitelistAuthorityDialogOpen}
                onChoose={(_account) => {
                  if (
                    _account &&
                    !whitelistAuthorities.find(
                      (_usr) => _usr.id === _account.id
                    )
                  ) {
                    setWhitelistAuthorities(
                      whitelistAuthorities && whitelistAuthorities.length
                        ? [...whitelistAuthorities, _account]
                        : [_account]
                    );
                  }
                }}
                chain={usr && usr.chain ? usr.chain : "bitshares"}
              />
              <AuthorityList
                title={t("AssetCommon:blacklist.header")}
                help={t("AssetCommon:blacklist.header_content")}
                list={blacklistAuthorities}
                onRemove={(id) =>
                  setBlacklistAuthorities(
                    blacklistAuthorities.filter((x) => x.id !== id)
                  )
                }
                dialogOpen={blacklistAuthorityDialogOpen}
                setDialogOpen={setBlacklistAuthorityDialogOpen}
                onChoose={(_account) => {
                  if (
                    _account &&
                    !blacklistAuthorities.find(
                      (_usr) => _usr.id === _account.id
                    )
                  ) {
                    setBlacklistAuthorities(
                      blacklistAuthorities && blacklistAuthorities.length
                        ? [...blacklistAuthorities, _account]
                        : [_account]
                    );
                  }
                }}
                chain={usr && usr.chain ? usr.chain : "bitshares"}
              />
            </CardContent>
          </Card>
        )}

        {/* Review and submit */}
        <Card
          ref={summaryRef}
          className="overflow-hidden border-white/10 bg-slate-950/60 backdrop-blur-xl shadow-lg shadow-black/20"
        >
          <SectionHeader
            icon={Sparkles}
            title={t("CreatePrediction:summary.title")}
            description={t("CreatePrediction:summary.subtitle")}
          />
          <CardContent className="space-y-5 pt-6">
            <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]">
              <div className="divide-y divide-white/10 px-4">
                <SummaryRow
                  icon={Hash}
                  label={t("CreatePrediction:summary.symbol")}
                  value={fullSymbol}
                  mono
                />
                <SummaryRow
                  icon={Tag}
                  label={t("CreatePrediction:summary.name")}
                  value={shortName}
                />
                <SummaryRow
                  icon={FileText}
                  label={t("CreatePrediction:summary.condition")}
                  value={
                    condition ||
                    t("CreatePrediction:summary.noCondition")
                  }
                />
                <SummaryRow
                  icon={Coins}
                  label={t("CreatePrediction:summary.backing")}
                  value={
                    backingAssetData
                      ? `${backingAssetData.symbol} (${backingAssetData.id})`
                      : backingAsset
                  }
                  mono
                />
                <SummaryRow
                  icon={Hash}
                  label={t("CreatePrediction:summary.maxSupply")}
                  value={
                    parseFloat(maxSupply) > 0
                      ? parseFloat(maxSupply).toLocaleString()
                      : null
                  }
                  mono
                />
                <SummaryRow
                  icon={Percent}
                  label={t("CreatePrediction:summary.commission")}
                  value={
                    commissionNum > 0
                      ? `${commissionNum}%`
                      : "0%"
                  }
                />
                <SummaryRow
                  icon={Calendar}
                  label={t("CreatePrediction:summary.resolution")}
                  value={
                    date
                      ? `${date.toLocaleDateString()} · ${t(
                          "CreatePrediction:summary.days",
                          { count: daysUntil }
                        )}`
                      : null
                  }
                />
              </div>
            </div>

            {isFormValid ? (
              <div className="flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                <p className="text-sm font-medium text-emerald-400">
                  {t("CreatePrediction:summary.ready")}
                </p>
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <p className="text-sm font-medium text-amber-400">
                  {t("CreatePrediction:summary.fieldsRequired")}
                </p>
              </div>
            )}

            <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white">
                  {t("CreatePrediction:tips.submitTitle")}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-white/50">
                  {t("CreatePrediction:tips.submitHint")}
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
                {t("CreatePrediction:buttons.submit")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {showDialog ? (
        <DeepLinkDialog
          operationNames={["asset_create"]}
          username={usr.username}
          usrChain={usr.chain}
          userID={usr.id}
          dismissCallback={setShowDialog}
          key={`CreatingPMA-${usr.id}-${fullSymbol}`}
          headerText={t("CreatePrediction:dialogContent.headerText", {
            symbol: fullSymbol,
          })}
          trxJSON={[trx]}
        />
      ) : null}
    </div>
  );
}
