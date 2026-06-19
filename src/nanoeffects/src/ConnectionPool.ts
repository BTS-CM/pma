import Apis from "@/bts/ws/ApiInstances";

type OptionalApis = {
  enableDatabase?: boolean;
  enableHistory?: boolean;
  enableNetworkBroadcast?: boolean;
  enableCrypto?: boolean;
  enableOrders?: boolean;
};

type CachedEntry = {
  node: string;
  api: any;
  refCount: number;
  closeTimer: ReturnType<typeof setTimeout> | null;
  optionalApis: OptionalApis;
};

let cached: CachedEntry | null = null;
let connectPromise: Promise<any> | null = null;
let requestedApis: OptionalApis = {};

const CLEANUP_DELAY_MS = 30000;

function mergeApis(...sources: OptionalApis[]): OptionalApis {
  const result: OptionalApis = {};
  for (const s of sources) {
    if (s.enableDatabase) result.enableDatabase = true;
    if (s.enableHistory) result.enableHistory = true;
    if (s.enableNetworkBroadcast) result.enableNetworkBroadcast = true;
    if (s.enableCrypto) result.enableCrypto = true;
    if (s.enableOrders) result.enableOrders = true;
  }
  return result;
}

function isSupersetOf(superset: OptionalApis, subset: OptionalApis): boolean {
  return (!subset.enableDatabase || superset.enableDatabase) &&
         (!subset.enableHistory || superset.enableHistory) &&
         (!subset.enableNetworkBroadcast || superset.enableNetworkBroadcast) &&
         (!subset.enableCrypto || superset.enableCrypto) &&
         (!subset.enableOrders || superset.enableOrders);
}

export async function acquireConnection(
  node: string,
  optionalApis: OptionalApis = { enableDatabase: true }
): Promise<any> {
  requestedApis = mergeApis(requestedApis, optionalApis);

  if (cached && cached.node === node) {
    const rs = cached.api?.ws_rpc?.ws?.readyState;
    if (rs === 1) {
      if (isSupersetOf(cached.optionalApis, optionalApis)) {
        cached.refCount++;
        if (cached.closeTimer) {
          clearTimeout(cached.closeTimer);
          cached.closeTimer = null;
        }
        return cached.api;
      }
      cached.api?.close();
      cached = null;
      connectPromise = null;
    } else {
      cached = null;
    }
  }

  if (!connectPromise) {
    connectPromise = Apis.instance(
      node,
      true,
      4000,
      requestedApis,
      (error: Error) => {
        cached = null;
        connectPromise = null;
        console.log({ error });
      }
    )
      .then((api) => {
        cached = { node, api, refCount: 0, closeTimer: null, optionalApis: { ...requestedApis } };
        connectPromise = null;
        return api;
      })
      .catch((err) => {
        connectPromise = null;
        throw err;
      });
  }

  const api = await connectPromise;
  if (cached && cached.node === node) {
    cached.refCount++;
    if (cached.closeTimer) {
      clearTimeout(cached.closeTimer);
      cached.closeTimer = null;
    }
  }
  return api;
}

export function releaseConnection(node: string, _api: any): void {
  if (!cached || cached.node !== node) return;
  cached.refCount--;
  if (cached.refCount <= 0) {
    if (cached.closeTimer) {
      clearTimeout(cached.closeTimer);
    }
    cached.closeTimer = setTimeout(() => {
      if (cached && cached.refCount <= 0) {
        cached.api?.close();
        cached = null;
      }
    }, CLEANUP_DELAY_MS);
  }
}

export function closeConnection(node?: string): void {
  if (!cached) return;
  if (node && cached.node !== node) return;
  if (cached.closeTimer) {
    clearTimeout(cached.closeTimer);
    cached.closeTimer = null;
  }
  cached.api?.close();
  cached = null;
}
