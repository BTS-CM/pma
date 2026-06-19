import { nanoquery } from "@nanostores/query";
import { chains } from "@/config/chains";
import { acquireConnection, releaseConnection } from "./src/ConnectionPool";

// Get the latest ID for an object in the blockchain
async function getMaxObjectIDs(
  chain: string,
  space_id: number,
  type_id: number,
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
      console.log({ error, node });
      console.log("Trying another node");
      return resolve(
        getMaxObjectIDs(
          chain,
          space_id,
          type_id,
          (chains as any)[chain].nodeList
            .map((x: any) => x.url)
            .filter((x: string) => x !== node)[0]
        )
      );
    }

    let nextObjectId;
    try {
      nextObjectId = await currentAPI
        .db_api()
        .exec("get_next_object_id", [space_id, type_id, false]);
    } catch (error) {
      console.log({ error, space_id, type_id });
      releaseConnection(node, currentAPI);

      console.log("Trying another node");
      return resolve(
        getMaxObjectIDs(
          chain,
          space_id,
          type_id,
          (chains as any)[chain].nodeList
            .map((x: any) => x.url)
            .filter((x: string) => x !== node)[0]
        )
      );
    }

    releaseConnection(node, currentAPI);

    // The next object ID is the maximum object ID plus one, so subtract one to get the maximum object ID
    resolve(parseInt(nextObjectId.split(".")[2]) - 1);
  });
}

const [createMaxObjectIDStore] = nanoquery({
  fetcher: async (...args: unknown[]) => {
    const chain = args[0] as string;
    const space_id = args[1] as number;
    const type_id = args[2] as number;
    const specificNode = args[3] ? (args[3] as string) : null;

    let response;
    try {
      response = await getMaxObjectIDs(chain, space_id, type_id, specificNode);
    } catch (error) {
      console.log({ error });
      return;
    }

    if (!response) {
      console.log(`Failed to fetch max object id`);
      return;
    }

    return response;
  },
});

export { createMaxObjectIDStore, getMaxObjectIDs };
