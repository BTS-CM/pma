import React, {
  useSyncExternalStore,
  useMemo,
  useEffect,
  useState,
  useCallback,
  memo,
} from "react";
import { List } from "react-window";
import { useStore } from "@nanostores/react";
import { format } from "date-fns";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex as toHex, utf8ToBytes } from "@noble/hashes/utils.js";
import DOMPurify from "dompurify";
import {
  QuestionMarkCircledIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  CopyIcon,
  CheckIcon,
  ImageIcon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons";
import {
  TrendingUp,
  ExternalLink as ExternalLinkIcon,
  Filter,
  ArrowUpDown,
  X as XIcon,
  Ban,
  Activity,
  Hourglass,
  BookOpen,
  Briefcase,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";

import AccountSearch from "@/components/AccountSearch.jsx";
import { Avatar } from "./Avatar.tsx";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

import { $currentUser } from "@/stores/users.ts";
import {
  $blockList,
  $userBlockList,
  addBlockedUser,
  removeBlockedUser,
} from "@/stores/blocklist.ts";
import { $currentNode } from "@/stores/node.ts";
import { $visualSettings } from "@/stores/visuals.ts";

import { useInitCache } from "@/nanoeffects/Init.ts";
import {
  createEveryObjectStore,
  createObjectStore,
} from "@/nanoeffects/Objects.ts";
import { createUserBalancesStore } from "@/nanoeffects/UserBalances.ts";
import { createAssetCallOrdersStore } from "@/nanoeffects/AssetCallOrders.ts";

import {
  humanReadableFloat,
  getFlagBooleans,
  blockchainFloat,
  assetAmountRegex,
  getNftImages,
  ipfsUrl,
  formatTimeRemaining,
  debounce,
} from "@/lib/common.js";

import DeepLinkDialog from "./common/DeepLinkDialog.jsx";
import JsonDetailsDialog from "./common/JsonDetailsDialog.jsx";

import HoverInfo from "@/components/common/HoverInfo.tsx";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { set } from "date-fns";

function prettifyDate(date) {
  const d = new Date(date);
  const hours = d.getHours() < 10 ? `0${d.getHours()}` : d.getHours();
  const minutes = d.getMinutes() < 10 ? `0${d.getMinutes()}` : d.getMinutes();
  return `${d.getDate()}/${
    d.getMonth() + 1
  }/${d.getFullYear()} ${hours}:${minutes}`;
}

function CopyButton({ value, label, className }) {
  const { t } = useTranslation(locale.get(), { i18n: i18nInstance });
  const [copied, setCopied] = useState(false);
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn("h-6 w-6", className)}
            onClick={async (e) => {
              e.stopPropagation();
              e.preventDefault();
              try {
                await navigator.clipboard.writeText(value);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              } catch (err) {
                // clipboard blocked; silently fail
              }
            }}
            aria-label={label || t("Predictions:copy")}
          >
            {copied ? (
              <CheckIcon className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <CopyIcon className="h-3.5 w-3.5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          {copied ? t("Predictions:copied") : label || t("Predictions:copy")}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function MonoBlock({ value, truncate, copyable, label }) {
  const display =
    truncate && value && value.length > truncate
      ? `${value.slice(0, Math.floor(truncate / 2))}…${value.slice(
          -Math.floor(truncate / 2),
        )}`
      : value;
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs">
      <span className="break-all">{display}</span>
      {copyable && value ? <CopyButton value={value} label={label} /> : null}
    </span>
  );
}

function StatBlock({ label, value, help, mono, accent }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 transition-all hover:bg-white/[0.06]",
        accent
          ? "border-l-2 border-l-current"
          : "",
        accent === "emerald" && "border-emerald-500/50 bg-emerald-500/5",
        accent === "rose" && "border-rose-500/50 bg-rose-500/5",
        accent === "amber" && "border-amber-500/50 bg-amber-500/5",
      )}
    >
      <div className="text-[10px] uppercase tracking-wider font-semibold text-white/60 flex items-center gap-1">
        {label}
        {help ? (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger>
                <QuestionMarkCircledIcon className="h-3 w-3" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                {help}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : null}
      </div>
      <div
        className={cn(
          "mt-1 text-sm font-semibold text-white",
          mono && "font-mono tabular-nums",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function ProbabilityBar({ yesPercent }) {
  const clamped = Math.max(0, Math.min(100, Number(yesPercent) || 0));
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-medium">
        <span className="text-emerald-400">
          YES {clamped.toFixed(1)}%
        </span>
        <span className="text-rose-400">
          NO {(100 - clamped).toFixed(1)}%
        </span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-rose-500/20">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

function NftHero({ images, heroIndex, setHeroIndex, ipfsGateway }) {
  const { t } = useTranslation(locale.get(), { i18n: i18nInstance });
  const hero = images[heroIndex] || images[0];
  if (!hero) return null;
  const src = ipfsUrl(hero.url, ipfsGateway);
  return (
    <div className="rounded-md border border-white/10 overflow-hidden bg-white/5">
      {src ? (
        <img
          src={src}
          alt={hero.type}
          loading="lazy"
          className="w-full h-auto object-contain max-h-[420px]"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <div className="flex items-center justify-center h-32 text-white/40 text-sm">
          <ImageIcon className="mr-2 h-4 w-4" />
          {t("Predictions:nft.noImage")}
        </div>
      )}
    </div>
  );
}

function NftThumbStrip({ images, heroIndex, setHeroIndex, ipfsGateway }) {
  if (!images || images.length <= 1) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {images.map((img, idx) => {
        const src = ipfsUrl(img.url, ipfsGateway);
        const active = idx === heroIndex;
        return (
          <button
            key={`thumb-${idx}-${img.url}`}
            type="button"
            onClick={() => setHeroIndex(idx)}
            className={cn(
              "h-14 w-14 rounded-md overflow-hidden border-2 transition-colors",
              active
? "border-violet-500 ring-2 ring-violet-500/30"
                  : "border-white/[0.08] hover:border-violet-500/40",
            )}
            aria-label={`Image ${idx + 1}`}
          >
            {src ? (
              <img
                src={src}
                alt={img.type}
                loading="lazy"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-white/10 text-white/40">
                <ImageIcon className="h-4 w-4" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

function LongText({ label, value }) {
  if (!value) return null;
  return (
    <div className="rounded-md border border-white/10 bg-white/5 p-3">
      {label ? (
        <div className="text-[11px] uppercase tracking-wide text-white/60 mb-1">
          {label}
        </div>
      ) : null}
      <div className="whitespace-pre-wrap break-words text-sm">{value}</div>
    </div>
  );
}

export default function Predictions(properties) {
  const { t, i18n } = useTranslation(locale.get(), { i18n: i18nInstance });
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
  const userBlockList = useSyncExternalStore(
    $userBlockList.subscribe,
    $userBlockList.get,
    () => true
  );
  const currentNode = useStore($currentNode);
  const visuals = useStore($visualSettings);

  const view = properties.view || "active"; // active, expired, mine, portfolio, margin
  const VIEW_CONFIG = {
    active: {
      icon: Activity,
      color: "text-cyan-400",
      bg: "bg-cyan-500/15",
      border: "border-cyan-500/30",
      ring: "ring-cyan-500/20",
      gradient: "from-cyan-500 to-sky-500",
    },
    expired: {
      icon: Hourglass,
      color: "text-sky-400",
      bg: "bg-sky-500/15",
      border: "border-sky-500/30",
      ring: "ring-sky-500/20",
      gradient: "from-sky-500 to-blue-500",
    },
    mine: {
      icon: BookOpen,
      color: "text-emerald-400",
      bg: "bg-emerald-500/15",
      border: "border-emerald-500/30",
      ring: "ring-emerald-500/20",
      gradient: "from-emerald-500 to-teal-500",
    },
    portfolio: {
      icon: Briefcase,
      color: "text-fuchsia-400",
      bg: "bg-fuchsia-500/15",
      border: "border-fuchsia-500/30",
      ring: "ring-fuchsia-500/20",
      gradient: "from-fuchsia-500 to-pink-500",
    },
    margin: {
      icon: TrendingUp,
      color: "text-amber-400",
      bg: "bg-amber-500/15",
      border: "border-amber-500/30",
      ring: "ring-amber-500/20",
      gradient: "from-amber-500 to-orange-500",
    },
  };
  const currentView = VIEW_CONFIG[view] || VIEW_CONFIG.active;

  // Live countdown ticker - re-renders the row every 30s so expiry countdowns update
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  // List-level controls
  const [sortBy, setSortBy] = useState(() => {
    if (typeof window === "undefined") return "newest";
    const params = new URLSearchParams(window.location.search);
    const s = params.get("sort");
    return s && ["newest", "expiring", "volume", "alpha"].includes(s)
      ? s
      : "newest";
  });
  const [filterBy, setFilterBy] = useState(() => {
    if (typeof window === "undefined") return "all";
    const params = new URLSearchParams(window.location.search);
    const f = params.get("filter");
    return f && ["all", "closing-soon", "new", "high-volume"].includes(f)
      ? f
      : "all";
  });
  const [issuerFilter, setIssuerFilter] = useState(() => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    return params.get("issuer") || null;
  });
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const setSearchQueryDebounced = useCallback(
    debounce((v) => setSearchQuery(v), 200),
    [],
  );
  const onSearchInput = (e) => {
    const v = e.currentTarget.value;
    setSearchInput(v);
    setSearchQueryDebounced(v);
  };

  const ipfsGateway =
    visuals && typeof visuals.ipfsGateway === "string" && visuals.ipfsGateway
      ? visuals.ipfsGateway
      : "https://ipfs.io/ipfs/";

  const { _assetsBTS, _assetsTEST, _marketSearchBTS, _marketSearchTEST } =
    properties;

  const _chain = useMemo(() => {
    if (usr && usr.chain) {
      return usr.chain;
    }
    return "bitshares";
  }, [usr]);

  useInitCache(_chain ?? "bitshares", []);

  const marketSearch = useMemo(() => {
    if (_chain && (_marketSearchBTS || _marketSearchTEST)) {
      return _chain === "bitshares" ? _marketSearchBTS : _marketSearchTEST;
    }
    return [];
  }, [_marketSearchBTS, _marketSearchTEST, _chain]);

  const assets = useMemo(() => {
    if (_chain && (_assetsBTS || _assetsTEST)) {
      return _chain === "bitshares" ? _assetsBTS : _assetsTEST;
    }
    return [];
  }, [_assetsBTS, _assetsTEST, _chain]);

  // Set of account IDs the current user has personally blocked (per chain).
  // Used as a second filter pass to hide PMAs whose issuer is in the user blocklist.
  const userBlockedIDs = useMemo(() => {
    if (!userBlockList || !_chain) return new Set();
    const chainList = userBlockList[_chain];
    if (!chainList || !chainList.length) return new Set();
    return new Set(chainList.map((u) => u.id));
  }, [userBlockList, _chain]);

  const [combinedAssets, setCombinedAssets] = useState([]);
  useEffect(() => {
    async function fetching() {
      const lastAsset = assets.at(-1);
      const requiredStore = createEveryObjectStore([
        _chain,
        parseInt(lastAsset.id.split(".")[0]),
        parseInt(lastAsset.id.split(".")[1]),
        parseInt(lastAsset.id.split(".")[2]),
        currentNode.url,
      ]);

      requiredStore.subscribe(({ data, error, loading }) => {
        if (data && !error && !loading) {
          setCombinedAssets(!data.length ? assets : [...assets, ...data]);
        }
      });
    }

    if (_chain && assets && assets.length && currentNode) {
      fetching();
    }
  }, [_chain, assets, currentNode]);

  const predictionMarketAssets = useMemo(() => {
    if (!_chain || !combinedAssets || !combinedAssets.length) {
      return [];
    }

    let _predictionMarketAssets = combinedAssets.filter(
      (x) =>
        (x.hasOwnProperty("prediction_market") &&
          x.prediction_market === true) ||
        (!x.hasOwnProperty("prediction_market") && x.bitasset_data_id) // non cached assets minus non-pm smartcoins
    );

    if (_chain === "bitshares" && _predictionMarketAssets.length) {
      // filter out prediction market assets created by banned users
      _predictionMarketAssets = _predictionMarketAssets.filter(
        (x) => !blocklist.users.includes(toHex(sha256(utf8ToBytes(x.issuer))))
      );
    }

    return _predictionMarketAssets;
  }, [_chain, combinedAssets]);

  const [pmaProcessedData, setPmaProcessedData] = useState([]);
  const [hasLoadedPmas, setHasLoadedPmas] = useState(false);
  useEffect(() => {
    async function fetching() {
      const _store = createObjectStore([
        _chain,
        JSON.stringify(predictionMarketAssets.map((x) => x.id)),
        currentNode ? currentNode.url : null,
      ]);

      _store.subscribe(({ data, error, loading }) => {
        if (data && !error && !loading) {
          const now = new Date();
          const processedData = data
            .map((x) => {
              const plainDescription = x.options.description;
              if (
                !plainDescription ||
                !plainDescription.length ||
                !plainDescription.includes("market") ||
                !plainDescription.includes("expiry") ||
                !plainDescription.includes("condition")
              ) {
                return;
              }

              const description = JSON.parse(x.options.description);
              if (
                !description ||
                !description.market ||
                !description.expiry ||
                !description.condition
              ) {
                return;
              }

              const market = description.market;
              const expiration = new Date(description.expiry);

              const backingAsset = assets.find((x) => x.symbol === market);
              return { ...x, backingAsset, expired: now > expiration };
            })
            .filter((x) => x)
            .sort(
              (a, b) => new Date(b.creation_time) - new Date(a.creation_time)
            );
          setPmaProcessedData(processedData);
          setHasLoadedPmas(true);
        }
      });
    }

    if (predictionMarketAssets && predictionMarketAssets.length) {
      fetching();
    }
  }, [predictionMarketAssets]);

  useEffect(() => {
    // If there are no prediction market assets at all, mark as loaded so
    // we show the empty state instead of indefinite skeleton rows.
    if (
      predictionMarketAssets &&
      predictionMarketAssets.length === 0 &&
      _chain &&
      currentNode
    ) {
      setHasLoadedPmas(true);
    }
  }, [predictionMarketAssets, _chain, currentNode]);

  const [usrBalances, setUsrBalances] = useState();
  const [balanceAssetIDs, setBalanceAssetIDs] = useState([]);
  useEffect(() => {
    async function fetchUserBalances() {
      if (usr && usr.id) {
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
            setBalanceAssetIDs(filteredData.map((x) => x.asset_id));
            setUsrBalances(filteredData);
          }
        });
      }
    }
    fetchUserBalances();
  }, [usr]);

  const activePMAs = useMemo(() => {
    return pmaProcessedData.filter((x) => !x.expired);
  }, [pmaProcessedData]);

  const expiredPMAs = useMemo(() => {
    return pmaProcessedData.filter((x) => x.expired);
  }, [pmaProcessedData]);

  const myPMAs = useMemo(() => {
    return pmaProcessedData.filter((x) => x.issuer === usr.id);
  }, [pmaProcessedData]);

  const balancePMAs = useMemo(() => {
    return pmaProcessedData.filter((x) => balanceAssetIDs.includes(x.id));
  }, [pmaProcessedData, balanceAssetIDs]);

  const [completedPMAs, setCompletedPMAs] = useState([]);
  useEffect(() => {
    async function fetching() {
      const _store = createObjectStore([
        _chain,
        JSON.stringify(pmaProcessedData.map((x) => x.bitasset_data_id)),
        currentNode ? currentNode.url : null,
      ]);

      _store.subscribe(({ data, error, loading }) => {
        if (data && !error && !loading) {
          const outcomes = data
            .filter((x) => x.settlement_price) // Filter out items with no settlement price
            .map((x) => {
              const baseAmount = parseInt(x.settlement_price.base.amount);
              if (baseAmount === 0) {
                return { ...x, outcome: -1 };
              }

              const quoteAsset = assets.find(
                (y) => x.options.short_backing_asset === y.id
              );
              const baseAsset = assets.find((y) => x.asset_id === y.id);

              const _outcome = parseFloat(
                (
                  humanReadableFloat(
                    parseInt(x.settlement_price.quote.amount),
                    quoteAsset.precision
                  ) / humanReadableFloat(baseAmount, baseAsset.precision)
                ).toFixed(quoteAsset.precision)
              );

              return { ...x, outcome: _outcome > 0 ? 1 : 0 };
            });

          setCompletedPMAs(outcomes);
        }
      });
    }

    if (pmaProcessedData && pmaProcessedData.length) {
      fetching();
    }
  }, [pmaProcessedData]);

  const [callOrders, setCallOrders] = useState([]);
  useEffect(() => {
    async function fetching() {
      const _assetStore = createAssetCallOrdersStore([
        _chain,
        JSON.stringify(completedPMAs.map((x) => x.asset_id)),
        currentNode.url,
      ]);

      _assetStore.subscribe(({ data, error, loading }) => {
        if (data && !error && !loading) {
          setCallOrders(data);
        }
      });
    }

    if (completedPMAs && completedPMAs.length) {
      fetching();
    }
  }, [completedPMAs]);

  const marginPMAs = useMemo(() => {
    return pmaProcessedData.filter((pma) => {
      return callOrders.some((order) => {
        const orderEntries = Object.values(order);
        return orderEntries.some((entries) => {
          return entries.some((entry) => entry.borrower === usr.id);
        });
      });
    });
  }, [pmaProcessedData, callOrders, usr.id]);

  const chosenPMAs = useMemo(() => {
    if (view === "active") {
      return activePMAs;
    } else if (view === "expired") {
      return expiredPMAs;
    } else if (view === "mine") {
      return myPMAs;
    } else if (view === "portfolio") {
      return balancePMAs;
    } else if (view === "margin") {
      return marginPMAs;
    }
    return [];
  }, [view, activePMAs, expiredPMAs, myPMAs, balancePMAs, marginPMAs]);

  // Page-level stats (computed from the raw chosenPMAs, NOT the filtered list)
  const pageStats = useMemo(() => {
    if (!chosenPMAs || !chosenPMAs.length) {
      return null;
    }
    if (view === "active") {
      const closingSoon = chosenPMAs.filter((p) => {
        const ms = new Date(p.expiry).getTime() - now;
        return ms > 0 && ms <= 24 * 60 * 60 * 1000;
      }).length;
      const newlyCreated = chosenPMAs.filter((p) => {
        const created = new Date(p.creation_time).getTime();
        const ageMs = now - created;
        return ageMs >= 0 && ageMs <= 7 * 24 * 60 * 60 * 1000;
      }).length;
      return {
        primary: chosenPMAs.length,
        secondary: [
          { key: "closing", label: t("Predictions:stats.closingSoon"), value: closingSoon },
          { key: "new", label: t("Predictions:stats.newlyCreated"), value: newlyCreated },
        ],
      };
    }
    if (view === "expired") {
      const awaiting = chosenPMAs.filter((p) => {
        const bitasset = completedPMAs.find((b) => b.id === p.bitasset_data_id);
        return !bitasset || !bitasset.hasOwnProperty("outcome") || bitasset.outcome === -1;
      }).length;
      const resolved = chosenPMAs.filter((p) => {
        const bitasset = completedPMAs.find((b) => b.id === p.bitasset_data_id);
        return bitasset && (bitasset.outcome === 0 || bitasset.outcome === 1);
      }).length;
      return {
        primary: chosenPMAs.length,
        secondary: [
          { key: "awaiting", label: t("Predictions:stats.awaitingResolution"), value: awaiting },
          { key: "resolved", label: t("Predictions:stats.resolved"), value: resolved },
        ],
      };
    }
    if (view === "mine") {
      const awaitingMine = chosenPMAs.filter((p) => {
        const bitasset = completedPMAs.find((b) => b.id === p.bitasset_data_id);
        return p.expired && (!bitasset || !bitasset.hasOwnProperty("outcome") || bitasset.outcome === -1);
      }).length;
      return {
        primary: chosenPMAs.length,
        secondary: [
          { key: "awaiting", label: t("Predictions:stats.awaitingYourResolution"), value: awaitingMine },
        ],
      };
    }
    if (view === "portfolio") {
      return {
        primary: chosenPMAs.length,
        secondary: [
          { key: "inBalance", label: t("Predictions:stats.inYourBalance"), value: chosenPMAs.length },
        ],
      };
    }
    if (view === "margin") {
      const atRisk = chosenPMAs.filter((p) => {
        const collateral = pmaProcessedData.find((x) => x.id === p.id);
        // heuristic: a margin position is at risk if there is an open call
        return true;
      }).length;
      return {
        primary: chosenPMAs.length,
        secondary: [
          { key: "atRisk", label: t("Predictions:stats.marginPositions"), value: chosenPMAs.length },
        ],
      };
    }
    return null;
  }, [chosenPMAs, view, completedPMAs, pmaProcessedData, now, t]);

  // Apply search + filter + sort to the chosenPMAs for the rendered list
  const sortedFilteredPMAs = useMemo(() => {
    if (!chosenPMAs || !chosenPMAs.length) return [];
    let result = [...chosenPMAs];

    // Second filter pass: drop PMAs whose issuer is in the user's personal
    // blocklist. This is intentionally separate from the committee blocklist
    // (which only feeds the committee reference view, not the prediction list).
    if (userBlockedIDs && userBlockedIDs.size) {
      result = result.filter((p) => !userBlockedIDs.has(p.issuer));
    }

    // Filter by specific issuer (set by clicking avatar in prediction row)
    if (issuerFilter) {
      result = result.filter((p) => p.issuer === issuerFilter);
    }

    if (searchQuery && searchQuery.trim().length) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((p) => {
        if (p.symbol && p.symbol.toLowerCase().includes(q)) return true;
        try {
          const d = JSON.parse(p.options.description || "{}");
          if (d && d.condition && String(d.condition).toLowerCase().includes(q))
            return true;
          if (d && d.short_name && String(d.short_name).toLowerCase().includes(q))
            return true;
        } catch (_) {}
        return false;
      });
    }

    if (filterBy === "closing-soon" && view === "active") {
      result = result.filter((p) => {
        const ms = new Date(p.expiry).getTime() - now;
        return ms > 0 && ms <= 24 * 60 * 60 * 1000;
      });
    } else if (filterBy === "new" && view === "active") {
      result = result.filter((p) => {
        const created = new Date(p.creation_time).getTime();
        const ageMs = now - created;
        return ageMs >= 0 && ageMs <= 7 * 24 * 60 * 60 * 1000;
      });
    } else if (filterBy === "high-volume" && view === "active") {
      // top 10% by total call-order collateral
      const collaterals = chosenPMAs.map((p) => {
        const orders = callOrders[p.id];
        return orders
          ? orders.reduce((acc, val) => acc + val.collateral, 0)
          : 0;
      });
      const sorted = [...collaterals].sort((a, b) => b - a);
      const cutoff = sorted[Math.floor(sorted.length * 0.1)] || 0;
      result = result.filter((_, idx) => collaterals[idx] >= cutoff);
    }

    if (sortBy === "newest") {
      result.sort(
        (a, b) =>
          new Date(b.creation_time).getTime() -
          new Date(a.creation_time).getTime(),
      );
    } else if (sortBy === "expiring") {
      result.sort(
        (a, b) => new Date(a.expiry).getTime() - new Date(b.expiry).getTime(),
      );
    } else if (sortBy === "volume") {
      result.sort((a, b) => {
        const ca = callOrders[a.id]
          ? callOrders[a.id].reduce((acc, val) => acc + val.collateral, 0)
          : 0;
        const cb = callOrders[b.id]
          ? callOrders[b.id].reduce((acc, val) => acc + val.collateral, 0)
          : 0;
        return cb - ca;
      });
    } else if (sortBy === "alpha") {
      result.sort((a, b) =>
        (a.symbol || "").localeCompare(b.symbol || ""),
      );
    }

    return result;
  }, [chosenPMAs, searchQuery, filterBy, issuerFilter, sortBy, now, callOrders, view, userBlockedIDs]);

  const PredictionRow = memo(({ res }) => {
    // All hooks must be called unconditionally, before any early return.
    const [rowView, setRowView] = useState("overview");

    const [heroIndex, setHeroIndex] = useState(0);
    useEffect(() => {
      setHeroIndex(0);
    }, [res?.id]);

    const nftImages = useMemo(
      () => {
        if (!res?.options?.description) return [];
        try {
          const _d = JSON.parse(res.options.description);
          return _d && _d.nft_object ? getNftImages(_d.nft_object) : [];
        } catch (_) {
          return [];
        }
      },
      [res?.id],
    );

    // sellers (false betters)
    const [issuePrompt, setIssuePrompt] = useState(false);
    const [issueAmount, setIssueAmount] = useState(0);
    const [issueDialog, setIssueDialog] = useState(false);

    const [sellPrompt, setSellPrompt] = useState(false);
    const [sellAmount, setSellAmount] = useState(0);
    const [sellDialog, setSellDialog] = useState(false);

    const [expiryType, setExpiryType] = useState("1hr");
    const [expiry, setExpiry] = useState(() => {
      const _now = new Date();
      const oneHour = 60 * 60 * 1000;
      return new Date(_now.getTime() + oneHour);
    });

    const [date, setDate] = useState(
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    );

    useEffect(() => {
      if (expiryType === "specific" && date) {
        setExpiry(date);
      }
    }, [expiryType, date]);

    // buyer (true betters)
    const [buyPrompt, setBuyPrompt] = useState(false);
    const [buyAmount, setBuyAmount] = useState(0);
    const [buyDialog, setBuyDialog] = useState(false);

    const [claimPrompt, setClaimPrompt] = useState(false);
    const [claimAmount, setClaimAmount] = useState(0);
    const [claimDialog, setClaimDialog] = useState(false);

    // owner (issuer) - admin
    const [resolvePrompt, setResolvePrompt] = useState(false);
    const [chosenOutcome, setChosenOutcome] = useState();
    const [resolveDialog, setResolveDialog] = useState(false);

    const [pricefeederPrompt, setPricefeederPrompt] = useState(false);
    const [priceFeeders, setPriceFeeders] = useState([]);
    const [priceSearchDialog, setPriceSearchDialog] = useState(false);
    const [pricefeederDialog, setPricefeederDialog] = useState(false);

    // witness || committee || pricefeeder - admin
    const [priceFeedPrompt, setPriceFeedPrompt] = useState(false);
    const [priceFeedOutcome, setPriceFeedOutcome] = useState();
    const [priceFeedDialog, setPriceFeedDialog] = useState(false);

    // JSON detail viewer
    const [jsonDialogOpen, setJsonDialogOpen] = useState(false);
    const [jsonPayload, setJsonPayload] = useState(null);

    // Block-issuer confirmation prompt
    const [blockConfirmOpen, setBlockConfirmOpen] = useState(false);

    // ----- Safe data lookups -----
    const relevantBitassetData = res
      ? completedPMAs.find((x) => x.id === res.bitasset_data_id)
      : null;

    // ----- Early return AFTER all hooks -----
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
          ? marketSearch.find((x) => x.u.includes(`(${house})`)).u
          : null;
    }

    // The marketSearch `u` field is formatted as `name (id) (LTM)` (LTM optional)
    // so we split out the parts to: (a) avoid rendering `(LTM)` twice when we
    // already show a dedicated LTM badge, and (b) extract a clean account
    // name to seed the Avatar.
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

    const cleanedPrediction = DOMPurify.sanitize(prediction_conditions ?? ""); // sanitize to avoid xss
    const cleanedDescription = DOMPurify.sanitize(main_description ?? ""); // sanitize to avoid xss

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

    let relevantCallOrders = callOrders.hasOwnProperty(res.id)
      ? callOrders[res.id]
      : null;
    const totalBets =
      relevantCallOrders && relevantCallOrders.length
        ? relevantCallOrders.reduce((acc, val) => acc + val.collateral, 0)
        : 0;

    const usrCallOrder =
      relevantCallOrders && relevantCallOrders.length
        ? relevantCallOrders.filter((x) => x.borrower === usr.id)
        : null;
    const existingCollateral = usrCallOrder ? usrCallOrder.collateral : 0;

    // Implied YES probability
    const settlementFundRaw = relevantBitassetData
      ? Number(relevantBitassetData.settlement_fund || 0)
      : 0;
    const totalCollateral = totalBets + settlementFundRaw;
    const impliedYesPercent =
      totalCollateral > 0 ? (settlementFundRaw / totalCollateral) * 100 : 0;

    const _backingAssetID = res.backingAsset.id;
    const _backingPrecision = res.backingAsset.precision;
    const backingAssetBalance = usrBalances.find(
      (x) => x.asset_id === _backingAssetID
    );
    const humanReadableBackingAssetBalance = backingAssetBalance
      ? humanReadableFloat(backingAssetBalance.amount, _backingPrecision)
      : 0;

    const predictionMarketAssetBalance = usrBalances.find(
      (x) => x.asset_id === res.id
    );
    const humanReadablePredictionMarketAssetBalance =
      predictionMarketAssetBalance
        ? humanReadableFloat(predictionMarketAssetBalance.amount, res.precision)
        : 0;

    const _flags = getFlagBooleans(res.options.flags);
    const _issuer_permissions = getFlagBooleans(res.options.issuer_permissions);

    const pricefeederRow = ({ index, style }) => {
      let res = priceFeeders[index];
      if (!res) {
        return null;
      }

      return (
        <div style={{ ...style }} key={`acard-${res.id}`}>
          <Card className="ml-2 mr-2 mt-1 bg-slate-900/80 border-white/[0.08]">
            <CardHeader className="pb-3 pt-3">
              <span className="flex items-center w-full">
                <span className="flex-shrink-0">
                  <Avatar
                    size={40}
                    name={res.name}
                    extra="Borrower"
                    expression={{ eye: "normal", mouth: "open" }}
                    colors={[
                      "#92A1C6",
                      "#146A7C",
                      "#F0AB3D",
                      "#C271B4",
                      "#C20D90",
                    ]}
                  />
                </span>
                <span className="flex-grow ml-3 text-white">
                  #{index + 1}: {res.name} ({res.id})
                </span>
                <span className="flex-shrink-0">
                  <Button
                    variant="outline"
                    className="mr-2"
                    onClick={(e) => {
                      e.preventDefault();
                      const _update = priceFeeders.filter(
                        (x) => x.id !== res.id
                      );
                      setPriceFeeders(_update);
                    }}
                  >
                    ❌
                  </Button>
                </span>
              </span>
            </CardHeader>
          </Card>
        </div>
      );
    };

    // Compute status for visual indicator
    const statusKey = (() => {
      if (!isExpired) return "active";
      if (
        relevantBitassetData &&
        relevantBitassetData.outcome === 1
      )
        return "resolvedYes";
      if (
        relevantBitassetData &&
        relevantBitassetData.outcome === 0
      )
        return "resolvedNo";
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
                      colors={[
                        "#92A1C6",
                        "#146A7C",
                        "#F0AB3D",
                        "#C271B4",
                        "#C20D90",
                      ]}
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
              <div className="flex flex-wrap items-center gap-1 mt-1 rounded-lg bg-white/[0.03] border border-white/[0.06] p-1 self-start">
                <Button
                  onClick={() => setRowView("overview")}
                  variant={rowView === "overview" ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-7 text-xs",
                    rowView !== "overview" && "text-white/50 hover:text-white/80 hover:bg-white/[0.06]",
                  )}
                >
                  {t("Predictions:tab.overview")}
                </Button>
                {hasNft ? (
                  <Button
                    onClick={() => setRowView("nft")}
                    variant={rowView === "nft" ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "h-7 text-xs",
                      rowView !== "nft" && "text-white/50 hover:text-white/80 hover:bg-white/[0.06]",
                    )}
                  >
                    {t("Predictions:tab.nft")}
                  </Button>
                ) : null}
                {hasPmo ? (
                  <Button
                    onClick={() => setRowView("org")}
                    variant={rowView === "org" ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "h-7 text-xs",
                      rowView !== "org" && "text-white/50 hover:text-white/80 hover:bg-white/[0.06]",
                    )}
                  >
                    {t("Predictions:tab.org")}
                  </Button>
                ) : null}
                <Button
                  onClick={() => setRowView("market")}
                  variant={rowView === "market" ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-7 text-xs",
                    rowView !== "market" && "text-white/50 hover:text-white/80 hover:bg-white/[0.06]",
                  )}
                >
                  {t("Predictions:tab.market")}
                </Button>
                <Button
                  onClick={() => setRowView("details")}
                  variant={rowView === "details" ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-7 text-xs",
                    rowView !== "details" && "text-white/50 hover:text-white/80 hover:bg-white/[0.06]",
                  )}
                >
                  {t("Predictions:tab.details")}
                </Button>
                {view !== "expired" ? (
                  <Button
                    onClick={() => setRowView("actions")}
                    variant={rowView === "actions" ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "h-7 text-xs",
                      rowView !== "actions" && "text-white/50 hover:text-white/80 hover:bg-white/[0.06]",
                    )}
                  >
                    {t("Predictions:tab.actions")}
                  </Button>
                ) : (
                  <Button
                    onClick={() => setRowView("winners")}
                    variant={rowView === "winners" ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "h-7 text-xs",
                      rowView !== "winners" && "text-white/50 hover:text-white/80 hover:bg-white/[0.06]",
                    )}
                  >
                    {t("Predictions:tab.winners")}
                  </Button>
                )}
                {usr.id === house ? (
                  <Button
                    onClick={() => setRowView("admin")}
                    variant={rowView === "admin" ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "h-7 text-xs",
                      rowView !== "admin" && "text-white/50 hover:text-white/80 hover:bg-white/[0.06]",
                    )}
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
                                name: issuerDisplayLabel ?? username ?? house,
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
              </div>

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
                          name={issuerDisplayName ?? house}
                          extra="BlockConfirm"
                          expression={{ eye: "normal", mouth: "unhappy" }}
                          colors={[
                            "#92A1C6",
                            "#146A7C",
                            "#F0AB3D",
                            "#C271B4",
                            "#C20D90",
                          ]}
                        />
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-white truncate">
                          {issuerDisplayName ?? house}
                        </div>
                        <div className="font-mono text-xs text-white/50">
                          {house}
                        </div>
                      </div>
                      {issuerIsLtm ? (
                        <span className="ml-auto inline-flex items-center rounded-full bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400">
                          LTM
                        </span>
                      ) : null}
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-white/[0.05] border-white/[0.08] text-white/70 hover:bg-white/10 hover:text-white">
                        {t("Predictions:blockConfirm.cancel")}
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => {
                          addBlockedUser(usr.chain, {
                            name: issuerDisplayLabel ?? username ?? house,
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

              {rowView === "overview" ? (
                <div className="grid grid-cols-1 gap-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <StatBlock
                      label={t(
                        `Predictions:${
                          isExpired ? "expired_at" : "expiration"
                        }`
                      )}
                      value={prettifyDate(expiration)}
                      mono
                    />
                    <StatBlock
                      label={
                        isExpired
                          ? t("Predictions:timeExpired")
                          : t("Predictions:timeLeft")
                      }
                      value={formatTimeRemaining(expiration)}
                      mono
                    />
                    {view === "expired" || view === "mine" ? (
                      <StatBlock
                        label={t("Predictions:outcome")}
                        accent={
                          relevantBitassetData &&
                          relevantBitassetData.outcome === 1
                            ? "emerald"
                            : relevantBitassetData &&
                              relevantBitassetData.outcome === 0
                            ? "rose"
                            : "amber"
                        }
                        value={
                          relevantBitassetData &&
                          relevantBitassetData.outcome === 1
                            ? t("Predictions:outcome.yes")
                            : relevantBitassetData &&
                              relevantBitassetData.outcome === 0
                            ? t("Predictions:outcome.no")
                            : t("Predictions:outcome.unresolved")
                        }
                      />
                    ) : (
                      <StatBlock
                        label={t("Predictions:unique_sellers")}
                        value={relevantCallOrders ? relevantCallOrders.length : 0}
                        mono
                      />
                    )}
                    <StatBlock
                      label={t("Predictions:bettingAsset")}
                      value={market}
                      mono
                    />
                  </div>
                  {view === "expired" || view === "mine" ? (
                    <StatBlock
                      label={t("Predictions:prize_pool")}
                      value={
                        relevantBitassetData
                          ? `${humanReadableFloat(
                              relevantBitassetData.settlement_fund,
                              res.precision,
                            )} ${market}`
                          : `0 ${market}`
                      }
                      mono
                    />
                  ) : (
                    <StatBlock
                      label={t("Predictions:openInterest")}
                      help={t("Predictions:openInterest_help")}
                      value={`${humanReadableFloat(
                        totalBets,
                        res.precision,
                      )} ${market}`}
                      mono
                    />
                  )}
                </div>
              ) : null}

              {rowView === "nft" && hasNft ? (
                <div className="grid grid-cols-1 gap-3">
                  {nftImages && nftImages.length ? (
                    <div>
                      <NftHero
                        images={nftImages}
                        heroIndex={heroIndex}
                        setHeroIndex={setHeroIndex}
                        ipfsGateway={ipfsGateway}
                      />
                      {nftImages.length > 1 ? (
                        <NftThumbStrip
                          images={nftImages}
                          heroIndex={heroIndex}
                          setHeroIndex={setHeroIndex}
                          ipfsGateway={ipfsGateway}
                        />
                      ) : null}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32 rounded-md border border-dashed border-white/20 text-white/40 text-sm">
                      <ImageIcon className="mr-2 h-4 w-4" />
                      {t("Predictions:nft.noImage")}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {_desc.nft_object.title ? (
                      <StatBlock
                        label={t("Predictions:nft.title")}
                        value={_desc.nft_object.title}
                      />
                    ) : null}
                    {_desc.nft_object.artist ? (
                      <StatBlock
                        label={t("Predictions:nft.artist")}
                        value={_desc.nft_object.artist}
                      />
                    ) : null}
                    {_desc.nft_object.type ? (
                      <StatBlock
                        label={t("Predictions:nft.type")}
                        value={
                          <span className="inline-flex items-center rounded-full bg-white/[0.06] border border-white/[0.08] px-2 py-0.5 text-xs font-medium text-white/70">
                            {_desc.nft_object.type}
                          </span>
                        }
                      />
                    ) : null}
                    {_desc.nft_object.encoding ? (
                      <StatBlock
                        label={t("Predictions:nft.encoding")}
                        value={
                          <span className="font-mono text-xs">
                            {_desc.nft_object.encoding}
                          </span>
                        }
                      />
                    ) : null}
                    {_desc.nft_object.license ? (
                      <StatBlock
                        label={t("Predictions:nft.license")}
                        value={
                          <span className="text-xs">
                            {_desc.nft_object.license}
                          </span>
                        }
                      />
                    ) : null}
                    {_desc.nft_object.holder_license ? (
                      <StatBlock
                        label={t("Predictions:nft.holderLicense")}
                        value={
                          <span className="text-xs">
                            {_desc.nft_object.holder_license}
                          </span>
                        }
                      />
                    ) : null}
                  </div>

                  {_desc.nft_object.tags ? (
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-white/60 mb-1">
                        {t("Predictions:nft.tags")}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {String(_desc.nft_object.tags)
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean)
                          .map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-[10px] py-0"
                            >
                              {tag}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  ) : null}

                  {_desc.nft_object.narrative ? (
                    <LongText
                      label={t("Predictions:nft.narrative")}
                      value={DOMPurify.sanitize(_desc.nft_object.narrative)}
                    />
                  ) : null}
                  {_desc.nft_object.acknowledgements ? (
                    <LongText
                      label={t("Predictions:nft.acknowledgements")}
                      value={DOMPurify.sanitize(
                        _desc.nft_object.acknowledgements,
                      )}
                    />
                  ) : null}
                  {_desc.nft_object.attestation ? (
                    <LongText
                      label={t("Predictions:nft.attestation")}
                      value={DOMPurify.sanitize(_desc.nft_object.attestation)}
                    />
                  ) : null}

                  {nftImages && nftImages.length ? (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="self-start"
                    >
                      <a
                        href={ipfsUrl(nftImages[heroIndex].url, ipfsGateway)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLinkIcon className="mr-2 h-3.5 w-3.5" />
                        {t("Predictions:nft.viewOnIpfs")}
                      </a>
                    </Button>
                  ) : null}

                  {(_desc.nft_signature || _desc.sig_pubkey_or_address) ? (
                    <div className="rounded-md border border-white/10 bg-white/5 p-3 grid grid-cols-1 gap-2 text-xs">
                      <div>
                        <div className="text-[11px] uppercase tracking-wide text-white/60 mb-0.5">
                          {t("Predictions:nft.signature")}
                        </div>
                        <MonoBlock
                          value={_desc.nft_signature}
                          truncate={32}
                          copyable
                          label={t("Predictions:nft.copySig")}
                        />
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-wide text-white/60 mb-0.5">
                          {t("Predictions:nft.sigPubkey")}
                        </div>
                        <MonoBlock
                          value={_desc.sig_pubkey_or_address}
                          truncate={32}
                          copyable
                          label={t("Predictions:nft.copyPubkey")}
                        />
                      </div>
                      <div className="text-[10px] text-white/40 italic">
                        {t("Predictions:nft.verifyNote")}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {rowView === "org" && hasPmo ? (
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="h-4 w-4 text-cyan-400" />
                    <span className="text-sm font-semibold text-white">
                      {t("Predictions:org.title")}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {parentPmoObject.name ? (
                      <StatBlock
                        label={t("Predictions:org.name")}
                        value={parentPmoObject.name}
                      />
                    ) : null}
                    {parentPmoObject.website ? (
                      <StatBlock
                        label={t("Predictions:org.website")}
                        value={
                          <a
                            href={parentPmoObject.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:underline inline-flex items-center gap-1"
                          >
                            {parentPmoObject.website}
                            <ExternalLinkIcon className="h-3 w-3" />
                          </a>
                        }
                      />
                    ) : null}
                    {parentPmoObject.manifest ? (
                      <StatBlock
                        label={t("Predictions:org.manifest")}
                        value={
                          <a
                            href={parentPmoObject.manifest}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:underline inline-flex items-center gap-1"
                          >
                            {parentPmoObject.manifest}
                            <ExternalLinkIcon className="h-3 w-3" />
                          </a>
                        }
                      />
                    ) : null}
                    {parentPmoObject.onchain_account ? (
                      <StatBlock
                        label={t("Predictions:org.onchainAccount")}
                        value={parentPmoObject.onchain_account}
                        mono
                      />
                    ) : null}
                  </div>

                  {parentPmoObject.resolution_policy ? (
                    <LongText
                      label={t("Predictions:org.resolutionPolicy")}
                      value={DOMPurify.sanitize(parentPmoObject.resolution_policy)}
                    />
                  ) : null}
                  {parentPmoObject.dispute_mechanism ? (
                    <LongText
                      label={t("Predictions:org.disputeMechanism")}
                      value={DOMPurify.sanitize(parentPmoObject.dispute_mechanism)}
                    />
                  ) : null}
                  {parentPmoObject.attestation ? (
                    <LongText
                      label={t("Predictions:org.attestation")}
                      value={DOMPurify.sanitize(parentPmoObject.attestation)}
                    />
                  ) : null}

                  {parentPmoObject.pmo_signature ? (
                    <div className="rounded-md border border-white/10 bg-white/5 p-3 text-xs">
                      <div className="text-[11px] uppercase tracking-wide text-white/60 mb-0.5">
                        {t("Predictions:org.signature")}
                      </div>
                      <MonoBlock
                        value={parentPmoObject.pmo_signature}
                        truncate={32}
                        copyable
                        label={t("Predictions:nft.copySig")}
                      />
                    </div>
                  ) : null}

                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="self-start"
                  >
                    <a href={`/active-predictions/index.html?search=${res.symbol.split(".")[0]}.`}>
                      <ExternalLinkIcon className="mr-2 h-3.5 w-3.5" />
                      {t("Predictions:org.viewAll", { symbol: res.symbol.split(".")[0] })}
                    </a>
                  </Button>
                </div>
              ) : null}

              {rowView === "market" ? (
                <div className="grid grid-cols-1 gap-3">
                  {!isExpired ? (
                    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                      <div className="text-[11px] uppercase tracking-wide text-white/60 mb-1.5">
                        {t("Predictions:market.impliedProbability")}
                      </div>
                      <ProbabilityBar yesPercent={impliedYesPercent} />
                      <div className="mt-1.5 text-[11px] text-white/40">
                        {t("Predictions:market.impliedProbability_help")}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
                      <span className="text-white/50">
                        {t("Predictions:market.expiredNote")}
                      </span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <StatBlock
                      label={t("Predictions:openInterest")}
                      help={t("Predictions:openInterest_help")}
                      value={`${humanReadableFloat(
                        totalBets,
                        res.precision,
                      )} ${market}`}
                      mono
                    />
                    <StatBlock
                      label={t("Predictions:market.settlementFund")}
                      help={t("Predictions:market.settlementFund_help")}
                      value={`${humanReadableFloat(
                        settlementFundRaw,
                        res.precision,
                      )} ${market}`}
                      mono
                    />
                    <StatBlock
                      label={t("Predictions:unique_sellers")}
                      value={relevantCallOrders ? relevantCallOrders.length : 0}
                      mono
                    />
                    <StatBlock
                      label={t("Predictions:market.commission")}
                      help={t("Predictions:market.commission_help")}
                      value={
                        res.options && res.options.market_fee_percent
                          ? `${(res.options.market_fee_percent / 100).toFixed(2)}%`
                          : "0%"
                      }
                      mono
                    />
                  </div>
                  {!isExpired ? (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="w-fit"
                    >
                      <a
                        href={`/dex/index.html?market=${res.symbol}_${market}`}
                      >
                        <TrendingUp className="mr-2 h-3.5 w-3.5" />
                        {t("Predictions:market.tradeOnDex")}
                      </a>
                    </Button>
                  ) : null}
                </div>
              ) : null}

              {rowView === "details" ? (
                <div className="grid grid-cols-1 gap-2">
                  {cleanedDescription ? (
                    <LongText
                      label={t("Predictions:description")}
                      value={cleanedDescription}
                    />
                  ) : null}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <StatBlock
                      label={t("Predictions:permissions")}
                      value={
                        Object.keys(_issuer_permissions).length > 0 ? (
                          <HoverCard>
                            <HoverCardTrigger>
                              <span className="inline-flex items-center gap-1">
                                {Object.keys(_issuer_permissions).length}
                                <QuestionMarkCircledIcon className="h-3 w-3" />
                              </span>
                            </HoverCardTrigger>
                            <HoverCardContent
                              className="w-80 mt-1 bg-slate-950 border-white/[0.08] text-white z-[9999]"
                              align="start"
                            >
                              {Object.keys(_issuer_permissions).join(", ")}
                            </HoverCardContent>
                          </HoverCard>
                        ) : (
                          "0"
                        )
                      }
                    />
                    <StatBlock
                      label={t("Predictions:flags")}
                      value={
                        Object.keys(_flags).length > 0 ? (
                          <HoverCard>
                            <HoverCardTrigger>
                              <span className="inline-flex items-center gap-1">
                                {Object.keys(_flags).length}
                                <QuestionMarkCircledIcon className="h-3 w-3" />
                              </span>
                            </HoverCardTrigger>
                            <HoverCardContent
                              className="w-80 mt-1 bg-slate-950 border-white/[0.08] text-white z-[9999]"
                              align="start"
                            >
                              {Object.keys(_flags).join(", ")}
                            </HoverCardContent>
                          </HoverCard>
                        ) : (
                          "0"
                        )
                      }
                    />
                  </div>
                  <div className="rounded-md border border-white/10 bg-white/5 p-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <div className="text-[11px] uppercase tracking-wide text-white/60">
                          {t("Predictions:details.assetId")}
                        </div>
                        <MonoBlock
                          value={res.id}
                          copyable
                          label={t("Predictions:copyAssetId")}
                        />
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-wide text-white/60">
                          {t("Predictions:details.issuer")}
                        </div>
                        <MonoBlock
                          value={house}
                          copyable
                          label={t("Predictions:copyIssuerId")}
                        />
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-wide text-white/60">
                          {t("Predictions:details.precision")}
                        </div>
                        <span className="font-mono">{res.precision}</span>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-wide text-white/60">
                          {t("Predictions:details.maxSupply")}
                        </div>
                        <span className="font-mono">
                          {humanReadableFloat(
                            res.options.max_supply,
                            res.precision,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
              {rowView === "actions" && view !== "expired" ? (
                <div className="grid grid-cols-1 gap-2">
                  <HoverInfo
                    content={t("Predictions:seller_content")}
                    header={t("Predictions:seller")}
                    type="header"
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <Dialog
                      open={issuePrompt}
                      onOpenChange={(open) => {
                        setIssuePrompt(open);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          onClick={(event) => {
                            setIssuePrompt(true);
                          }}
                        >
                          {t(`Predictions:issue`)}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px] bg-slate-950 border-white/[0.08] text-white shadow-2xl shadow-black/40">
                        <DialogHeader>
                          <DialogTitle>
                            {t(`Predictions:issueDialog.title`)}
                          </DialogTitle>
                          <DialogDescription>
                            {t(`Predictions:issueDialog.description`)}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-1 gap-2">
                          <div className="grid grid-cols-2 gap-2">
                            <HoverInfo
                              content={t("Predictions:issueDialog.qtyContent")}
                              header={t("Predictions:issueDialog.qtyHeader")}
                              type="header"
                            />
                            <Button
                              className="h-6 mt-1 ml-3 hover:shadow-md"
                              onClick={() => {
                                setIssueAmount(
                                  backingAssetBalance
                                    ? humanReadableFloat(
                                        backingAssetBalance.amount,
                                        _backingPrecision
                                      )
                                    : 0
                                );
                              }}
                              variant="outline"
                            >
                              {t("Predictions:issueDialog.balance")}
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              type="number"
                              value={issueAmount}
                              min={1}
                              step={1}
                              onInput={(e) => {
                                const input = e.currentTarget.value;
                                const regex = assetAmountRegex({
                                  precision: _backingPrecision,
                                });
                                if (regex.test(input)) {
                                  setIssueAmount(e.currentTarget.value);
                                }
                              }}
                            />
                            <Input
                              type="text"
                              value={`${res.backingAsset.symbol} (${res.backingAsset.id})`}
                              disabled
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <HoverInfo
                                content={t(
                                  "Predictions:issueDialog.existingContent"
                                )}
                                header={t(
                                  "Predictions:issueDialog.existingHeader"
                                )}
                                type="header"
                              />
                              <Input
                                type="text"
                                value={`${existingCollateral} ${res.backingAsset.symbol} (${res.backingAsset.id})`}
                                className="mt-1"
                                disabled
                              />
                            </div>
                            <div>
                              <HoverInfo
                                content={t(
                                  "Predictions:issueDialog.totalContent"
                                )}
                                header={t(
                                  "Predictions:issueDialog.totalHeader"
                                )}
                                type="header"
                              />
                              <Input
                                type="text"
                                value={`${existingCollateral + issueAmount} ${
                                  res.backingAsset.symbol
                                } (${res.backingAsset.id})`}
                                className="mt-1"
                                disabled
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              className="h-6 mt-1 w-1/2"
                              onClick={() => {
                                setIssueDialog(true);
                              }}
                            >
                              {t("Predictions:submit")}
                            </Button>
                            {issueAmount > humanReadableBackingAssetBalance ? (
                              <Badge variant="destructive">
                                <ExclamationTriangleIcon className="mr-2" />{" "}
                                {t("Predictions:insufficient_funds")}
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                        {issueDialog ? (
                          <DeepLinkDialog
                            operationNames={["call_order_update"]}
                            username={usr.username}
                            usrChain={usr.chain}
                            userID={usr.id}
                            dismissCallback={setIssueDialog}
                            key={`deeplink-dialog-${res.id}`}
                            headerText={t(
                              `Predictions:dialogContent.header_issue`
                            )}
                            trxJSON={[
                              {
                                funding_account: usr.id,
                                delta_collateral: {
                                  amount: blockchainFloat(
                                    existingCollateral + issueAmount,
                                    res.precision
                                  ),
                                  asset_id: res.id,
                                },
                                delta_debt: {
                                  amount: blockchainFloat(
                                    existingCollateral + issueAmount,
                                    _backingPrecision
                                  ),
                                  asset_id: _backingAssetID,
                                },
                                extensions: {},
                              },
                            ]}
                          />
                        ) : null}
                      </DialogContent>
                    </Dialog>
                    <Dialog
                      open={sellPrompt}
                      onOpenChange={(open) => {
                        setSellPrompt(open);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => {
                            setSellPrompt(true);
                          }}
                        >
                          {t(`Predictions:sell`)}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px] bg-slate-950 border-white/[0.08] text-white shadow-2xl shadow-black/40">
                        <DialogHeader>
                          <DialogTitle>
                            {t(`Predictions:sellDialog.title`)}
                          </DialogTitle>
                          <DialogDescription>
                            {t(`Predictions:sellDialog.description`)}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-1">
                          <HoverInfo
                            content={t("Predictions:sellDialog.qtyContent")}
                            header={t("Predictions:sellDialog.qtyHeader")}
                            type="header"
                          />
                          <Button
                            className="h-6 mt-1 ml-3 hover:shadow-md"
                            onClick={() => {
                              setSellAmount(
                                humanReadablePredictionMarketAssetBalance
                                  ? humanReadablePredictionMarketAssetBalance
                                  : 0
                              );
                            }}
                            variant="outline"
                          >
                            {t("Predictions:issueDialog.balance")}
                          </Button>
                          <Input
                            type="number"
                            value={sellAmount}
                            min={1}
                            step={1}
                            onInput={(e) => {
                              const input = e.currentTarget.value;
                              const regex = assetAmountRegex({
                                precision: res.precision,
                              });
                              if (regex.test(input)) {
                                setSellAmount(e.currentTarget.value);
                              }
                            }}
                            className="mt-1"
                          />
                          <Input
                            type="text"
                            value={`${res.symbol} (${res.id})`}
                            disabled
                            className="mt-1"
                          />
                          <div className="col-span-2">
                            <HoverInfo
                              content={t(
                                "Predictions:sellDialog.receivingContent"
                              )}
                              header={t(
                                "Predictions:sellDialog.receivingHeader"
                              )}
                              type="header"
                            />
                            <Input
                              type="number"
                              placeholder={`${sellAmount ?? 0} ${
                                res.backingAsset.symbol
                              } (${res.backingAsset.id})`}
                              disabled
                              className="mt-1 w-1/2"
                            />
                          </div>
                          <div className="col-span-2">
                            <HoverInfo
                              content={t(
                                "Predictions:sellDialog.expiryContent"
                              )}
                              header={t("Predictions:sellDialog.expiryHeader")}
                              type="header"
                            />
                            <Select
                              onValueChange={(selectedExpiry) => {
                                setExpiryType(selectedExpiry);
                                const oneHour = 60 * 60 * 1000;
                                const oneDay = 24 * oneHour;
                                if (
                                  selectedExpiry !== "specific" &&
                                  selectedExpiry !== "fkill"
                                ) {
                                  const now = new Date();
                                  let expiryDate;
                                  if (selectedExpiry === "1hr") {
                                    expiryDate = new Date(
                                      now.getTime() + oneHour
                                    );
                                  } else if (selectedExpiry === "12hr") {
                                    const duration = oneHour * 12;
                                    expiryDate = new Date(
                                      now.getTime() + duration
                                    );
                                  } else if (selectedExpiry === "24hr") {
                                    const duration = oneDay;
                                    expiryDate = new Date(
                                      now.getTime() + duration
                                    );
                                  } else if (selectedExpiry === "7d") {
                                    const duration = oneDay * 7;
                                    expiryDate = new Date(
                                      now.getTime() + duration
                                    );
                                  } else if (selectedExpiry === "30d") {
                                    const duration = oneDay * 30;
                                    expiryDate = new Date(
                                      now.getTime() + duration
                                    );
                                  }

                                  if (expiryDate) {
                                    setDate(expiryDate);
                                  }
                                  setExpiry(selectedExpiry);
                                } else if (selectedExpiry === "fkill") {
                                  const now = new Date();
                                  setExpiry(new Date(now.getTime() + oneDay));
                                } else if (selectedExpiry === "specific") {
                                  // Setting a default date expiry
                                  setExpiry();
                                }
                              }}
                            >
                              <SelectTrigger className="mb-3 mt-1 w-1/2">
                                <SelectValue placeholder="1hr" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-950 border-white/[0.08] shadow-2xl shadow-black/40">
                                <SelectItem value="1hr">
                                  {t("LimitOrderCard:expiry.1hr")}
                                </SelectItem>
                                <SelectItem value="12hr">
                                  {t("LimitOrderCard:expiry.12hr")}
                                </SelectItem>
                                <SelectItem value="24hr">
                                  {t("LimitOrderCard:expiry.24hr")}
                                </SelectItem>
                                <SelectItem value="7d">
                                  {t("LimitOrderCard:expiry.7d")}
                                </SelectItem>
                                <SelectItem value="30d">
                                  {t("LimitOrderCard:expiry.30d")}
                                </SelectItem>
                                <SelectItem value="specific">
                                  {t("LimitOrderCard:expiry.specific")}
                                </SelectItem>
                                <SelectItem value="fkill">
                                  {t("LimitOrderCard:expiry.fkill")}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            {expiryType === "specific" ? (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-[240px] justify-start text-left font-normal",
                                       !date && "text-white/40"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? (
                                      format(date, "PPP")
                                    ) : (
                                      <span>
                                        {t("LimitOrderCard:expiry.pickDate")}
                                      </span>
                                    )}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={(e) => {
                                      const parsedDate = new Date(e);
                                      const now = new Date();
                                      if (parsedDate < now) {
                                        //console.log("Not a valid date");
                                        setDate(
                                          new Date(
                                            Date.now() + 1 * 24 * 60 * 60 * 1000
                                          )
                                        );
                                        return;
                                      }
                                      //console.log("Setting expiry date");
                                      setDate(e);
                                    }}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            ) : null}
                            {expiryType === "fkill"
                              ? t("LimitOrderCard:expiry.fkillDescription")
                              : null}
                            {expiryType !== "specific" && expiryType !== "fkill"
                              ? t("LimitOrderCard:expiry.generalDescription", {
                                  expiryType,
                                })
                              : null}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            className="h-6 mt-1 w-1/2"
                            onClick={() => {
                              setSellDialog(true);
                            }}
                          >
                            {t("Predictions:submit")}
                          </Button>
                          {sellAmount >
                          humanReadablePredictionMarketAssetBalance ? (
                            <Badge variant="destructive">
                              <ExclamationTriangleIcon className="mr-2" />{" "}
                              {t("Predictions:insufficient_funds")}
                            </Badge>
                          ) : null}
                        </div>
                        {sellDialog ? ( // selling the PMA token in return for backing asset tokens
                          <DeepLinkDialog
                            operationNames={["limit_order_create"]}
                            username={usr.username}
                            usrChain={usr.chain}
                            userID={usr.id}
                            dismissCallback={setSellDialog}
                            key={`deeplink-selldialog-${res.id}`}
                            headerText={t(
                              `Predictions:dialogContent.header_sell`
                            )}
                            trxJSON={[
                              {
                                seller: usr.id,
                                amount_to_sell: {
                                  amount: blockchainFloat(
                                    sellAmount,
                                    res.precision
                                  ).toFixed(0),
                                  asset_id: res.id,
                                },
                                min_to_receive: {
                                  amount: blockchainFloat(
                                    sellAmount,
                                    _backingPrecision
                                  ).toFixed(0),
                                  asset_id: _backingAssetID,
                                },
                                expiration: date,
                                fill_or_kill:
                                  expiryType === "fkill" ? true : false,
                                extensions: {},
                              },
                            ]}
                          />
                        ) : null}
                      </DialogContent>
                    </Dialog>
                  </div>
                  <HoverInfo
                    content={t("Predictions:buyer_content")}
                    header={t("Predictions:buyer")}
                    type="header"
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <Dialog
                      open={buyPrompt}
                      onOpenChange={(open) => {
                        setBuyPrompt(open);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => {
                            setBuyPrompt(true);
                          }}
                        >
                          {t(`Predictions:buy`)}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px] bg-slate-950 border-white/[0.08] text-white shadow-2xl shadow-black/40">
                        <DialogHeader>
                          <DialogTitle>
                            {t(`Predictions:buyDialog.title`)}
                          </DialogTitle>
                          <DialogDescription>
                            {t(`Predictions:buyDialog.description`)}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-1 gap-2">
                          <div className="grid grid-cols-2 gap-2">
                            <HoverInfo
                              content={t("Predictions:issueDialog.qtyContent")}
                              header={t("Predictions:issueDialog.qtyHeader")}
                              type="header"
                            />
                            <Button
                              className="h-6 mt-1 ml-3 hover:shadow-md"
                              onClick={() => {
                                setBuyAmount(
                                  humanReadableBackingAssetBalance
                                    ? humanReadableBackingAssetBalance
                                    : 0
                                );
                              }}
                              variant="outline"
                            >
                              {t("Predictions:issueDialog.balance")}
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              type="number"
                              value={buyAmount}
                              min={1}
                              step={1}
                              onInput={(e) => {
                                const input = e.currentTarget.value;
                                const regex = assetAmountRegex({
                                  precision: res.precision,
                                });
                                if (regex.test(input)) {
                                  setBuyAmount(e.currentTarget.value);
                                }
                              }}
                            />
                            <Input
                              type="text"
                              value={`${res.backingAsset.symbol} (${res.backingAsset.id})`}
                              disabled
                            />
                          </div>
                          <div>
                            <HoverInfo
                              content={t(
                                "Predictions:issueDialog.receivingContent"
                              )}
                              header={t(
                                "Predictions:issueDialog.receivingHeader"
                              )}
                              type="header"
                            />
                            <div className="grid grid-cols-1 gap-2">
                              <Input
                                type="text"
                                value={`${buyAmount} ${res.symbol} (${res.id})`}
                                disabled
                                className="w-1/2"
                              />
                            </div>
                          </div>

                          <div>
                            <HoverInfo
                              content={t(
                                "Predictions:sellDialog.expiryContent"
                              )}
                              header={t("Predictions:sellDialog.expiryHeader")}
                              type="header"
                            />
                            <Select
                              onValueChange={(selectedExpiry) => {
                                setExpiryType(selectedExpiry);
                                const oneHour = 60 * 60 * 1000;
                                const oneDay = 24 * oneHour;
                                if (
                                  selectedExpiry !== "specific" &&
                                  selectedExpiry !== "fkill"
                                ) {
                                  const now = new Date();
                                  let expiryDate;
                                  if (selectedExpiry === "1hr") {
                                    expiryDate = new Date(
                                      now.getTime() + oneHour
                                    );
                                  } else if (selectedExpiry === "12hr") {
                                    const duration = oneHour * 12;
                                    expiryDate = new Date(
                                      now.getTime() + duration
                                    );
                                  } else if (selectedExpiry === "24hr") {
                                    const duration = oneDay;
                                    expiryDate = new Date(
                                      now.getTime() + duration
                                    );
                                  } else if (selectedExpiry === "7d") {
                                    const duration = oneDay * 7;
                                    expiryDate = new Date(
                                      now.getTime() + duration
                                    );
                                  } else if (selectedExpiry === "30d") {
                                    const duration = oneDay * 30;
                                    expiryDate = new Date(
                                      now.getTime() + duration
                                    );
                                  }

                                  if (expiryDate) {
                                    setDate(expiryDate);
                                  }
                                  setExpiry(selectedExpiry);
                                } else if (selectedExpiry === "fkill") {
                                  const now = new Date();
                                  setExpiry(new Date(now.getTime() + oneDay));
                                } else if (selectedExpiry === "specific") {
                                  // Setting a default date expiry
                                  setExpiry();
                                }
                              }}
                            >
                              <SelectTrigger className="mb-3 mt-1 w-1/2">
                                <SelectValue placeholder="1hr" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-950 border-white/[0.08] shadow-2xl shadow-black/40">
                                <SelectItem value="1hr">
                                  {t("LimitOrderCard:expiry.1hr")}
                                </SelectItem>
                                <SelectItem value="12hr">
                                  {t("LimitOrderCard:expiry.12hr")}
                                </SelectItem>
                                <SelectItem value="24hr">
                                  {t("LimitOrderCard:expiry.24hr")}
                                </SelectItem>
                                <SelectItem value="7d">
                                  {t("LimitOrderCard:expiry.7d")}
                                </SelectItem>
                                <SelectItem value="30d">
                                  {t("LimitOrderCard:expiry.30d")}
                                </SelectItem>
                                <SelectItem value="specific">
                                  {t("LimitOrderCard:expiry.specific")}
                                </SelectItem>
                                <SelectItem value="fkill">
                                  {t("LimitOrderCard:expiry.fkill")}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            {expiryType === "specific" ? (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-[240px] justify-start text-left font-normal",
                                       !date && "text-white/40"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? (
                                      format(date, "PPP")
                                    ) : (
                                      <span>
                                        {t("LimitOrderCard:expiry.pickDate")}
                                      </span>
                                    )}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={(e) => {
                                      const parsedDate = new Date(e);
                                      const now = new Date();
                                      if (parsedDate < now) {
                                        //console.log("Not a valid date");
                                        setDate(
                                          new Date(
                                            Date.now() + 1 * 24 * 60 * 60 * 1000
                                          )
                                        );
                                        return;
                                      }
                                      //console.log("Setting expiry date");
                                      setDate(e);
                                    }}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            ) : null}
                            {expiryType === "fkill"
                              ? t("LimitOrderCard:expiry.fkillDescription")
                              : null}
                            {expiryType !== "specific" && expiryType !== "fkill"
                              ? t("LimitOrderCard:expiry.generalDescription", {
                                  expiryType,
                                })
                              : null}
                          </div>
                        </div>

                        <div>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              className="h-6 mt-1 w-1/2"
                              onClick={() => {
                                setBuyDialog(true);
                              }}
                            >
                              {t("Predictions:submit")}
                            </Button>
                            {buyAmount > humanReadableBackingAssetBalance ? (
                              <Badge variant="destructive">
                                <ExclamationTriangleIcon className="mr-2" />{" "}
                                {t("Predictions:insufficient_funds")}
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                        {buyDialog ? ( // buying the PMA token in return for backing asset tokens
                          <DeepLinkDialog
                            operationNames={["limit_order_create"]}
                            username={usr.username}
                            usrChain={usr.chain}
                            userID={usr.id}
                            dismissCallback={setBuyDialog}
                            key={`deeplink-buydialog-${res.id}`}
                            headerText={t(
                              `Predictions:dialogContent.header_buy`
                            )}
                            trxJSON={[
                              {
                                seller: usr.id,
                                amount_to_sell: {
                                  amount: blockchainFloat(
                                    buyAmount,
                                    _backingPrecision
                                  ).toFixed(0),
                                  asset_id: _backingAssetID,
                                },
                                min_to_receive: {
                                  amount: blockchainFloat(
                                    buyAmount,
                                    res.precision
                                  ).toFixed(0),
                                  asset_id: res.id,
                                },
                                expiration: date,
                                fill_or_kill:
                                  expiryType === "fkill" ? true : false,
                                extensions: {},
                              },
                            ]}
                          />
                        ) : null}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ) : null}
              {rowView === "winners" ? (
                <div className="grid grid-cols-1 gap-3">
                  <div className="rounded-md border border-white/10 bg-white/5 p-3 text-sm">
                    <div className="font-medium text-white mb-1">
                      {t("Predictions:winner_header")}
                    </div>
                    <p className="text-white/50">
                      {t("Predictions:winner_content")}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <StatBlock
                      label={t("Predictions:prize_pool")}
                      help={t("Predictions:winner.settlementFund_help")}
                      value={
                        relevantBitassetData
                          ? `${humanReadableFloat(
                              relevantBitassetData.settlement_fund,
                              res.precision,
                            )} ${market}`
                          : `0 ${market}`
                      }
                      mono
                    />
                    <StatBlock
                      label={t("Predictions:winner.yourPmaBalance")}
                      help={t("Predictions:winner.yourPmaBalance_help")}
                      value={`${humanReadablePredictionMarketAssetBalance} ${symbol}`}
                      mono
                    />
                  </div>
                  <div className="flex justify-start">
                    <Dialog
                      open={claimPrompt}
                      onOpenChange={(open) => {
                        setClaimPrompt(open);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => {
                            setClaimPrompt(true);
                          }}
                          disabled={
                            !humanReadablePredictionMarketAssetBalance ||
                            humanReadablePredictionMarketAssetBalance <= 0
                          }
                        >
                          {t(`Predictions:winner_claim`)}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px] bg-slate-950 border-white/[0.08] text-white shadow-2xl shadow-black/40">
                        <DialogHeader>
                          <DialogTitle>
                            {t(`Predictions:winner_claim`)}
                          </DialogTitle>
                          <DialogDescription>
                            {t(`Predictions:winner_content`)}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-1 gap-2">
                          <div className="grid grid-cols-2 gap-2">
                            <HoverInfo
                              content={t("Predictions:claimDialog.qtyContent")}
                              header={t("Predictions:claimDialog.qtyHeader")}
                              type="header"
                            />
                            <Button
                              className="h-6 mt-1 ml-3 hover:shadow-md"
                              onClick={() => {
                                setClaimAmount(
                                  humanReadableFloat(
                                    relevantBitassetData.settlement_fund,
                                    res.precision
                                  )
                                );
                              }}
                              variant="outline"
                            >
                              {t("Predictions:issueDialog.balance")}
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              type="number"
                              value={claimAmount}
                              min={1}
                              step={1}
                              onInput={(e) => {
                                const input = e.currentTarget.value;
                                const regex = assetAmountRegex({
                                  precision: res.precision,
                                });
                                if (regex.test(input)) {
                                  setClaimAmount(e.currentTarget.value);
                                }
                              }}
                            />
                            <Input
                              type="text"
                              value={`${res.symbol} (${res.id})`}
                              disabled
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              className="h-6 mt-1 w-1/2"
                              onClick={() => {
                                setClaimDialog(true);
                              }}
                            >
                              {t("Predictions:submit")}
                            </Button>
                            {claimAmount >
                            humanReadablePredictionMarketAssetBalance ? (
                              <Badge variant="destructive">
                                <ExclamationTriangleIcon className="mr-2" />{" "}
                                {t("Predictions:insufficient_funds")}
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                        {claimDialog ? (
                          <DeepLinkDialog
                            operationNames={["asset_settle"]}
                            username={usr.username}
                            usrChain={usr.chain}
                            userID={usr.id}
                            dismissCallback={setClaimDialog}
                            key={`deeplink-claimdialog-${res.id}`}
                            headerText={t(
                              `Predictions:dialogContent.header_claim`
                            )}
                            trxJSON={[
                              {
                                account: usr.id,
                                amount: {
                                  amount: blockchainFloat(
                                    claimAmount,
                                    res.precision
                                  ).toFixed(0),
                                  asset_id: res.id,
                                },
                                extensions: {},
                              },
                            ]}
                          />
                        ) : null}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ) : null}
              {rowView === "admin" ? (
                <div className="grid grid-cols-1 gap-2">
                  <HoverInfo
                    content={t("Predictions:admin_content")}
                    header={t("Predictions:admin")}
                    type="header"
                  />
                  <div className="grid grid-cols-3 gap-3 mt-1">
                    {!expiredPMAs.find((x) => x.id === res.id) ? (
                      <HoverCard>
                        <HoverCardTrigger>
                          <Button disabled>{t(`Predictions:resolve`)}</Button>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80 mt-1 bg-slate-950 border-white/[0.08] text-white z-[9999]" align="start">
                          <p className="leading-6 text-sm [&:not(:first-child)]:mt-1">
                            {t("Predictions:not_expired")}
                            <br />
                            {t("Predictions:time_till_expiration", {
                              hours: expirationHours,
                            })}
                          </p>
                        </HoverCardContent>
                      </HoverCard>
                    ) : (
                      <Dialog
                        open={resolvePrompt}
                        onOpenChange={(open) => {
                          setResolvePrompt(open);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            onClick={() => {
                              setResolvePrompt(true);
                            }}
                          >
                            {t(`Predictions:resolve`)}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px] bg-slate-950 border-white/[0.08] text-white shadow-2xl shadow-black/40">
                          <DialogHeader>
                            <DialogTitle>
                              {t(`Predictions:resolveDialog.title`)}
                            </DialogTitle>
                            <DialogDescription>
                              {t(`Predictions:resolveDialog.description`)}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid grid-cols-1 gap-2">
                            <b>{t("Predictions:prediction")}</b>
                            <Textarea
                              placeholder={cleanedPrediction}
                              value={cleanedPrediction}
                              disabled={true}
                              className="max-h-[80px] mt-1"
                            />
                            <div>
                              <b>
                                {t(
                                  `Predictions:${
                                    expirationHours >= 0
                                      ? "expiration"
                                      : "expired_at"
                                  }`
                                )}
                              </b>
                              : {prettifyDate(expiration)}
                            </div>
                            {expirationHours >= 0 ? (
                              <>
                                {t("Predictions:time_till_expiration", {
                                  hours: expirationHours,
                                })}
                                <br />
                              </>
                            ) : null}
                            <HoverInfo
                              content={t(
                                "Predictions:resolveDialog.outcomeContent"
                              )}
                              header={t(
                                "Predictions:resolveDialog.outcomeHeader"
                              )}
                              type="header"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <RadioGroup
                                defaultValue={chosenOutcome ?? ""}
                                onClick={(e) => {
                                  const value = e.target.value;
                                  if (value) {
                                    setChosenOutcome(value);
                                  }
                                }}
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="1" id="1" />
                                  <Label htmlFor="1">
                                    {t("Predictions:outcome.yes")}
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="2" id="2" />
                                  <Label htmlFor="2">
                                    {t("Predictions:outcome.no")}
                                  </Label>
                                </div>
                              </RadioGroup>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                className="h-6 mt-1 w-1/2"
                                onClick={() => {
                                  setResolveDialog(true);
                                }}
                              >
                                {t("Predictions:submit")}
                              </Button>
                            </div>
                          </div>
                          {resolveDialog && chosenOutcome ? (
                            <DeepLinkDialog
                              operationNames={["asset_global_settle"]}
                              username={usr.username}
                              usrChain={usr.chain}
                              userID={usr.id}
                              dismissCallback={setResolveDialog}
                              key={`deeplink-resolvedialog-${res.id}`}
                              headerText={t(
                                `Predictions:dialogContent.header_resolve`
                              )}
                              trxJSON={[
                                {
                                  issuer: usr.id,
                                  asset_to_settle: res.id,
                                  settle_price: {
                                    base: {
                                      amount: 1, // 1 indicates prediction has been resolved
                                      asset_id: res.id,
                                    },
                                    quote: {
                                      amount:
                                        chosenOutcome === "1"
                                          ? 1 // true
                                          : 0, // false
                                      asset_id: _backingAssetID,
                                    },
                                  },
                                  extensions: {},
                                },
                              ]}
                            />
                          ) : null}
                        </DialogContent>
                      </Dialog>
                    )}
                    <Dialog
                      open={pricefeederPrompt}
                      onOpenChange={(open) => {
                        setPricefeederPrompt(open);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => {
                            setPricefeederPrompt(true);
                          }}
                        >
                          {t(`Predictions:pricefeeder`)}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px] bg-slate-950 border-white/[0.08] text-white shadow-2xl shadow-black/40">
                        <DialogHeader>
                          <DialogTitle>
                            {t(`Predictions:priceFeederDialog.title`)}
                          </DialogTitle>
                          <DialogDescription>
                            {t(`Predictions:priceFeederDialog.description`)}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-1 gap-2">
                          <HoverInfo
                            content={t(
                              "Predictions:priceFeederDialog.priceFeedersContent"
                            )}
                            header={t(
                              "Predictions:priceFeederDialog.priceFeedersHeader"
                            )}
                            type="header"
                          />
                          <div className="grid grid-cols-12 mt-1">
                            <span className="col-span-9 border border-white/[0.08] rounded-lg overflow-hidden">
                              <div className="w-full max-h-[210px] overflow-auto">
                                <List
                                  rowComponent={pricefeederRow}
                                  rowCount={priceFeeders.length}
                                  rowHeight={100}
                                  rowProps={{}}
                                />
                              </div>
                            </span>
                            <span className="col-span-3 ml-3 text-center">
                              <Dialog
                                open={priceSearchDialog}
                                onOpenChange={(open) => {
                                  setPriceSearchDialog(open);
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="ml-3 mt-1"
                                  >
                                    ➕ {t("Favourites:addUser")}
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[375px] bg-slate-950 border-white/[0.08] text-white shadow-2xl shadow-black/40">
                                  <DialogHeader>
                                    <DialogTitle>
                                      {!usr || !usr.chain
                                        ? t("Transfer:bitsharesAccountSearch")
                                        : null}
                                      {usr && usr.chain === "bitshares"
                                        ? t(
                                            "Transfer:bitsharesAccountSearchBTS"
                                          )
                                        : null}
                                      {usr && usr.chain !== "bitshares"
                                        ? t(
                                            "Transfer:bitsharesAccountSearchTEST"
                                          )
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
                                        !priceFeeders.find(
                                          (_usr) => _usr.id === _account.id
                                        )
                                      ) {
                                        setPriceFeeders(
                                          priceFeeders && priceFeeders.length
                                            ? [...priceFeeders, _account]
                                            : [_account]
                                        );
                                      }
                                      setPriceSearchDialog(false);
                                    }}
                                  />
                                </DialogContent>
                              </Dialog>
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              className="h-6 mt-1 w-1/2"
                              onClick={() => {
                                setPricefeederDialog(true);
                              }}
                            >
                              {t("Predictions:submit")}
                            </Button>
                          </div>
                        </div>
                        {pricefeederDialog ? (
                          <DeepLinkDialog
                            operationNames={["asset_update_feed_producers"]}
                            username={usr.username}
                            usrChain={usr.chain}
                            userID={usr.id}
                            dismissCallback={setPricefeederDialog}
                            key={`deeplink-pricefeeddialog-${res.id}`}
                            headerText={t(
                              `Predictions:dialogContent.header_pricefeeder`
                            )}
                            trxJSON={[
                              {
                                issuer: usr.id,
                                asset_to_update: res.id,
                                new_feed_producers: priceFeeders.map(
                                  (_usr) => _usr.id
                                ),
                              },
                            ]}
                          />
                        ) : null}
                      </DialogContent>
                    </Dialog>
                  </div>
                  <HoverInfo
                    content={t("Predictions:feeder_content")}
                    header={t("Predictions:price_feeders")}
                    type="header"
                  />
                  <div className="grid grid-cols-3 gap-3 mt-1">
                    <Dialog
                      open={priceFeedPrompt}
                      onOpenChange={(open) => {
                        setPriceFeedPrompt(open);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => {
                            setPriceFeedPrompt(true);
                          }}
                        >
                          {t(`Predictions:feed`)}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px] bg-slate-950 border-white/[0.08] text-white shadow-2xl shadow-black/40">
                        <DialogHeader>
                          <DialogTitle>
                            {t(`Predictions:feederDialog.title`)}
                          </DialogTitle>
                          <DialogDescription>
                            {t(`Predictions:feederDialog.description`)}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-1 gap-2">
                          <HoverInfo
                            content={t(
                              "Predictions:resolveDialog.outcomeContent"
                            )}
                            header={t(
                              "Predictions:resolveDialog.outcomeHeader"
                            )}
                            type="header"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <RadioGroup
                              defaultValue={priceFeedOutcome ?? ""}
                              onClick={(e) => {
                                const value = e.target.value;
                                if (value) {
                                  setPriceFeedOutcome(value);
                                }
                              }}
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="1" id="1" />
                                <Label htmlFor="1">
                                  {t("Predictions:outcome.yes")}
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="2" id="2" />
                                <Label htmlFor="2">
                                  {t("Predictions:outcome.no")}
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              className="h-6 mt-1 w-1/2"
                              onClick={() => {
                                setPriceFeedDialog(true);
                              }}
                            >
                              {t("Predictions:submit")}
                            </Button>
                          </div>
                          {priceFeedDialog && priceFeedOutcome ? (
                            <DeepLinkDialog // feeding the price of the prediction market asset (witness || committee || private price feeder)
                              operationNames={["asset_publish_feed"]}
                              username={usr.username}
                              usrChain={usr.chain}
                              userID={usr.id}
                              dismissCallback={setPriceFeedDialog}
                              key={`deeplink-feedpricedialog-${res.id}`}
                              headerText={t(
                                `Predictions:dialogContent.header_feedprice`
                              )}
                              trxJSON={[
                                {
                                  publisher: usr.id,
                                  asset_id: res.id,
                                  feed: {
                                    settlement_price: {
                                      base: {
                                        amount: 1, // 1 indicates prediction has been resolved
                                        asset_id: res.id,
                                      },
                                      quote: {
                                        amount:
                                          priceFeedOutcome === "1"
                                            ? 1 // true
                                            : 0, // false
                                        asset_id: _backingAssetID,
                                      },
                                    },
                                    maintenance_collateral_ratio: 100,
                                    maximum_short_squeeze_ratio: 100,
                                    core_exchange_rate: {
                                      base: {
                                        amount: 1, // 1 indicates prediction has been resolved
                                        asset_id: res.id,
                                      },
                                      quote: {
                                        amount:
                                          priceFeedOutcome === "1"
                                            ? 1 // true
                                            : 0, // false
                                        asset_id: _backingAssetID,
                                      },
                                    },
                                  },
                                  extensions: {},
                                },
                              ]}
                            />
                          ) : null}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ) : null}
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
  PredictionRow.displayName = "PredictionRow";

  return (
    <div className="container mx-auto mt-5 mb-5 text-white">
      <div className="grid grid-cols-1 gap-3">
        <Card className={cn("bg-slate-900/60 border-white/[0.08] shadow-lg shadow-black/20 backdrop-blur-sm", currentView.border && `border-l-2 ${currentView.border}`)}>
          <CardHeader className="pb-1">
            <CardTitle className="text-white flex items-center gap-2">
              <span className={cn("flex items-center justify-center w-7 h-7 rounded-lg", currentView.bg)}>
                <currentView.icon className={cn("w-4 h-4", currentView.color)} />
              </span>
              {t(`Predictions:card.title.${view}`)}
              {issuerFilter ? (
                <button
                  type="button"
                  onClick={() => setIssuerFilter(null)}
                  className="ml-auto inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-400 hover:bg-amber-500/20 transition-colors"
                >
                  <XIcon className="h-3 w-3" />
                  {t("Predictions:list.clearFilter")}
                </button>
              ) : null}
            </CardTitle>
            <CardDescription className="text-white/50">
              {pageStats
                ? `${t("Predictions:card.showing", { primary: pageStats.primary })}${pageStats.secondary
                    .map((s) =>
                      t("Predictions:card.stat", { value: s.value, label: s.label }),
                    )
                    .join(" · ")}`
                : t(`Predictions:card.description.${view}`)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!hasLoadedPmas ? (
              <div className="grid grid-cols-1 gap-2 mt-3">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={`skeleton-${i}`} className="h-[120px] w-full bg-white/10" />
                ))}
              </div>
            ) : null}

            {hasLoadedPmas && chosenPMAs && chosenPMAs.length ? (
              <div className="grid grid-cols-1 gap-3 mt-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative flex-1 min-w-[200px]">
                    <MagnifyingGlassIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40 pointer-events-none" />
                    <Input
                      type="text"
                      value={searchInput}
                      onChange={onSearchInput}
                      placeholder={t("Predictions:list.searchPlaceholder")}
                      className="pl-7 h-8 text-sm bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30"
                    />
                    {searchInput ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchInput("");
                          setSearchQuery("");
                        }}
                        className="absolute right-1 top-1/2 -translate-y-1/2 p-1 hover:text-white text-white/40"
                        aria-label="Clear"
                      >
                        <XIcon className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                  </div>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="h-8 w-[160px] text-xs bg-white/[0.03] border-white/[0.08] text-white/70">
                      <ArrowUpDown className="mr-1.5 h-3.5 w-3.5" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-white/[0.08] shadow-2xl shadow-black/40">
                      <SelectItem value="newest">
                        {t("Predictions:list.sort.newest")}
                      </SelectItem>
                      <SelectItem value="expiring">
                        {t("Predictions:list.sort.expiring")}
                      </SelectItem>
                      <SelectItem value="volume">
                        {t("Predictions:list.sort.volume")}
                      </SelectItem>
                      <SelectItem value="alpha">
                        {t("Predictions:list.sort.alpha")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {view === "active" ? (
                    <Select value={filterBy} onValueChange={setFilterBy}>
                      <SelectTrigger className="h-8 w-[160px] text-xs bg-white/[0.03] border-white/[0.08] text-white/70">
                        <Filter className="mr-1.5 h-3.5 w-3.5" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-950 border-white/[0.08] shadow-2xl shadow-black/40">
                        <SelectItem value="all">
                          {t("Predictions:list.filter.all")}
                        </SelectItem>
                        <SelectItem value="closing-soon">
                          {t("Predictions:list.filter.closingSoon")}
                        </SelectItem>
                        <SelectItem value="new">
                          {t("Predictions:list.filter.new")}
                        </SelectItem>
                        <SelectItem value="high-volume">
                          {t("Predictions:list.filter.highVolume")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  ) : null}
                </div>

                {sortedFilteredPMAs && sortedFilteredPMAs.length ? (
                  <div
                    className="w-full max-h-[60vh] md:max-h-[70vh] overflow-auto pr-1"
                    key={`list-${view}-${sortBy}-${filterBy}-${searchQuery}`}
                  >
                    <div className="grid grid-cols-1 gap-3 pb-2">
                      {sortedFilteredPMAs.map((res) => (
                        <PredictionRow key={res.id} res={res} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center mt-5 text-sm text-white/40 italic">
                    {t("Predictions:list.noResults")}
                  </div>
                )}
              </div>
            ) : null}

            {hasLoadedPmas && chosenPMAs && !chosenPMAs.length && view === "active" ? (
              <Empty className="mt-5 border-white/[0.06]">
                <EmptyHeader>
                  <EmptyMedia variant="icon" className={cn(currentView.bg, currentView.color)}><currentView.icon className="w-6 h-6" /></EmptyMedia>
                  <EmptyTitle className="text-white/80">{t("Predictions:card.emptyActive")}</EmptyTitle>
                </EmptyHeader>
                <EmptyContent>
                  <a href="/create_prediction/index.html">
                    <Button className="bg-violet-600 hover:bg-violet-500 text-white">{t("PageHeader:createPrediction")}</Button>
                  </a>
                </EmptyContent>
              </Empty>
            ) : null}
            {hasLoadedPmas && chosenPMAs && !chosenPMAs.length && view === "mine" ? (
              <Empty className="mt-5 border-white/[0.06]">
                <EmptyHeader>
                  <EmptyMedia variant="icon" className={cn(currentView.bg, currentView.color)}><currentView.icon className="w-6 h-6" /></EmptyMedia>
                  <EmptyTitle className="text-white/80">{t("Predictions:card.emptyMine")}</EmptyTitle>
                </EmptyHeader>
                <EmptyContent>
                  <a href="/create_prediction/index.html">
                    <Button className="bg-violet-600 hover:bg-violet-500 text-white">{t("PageHeader:createPrediction")}</Button>
                  </a>
                </EmptyContent>
              </Empty>
            ) : null}
            {hasLoadedPmas && chosenPMAs && !chosenPMAs.length && view === "portfolio" ? (
              <div className="text-center mt-5">
                <span className={cn("inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3", currentView.bg)}>
                  <currentView.icon className={cn("w-5 h-5", currentView.color)} />
                </span>
                <div className="text-white/50 text-sm">{t("Predictions:card.emptyPortfolio")}</div>
              </div>
            ) : null}
            {hasLoadedPmas && chosenPMAs && !chosenPMAs.length && view === "margin" ? (
              <div className="text-center mt-5">
                <span className={cn("inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3", currentView.bg)}>
                  <currentView.icon className={cn("w-5 h-5", currentView.color)} />
                </span>
                <div className="text-white/50 text-sm">{t("Predictions:card.emptyMargin")}</div>
              </div>
            ) : null}
            {hasLoadedPmas && chosenPMAs && !chosenPMAs.length && view === "expired" ? (
              <div className="text-center mt-5">
                <span className={cn("inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3", currentView.bg)}>
                  <currentView.icon className={cn("w-5 h-5", currentView.color)} />
                </span>
                <div className="text-white/50 text-sm">{t("Predictions:card.emptyExpired")}</div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
