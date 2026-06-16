import { Apis } from "bitsharesjs-ws";
import { TransactionBuilder } from "bitsharesjs";
import { v4 as uuidv4 } from "uuid";

const chains = {
  bitshares: {
    nodeList: [
      {
        url: "wss://node.xbts.io/ws",
      },
      {
        url: "wss://api.bitshares.dev/ws",
      },
      {
        url: "wss://btsws.roelandp.nl/ws",
      },
    ],
  },
  bitshares_testnet: {
    nodeList: [
      {
        url: "wss://testnet.dex.trading/",
      },
      {
        url: "wss://testnet.xbts.io/ws",
      },
      {
        url: "wss://api-testnet.61bts.com/ws",
      },
    ],
  },
};

async function generateDeepLink(chain, nodeURL, opTypes, operations) {
  let apiInstance = null;
    const _node =
      nodeURL && nodeURL.length ? nodeURL : chains[chain].nodeList[0].url;

    try {
      apiInstance = await Apis.instance(
        _node,
        true,
        4000,
        { enableCrypto: false, enableOrders: true },
        (error) => console.log({ error }),
      );
      await apiInstance.init_promise;
    } catch (error) {
      console.log({ error, location: "api instance failed" });
      throw error;
    }

    let includesMemos = false;
    const tr = new TransactionBuilder();
    for (let i = 0; i < operations.length; i++) {
      if (operations[i].memo && operations[i].memo.message) {
        let encodedMessage;
        try {
          encodedMessage = Buffer.from(operations[i].memo.message, "utf-8");
        } catch (error) {
          console.log({ error, location: "encode memo failed" });
          throw error;
        }
        includesMemos = true;
        operations[i].memo.message = encodedMessage;
      }
      tr.add_type_operation(opTypes[i], operations[i]);
    }

    try {
      await tr.update_head_block();
    } catch (error) {
      console.log({ error, location: "update head block failed" });
      throw error;
    }

    try {
      await tr.set_required_fees();
    } catch (error) {
      console.log({ error, location: "set required fees failed" });
      throw error;
    }

    try {
      tr.set_expire_seconds(7200);
    } catch (error) {
      console.log({ error, location: "set expire seconds failed" });
      throw error;
    }

    try {
      tr.finalize();
    } catch (error) {
      console.log({ error, location: "finalize failed" });
      throw error;
    }

    const id = await uuidv4();

    const request = {
      type: "api",
      id: id,
      payload: {
        method: "injectedCall",
        params: ["signAndBroadcast", JSON.stringify(tr.toObject()), []],
        appName: "Bitshares Prediction Market UI",
        chain: chain === "bitshares" ? "BTS" : "BTS_TEST",
        browser: "web browser",
        origin: "localhost",
        memo: includesMemos,
      },
    };

    const encodedPayload = encodeURIComponent(JSON.stringify(request));
    return encodedPayload;
}

export { generateDeepLink };
