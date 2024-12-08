import { LoyaltyCode } from "../common/constants";
import { Network } from "../common/enums";
import { decodeUserAction, getFractalTxHexById } from "../utility";
import * as bitcoin from "bitcoinjs-lib";
import * as _ from "lodash";

export const decodeLoyalty = async (txId: string, network: Network) => {
  try {
    console.log("iniating decode loyalty txn for ", txId);
    const txHex = await getFractalTxHexById(txId, network);

    console.log("tx hex = ", txHex);

    const tx = bitcoin.Transaction.fromHex(txHex);

    console.log("total outs  =", tx.outs.length);

    for (const output of tx.outs) {
      const script = output.script;
      if (bitcoin.script.decompile(script)?.[0] === bitcoin.opcodes.OP_RETURN) {
        const opReturnData = bitcoin.script.decompile(script)?.slice(1);

        if (
          opReturnData &&
          opReturnData.length >= 2 &&
          opReturnData[0].toString() === LoyaltyCode
        ) {
          console.log("found loyalty txn");
          const loyaltyCode = opReturnData[0].toString();
          const hashedMetadata = (opReturnData[1] as Buffer).toString("hex");

          console.log("Loyalty Code:", loyaltyCode);
          console.log("Hashed Metadata:", hashedMetadata);
          console.log("original = ", "56317c547c4c7c61736466");

          const decodeAction = decodeUserAction(hashedMetadata);
          return decodeAction;
        } else {
          console.log("output doesnt contain loyalty txn");
          continue;
        }
      }
    }

    return null;
  } catch (err) {
    console.log("error decoding the loyalty psbt");
  }
};
