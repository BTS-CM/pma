import { nanoquery } from "@nanostores/query";
import { chains } from "@/config/chains";
import { acquireConnection, releaseConnection } from "./src/ConnectionPool";

function getAccountReferences(
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

    let accountReferences;
    try {
      accountReferences = await currentAPI
        .db_api()
        .exec("get_account_references", [accountID]);
    } catch (error) {
      console.log({ error });
      releaseConnection(node, currentAPI);
      reject(error);
      return;
    }

    releaseConnection(node, currentAPI);

    if (!accountReferences) {
      reject(new Error("Account references not found..."));
      return;
    }

    resolve(accountReferences);
  });
}

const [createAccountReferenceStore] = nanoquery({
  fetcher: async (...args: unknown[]) => {
    const chain = args[0] as string;
    const account_id = args[1] as string;
    let specificNode = args[2] ? (args[2] as string) : null;

    let response;
    try {
      response = await getAccountReferences(chain, account_id, specificNode);
    } catch (error) {
      console.log({ error });
      return;
    }

    if (!response) {
      console.log(`Failed to fetch account references...`);
      return;
    }

    return response;
  },
});

export { createAccountReferenceStore, getAccountReferences };
