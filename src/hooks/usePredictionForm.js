import {
  useState,
  useEffect,
  useSyncExternalStore,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useStore } from "@nanostores/react";

import { useInitCache } from "@/nanoeffects/Init.ts";
import { createFullAssetFromSymbolStore } from "@/nanoeffects/Assets.ts";
import { createAssetExistsStore } from "@/nanoeffects/AssetExists.ts";
import { createUserBalancesStore } from "@/nanoeffects/UserBalances.ts";
import { createEveryObjectStore } from "@/nanoeffects/Objects.ts";

import { $currentUser } from "@/stores/users.ts";
import { $currentNode } from "@/stores/node.ts";
import {
  getPermissions,
  getFlags,
  debounce,
  humanReadableFloat,
} from "@/lib/common.js";
import { blockchainFloat } from "@/bts/common";

function hasCompleteAssetDetails(asset) {
  return !!(
    asset?.options &&
    typeof asset.options === "object" &&
    "description" in asset.options &&
    "issuer_permissions" in asset.options &&
    "flags" in asset.options
  );
}

export default function usePredictionForm(properties) {
  const usr = useSyncExternalStore(
    $currentUser.subscribe,
    $currentUser.get,
    () => true
  );
  const currentNode = useStore($currentNode);

  const {
    _assetsBTS,
    _assetsTEST,
    _marketSearchBTS,
    _marketSearchTEST,
    _feeScheduleBTS,
    _feeScheduleTEST,
  } = properties;

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

  // Edit mode: read ?asset_update=SYMBOL and ?settlement=N from URL
  const updateSymbol = useMemo(() => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    return params.get("asset_update") || null;
  }, []);
  const isEditMode = !!updateSymbol;
  const settlementParam = useMemo(() => {
    if (typeof window === "undefined") return 0;
    const params = new URLSearchParams(window.location.search);
    return parseFloat(params.get("settlement") || "0");
  }, []);

  // Fee schedule (operation 10 for create, 11 for update)
  const feeSchedule = useMemo(() => {
    const schedule = _chain === "bitshares" ? _feeScheduleBTS : _feeScheduleTEST;
    if (!schedule) return null;
    const opId = isEditMode ? 11 : 10;
    const op = schedule.find((entry) => entry.id === opId);
    return op ? op.data : null;
  }, [_chain, _feeScheduleBTS, _feeScheduleTEST, isEditMode]);

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
      if (!assets || !assets.length || !currentNode) return;
      
      const lastAsset = assets.reduce((max, x) => {
        const n = parseInt(x.id.split(".")[2], 10);
        const m = parseInt(max.id.split(".")[2], 10);
        return n > m ? x : max;
      });

      if (!lastAsset || !lastAsset.id) return;
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
  const precisionNum = 5;
  const [maxSupply, setMaxSupply] = useState("1000000000");

  // Creation mode: "manual" (default) or "organization"
  const [creationMode, setCreationMode] = useState("manual");
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [subAssetName, setSubAssetName] = useState("");

  // Read ?org=SYMBOL from URL to pre-select organization
  const urlOrgSymbol = useMemo(() => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    return params.get("org") || null;
  }, []);

  // Find the existing asset when in edit mode
  const cachedExistingAsset = useMemo(() => {
    if (!updateSymbol) return null;
    const source = combinedAssets && combinedAssets.length ? combinedAssets : assets;
    if (!source || !source.length) return null;
    return source.find((asset) => asset.symbol === updateSymbol) ?? null;
  }, [updateSymbol, combinedAssets, assets]);

  const [fetchedExistingAsset, setFetchedExistingAsset] = useState(null);

  const shouldFetchExistingAsset =
    !!isEditMode &&
    !!updateSymbol &&
    !!currentNode?.url &&
    !hasCompleteAssetDetails(cachedExistingAsset);

  const existingAsset = useMemo(() => {
    if (!updateSymbol) return null;
    if (hasCompleteAssetDetails(cachedExistingAsset)) {
      return cachedExistingAsset;
    }
    return fetchedExistingAsset ?? cachedExistingAsset;
  }, [updateSymbol, cachedExistingAsset, fetchedExistingAsset]);

  useEffect(() => {
    if (!shouldFetchExistingAsset) {
      setFetchedExistingAsset(null);
      return;
    }

    const existingAssetStore = createFullAssetFromSymbolStore([
      _chain,
      updateSymbol,
      currentNode.url,
    ]);

    return existingAssetStore.subscribe(({ data, error, loading }) => {
      if (error) {
        console.log("[CreatePrediction] Failed to fetch full asset:", error);
        setFetchedExistingAsset(null);
        return;
      }

      if (loading) {
        return;
      }

      if (data) {
        setFetchedExistingAsset(data);
      }
    });
  }, [shouldFetchExistingAsset, _chain, updateSymbol, currentNode]);

  // Filter PMO organizations owned by the current user
  const userOrgs = useMemo(() => {
    const source = combinedAssets && combinedAssets.length ? combinedAssets : assets;
    if (!source || !source.length || !usr || !usr.id) return [];
    return source.filter((a) => {
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
  }, [combinedAssets, assets, usr]);

  // When URL has ?org=SYMBOL, fetch the full org asset from the chain
  // (cached assets lack options.description so userOrgs is always empty)
  const [fetchedUrlOrg, setFetchedUrlOrg] = useState(null);
  useEffect(() => {
    if (!urlOrgSymbol || !currentNode?.url) return;
    let cancelled = false;
    const store = createFullAssetFromSymbolStore([_chain, urlOrgSymbol, currentNode.url]);
    const unsub = store.subscribe(({ data, error, loading }) => {
      if (cancelled) return;
      if (!loading && data) {
        setFetchedUrlOrg(data);
      }
    });
    return () => {
      cancelled = true;
      if (unsub) unsub();
    };
  }, [urlOrgSymbol, _chain, currentNode]);

  // Effective user orgs: merge chain-fetched URL org into userOrgs if it's a PMO owned by the user
  const effectiveUserOrgs = useMemo(() => {
    if (!fetchedUrlOrg || !usr?.id) return userOrgs;
    if (fetchedUrlOrg.issuer !== usr.id) return userOrgs;
    if (fetchedUrlOrg.symbol?.includes(".")) return userOrgs;
    if (!fetchedUrlOrg.options?.description) return userOrgs;
    try {
      const d = JSON.parse(fetchedUrlOrg.options.description);
      if (!d || !d.pmo_object) return userOrgs;
    } catch {
      return userOrgs;
    }
    if (userOrgs.some((o) => o.symbol === fetchedUrlOrg.symbol)) return userOrgs;
    return [...userOrgs, fetchedUrlOrg];
  }, [fetchedUrlOrg, userOrgs, usr]);

  // Default to organization mode when user owns PMO assets (skip in edit mode)
  useEffect(() => {
    if (!isEditMode && effectiveUserOrgs.length > 0 && creationMode === "manual") {
      setCreationMode("organization");
    }
  }, [effectiveUserOrgs, isEditMode]);

  // Pre-select org from URL param
  useEffect(() => {
    if (urlOrgSymbol && effectiveUserOrgs.length > 0 && creationMode === "organization" && !selectedOrg) {
      const org = effectiveUserOrgs.find((o) => o.symbol === urlOrgSymbol);
      if (org) {
        setSelectedOrg(org);
      }
    }
  }, [urlOrgSymbol, effectiveUserOrgs, creationMode, selectedOrg]);

  // In org mode, shortName auto-fills from the sub-asset name
  useEffect(() => {
    if (creationMode === "organization" && subAssetName) {
      setShortName(subAssetName);
    } else if (creationMode === "manual") {
      // reset shortName only if it was auto-filled
    }
  }, [creationMode, subAssetName]);

  // Maximum supply is constrained by the asset's precision
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
  const originalExpiryRef = useRef(null);
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

  // Compute the full symbol based on creation mode
  const fullSymbol = useMemo(() => {
    if (creationMode === "organization" && selectedOrg && subAssetName) {
      return `${selectedOrg.symbol}.${subAssetName}`;
    }
    return symbol;
  }, [creationMode, selectedOrg, subAssetName, symbol]);

  // Max sub-asset name length: 16 total minus org symbol length minus 1 for the dot
  const maxSubAssetLength = useMemo(() => {
    if (creationMode === "organization" && selectedOrg) {
      return Math.max(0, 16 - selectedOrg.symbol.length - 1);
    }
    return 16;
  }, [creationMode, selectedOrg]);

  // Permissions (most default to true)
  const [permChargeMarketFee, setPermChargeMarketFee] = useState(true);
  const [permWhiteList, setPermWhiteList] = useState(true);
  const [permOverrideAuthority, setPermOverrideAuthority] = useState(true);
  const [permTransferRestricted, setPermTransferRestricted] = useState(true);
  const [permDisableForceSettle, setPermDisableForceSettle] = useState(false);
  const [permGlobalSettle, setPermGlobalSettle] = useState(true);
  const [permDisableConfidential, setPermDisableConfidential] = useState(true);
  const [permWitnessFedAsset, setPermWitnessFedAsset] = useState(true);
  const [permCommitteeFedAsset, setPermCommitteeFedAsset] = useState(true);
  const [permLockMaxSupply, setPermLockMaxSupply] = useState(true);
  const [permDisableNewSupply, setPermDisableNewSupply] = useState(true);

  // Flags (all default to false)
  const [flagChargeMarketFee, setFlagChargeMarketFee] = useState(true);
  const [flagWhiteList, setFlagWhiteList] = useState(false);
  const [flagOverrideAuthority, setFlagOverrideAuthority] = useState(false);
  const [flagTransferRestricted, setFlagTransferRestricted] = useState(false);
  const [flagDisableForceSettle, setFlagDisableForceSettle] = useState(false);
  const [flagDisableConfidential, setFlagDisableConfidential] = useState(false);
  const [flagWitnessFedAsset, setFlagWitnessFedAsset] = useState(false);
  const [flagCommitteeFedAsset, setFlagCommitteeFedAsset] = useState(false);
  const [flagLockMaxSupply, setFlagLockMaxSupply] = useState(false);
  const [flagDisableNewSupply, setFlagDisableNewSupply] = useState(false);

  const [whitelistAuthorities, setWhitelistAuthorities] = useState([]);
  const [blacklistAuthorities, setBlacklistAuthorities] = useState([]);

  // Extensions
  const [enabledReferrerReward, setEnabledReferrerReward] = useState(false);
  const [enabledFeeSharingWhitelist, setEnabledFeeSharingWhitelist] =
    useState(false);
  const [enabledTakerFee, setEnabledTakerFee] = useState(false);

  const [referrerReward, setReferrerReward] = useState(0);
  const [feeSharingWhitelist, setFeeSharingWhitelist] = useState([]);
  const [takerFee, setTakerFee] = useState(0);

  // Toggle visibility for optional steps
  const [enabledExtensions, setEnabledExtensions] = useState(false);
  const [enabledPermissions, setEnabledPermissions] = useState(false);

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

  // Fee estimation
  const [estimatedFee, setEstimatedFee] = useState(0);
  const [feeCalculating, setFeeCalculating] = useState(false);

  // Dialog states
  const [showDialog, setShowDialog] = useState(false);
  const [expiryWarningDialog, setExpiryWarningDialog] = useState(false);
  const [whitelistMarketFeeSharingDialogOpen, setWhitelistMarketFeeSharingDialogOpen] =
    useState(false);
  const [whitelistAuthorityDialogOpen, setWhitelistAuthorityDialogOpen] =
    useState(false);
  const [blacklistAuthorityDialogOpen, setBlacklistAuthorityDialogOpen] =
    useState(false);

  // Summary ref for scrolling
  const summaryRef = useRef(null);

  // Check if the PMA has expired and has a positive settlement fund (prize pool)
  const hasExpiredWithPrize = useMemo(() => {
    if (!isEditMode || !existingAsset) return false;
    if (settlementParam <= 0) return false;
    try {
      const d = JSON.parse(existingAsset.options?.description || "{}");
      if (!d.expiry) return false;
      const expiryDate = new Date(d.expiry);
      return expiryDate < new Date();
    } catch {
      return false;
    }
  }, [isEditMode, existingAsset, settlementParam]);

  // Pre-fill form when in edit mode
  useEffect(() => {
    if (!existingAsset || !isEditMode) return;
    console.log("[CreatePrediction] Pre-filling from asset:", JSON.stringify(existingAsset, null, 2));
    const assetOptions = existingAsset.options || {};
    const maxSupplyValue =
      assetOptions.max_supply ?? existingAsset.max_supply ?? "1000000000";
    const marketFeePercent =
      assetOptions.market_fee_percent ?? existingAsset.market_fee_percent ?? 0;
    setSymbol(existingAsset.symbol);
    setMaxSupply(
      String(humanReadableFloat(maxSupplyValue, existingAsset.precision ?? 5))
    );
    setCommission(String(marketFeePercent / 100));
    // Determine creation mode: only org mode if the parent symbol matches a real user org
    let isOrgMode = false;
    if (existingAsset.symbol && existingAsset.symbol.includes(".")) {
      const parts = existingAsset.symbol.split(".");
      const orgSymbol = parts.slice(0, -1).join(".");
      const source = combinedAssets && combinedAssets.length ? combinedAssets : assets;
      let matchingOrg = source?.find((a) => a.symbol === orgSymbol && a.issuer === usr?.id);
      // If parent org not found in cache (missing options.description), fetch from chain
      if (!matchingOrg && currentNode?.url) {
        const orgStore = createFullAssetFromSymbolStore([_chain, orgSymbol, currentNode.url]);
        orgStore.subscribe(({ data, error, loading }) => {
          if (!loading && !error && data && data.issuer === usr?.id) {
            setCreationMode("organization");
            setSelectedOrg(data);
          }
        });
        isOrgMode = true;
        const subName = parts[parts.length - 1];
        setSubAssetName(subName);
        setShortName(subName);
      } else if (matchingOrg) {
        isOrgMode = true;
        setCreationMode("organization");
        setSelectedOrg(matchingOrg);
        const subName = parts[parts.length - 1];
        setSubAssetName(subName);
        setShortName(subName);
      }
    }
    if (!isOrgMode) {
      setCreationMode("manual");
    }
    try {
      const d = JSON.parse(assetOptions.description || "{}");
      setDesc(d.main || "");
      if (!isOrgMode) {
        setShortName(d.short_name || "");
      }
      setCondition(d.condition || "");
      setBackingAsset(
        d.market ||
          existingAsset.backingAsset?.symbol ||
          (usr.chain === "bitshares" ? "BTS" : "TEST")
      );
      if (d.expiry) {
        const expiryDate = new Date(d.expiry);
        originalExpiryRef.current = expiryDate.getTime();
        setDate(expiryDate);
      }
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
        for (const imgType of ["PNG", "JPEG", "WEBP", "GIF", "TIFF"]) {
          const url = d.nft_object[`media_${imgType}_multihash`];
          if (url) media.push({ type: imgType, url });
        }
        if (media.length) setNFTMedia(media);
      }
    } catch {}
    // Restore permissions and flags from existing asset using correct bitmask values
    const perms = assetOptions.issuer_permissions;
    const flgs = assetOptions.flags;
    let hasNonDefaultPerms = false;
    let hasNonDefaultFlags = false;
    if (typeof perms === "number") {
      const pChargeMarketFee = !!(perms & 0x01);
      const pWhiteList = !!(perms & 0x02);
      const pOverrideAuthority = !!(perms & 0x04);
      const pTransferRestricted = !!(perms & 0x08);
      const pDisableForceSettle = !!(perms & 0x10);
      const pGlobalSettle = !!(perms & 0x20);
      const pDisableConfidential = !!(perms & 0x40);
      const pWitnessFedAsset = !!(perms & 0x80);
      const pCommitteeFedAsset = !!(perms & 0x100);
      const pLockMaxSupply = !!(perms & 0x200);
      const pDisableNewSupply = !!(perms & 0x400);
      setPermChargeMarketFee(pChargeMarketFee);
      setPermWhiteList(pWhiteList);
      setPermOverrideAuthority(pOverrideAuthority);
      setPermTransferRestricted(pTransferRestricted);
      setPermDisableForceSettle(pDisableForceSettle);
      setPermGlobalSettle(pGlobalSettle);
      setPermDisableConfidential(pDisableConfidential);
      setPermWitnessFedAsset(pWitnessFedAsset);
      setPermCommitteeFedAsset(pCommitteeFedAsset);
      setPermLockMaxSupply(pLockMaxSupply);
      setPermDisableNewSupply(pDisableNewSupply);
      if (!pChargeMarketFee || !pWhiteList || !pOverrideAuthority || !pTransferRestricted || !pDisableForceSettle || !pGlobalSettle || !pDisableConfidential || !pWitnessFedAsset || !pCommitteeFedAsset || !pLockMaxSupply || !pDisableNewSupply) {
        hasNonDefaultPerms = true;
      }
    }
    if (typeof flgs === "number") {
      const fChargeMarketFee = !!(flgs & 0x01);
      const fWhiteList = !!(flgs & 0x02);
      const fOverrideAuthority = !!(flgs & 0x04);
      const fTransferRestricted = !!(flgs & 0x08);
      const fDisableForceSettle = !!(flgs & 0x10);
      const fDisableConfidential = !!(flgs & 0x40);
      const fWitnessFedAsset = !!(flgs & 0x80);
      const fCommitteeFedAsset = !!(flgs & 0x100);
      const fLockMaxSupply = !!(flgs & 0x200);
      const fDisableNewSupply = !!(flgs & 0x400);
      setFlagChargeMarketFee(fChargeMarketFee);
      setFlagWhiteList(fWhiteList);
      setFlagOverrideAuthority(fOverrideAuthority);
      setFlagTransferRestricted(fTransferRestricted);
      setFlagDisableForceSettle(fDisableForceSettle);
      setFlagDisableConfidential(fDisableConfidential);
      setFlagWitnessFedAsset(fWitnessFedAsset);
      setFlagCommitteeFedAsset(fCommitteeFedAsset);
      setFlagLockMaxSupply(fLockMaxSupply);
      setFlagDisableNewSupply(fDisableNewSupply);
      if (fChargeMarketFee || fWhiteList || fOverrideAuthority || fTransferRestricted || fDisableForceSettle || fDisableConfidential || fWitnessFedAsset || fCommitteeFedAsset || fLockMaxSupply || fDisableNewSupply) {
        hasNonDefaultFlags = true;
      }
    }
    if (hasNonDefaultPerms || hasNonDefaultFlags) {
      setEnabledPermissions(true);
    }
    // Restore extensions
    const ext = assetOptions.extensions || {};
    let hasExtensions = false;
    if (ext.reward_percent) {
      setEnabledReferrerReward(true);
      setReferrerReward(ext.reward_percent / 100);
      hasExtensions = true;
    }
    if (ext.whitelist_market_fee_sharing) {
      setEnabledFeeSharingWhitelist(true);
      const extSource = combinedAssets && combinedAssets.length ? combinedAssets : assets;
      const shared = (ext.whitelist_market_fee_sharing || []).map((id) => {
        const found = extSource?.find((a) => a.id === id);
        return found ? { id: found.id, name: found.symbol || found.id } : { id, name: id };
      });
      setFeeSharingWhitelist(shared);
      hasExtensions = true;
    }
    if (ext.taker_fee_percent) {
      setEnabledTakerFee(true);
      setTakerFee(ext.taker_fee_percent / 100);
      hasExtensions = true;
    }
    if (hasExtensions) {
      setEnabledExtensions(true);
    }
  }, [existingAsset, isEditMode, combinedAssets, assets, usr]);

  // Permission/flag enforcement: when a permission is disabled, its flag must also be off
  useEffect(() => { if (!permChargeMarketFee) setFlagChargeMarketFee(false); }, [permChargeMarketFee]);
  useEffect(() => { if (!permWhiteList) setFlagWhiteList(false); }, [permWhiteList]);
  useEffect(() => { if (!permOverrideAuthority) setFlagOverrideAuthority(false); }, [permOverrideAuthority]);
  useEffect(() => { if (!permTransferRestricted) setFlagTransferRestricted(false); }, [permTransferRestricted]);
  useEffect(() => { if (!permDisableForceSettle) setFlagDisableForceSettle(false); }, [permDisableForceSettle]);
  useEffect(() => { if (!permDisableConfidential) setFlagDisableConfidential(false); }, [permDisableConfidential]);
  useEffect(() => { if (!permWitnessFedAsset) setFlagWitnessFedAsset(false); }, [permWitnessFedAsset]);
  useEffect(() => { if (!permCommitteeFedAsset) setFlagCommitteeFedAsset(false); }, [permCommitteeFedAsset]);
  useEffect(() => { if (permLockMaxSupply) setFlagLockMaxSupply(false); }, [permLockMaxSupply]);
  useEffect(() => { if (permDisableNewSupply) setFlagDisableNewSupply(false); }, [permDisableNewSupply]);

  // Witness fed and committee fed are mutually exclusive
  useEffect(() => { if (flagWitnessFedAsset) setFlagCommitteeFedAsset(false); }, [flagWitnessFedAsset]);
  useEffect(() => { if (flagCommitteeFedAsset) setFlagWitnessFedAsset(false); }, [flagCommitteeFedAsset]);

  const issuer_permissions = useMemo(() => {
    const base = {
      charge_market_fee: permChargeMarketFee,
      white_list: permWhiteList,
      override_authority: permOverrideAuthority,
      transfer_restricted: permTransferRestricted,
      disable_force_settle: permDisableForceSettle,
      global_settle: permGlobalSettle,
      disable_confidential: permDisableConfidential,
      witness_fed_asset: permWitnessFedAsset,
      committee_fed_asset: permCommitteeFedAsset,
      lock_max_supply: permLockMaxSupply,
      disable_new_supply: permDisableNewSupply,
    };
    return getPermissions(base, true);
  }, [
    permChargeMarketFee, permWhiteList, permOverrideAuthority,
    permTransferRestricted, permDisableForceSettle, permGlobalSettle,
    permDisableConfidential, permWitnessFedAsset, permCommitteeFedAsset,
    permLockMaxSupply, permDisableNewSupply,
  ]);

  const flags = useMemo(() => {
    const baseFlags = {
      charge_market_fee: flagChargeMarketFee,
      white_list: flagWhiteList,
      override_authority: flagOverrideAuthority,
      transfer_restricted: flagTransferRestricted,
      disable_force_settle: flagDisableForceSettle,
      disable_confidential: flagDisableConfidential,
      witness_fed_asset: flagWitnessFedAsset,
      committee_fed_asset: flagCommitteeFedAsset,
      lock_max_supply: flagLockMaxSupply,
      disable_new_supply: flagDisableNewSupply,
    };
    return getFlags(baseFlags);
  }, [
    flagChargeMarketFee, flagWhiteList, flagOverrideAuthority,
    flagTransferRestricted, flagDisableForceSettle,
    flagDisableConfidential, flagWitnessFedAsset, flagCommitteeFedAsset,
    flagLockMaxSupply, flagDisableNewSupply,
  ]);

  const lockedPermissions = useMemo(() => {
    const mask = existingAsset?.options?.issuer_permissions;
    if (!isEditMode || typeof mask !== "number") return {
      charge_market_fee: false,
      white_list: false,
      override_authority: false,
      transfer_restricted: false,
      disable_force_settle: false,
      global_settle: false,
      disable_confidential: false,
      witness_fed_asset: false,
      committee_fed_asset: false,
      lock_max_supply: false,
      disable_new_supply: false,
    };
    return {
      charge_market_fee: !(mask & 0x01),
      white_list: !(mask & 0x02),
      override_authority: !(mask & 0x04),
      transfer_restricted: !(mask & 0x08),
      disable_force_settle: !(mask & 0x10),
      global_settle: !(mask & 0x20),
      disable_confidential: !(mask & 0x40),
      witness_fed_asset: !(mask & 0x80),
      committee_fed_asset: !(mask & 0x100),
      lock_max_supply: !(mask & 0x200),
      disable_new_supply: !(mask & 0x400),
    };
  }, [existingAsset, isEditMode]);

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
        const imageType = image.type;
        if (!nft_object[`media_${imageType}_multihash`]) {
          nft_object[`media_${imageType}_multihash`] = image.url;
        }

        const sameTypeFiles = nftMedia.filter((img) => img.type === imageType);
        if (sameTypeFiles && sameTypeFiles.length > 1) {
          if (!nft_object[`media_${imageType}_multihashes`]) {
            nft_object[`media_${imageType}_multihashes`] = [
              {
                url: image.url,
              },
            ];
          } else {
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

    if (isEditMode && existingAsset) {
      return {
        issuer: usr.id,
        asset_to_update: existingAsset.id,
        new_options: {
          description,
          max_supply: blockchainFloat(parseFloat(maxSupply) || 0, precisionNum),
          market_fee_percent: commissionNum ? Math.round(commissionNum * 100) : 0,
          max_market_fee: blockchainFloat(parseFloat(maxSupply) || 0, precisionNum),
          issuer_permissions,
          flags,
          core_exchange_rate: {
            base: {
              amount: blockchainFloat(1, backingAssetData ? backingAssetData.precision : 5),
              asset_id: backingAssetData ? backingAssetData.id : "1.3.0",
            },
            quote: {
              amount: blockchainFloat(1, precisionNum),
              asset_id: existingAsset.id,
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
        extensions: [],
      };
    }

    return {
      issuer: usr.id,
      symbol: fullSymbol,
      precision: precisionNum,
      common_options: {
        description,
        max_supply: blockchainFloat(parseFloat(maxSupply) || 0, precisionNum),
        market_fee_percent: commissionNum ? Math.round(commissionNum * 100) : 0,
        max_market_fee: blockchainFloat(parseFloat(maxSupply) || 0, precisionNum),
        issuer_permissions,
        flags,
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
      is_prediction_market: true,
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
    referrerReward,
    feeSharingWhitelist,
    takerFee,
    whitelistAuthorities,
    blacklistAuthorities,
    flagWhiteList,
    isEditMode,
    existingAsset,
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

  // Debounced fee calculation
  const debouncedCalculateFee = useCallback(
    debounce(() => {
      if (!feeSchedule || !usr || !usr.id) return;
      setFeeCalculating(true);

      let symbolFee = 0;
      const isSubAsset = fullSymbol.includes(".");
      const parentName = isSubAsset ? fullSymbol.split(".")[0] : fullSymbol;
      const symLen = parentName.length;
      if (symLen <= 3) {
        symbolFee = parseInt(feeSchedule.symbol3 || "0", 10);
      } else if (symLen === 4) {
        symbolFee = parseInt(feeSchedule.symbol4 || "0", 10);
      } else if (symLen >= 5) {
        symbolFee = parseInt(feeSchedule.long_symbol || "0", 10);
      }

      const subAssetFee = isSubAsset ? Math.ceil(symbolFee * 0.5) * -1 : 0;

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

      const coreExchangeRateFee = Math.ceil(0.5 * pricePerKbyte);

      const totalFee = symbolFee + subAssetFee + dataFee + coreExchangeRateFee;
      setEstimatedFee(totalFee);
      setFeeCalculating(false);
    }, 1500),
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

  useEffect(() => {
    debouncedCalculateFee();
  }, [debouncedCalculateFee]);

  // Days until resolution
  const daysUntil = useMemo(() => {
    if (!date) return 0;
    const diff = date.getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [date]);

  const isExpiredInEditMode = useMemo(() => {
    if (!isEditMode || !existingAsset?.options?.description) return false;
    try {
      const d = JSON.parse(existingAsset.options.description);
      if (d.expiry) {
        return new Date(d.expiry).getTime() <= Date.now();
      }
    } catch {}
    return false;
  }, [isEditMode, existingAsset]);

  const _resolvedConfirmedRef = useRef(false);
  const isResolvedInEditMode = useMemo(() => {
    if (!isEditMode || !isExpiredInEditMode) {
      _resolvedConfirmedRef.current = false;
      return false;
    }
    if (_resolvedConfirmedRef.current) return true;
    const sp = existingAsset?.bitasset_data?.settlement_price;
    if (!sp) return false;
    const baseAmount = parseInt(sp.base?.amount);
    if (!baseAmount) return false;
    const quoteAmount = parseInt(sp.quote?.amount);
    if (quoteAmount > 0 || quoteAmount === 0) {
      _resolvedConfirmedRef.current = true;
      return true;
    }
    return false;
  }, [isEditMode, isExpiredInEditMode, existingAsset]);

  const symbolError = useMemo(() => {
    if (creationMode === "organization") {
      if (!subAssetName || subAssetName.length === 0) return null;
      if (subAssetName.length > maxSubAssetLength) return `Sub-asset name is too long (max ${maxSubAssetLength} characters)`;
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
  }, [symbol, creationMode, subAssetName, selectedOrg, maxSubAssetLength]);

  // Symbol existence check — debounced 3s after typing stops
  const [symbolExists, setSymbolExists] = useState(null);
  const symbolExistsTimerRef = useRef(null);

  useEffect(() => {
    if (isEditMode) return;
    if (!fullSymbol || fullSymbol.length < 1) {
      setSymbolExists(null);
      return;
    }
    if (symbolError) {
      setSymbolExists(null);
      return;
    }

    setSymbolExists(null);
    if (symbolExistsTimerRef.current) clearTimeout(symbolExistsTimerRef.current);

    symbolExistsTimerRef.current = setTimeout(() => {
      const store = createAssetExistsStore([_chain, fullSymbol, currentNode?.url]);
      const unsub = store.subscribe(({ data, error, loading }) => {
        if (loading) return;
        if (error) {
          setSymbolExists(null);
          return;
        }
        setSymbolExists(!!data && typeof data === "string" && data.length > 0);
        unsub();
      });
    }, 3000);

    return () => {
      if (symbolExistsTimerRef.current) clearTimeout(symbolExistsTimerRef.current);
    };
  }, [fullSymbol, isEditMode, symbolError]);

  // Form validity
  const isFormValid = useMemo(() => {
    if (creationMode === "organization") {
      if (!selectedOrg || !subAssetName) return false;
    } else {
      if (!symbol) return false;
    }
    if (!condition) return false;
    if (!date) return false;
    if (!isEditMode && symbolExists === true) return false;
    return true;
  }, [symbol, condition, date, creationMode, selectedOrg, subAssetName, isEditMode, symbolExists]);

  const commissionError = useMemo(() => {
    if (commission === "" || commission === "." || parseFloat(commission) === 0)
      return null;
    const n = parseFloat(commission);
    if (Number.isNaN(n)) return "Commission must be a number";
    if (n < 0) return "Commission cannot be negative";
    if (n > 100) return "Commission cannot exceed 100%";
    return null;
  }, [commission]);

  return {
    // Stores / external state
    usr,
    currentNode,
    _chain,
    marketSearch,

    // Edit mode
    isEditMode,
    updateSymbol,
    settlementParam,
    existingAsset,

    // Fee schedule
    feeSchedule,

    // Assets
    assets,
    combinedAssets,

    // Balances
    balances,
    balanceCounter,
    setBalanceCoutner,

    // Asset info
    shortName,
    setShortName,
    symbol,
    setSymbol,
    desc,
    setDesc,
    precisionNum,
    maxSupply,
    setMaxSupply,

    // Creation mode
    creationMode,
    setCreationMode,
    selectedOrg,
    setSelectedOrg,
    subAssetName,
    setSubAssetName,
    fullSymbol,
    maxSubAssetLength,
    effectiveUserOrgs,
    urlOrgSymbol,

    // Prediction market info
    condition,
    setCondition,
    date,
    setDate,
    originalExpiryRef,
    backingAsset,
    setBackingAsset,
    commission,
    setCommission,
    commissionNum,
    backingAssetData,

    // Permissions
    permChargeMarketFee, setPermChargeMarketFee,
    permWhiteList, setPermWhiteList,
    permOverrideAuthority, setPermOverrideAuthority,
    permTransferRestricted, setPermTransferRestricted,
    permDisableForceSettle, setPermDisableForceSettle,
    permGlobalSettle, setPermGlobalSettle,
    permDisableConfidential, setPermDisableConfidential,
    permWitnessFedAsset, setPermWitnessFedAsset,
    permCommitteeFedAsset, setPermCommitteeFedAsset,
    permLockMaxSupply, setPermLockMaxSupply,
    permDisableNewSupply, setPermDisableNewSupply,

    // Flags
    flagChargeMarketFee, setFlagChargeMarketFee,
    flagWhiteList, setFlagWhiteList,
    flagOverrideAuthority, setFlagOverrideAuthority,
    flagTransferRestricted, setFlagTransferRestricted,
    flagDisableForceSettle, setFlagDisableForceSettle,
    flagDisableConfidential, setFlagDisableConfidential,
    flagWitnessFedAsset, setFlagWitnessFedAsset,
    flagCommitteeFedAsset, setFlagCommitteeFedAsset,
    flagLockMaxSupply, setFlagLockMaxSupply,
    flagDisableNewSupply, setFlagDisableNewSupply,

    // Authorities
    whitelistAuthorities, setWhitelistAuthorities,
    blacklistAuthorities, setBlacklistAuthorities,

    // Extensions
    enabledReferrerReward, setEnabledReferrerReward,
    enabledFeeSharingWhitelist, setEnabledFeeSharingWhitelist,
    enabledTakerFee, setEnabledTakerFee,
    referrerReward, setReferrerReward,
    feeSharingWhitelist, setFeeSharingWhitelist,
    takerFee, setTakerFee,

    // Toggle visibility
    enabledExtensions, setEnabledExtensions,
    enabledPermissions, setEnabledPermissions,

    // NFT
    enabledNFT, setEnabledNFT,
    acknowledgements, setAcknowledgements,
    artist, setArtist,
    attestation, setAttestation,
    holderLicense, setHolderLicense,
    license, setLicense,
    narrative, setNarrative,
    title, setTitle,
    tags, setTags,
    type, setType,
    nftMedia, setNFTMedia,
    newMediaType, setNewMediaType,
    newMediaUrl, setNewMediaUrl,

    // Fee estimation
    estimatedFee,
    feeCalculating,

    // Dialog states
    showDialog, setShowDialog,
    expiryWarningDialog, setExpiryWarningDialog,
    whitelistMarketFeeSharingDialogOpen, setWhitelistMarketFeeSharingDialogOpen,
    whitelistAuthorityDialogOpen, setWhitelistAuthorityDialogOpen,
    blacklistAuthorityDialogOpen, setBlacklistAuthorityDialogOpen,

    // Computed values
    description,
    trx,
    issuer_permissions,
    flags,
    lockedPermissions,
    hasExpiredWithPrize,
    daysUntil,
    isExpiredInEditMode,
    isResolvedInEditMode,
    symbolError,
    symbolExists,
    commissionError,
    isFormValid,

    // Callbacks
    sanitizeMaxSupply,
    sanitizeCommission,
    debouncedPercent,

    // Refs
    summaryRef,
  };
}
