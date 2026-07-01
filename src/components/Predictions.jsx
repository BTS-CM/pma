import React, {
  useSyncExternalStore,
  useMemo,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useStore } from "@nanostores/react";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex as toHex, utf8ToBytes } from "@noble/hashes/utils.js";
import {
  Filter,
  ArrowUpDown,
  X as XIcon,
  Activity,
  Hourglass,
  BookOpen,
  Briefcase,
  TrendingUp,
} from "lucide-react";
import { List } from "react-window";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

import { useTranslation } from "react-i18next";
import { i18n as i18nInstance, locale } from "@/lib/i18n.js";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
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

import { $currentUser } from "@/stores/users.ts";
import {
  $blockList,
  $userBlockList,
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
  debounce,
} from "@/lib/common.js";

import { PredictionRow } from "./predictions/components/prediction-row/index.jsx";

export default function Predictions(properties) {
  const { t } = useTranslation(locale.get(), { i18n: i18nInstance });
  const usr = useSyncExternalStore(
    $currentUser.subscribe,
    $currentUser.get,
    () => true,
  );
  const blocklist = useSyncExternalStore(
    $blockList.subscribe,
    $blockList.get,
    () => true,
  );
  const userBlockList = useSyncExternalStore(
    $userBlockList.subscribe,
    $userBlockList.get,
    () => true,
  );
  const currentNode = useStore($currentNode);
  const visuals = useStore($visualSettings);

  const view = properties.view || "active";
  const VIEW_CONFIG = {
    active: {
      icon: Activity,
      color: "text-cyan-400",
      bg: "bg-cyan-500/15",
      border: "border-cyan-500/30",
    },
    expired: {
      icon: Hourglass,
      color: "text-sky-400",
      bg: "bg-sky-500/15",
      border: "border-sky-500/30",
    },
    mine: {
      icon: BookOpen,
      color: "text-emerald-400",
      bg: "bg-emerald-500/15",
      border: "border-emerald-500/30",
    },
    portfolio: {
      icon: Briefcase,
      color: "text-fuchsia-400",
      bg: "bg-fuchsia-500/15",
      border: "border-fuchsia-500/30",
    },
    margin: {
      icon: TrendingUp,
      color: "text-amber-400",
      bg: "bg-amber-500/15",
      border: "border-amber-500/30",
    },
  };
  const currentView = VIEW_CONFIG[view] || VIEW_CONFIG.active;

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

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


  //const [searchInput, setSearchInput] = useState("");
  //const [searchQuery, setSearchQuery] = useState("");

  const [searchInput, setSearchInput] = useState(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(window.location.search);
    return params.get("search") || "";
  });

  const [searchQuery, setSearchQuery] = useState(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(window.location.search);
    return params.get("search") || "";
  });

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

  const userBlockedIDs = useMemo(() => {
    if (!userBlockList || !_chain) return new Set();
    const chainList = userBlockList[_chain];
    if (!chainList || !chainList.length) return new Set();
    return new Set(chainList.map((u) => u.id));
  }, [userBlockList, _chain]);

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

  const predictionMarketAssets = useMemo(() => {
    if (!_chain || !combinedAssets || !combinedAssets.length) {
      return [];
    }

    let _predictionMarketAssets = combinedAssets.filter((x) => x.bitasset_data_id);

    if (_chain === "bitshares" && _predictionMarketAssets.length) {
      _predictionMarketAssets = _predictionMarketAssets.filter(
        (x) => !blocklist.users.includes(toHex(sha256(utf8ToBytes(x.issuer)))),
      );
    }

    return _predictionMarketAssets;
  }, [_chain, combinedAssets]);

  const [pmaProcessedData, setPmaProcessedData] = useState([]);
  const [hasLoadedPmas, setHasLoadedPmas] = useState(false);
  const [fetchingPmas, setFetchingPmas] = useState(true);
  const queriedStoreRef = useRef(false);
  const [dynamicAssetDataById, setDynamicAssetDataById] = useState({});

  const predictionMarketAssetsCount = predictionMarketAssets?.length || 0;
  const assetsCount = assets?.length || 0;
  const currentNodeReady = !!(currentNode && currentNode.url);

  useEffect(() => {
    if (predictionMarketAssetsCount > 0 && currentNodeReady) {
      queriedStoreRef.current = true;
      let cancelled = false;
      let unsubscribePma = null;
      setFetchingPmas(true);

      async function fetching() {
        const _store = createObjectStore([
          _chain,
          JSON.stringify(predictionMarketAssets.map((x) => x.id)),
          currentNode.url,
        ]);

        unsubscribePma = _store.subscribe(({ data, error, loading }) => {
          if (cancelled) return;
          if (data && !error && !loading) {
            console.log(`[PMA:Objects] received ${data.length} objects, first id=${data[0]?.id}, last id=${data[data.length-1]?.id}`);
            const now = new Date();
            const processedData = data
              .map((x) => {
                let description;
                try {
                  description = JSON.parse(x.options?.description || "{}");
                } catch {
                  return;
                }

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
                (a, b) =>
                  new Date(b.creation_time) - new Date(a.creation_time),
              );
            setPmaProcessedData(processedData);
            setHasLoadedPmas(true);
            setFetchingPmas(false);
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
    } else if (
      queriedStoreRef.current &&
      predictionMarketAssetsCount === 0 &&
      currentNodeReady &&
      assetsCount > 0
    ) {
      setHasLoadedPmas(true);
      setFetchingPmas(false);
    }
  }, [predictionMarketAssetsCount, currentNodeReady, assetsCount]);

  const [parentOrgAssets, setParentOrgAssets] = useState({});
  useEffect(() => {
    if (!pmaProcessedData?.length || !combinedAssets?.length || !currentNode?.url) return;

    const uniquePrefixes = [...new Set(
      pmaProcessedData
        .map((pma) => pma.symbol?.split(".")[0])
        .filter(Boolean)
    )];

    const orgIDs = combinedAssets
      .filter((a) => uniquePrefixes.includes(a.symbol))
      .map((a) => a.id);

    if (!orgIDs.length) return;

    let cancelled = false;
    let unsubscribe = null;

    const store = createObjectStore([
      _chain,
      JSON.stringify(orgIDs),
      currentNode.url,
    ]);

    unsubscribe = store.subscribe(({ data, error, loading }) => {
      if (cancelled) return;
      if (data && !error && !loading) {
        const map = {};
        for (const asset of data) {
          if (asset?.symbol) map[asset.symbol] = asset;
        }
        setParentOrgAssets(map);
      }
    });

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, [pmaProcessedData, combinedAssets, _chain, currentNode]);

  useEffect(() => {
    if (!_chain || !currentNodeReady || !pmaProcessedData?.length) {
      setDynamicAssetDataById({});
      return;
    }

    const dynamicAssetIds = [
      ...new Set(
        pmaProcessedData
          .map((asset) => asset?.dynamic_asset_data_id)
          .filter(Boolean),
      ),
    ];

    if (!dynamicAssetIds.length) {
      setDynamicAssetDataById({});
      return;
    }

    let cancelled = false;
    const dynamicAssetStore = createObjectStore([
      _chain,
      JSON.stringify(dynamicAssetIds),
      currentNode.url,
    ]);

    const unsubscribe = dynamicAssetStore.subscribe(({ data, error, loading }) => {
      if (cancelled || !data || error || loading) {
        return;
      }

      setDynamicAssetDataById(
        data.reduce((accumulator, entry) => {
          if (entry?.id) {
            accumulator[entry.id] = entry;
          }
          return accumulator;
        }, {}),
      );
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [_chain, currentNode, currentNodeReady, pmaProcessedData]);

  const [usrBalances, setUsrBalances] = useState();
  const [balanceAssetIDs, setBalanceAssetIDs] = useState([]);
  useEffect(() => {
    if (!usr?.id) return;

    let cancelled = false;
    let unsubscribeBal = null;

    async function fetchUserBalances() {
      const userBalancesStore = createUserBalancesStore([
        usr.chain,
        usr.id,
        currentNode ? currentNode.url : null,
      ]);

      unsubscribeBal = userBalancesStore.subscribe(({ data, error, loading }) => {
        if (cancelled) return;
        if (data && !error && !loading) {
          setBalanceAssetIDs(data.map((x) => x.asset_id));
          setUsrBalances(data);
        }
      });
    }

    fetchUserBalances();

    return () => {
      cancelled = true;
      if (unsubscribeBal) {
        unsubscribeBal();
        unsubscribeBal = null;
      }
    };
  }, [usr, currentNode?.url]);

  const activePMAs = useMemo(() => {
    return pmaProcessedData.filter((x) => !x.expired);
  }, [pmaProcessedData]);

  const expiredPMAs = useMemo(() => {
    return pmaProcessedData.filter((x) => x.expired);
  }, [pmaProcessedData]);

  const myPMAs = useMemo(() => {
    return pmaProcessedData.filter((x) => x.issuer === usr.id);
  }, [pmaProcessedData, usr.id]);

  const balancePMAs = useMemo(() => {
    return pmaProcessedData.filter((x) => balanceAssetIDs.includes(x.id));
  }, [pmaProcessedData, balanceAssetIDs]);

  const [completedPMAs, setCompletedPMAs] = useState([]);
  useEffect(() => {
    if (!pmaProcessedData?.length) return;

    let cancelled = false;
    let unsubscribe = null;

    async function fetching() {
      const uniqueIDs = [...new Set(pmaProcessedData.map((x) => x.bitasset_data_id).filter(Boolean))];
      console.log(`[PMA:completedPMAs] requesting ${uniqueIDs.length} unique bitasset_data IDs:`, uniqueIDs);

      const _store = createObjectStore([
        _chain,
        JSON.stringify(uniqueIDs),
        currentNode ? currentNode.url : null,
      ]);

      unsubscribe = _store.subscribe(({ data, error, loading }) => {
        if (cancelled) return;
        if (data && !error && !loading) {
          const requestedIDs = new Set(uniqueIDs);
          const receivedIDs = new Set(data.map((x) => x?.id).filter(Boolean));
          const missing = [...requestedIDs].filter((id) => !receivedIDs.has(id));
          if (missing.length) {
            console.warn(`[PMA:completedPMAs] ${missing.length} bitasset_data IDs NOT returned:`, missing);
          }

          const enriched = data
            .filter(Boolean)
            .map((x) => {
              if (!x.settlement_price) {
                return { ...x, outcome: undefined };
              }
              const baseAmount = parseInt(x.settlement_price.base.amount);
              const quoteAmount = parseInt(x.settlement_price.quote.amount);
              if (baseAmount === 0) {
                return { ...x, outcome: -1 };
              }
              return { ...x, outcome: quoteAmount > 0 ? 1 : 0 };
            });

          console.log(`[PMA:completedPMAs] received ${data.length} bitasset_data, ${enriched.filter((x) => x.outcome != null).length} resolved`);
          setCompletedPMAs(enriched);
        }
      });
    }

    fetching();

    return () => {
      cancelled = true;
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
    };
  }, [pmaProcessedData]);

  const [callOrders, setCallOrders] = useState([]);
  useEffect(() => {
    if (!completedPMAs?.length) return;

    let cancelled = false;
    let unsubscribeCall = null;

    async function fetching() {
      const _assetStore = createAssetCallOrdersStore([
        _chain,
        JSON.stringify(completedPMAs.map((x) => x.asset_id)),
        currentNode.url,
      ]);

      unsubscribeCall = _assetStore.subscribe(({ data, error, loading }) => {
        if (cancelled) return;
        if (data && !error && !loading) {
          setCallOrders(data);
        }
      });
    }

    fetching();

    return () => {
      cancelled = true;
      if (unsubscribeCall) {
        unsubscribeCall();
        unsubscribeCall = null;
      }
    };
  }, [completedPMAs]);

  const marginPMAs = useMemo(() => {
    return pmaProcessedData.filter((pma) => {
      const orders = callOrders[pma.id];
      return orders && orders.some((entry) => entry.borrower === usr.id);
    });
  }, [pmaProcessedData, callOrders, usr.id]);

  const chosenPMAs = useMemo(() => {
    if (view === "active") return activePMAs;
    if (view === "expired") return expiredPMAs;
    if (view === "mine") return myPMAs;
    if (view === "portfolio") return balancePMAs;
    if (view === "margin") return marginPMAs;
    return [];
  }, [view, activePMAs, expiredPMAs, myPMAs, balancePMAs, marginPMAs]);

  const pageStats = useMemo(() => {
    if (!chosenPMAs || !chosenPMAs.length) return null;
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
          {
            key: "closing",
            label: t("Predictions:stats.closingSoon"),
            value: closingSoon,
          },
          {
            key: "new",
            label: t("Predictions:stats.newlyCreated"),
            value: newlyCreated,
          },
        ],
      };
    }
    if (view === "expired") {
      const awaiting = chosenPMAs.filter((p) => {
        const bitasset = completedPMAs.find(
          (b) => b.id === p.bitasset_data_id,
        );
        return (
          !bitasset ||
          !bitasset.hasOwnProperty("outcome") ||
          bitasset.outcome === -1
        );
      }).length;
      const resolved = chosenPMAs.filter((p) => {
        const bitasset = completedPMAs.find(
          (b) => b.id === p.bitasset_data_id,
        );
        return bitasset && (bitasset.outcome === 0 || bitasset.outcome === 1);
      }).length;
      return {
        primary: chosenPMAs.length,
        secondary: [
          {
            key: "awaiting",
            label: t("Predictions:stats.awaitingResolution"),
            value: awaiting,
          },
          {
            key: "resolved",
            label: t("Predictions:stats.resolved"),
            value: resolved,
          },
        ],
      };
    }
    if (view === "mine") {
      const awaitingMine = chosenPMAs.filter((p) => {
        const bitasset = completedPMAs.find(
          (b) => b.id === p.bitasset_data_id,
        );
        return (
          p.expired &&
          (!bitasset ||
            !bitasset.hasOwnProperty("outcome") ||
            bitasset.outcome === -1)
        );
      }).length;
      return {
        primary: chosenPMAs.length,
        secondary: [
          {
            key: "awaiting",
            label: t("Predictions:stats.awaitingYourResolution"),
            value: awaitingMine,
          },
        ],
      };
    }
    if (view === "portfolio") {
      return {
        primary: chosenPMAs.length,
        secondary: [
          {
            key: "inBalance",
            label: t("Predictions:stats.inYourBalance"),
            value: chosenPMAs.length,
          },
        ],
      };
    }
    if (view === "margin") {
      return {
        primary: chosenPMAs.length,
        secondary: [
          {
            key: "atRisk",
            label: t("Predictions:stats.marginPositions"),
            value: chosenPMAs.length,
          },
        ],
      };
    }
    return null;
  }, [chosenPMAs, view, completedPMAs, pmaProcessedData, now, t]);

  const sortedFilteredPMAs = useMemo(() => {
    if (!chosenPMAs || !chosenPMAs.length) return [];
    let result = [...chosenPMAs];

    if (userBlockedIDs && userBlockedIDs.size) {
      result = result.filter((p) => !userBlockedIDs.has(p.issuer));
    }

    if (issuerFilter) {
      result = result.filter((p) => p.issuer === issuerFilter);
    }

    if (searchQuery && searchQuery.trim().length) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((p) => {
        if (p.symbol && p.symbol.toLowerCase().includes(q)) return true;
        try {
          const d = JSON.parse(p.options.description || "{}");
          if (
            d &&
            d.condition &&
            String(d.condition).toLowerCase().includes(q)
          )
            return true;
          if (
            d &&
            d.short_name &&
            String(d.short_name).toLowerCase().includes(q)
          )
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
        (a, b) =>
          new Date(a.expiry).getTime() - new Date(b.expiry).getTime(),
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
  }, [
    chosenPMAs,
    searchQuery,
    filterBy,
    issuerFilter,
    sortBy,
    now,
    callOrders,
    view,
    userBlockedIDs,
  ]);

  const listContainerRef = useRef(null);

  const PredictionRowItem = useCallback(({ index, style, items, completedPMAs, callOrders, usrBalances, usr, marketSearch, combinedAssets, parentOrgAssets, expiredPMAs, userBlockedIDs, ipfsGateway, view, now, setIssuerFilter, t, dynamicAssetDataById }) => {
    const item = items[index];
    if (!item) return null;
    return (
      <div style={{ ...style, paddingBottom: 4, paddingRight: 4 }}>
        <PredictionRow
          res={item}
          completedPMAs={completedPMAs}
          callOrders={callOrders}
          usrBalances={usrBalances}
          usr={usr}
          marketSearch={marketSearch}
          combinedAssets={combinedAssets}
          parentOrgAssets={parentOrgAssets}
          expiredPMAs={expiredPMAs}
          userBlockedIDs={userBlockedIDs}
          ipfsGateway={ipfsGateway}
          dynamicAssetDataById={dynamicAssetDataById}
          view={view}
          now={now}
          setIssuerFilter={setIssuerFilter}
          t={t}
        />
      </div>
    );
  }, []);

  const listRowProps = useMemo(() => ({
    items: sortedFilteredPMAs || [],
    completedPMAs,
    callOrders,
    usrBalances,
    usr,
    marketSearch,
    combinedAssets,
    parentOrgAssets,
    expiredPMAs,
    userBlockedIDs,
    ipfsGateway,
    dynamicAssetDataById,
    view,
    now,
    setIssuerFilter,
    t,
  }), [sortedFilteredPMAs, completedPMAs, callOrders, usrBalances, usr, marketSearch, combinedAssets, parentOrgAssets, expiredPMAs, userBlockedIDs, ipfsGateway, dynamicAssetDataById, view, now, setIssuerFilter, t]);

  return (
    <div className="container mx-auto mt-5 mb-5 text-foreground">
      <div className="grid grid-cols-1 gap-3">
        <Card
          className={cn(
            "bg-card/60 border-border shadow-lg shadow-black/20 backdrop-blur-sm",
            currentView.border && `border-l-2 ${currentView.border}`,
          )}
        >
          <CardHeader className="pb-1">
            <CardTitle className="flex items-center gap-2">
              <span
                className={cn(
                  "flex items-center justify-center w-7 h-7 rounded-lg",
                  currentView.bg,
                )}
              >
                <currentView.icon
                  className={cn("w-4 h-4", currentView.color)}
                />
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
            <CardDescription className="text-muted-foreground">
              {pageStats
                ? `${t("Predictions:card.showing", { primary: pageStats.primary })}${pageStats.secondary
                    .map((s) =>
                      t("Predictions:card.stat", {
                        value: s.value,
                        label: s.label,
                      }),
                    )
                    .join(" · ")}`
                : t(`Predictions:card.description.${view}`)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {fetchingPmas ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Spinner className="size-6 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  {t("Predictions:loading")}
                </div>
              </div>
            ) : null}

            {hasLoadedPmas && chosenPMAs && chosenPMAs.length ? (
              <div className="grid grid-cols-1 gap-3 mt-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative flex-1 min-w-[200px]">
                    <MagnifyingGlassIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    <Input
                      type="text"
                      value={searchInput}
                      onChange={onSearchInput}
                      placeholder={t("Predictions:list.searchPlaceholder")}
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
                      <SelectTrigger className="h-8 w-[160px] text-xs bg-accent/30 dark:bg-white/[0.05] border-border text-foreground/70">
                        <Filter className="mr-1.5 h-3.5 w-3.5" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border shadow-2xl shadow-black/40">
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
                  <div ref={listContainerRef} className="w-full max-h-[60vh] md:max-h-[70vh] overflow-auto pr-1">
                    <List
                      rowComponent={PredictionRowItem}
                      rowCount={sortedFilteredPMAs.length}
                      rowHeight={185}
                      rowProps={listRowProps}
                    />
                  </div>
                ) : !fetchingPmas ? (
                  <div className="text-center mt-5 text-sm text-muted-foreground italic">
                    {t("Predictions:list.noResults")}
                  </div>
                ) : null}
              </div>
            ) : null}

            {hasLoadedPmas && !fetchingPmas &&
            chosenPMAs &&
            !chosenPMAs.length &&
            view === "active" ? (
              <Empty className="mt-5 border-border/60">
                <EmptyHeader>
                  <EmptyMedia
                    variant="icon"
                    className={cn(currentView.bg, currentView.color)}
                  >
                    <currentView.icon className="w-6 h-6" />
                  </EmptyMedia>
                  <EmptyTitle className="text-foreground/80">
                    {t("Predictions:card.emptyActive")}
                  </EmptyTitle>
                </EmptyHeader>
                <EmptyContent>
                  <a href="/create_prediction.html">
                    <Button className="bg-violet-600 hover:bg-violet-500 text-foreground">
                      {t("PageHeader:createPrediction")}
                    </Button>
                  </a>
                </EmptyContent>
              </Empty>
            ) : null}
            {hasLoadedPmas && !fetchingPmas &&
            chosenPMAs &&
            !chosenPMAs.length &&
            view === "mine" ? (
              <Empty className="mt-5 border-border/60">
                <EmptyHeader>
                  <EmptyMedia
                    variant="icon"
                    className={cn(currentView.bg, currentView.color)}
                  >
                    <currentView.icon className="w-6 h-6" />
                  </EmptyMedia>
                  <EmptyTitle className="text-foreground/80">
                    {t("Predictions:card.emptyMine")}
                  </EmptyTitle>
                </EmptyHeader>
                <EmptyContent>
                  <a href="/create_prediction.html">
                    <Button className="bg-violet-600 hover:bg-violet-500 text-foreground">
                      {t("PageHeader:createPrediction")}
                    </Button>
                  </a>
                </EmptyContent>
              </Empty>
            ) : null}
            {hasLoadedPmas && !fetchingPmas &&
            chosenPMAs &&
            !chosenPMAs.length &&
            view === "portfolio" ? (
              <div className="text-center mt-5">
                <span
                  className={cn(
                    "inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3",
                    currentView.bg,
                  )}
                >
                  <currentView.icon
                    className={cn("w-5 h-5", currentView.color)}
                  />
                </span>
                <div className="text-muted-foreground text-sm">
                  {t("Predictions:card.emptyPortfolio")}
                </div>
              </div>
            ) : null}
            {hasLoadedPmas && !fetchingPmas &&
            chosenPMAs &&
            !chosenPMAs.length &&
            view === "margin" ? (
              <div className="text-center mt-5">
                <span
                  className={cn(
                    "inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3",
                    currentView.bg,
                  )}
                >
                  <currentView.icon
                    className={cn("w-5 h-5", currentView.color)}
                  />
                </span>
                <div className="text-muted-foreground text-sm">
                  {t("Predictions:card.emptyMargin")}
                </div>
              </div>
            ) : null}
            {hasLoadedPmas && !fetchingPmas &&
            chosenPMAs &&
            !chosenPMAs.length &&
            view === "expired" ? (
              <div className="text-center mt-5">
                <span
                  className={cn(
                    "inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3",
                    currentView.bg,
                  )}
                >
                  <currentView.icon
                    className={cn("w-5 h-5", currentView.color)}
                  />
                </span>
                <div className="text-muted-foreground text-sm">
                  {t("Predictions:card.emptyExpired")}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
