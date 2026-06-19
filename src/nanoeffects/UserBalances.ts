import { nanoquery } from "@nanostores/query";
import { chains } from "@/config/chains";
import { acquireConnection, releaseConnection } from "./src/ConnectionPool";

//Fetch account balances
async function getAccountBalances(
  chain: string,
  accountID: string,
  specificNode?: string | null,
  existingAPI?: any,
  specificAssets?: string[] | null
) {
  return new Promise(async (resolve, reject) => {
    let node = specificNode
      ? specificNode
      : (chains as any)[chain].nodeList[0].url;

    let currentAPI;
    let isExisting = false;
    try {
      if (existingAPI) {
        currentAPI = existingAPI;
        isExisting = true;
      } else {
        currentAPI = await acquireConnection(node);
      }
    } catch (error) {
      console.log({ error });
      reject(error);
      return;
    }

    try {
      let balances;
      try {
        balances = await currentAPI
          .db_api()
          .exec("get_account_balances", [
            accountID,
            specificAssets ? specificAssets : [],
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

      if (!balances) {
        return resolve([]);
      }

      return resolve(balances);
    } finally {
      if (!isExisting) {
        releaseConnection(node, currentAPI);
      }
    }
  });
}

// Create fetcher store for user balances
const [createUserBalancesStore] = nanoquery({
  fetcher: async (...args: unknown[]) => {
    const chain = args[0] as string;
    const accountID = args[1] as string;
    const specificNode = args[2] ? (args[2] as string) : null;

    let response;
    try {
      response = await getAccountBalances(chain, accountID, specificNode);
    } catch (error) {
      console.log({ error });
      return;
    }

    if (!response) {
      console.log(`Failed to fetch user balances`);
      return;
    }

    return response;
  },
});

const [createUsersCoreBalanceStore] = nanoquery({
  fetcher: async (...args: unknown[]) => {
    const chain = args[0] as string;
    const accountIDs = JSON.parse(args[1] as string);
    const specificNode = args[2] ? (args[2] as string) : null;

    let node = specificNode
      ? specificNode
      : (chains as any)[chain].nodeList[0].url;

    let currentAPI;
    try {
      currentAPI = await acquireConnection(node);
    } catch (error) {
      console.log({ error });
      return;
    }

    try {
      let userBalances: any = [];
      for (let i = 0; i < accountIDs.length; i++) {
        const accountID = accountIDs[i];
        let response;
        try {
          response = await getAccountBalances(
            chain,
            accountID,
            specificNode,
            currentAPI,
            ["1.3.0"]
          );
        } catch (error) {
          console.log({ error });
          return;
        }

        if (!response) {
          console.log(`Failed to fetch user balances`);
          continue;
        }

        userBalances.push({ id: accountID, balance: response });
      }

      return userBalances;
    } finally {
      releaseConnection(node, currentAPI);
    }
  },
});

export {
  createUserBalancesStore,
  getAccountBalances,
  createUsersCoreBalanceStore,
};
