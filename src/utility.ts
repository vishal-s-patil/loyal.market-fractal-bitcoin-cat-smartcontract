import {
  BitcoinAddressTypesSigner,
  LoyaltyVersion,
  Network,
} from "./common/enums";
import { TUtxoResp } from "./common/types";
import {
  FractalMempoolMainnetApi,
  FractalMempoolTestnetApi,
} from "./common/constants";
import { IGetFeeByPsbt, IUserAction } from "./common/interface";
import * as crypto from "crypto";
import * as btcSigner from "@scure/btc-signer";
import * as _ from "lodash";

export const generateNonce = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

// export const hashMetadata = (metadata: string): string => {
//   return crypto.createHash("sha256").update(metadata).digest("hex");
// };

export const getAddressTypeFromSigner = async (
  address: string,
  network: Network
): Promise<BitcoinAddressTypesSigner> => {
  try {
    const _network =
      network === Network.mainnet ? btcSigner.NETWORK : btcSigner.TEST_NETWORK;

    const addressType = btcSigner.Address(_network).decode(address);

    return addressType.type as BitcoinAddressTypesSigner;
  } catch (e) {
    return BitcoinAddressTypesSigner.unknown;
  }
};

export const getFractalUtxo = async (
  address: string,
  network: Network
): Promise<TUtxoResp[]> => {
  const url =
    network === Network.mainnet
      ? FractalMempoolMainnetApi
      : FractalMempoolTestnetApi;

  const res = await fetch(`${url}/address/${address}/utxo`)
    .then((res) => res.json())
    .catch((e) => []);

  return res;
};

export const getFractalTxHexById = async (txId: string, network: Network) => {
  const url =
    network === Network.mainnet
      ? FractalMempoolMainnetApi
      : FractalMempoolTestnetApi;
  const txHexById = await fetch(`${url}/tx/${txId}/hex`)
    .then((response) => {
      return response.text();
    })
    .catch((e) => {
      return "";
    });
  return txHexById;
};

export const getFeeByPsbt = (data: IGetFeeByPsbt): number => {
  try {
    const txnSize = data.psbt.data.getTransaction().length;

    const fee = txnSize * data.feeRate;

    return fee;
  } catch (e) {
    return 0;
  }
};

export const concatenateActions = (actionHashes: string[]): string => {
  return actionHashes.join("||");
};

export const decodeUserAction = (hexData: string): IUserAction => {
  console.log("decoding hex to user action", hexData);
  const asciiData = Buffer.from(hexData, "hex").toString();

  console.log("ascii user action = ", asciiData);
  const [
    version,
    platformCode,
    actionCode,
    interactionId,
    timestamp,
    nounce,
    userId,
  ] = _.split(Buffer.from(asciiData, "hex").toString(), "|");

  return {
    version: version as any,
    platformCode: platformCode as any,
    actionCode: actionCode as any,
    interactionId: interactionId as any,
    // timestamp: _.toNumber(timestamp),
    // userId: userId,
  };
};

export const constructMetadata = (
  version: LoyaltyVersion, // for future
  action: IUserAction
) => {
  return `${version}|${action.platformCode}|${action.actionCode}|${action.interactionId}`;
};
