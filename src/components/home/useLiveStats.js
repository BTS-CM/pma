import { useEffect, useMemo, useState } from "react";
import { useStore } from "@nanostores/react";
import { $currentNode } from "@/stores/node.ts";

function isPredictionMarketAsset(asset) {
  if (!asset) return false;
  if (asset.prediction_market === true) return true;
  if (asset.bitasset_data_id) return true;
  return false;
}

function safeParseDescription(raw) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && parsed.market && parsed.expiry && parsed.condition) {
      return parsed;
    }
  } catch (_) {}
  return null;
}

export function useLiveStats(_assetsBTS, _assetsTEST) {
  const currentNode = useStore($currentNode);

  const chain = currentNode && currentNode.url ? "bitshares" : "bitshares";

  const baseAssets = useMemo(() => {
    if (chain === "bitshares_testnet") return _assetsTEST || [];
    return _assetsBTS || [];
  }, [chain, _assetsBTS, _assetsTEST]);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30 * 1000);
    return () => clearInterval(id);
  }, []);

  return useMemo(() => {
    if (!baseAssets || !baseAssets.length) {
      return { available: false, active: 0, closingSoon: 0, newlyCreated: 0 };
    }

    let active = 0;
    let closingSoon = 0;
    let newlyCreated = 0;
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const twentyFourHoursMs = 24 * 60 * 60 * 1000;
    let considered = 0;

    for (const asset of baseAssets) {
      if (!isPredictionMarketAsset(asset)) continue;
      const desc = safeParseDescription(
        asset.options && asset.options.description,
      );
      if (!desc) continue;
      considered += 1;
      if (considered > 800) break;

      const expiryMs = new Date(desc.expiry).getTime();
      if (Number.isNaN(expiryMs)) continue;
      if (expiryMs > now) {
        active += 1;
        if (expiryMs - now <= twentyFourHoursMs) closingSoon += 1;
      }
      if (asset.creation_time) {
        const createdMs = new Date(asset.creation_time).getTime();
        if (!Number.isNaN(createdMs) && now - createdMs <= sevenDaysMs) {
          newlyCreated += 1;
        }
      }
    }

    return {
      available: considered > 0,
      active,
      closingSoon,
      newlyCreated,
    };
  }, [baseAssets, now]);
}
