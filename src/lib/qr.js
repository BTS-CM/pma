import { Apis } from "bitsharesjs-ws";
import { TransactionBuilder } from "bitsharesjs";

/**
 * Generate a transaction object suitable for QR encoding.
 * @param {"bitshares"|"bitshares_testnet"} chain
 * @param {string} nodeURL - WebSocket endpoint to use; may be undefined/empty
 * @param {string[]} opTypes - Operation type strings (e.g., ["transfer"]) aligned with operations
 * @param {object[]} operations - Operation payload objects
 * @returns {Promise<object>} Transaction object
 */
async function generateQRContents(chain, nodeURL, opTypes, operations) {
    const defaultNodes = {
      bitshares: [
        "wss://node.xbts.io/ws",
        "wss://api.bitshares.dev/ws",
        "wss://btsws.roelandp.nl/ws",
      ],
      bitshares_testnet: [
        "wss://testnet.dex.trading/",
        "wss://testnet.xbts.io/ws",
        "wss://api-testnet.61bts.com/ws",
      ],
    };

    const _node =
      nodeURL && nodeURL.length ? nodeURL : defaultNodes[chain]?.[0];

    try {
      const apiInstance = Apis.instance(_node, false);
      const rs = apiInstance.ws_rpc?.ws?.readyState;
      if (!apiInstance.init_promise || (rs !== 1 && rs !== 0)) {
        await Apis.instance(
          _node,
          true,
          4000,
          { enableCrypto: false, enableOrders: true },
          (error) => console.log({ error }),
        );
      }
      await apiInstance.init_promise;
    } catch (error) {
      console.log({ error, location: "api instance failed (QR)" });
      throw error;
    }

    const tr = new TransactionBuilder();

    for (let i = 0; i < operations.length; i++) {
      const op = { ...operations[i] };
      if (op.memo && typeof op.memo.message === "string") {
        try {
          op.memo.message = Buffer.from(op.memo.message, "utf-8");
        } catch (error) {
          console.log({ error, location: "encode memo failed (QR)" });
          throw error;
        }
      }
      tr.add_type_operation(opTypes[i], op);
    }

    try {
      await tr.set_required_fees();
    } catch (error) {
      console.error(error);
      throw error;
    }

    try {
      await tr.update_head_block();
    } catch (error) {
      console.error(error);
      throw error;
    }

    try {
      await tr.set_expire_seconds(4000);
    } catch (error) {
      console.error(error);
      throw error;
    }

    return tr.toObject();
}

export { generateQRContents };
