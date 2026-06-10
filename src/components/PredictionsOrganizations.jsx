import React, {
  useSyncExternalStore,
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
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { $currentUser } from "@/stores/users.ts";
import { $currentNode } from "@/stores/node.ts";
import { useInitCache } from "@/nanoeffects/Init.ts";
import {
  createEveryObjectStore,
  createObjectStore,
} from "@/nanoeffects/Objects.ts";

import { humanReadableFloat, debounce } from "@/lib/common.js";
import { Avatar } from "./Avatar.tsx";

function StatBlock({ label, value, mono, accent }) {
  const accentColors = {
    emerald: "text-emerald-400",
    rose: "text-rose-400",
    cyan: "text-cyan-400",
    amber: "text-amber-400",
  };
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-2.5">
      <div className="text-[11px] uppercase tracking-wide text-white/50 mb-1">
        {label}
      </div>
      <div
        className={cn(
          "text-sm font-medium break-words",
          mono && "font-mono",
          accent ? accentColors[accent] || "text-white" : "text-white",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function OrganizationCard({ org, pmaCounts, t, usr }) {
  const symbol = org.symbol;
  const isOwner = usr && usr.id && org.issuer === usr.id;
  const desc = (() => {
    try {
      return JSON.parse(org.options?.description || "{}");
    } catch {
      return {};
    }
  })();
  const pmo = desc.pmo_object;
  if (!pmo) return null;

  return (
    <Card className="bg-slate-900/80 border-white/[0.08] shadow-md shadow-black/20 hover:shadow-xl hover:shadow-black/30 transition-all hover:-translate-y-0.5 border-l-4 border-l-cyan-500">
      <CardHeader className="pb-2 pt-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-cyan-400 flex-shrink-0" />
              {pmo.name || symbol}
            </CardTitle>
            <CardDescription className="text-xs text-white/50 mt-1 font-mono">
              {symbol}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {pmaCounts.active > 0 ? (
              <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                {pmaCounts.active} {t("PredictionsOrganizations:active")}
              </Badge>
            ) : null}
            {pmaCounts.expired > 0 ? (
              <Badge variant="outline" className="text-[10px] border-white/20 text-white/50 bg-white/5">
                {pmaCounts.expired} {t("PredictionsOrganizations:expired")}
              </Badge>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="text-sm pb-3 text-white/70">
        <div className="grid grid-cols-1 gap-2">
          {pmo.website ? (
            <div className="flex items-center gap-2 text-xs">
              <Globe className="h-3.5 w-3.5 text-cyan-400 flex-shrink-0" />
              <a
                href={pmo.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline truncate"
              >
                {pmo.website}
              </a>
            </div>
          ) : null}
          {pmo.manifest ? (
            <div className="flex items-center gap-2 text-xs">
              <FileText className="h-3.5 w-3.5 text-cyan-400 flex-shrink-0" />
              <a
                href={pmo.manifest}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline truncate"
              >
                {pmo.manifest}
              </a>
            </div>
          ) : null}
          {pmo.resolution_policy ? (
            <div className="text-xs text-white/60 line-clamp-2">
              <span className="text-white/40 uppercase tracking-wide text-[10px]">
                {t("PredictionsOrganizations:resolutionPolicy")}:{" "}
              </span>
              {pmo.resolution_policy}
            </div>
          ) : null}
          {pmo.dispute_mechanism ? (
            <div className="text-xs text-white/60 line-clamp-2">
              <span className="text-white/40 uppercase tracking-wide text-[10px]">
                {t("PredictionsOrganizations:disputeMechanism")}:{" "}
              </span>
              {pmo.dispute_mechanism}
            </div>
          ) : null}
          {pmo.onchain_account ? (
            <div className="text-xs text-white/40 font-mono">
              {pmo.onchain_account}
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2 mt-1">
            <a
              href={`/active-predictions/index.html?search=${symbol}.`}
              className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              {t("PredictionsOrganizations:viewActive")}
            </a>
            <a
              href={`/expired-predictions/index.html?search=${symbol}.`}
              className="inline-flex items-center gap-1 text-xs text-white/50 hover:text-white/70 hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              {t("PredictionsOrganizations:viewExpired")}
            </a>
            {isOwner ? (
              <>
                <a
                  href={`/create_pma_org/index.html?asset_update=${symbol}`}
                  className="inline-flex items-center gap-1 text-xs text-amber-400 hover:underline"
                >
                  <Pen className="h-3 w-3" />
                  {t("PredictionsOrganizations:editOrg")}
                </a>
                <a
                  href={`/create_prediction/index.html?org=${symbol}`}
                  className="inline-flex items-center gap-1 text-xs text-fuchsia-400 hover:underline"
                >
                  <Plus className="h-3 w-3" />
                  {t("PredictionsOrganizations:createPrediction")}
                </a>
              </>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PredictionsOrganizations(properties) {
  const usr = useStore($currentUser);
  const currentNode = useStore($currentNode);

  const { _assetsBTS, _assetsTEST } = properties;

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

  const [hasLoaded, setHasLoaded] = useState(false);
  useEffect(() => {
    if (combinedAssets && combinedAssets.length) {
      setHasLoaded(true);
    }
  }, [combinedAssets]);

  const organizations = useMemo(() => {
    if (!combinedAssets || !combinedAssets.length) return [];
    return combinedAssets.filter((a) => {
      if (!a?.options?.description) return false;
      try {
        const d = JSON.parse(a.options.description);
        return d && d.pmo_object;
      } catch {
        return false;
      }
    });
  }, [combinedAssets]);

  const pmaCounts = useMemo(() => {
    const counts = {};
    const pmas = combinedAssets.filter(
      (x) =>
        (x.hasOwnProperty("prediction_market") && x.prediction_market === true) ||
        (!x.hasOwnProperty("prediction_market") && x.bitasset_data_id),
    );
    for (const org of organizations) {
      const prefix = org.symbol;
      let active = 0;
      let expired = 0;
      for (const pma of pmas) {
        if (pma.symbol && pma.symbol.startsWith(prefix + ".")) {
          const desc = (() => {
            try {
              return JSON.parse(pma.options?.description || "{}");
            } catch {
              return {};
            }
          })();
          if (desc.expiry && new Date(desc.expiry) <= new Date()) {
            expired++;
          } else {
            active++;
          }
        }
      }
      counts[org.symbol] = { active, expired, total: active + expired };
    }
    return counts;
  }, [organizations, combinedAssets]);

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
        if (pmo?.name && pmo.name.toLowerCase().includes(q)) return true;
        if (pmo?.website && pmo.website.toLowerCase().includes(q)) return true;
        return false;
      });
    }

    result = [...result].sort((a, b) => {
      const aCounts = pmaCounts[a.symbol] || { total: 0 };
      const bCounts = pmaCounts[b.symbol] || { total: 0 };
      if (sortBy === "alpha") return a.symbol.localeCompare(b.symbol);
      if (sortBy === "pmaCount") return bCounts.total - aCounts.total;
      if (sortBy === "newest") {
        return (
          new Date(b.creation_time || 0) - new Date(a.creation_time || 0)
        );
      }
      return 0;
    });

    return result;
  }, [organizations, searchQuery, sortBy, pmaCounts]);

  return (
    <div className="container mx-auto mt-5 mb-5 text-white">
      <div className="grid grid-cols-1 gap-3">
        <Card className="bg-slate-900/60 border-white/[0.08] shadow-lg shadow-black/20 backdrop-blur-sm border-l-2 border-l-cyan-500">
          <CardHeader className="pb-1">
            <CardTitle className="text-white flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-cyan-500/15">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
              </span>
              {t("PredictionsOrganizations:title")}
            </CardTitle>
            <CardDescription className="text-white/50">
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
              <div className="grid grid-cols-1 gap-2 mt-3">
                {[0, 1, 2].map((i) => (
                  <Skeleton
                    key={`skeleton-${i}`}
                    className="h-[120px] w-full bg-white/10"
                  />
                ))}
              </div>
            ) : null}

            {hasLoaded && filteredOrgs && filteredOrgs.length ? (
              <div className="grid grid-cols-1 gap-3 mt-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40 pointer-events-none" />
                    <Input
                      type="text"
                      value={searchInput}
                      onChange={onSearchInput}
                      placeholder={t(
                        "PredictionsOrganizations:searchPlaceholder",
                      )}
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
                        pmaCounts={pmaCounts[org.symbol] || { active: 0, expired: 0, total: 0 }}
                        t={t}
                        usr={usr}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {hasLoaded && filteredOrgs && !filteredOrgs.length ? (
              <Empty className="mt-5 border-white/[0.06]">
                <EmptyHeader>
                  <EmptyMedia
                    variant="icon"
                    className="bg-cyan-500/15 text-cyan-400"
                  >
                    <ShieldCheck className="w-6 h-6" />
                  </EmptyMedia>
                  <EmptyTitle className="text-white/80">
                    {t("PredictionsOrganizations:empty")}
                  </EmptyTitle>
                </EmptyHeader>
                <EmptyContent>
                  <a href="/create_pma_org/index.html">
                    <Button className="bg-cyan-600 hover:bg-cyan-500 text-white">
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
