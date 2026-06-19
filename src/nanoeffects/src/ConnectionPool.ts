import Apis from "@/bts/ws/ApiInstances";

type CachedEntry = {
  node: string;
  api: any;
  refCount: number;
  closeTimer: ReturnType<typeof setTimeout> | null;
};

let cached: CachedEntry | null = null;
let connectPromise: Promise<any> | null = null;

const CLEANUP_DELAY_MS = 30000;

export async function acquireConnection(
  node: string,
  optionalApis = { enableDatabase: true }
): Promise<any> {
  if (cached && cached.node === node) {
    const rs = cached.api?.ws_rpc?.ws?.readyState;
    if (rs === 1) {
      cached.refCount++;
      if (cached.closeTimer) {
        clearTimeout(cached.closeTimer);
        cached.closeTimer = null;
      }
      return cached.api;
    }
    cached = null;
  }

  if (!connectPromise) {
    connectPromise = Apis.instance(
      node,
      true,
      4000,
      optionalApis,
      (error: Error) => {
        cached = null;
        connectPromise = null;
        console.log({ error });
      }
    )
      .then((api) => {
        cached = { node, api, refCount: 0, closeTimer: null };
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
