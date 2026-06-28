import { nanoquery } from "@nanostores/query";
import { chains } from "@/config/chains";
import { acquireConnection, releaseConnection } from "./src/ConnectionPool";

const MAX_LIMIT_ORDERS = 1000;
const BTS_LIMIT = 50;
const TEST_LIMIT = 10;

const MAX_BTS_ITERATIONS = MAX_LIMIT_ORDERS / BTS_LIMIT;
const MAX_TEST_ITERATIONS = MAX_LIMIT_ORDERS / TEST_LIMIT;

function getAccountLimitOrders(
  chain: string,
  accountID: string,
  specificNode?: string | null
) {
  return new Promise(async (resolve, reject) => {
    let node = specificNode
      ? specificNode
      : (chains as any)[chain].nodeList[0].url;

    let currentAPI;
    try {
      currentAPI = await acquireConnection(node);
    } catch (error) {
      console.log({ error });
      reject(error);
      return;
    }

    try {
      const API_LIMIT = chain === "bitshares" ? BTS_LIMIT : TEST_LIMIT;
      const API_ITERATIONS =
        chain === "bitshares" ? MAX_BTS_ITERATIONS : MAX_TEST_ITERATIONS;

      let limitOrders: any;
      try {
        limitOrders = await currentAPI
          .db_api()
          .exec("get_limit_orders_by_account", [accountID, API_LIMIT])
          .then((results: Object[]) => {
            if (results && results.length) {
              return results;
            }
          });
      } catch (error) {
        console.log({ error });
        reject(error);
        return;
      }

      if (!limitOrders || !limitOrders.length) {
        resolve([]);
        return;
      }

      if (limitOrders && limitOrders.length === API_LIMIT) {
        for (let i = 1; i < API_ITERATIONS; i++) {
          let nextLimitOrders;
          try {
            nextLimitOrders = await currentAPI
              .db_api()
              .exec("get_limit_orders_by_account", [
                accountID,
                API_LIMIT,
                limitOrders[limitOrders.length - 1].id,
              ])
              .then((results: Object[]) => {
                if (results && results.length) {
                  return results;
                }
              });
          } catch (error) {
            console.log({ error });
            reject(error);
            return;
          }

          if (nextLimitOrders) {
            limitOrders = limitOrders.concat(nextLimitOrders);
          }
        }
      }

      resolve(limitOrders);
    } finally {
      releaseConnection(node, currentAPI);
    }
  });
}

const [createAccountLimitOrderStore, , nanoqueryHelpers] = nanoquery({
  fetcher: async (...args: unknown[]) => {
    const chain = args[0] as string;
    const account_id = args[1] as string;
    let specificNode = args[2] ? (args[2] as string) : null;

    let response;
    try {
      response = await getAccountLimitOrders(chain, account_id, specificNode);
    } catch (error) {
      console.log({ error });
      return;
    }

    if (!response) {
      console.log(`Failed to fetch account limit orders`);
      return;
    }

    return response;
  },
});

function revalidateAccountLimitOrders(chain, accountID) {
  nanoqueryHelpers.revalidateKeys(
    (key) =>
      Array.isArray(key) &&
      key.length >= 2 &&
      key[0] === chain &&
      key[1] === accountID,
  );
}

export {
  createAccountLimitOrderStore,
  getAccountLimitOrders,
  revalidateAccountLimitOrders,
};
