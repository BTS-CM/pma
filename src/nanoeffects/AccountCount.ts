import { nanoquery } from "@nanostores/query";
import { chains } from "@/config/chains";
import { acquireConnection, releaseConnection } from "./src/ConnectionPool";

// Retrieve the quantity of registered blockchain accounts
async function getAccountCount(chain: string, specificNode?: string | null) {
  return new Promise(async (resolve, reject) => {
    let node = specificNode
      ? specificNode
      : (chains as any)[chain].nodeList[0].url;

    let currentAPI;
    try {
      currentAPI = await acquireConnection(node);
    } catch (error) {
      console.log({ error, node });
      reject(error);
      return;
    }

    try {
      let accountCount;
      try {
        accountCount = await currentAPI.db_api().exec("get_account_count", []);
      } catch (error) {
        console.log({ error });
      }

      if (!accountCount) {
        console.log(
          `Failed to fetch the quantity of registered blockchain accounts`
        );
        reject();
        return;
      }

      resolve(accountCount);
    } finally {
      releaseConnection(node, currentAPI);
    }
  });
}

const [createAccountCountStore] = nanoquery({
  fetcher: async (...args: unknown[]) => {
    const chain = args[0] as string;
    const specificNode = args[1] ? (args[1] as string) : null;

    let response;
    try {
      response = await getAccountCount(chain, specificNode);
    } catch (error) {
      console.log({ error });
      return;
    }

    if (!response) {
      console.log(`Failed to fetch the quantity of registered accounts`);
      return;
    }

    return response;
  },
});

export { createAccountCountStore, getAccountCount };
