import { nanoquery } from "@nanostores/query";
import { chains } from "@/config/chains";
import { acquireConnection, releaseConnection } from "./src/ConnectionPool";
import { $nodes } from "@/stores/node";

async function accountSearch(
  chain: string,
  search_string: string,
  specificNode?: string | null
) {
  return new Promise(async (resolve, reject) => {
    // access latest $nodes

    let node;
    if (specificNode) {
      node = specificNode;
    } else {
      const nodes = $nodes.get();
      const relevantNodes = nodes[chain];

      node = relevantNodes[0].url;
    }

    let currentAPI;
    try {
      currentAPI = await acquireConnection(node);
    } catch (error) {
      console.log({ error });
      reject(error);
      return;
    }

    try {
      let object;
      try {
        object = await currentAPI
          .db_api()
          .exec("get_accounts", [[search_string]]);
      } catch (error) {
        console.log({ error });
        reject(error);
        return;
      }

      if (!object || !object.length) {
        reject(new Error("Couldn't retrieve account"));
        return;
      }

      resolve(object[0]);
    } finally {
      releaseConnection(node, currentAPI);
    }
  });
}

const [createUserSearchStore] = nanoquery({
  fetcher: async (...args: unknown[]) => {
    const chain = args[0] as string;
    const searchText = args[1] as string;
    const specificNode = args[2] ? (args[2] as string) : null;

    let response;
    try {
      response = await accountSearch(chain, searchText, specificNode);
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

export { createUserSearchStore, accountSearch };
