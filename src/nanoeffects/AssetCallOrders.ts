import { nanoquery } from "@nanostores/query";
import { chains } from "@/config/chains";
import { acquireConnection, releaseConnection } from "./src/ConnectionPool";

function getAssetCallOrders(
  chain: string,
  ids: string[],
  specificNode?: string | null,
  existingAPI?: any
) {
  return new Promise(async (resolve, reject) => {
    let currentAPI;
    if (existingAPI) {
      currentAPI = existingAPI;
    } else {
      let node = specificNode
        ? specificNode
        : (chains as any)[chain].nodeList[0].url;
      try {
        currentAPI = await acquireConnection(node);
      } catch (error) {
        console.log({ error });
        reject(error);
        return;
      }
    }

    try {
      const assetCallOrders = await Promise.all(
        ids.map(async (id) => {
          const result = await currentAPI
            .db_api()
            .exec("get_call_orders", [id, 300]);
          return { [id]: result };
        })
      );

      if (!existingAPI) {
        releaseConnection(specificNode || (chains as any)[chain].nodeList[0].url, currentAPI);
      }

      if (assetCallOrders) {
        return resolve(Object.assign({}, ...assetCallOrders));
      }

      return reject(new Error("Couldn't retrieve asset call orders"));
    } catch (error) {
      console.log({ error });
      if (!existingAPI) {
        releaseConnection(specificNode || (chains as any)[chain].nodeList[0].url, currentAPI);
      }
      return reject(error);
    }
  });
}

const [createAssetCallOrdersStore] = nanoquery({
  fetcher: async (...args: unknown[]) => {
    const chain = args[0] as string;
    const ids = JSON.parse(args[1] as string);

    let specificNode = args[2] ? (args[2] as string) : null;

    let response;
    try {
      response = await getAssetCallOrders(chain, ids, specificNode);
    } catch (error) {
      console.log({ error });
      return;
    }

    if (!response) {
      console.log(`Failed to fetch asset call orders`);
      return;
    }

    return response;
  },
});

export { getAssetCallOrders, createAssetCallOrdersStore };
