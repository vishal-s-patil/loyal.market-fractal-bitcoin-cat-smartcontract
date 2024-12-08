import {
  CustomErrorResp,
  ICreateLoyaltyPsbtPayload,
} from "../common/interface";
import {
  concatenateActions,
  constructMetadata,
  generateNonce,
  getAddressTypeFromSigner,
  getFeeByPsbt,
  getFractalTxHexById,
  getFractalUtxo,
} from "../utility";
import {
  BitcoinAddressTypesSigner,
  LoyaltyVersion,
  Network,
} from "../common/enums";
import { TCreateLoyaltyPsbtResp, TUtxoResp } from "../common/types";
import {
  CustomError,
  ErrorCodes,
  LoyaltyCode,
  MINIMUM_UTXO_FOR_FRACTAL_INSCRIPTION_CHECK,
  RbfDefaultSequenceNumber,
} from "../common/constants";
import * as bitcoin from "bitcoinjs-lib";
import * as _ from "lodash";

export const createLoyaltyPsbt = async (
  data: ICreateLoyaltyPsbtPayload
): Promise<TCreateLoyaltyPsbtResp | CustomErrorResp> => {
  try {
    let inputUtxoSum = 0;

    console.log("rcvd req to create loyalty psbt", data);

    const unsignedPsbt = new bitcoin.Psbt({
      network: bitcoin.networks.bitcoin,
    });

    const incomingAddressType = await getAddressTypeFromSigner(
      data.userTaprootAddress,
      Network.mainnet
    );

    console.log("incoming address type ", incomingAddressType);
    const utxos = await getFractalUtxo(data.userTaprootAddress, data.network);

    console.log("utxos ", utxos);
    let totalBalanceAvailable = 0;

    const sortedFeeUtxos = _.chain(utxos)
      .filter((utxo: TUtxoResp) => {
        return (
          utxo.status.confirmed === true &&
          utxo.value > MINIMUM_UTXO_FOR_FRACTAL_INSCRIPTION_CHECK
        );
      })
      .sortBy((utxo) => {
        totalBalanceAvailable += utxo.value;
        return utxo.value;
      })
      .reverse()
      .valueOf();

    if (_.isEmpty(sortedFeeUtxos)) {
      console.log("no inscription free utxos found");
      throw ErrorCodes.NO_INSCRIPTION_FREE_UTXOS();
    }

    const actionHashes: string[] = [];

    console.log("encoding user actions");
    data.userActions.forEach((action) => {
      const metadata = constructMetadata(LoyaltyVersion.V1, action);
      console.log("encoding metadata = ", metadata);
      actionHashes.push(Buffer.from(metadata).toString("hex"));
    });

    console.log("all user actions encoded ", actionHashes);

    const concatenatedMetadata = concatenateActions(actionHashes);

    const hashedMetadata = concatenatedMetadata; //hashMetadata(concatenatedMetadata);

    console.log("hashed metadata ", hashedMetadata);

    unsignedPsbt.addOutput({
      address: data.userTaprootAddress,
      value: 330,
    });

    console.log("total script = ", [
      Buffer.from(LoyaltyCode, "utf-8").toString(),
      Buffer.from(hashedMetadata).toString(),
    ]);

    unsignedPsbt.addOutput({
      script: bitcoin.script.compile([
        bitcoin.opcodes.OP_RETURN,
        Buffer.from(LoyaltyCode, "utf-8"),
        Buffer.from(hashedMetadata),
      ]),
      value: 0,
    });

    console.log("attaching fee input to psbt");
    for (const _utxo in sortedFeeUtxos) {
      const utxo = sortedFeeUtxos[_utxo];
      const tx = bitcoin.Transaction.fromHex(
        await getFractalTxHexById(utxo.txid, data.network)
      );

      for (const output in tx.outs) {
        try {
          tx.setWitness(parseInt(output), []);
        } catch {}
      }

      let redeemScriptHex: any;
      let witnessUtxo: any;
      if (_.includes([BitcoinAddressTypesSigner.tr], incomingAddressType)) {
        const p2trPubkey =
          data.userTaprootAddressPubkey.length === 66
            ? data.userTaprootAddressPubkey.slice(2)
            : data.userTaprootAddressPubkey;
        const p2tr = bitcoin.payments.p2tr({
          internalPubkey: Buffer.from(p2trPubkey, "hex"),
        });
        redeemScriptHex = p2tr.internalPubkey;
        witnessUtxo = p2tr.output;
      }

      if (
        _.includes(
          [BitcoinAddressTypesSigner.wpkh, BitcoinAddressTypesSigner.sh],
          incomingAddressType
        )
      ) {
        const p2wpkh = bitcoin.payments.p2wpkh({
          pubkey: Buffer.from(data.userTaprootAddressPubkey, "hex"),
        });
        const p2sh = bitcoin.payments.p2sh({ redeem: p2wpkh });

        redeemScriptHex = p2sh.redeem?.output;

        if (incomingAddressType === BitcoinAddressTypesSigner.wpkh) {
          witnessUtxo = p2wpkh.output;
        } else {
          witnessUtxo = p2sh.output;
        }
      }

      unsignedPsbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        ...(!_.includes(
          [
            BitcoinAddressTypesSigner.tr,
            BitcoinAddressTypesSigner.sh,
            BitcoinAddressTypesSigner.wpkh,
          ],
          incomingAddressType
        ) && { nonWitnessUtxo: tx.toBuffer() }),
        witnessUtxo: { script: witnessUtxo, value: utxo.value },
        ...(_.includes([BitcoinAddressTypesSigner.tr], incomingAddressType) && {
          tapInternalKey: redeemScriptHex,
        }),
        ...(_.includes([BitcoinAddressTypesSigner.sh], incomingAddressType) && {
          redeemScript: redeemScriptHex,
        }),

        sequence: RbfDefaultSequenceNumber,
        sighashType: bitcoin.Transaction.SIGHASH_ALL,
      });

      const fee = getFeeByPsbt({
        psbt: unsignedPsbt,
        feeRate: data.feeRate,
      });
      inputUtxoSum += utxo.value;

      if (inputUtxoSum >= fee) {
        break;
      }
    }

    const finalFee = getFeeByPsbt({
      psbt: unsignedPsbt
        .clone()
        .addOutput({ value: 0, address: data.userTaprootAddress }),
      feeRate: data.feeRate,
    });

    const changeAmount = inputUtxoSum - finalFee;

    if (changeAmount < 0) {
      throw ErrorCodes.INSUFFICICENT_BALANCE(Math.abs(changeAmount));
    }

    // change amount
    unsignedPsbt.addOutput({
      address: data.userTaprootAddress,
      value: changeAmount,
    });

    return {
      unsignedPsbtHex: unsignedPsbt.toHex(),
      unsignedPsbtBase64: unsignedPsbt.toBase64(),
    };
  } catch (e) {
    console.log("error generating loyalty psbt", e);
    if (e instanceof CustomError) {
      return {
        statusCode: e.statusCode,
        errorCode: e.errorCode,
        body: JSON.stringify({ ...e, errorMessage: e.message }),
      };
    } else {
      const err = ErrorCodes.GENERIC_ERROR("error creating loyalty psbt");
      return {
        statusCode: 500,
        errorCode: err.errorCode,
        body: JSON.stringify({ ...err, errorMessage: err.message }),
      };
    }
  }
};
