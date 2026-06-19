import { nanoquery } from "@nanostores/query";
import { chains } from "@/config/chains";
import { acquireConnection, releaseConnection } from "./src/ConnectionPool";
import { getObjects } from "./src/common";
import { getAccountBalances } from "@/nanoeffects/UserBalances.ts";

const [createSmartcoinsStore] = nanoquery({
  fetcher: async (...args: unknown[]) => {
    const chain = args[0] as string;
    const accountID = args[1] as string;
    let specificNode = args[2] ? (args[2] as string) : null;
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
      let accountBalances: any;
      try {
        accountBalances = await getAccountBalances(
          chain,
          accountID,
          node,
          currentAPI
        );
      } catch (error) {
        console.log({ error });
        return;
      }

      let nextObjectId;
      try {
        nextObjectId = await currentAPI
          .db_api()
          .exec("get_next_object_id", [2, 4, false]);
      } catch (error) {
        console.log({ error });
        return;
      }

      const maxObjectID = parseInt(nextObjectId.split(".")[2]) - 1;
      let smartcoinIDs: string[] = Array.from(
        { length: maxObjectID },
        (_, i) => `2.4.${i}`
      );

      let allSmartcoinData;
      try {
        allSmartcoinData = await getObjects(
          chain,
          smartcoinIDs,
          specificNode,
          currentAPI
        );
      } catch (error) {
        console.log({ error });
        return;
      }

      if (!allSmartcoinData) {
        console.log(`Failed to fetch every object`);
        return [];
      }

      const assetIDs: string[] = [
        ...new Set([
          ...allSmartcoinData.map((x) => x.asset_id),
          ...allSmartcoinData.map((x) => x.options.short_backing_asset),
        ]),
      ];

      let allAssetData;
      try {
        allAssetData = await getObjects(
          chain,
          assetIDs,
          specificNode,
          currentAPI
        );
      } catch (error) {
        console.log({ error });
        return;
      }

      const issuerIDs: any[] = [...new Set(allAssetData.map((x) => x.issuer))];

      let allIssuerData;
      try {
        allIssuerData = await getObjects(
          chain,
          issuerIDs,
          specificNode,
          currentAPI
        );
      } catch (error) {
        console.log({ error });
        return;
      }

      return {
        _smartcoins: allSmartcoinData,
        _assets: allAssetData,
        _issuers: allIssuerData,
        _balances: accountBalances,
      };
    } finally {
      releaseConnection(node, currentAPI);
    }
  },
});

export { createSmartcoinsStore };
