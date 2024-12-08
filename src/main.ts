import {
  ACTION_CODES,
  Chain,
  LoyaltyVersion,
  Network,
  PLATFORM_CODES,
} from "./common/enums";
import { createLoyaltyPsbt } from "./loyalty/loyaltyPsbt";
import * as bitcoin from "bitcoinjs-lib/";
import * as _ from "lodash";
import * as ecc from "tiny-secp256k1";
import * as dotenv from "dotenv";
import { decodeLoyalty } from "./loyalty/decodeLoyalty";
import { TgBot } from "./botInstance";
import express from "express";
bitcoin.initEccLib(ecc);

const botInstance = TgBot.getInstance();
const bot = botInstance.getBot();

const app = express();
const host = process.env.SERVER_HOST_NAME || "localhost";
const port = process.env.PORT || 8000;

const publishLoyaltyTxn = async () => {
  try {
    const loyaltyPsbt = await createLoyaltyPsbt({
      userActions: [
        {
          version: LoyaltyVersion.V1,
          platformCode: PLATFORM_CODES.twitter,
          actionCode: ACTION_CODES.like,
          interactionId: "asdf",
          // timestamp: 1733477755104,
          // userId: "xyz",
        },
      ],
      userTaprootAddress:
        "bc1pzy24xv6fgv84drmr8f337mamfw97jtnmvg3ue7zqgl0w267kexuqy0ypku",
      userTaprootAddressPubkey:
        "02b34a1ed01784a5d15d7e9b47a63581cca5ab0e71f9fabddd41f01eec0c43fa2e",
      network: Network.mainnet,
      feeRate: 90,
    });
    console.log("loyalty psbt", loyaltyPsbt);
  } catch (e) {
    console.log("error publishing loyalty txn", e);
  }
};

const decodeLoyaltyTxn = async (txId: string) => {
  try {
    console.log("decoding txn = ");

    const decodedLoyalty = await decodeLoyalty(txId, Network.mainnet);

    console.log("decoded loyalty resp = ", decodedLoyalty);
  } catch (e) {
    console.log("error decoding loyalty txn"), e;
  }
};

const main = async () => {
  try {
    // publishLoyaltyTxn();
    decodeLoyaltyTxn(
      // "d6e8a096a22f2eb9f01886d0796d9b3327133deb5030b61e82b1c7e66581049d"
      "866733d3b0d607d4923f08912d72f70acc9ae721a03cc6713f7ec09d9e1d87e5"
    );
  } catch (e) {
    console.log("error from main", e);
  }
};

app.get("/redirect-unisat-wallet", async (req, res) => {
  try {
    const tgId = req.query.tgId;
    const name = req.query.name;
    const chain = req.query.chain?.toString() || Chain.FRACTAL_BITCOIN;

    const payload = tgId + "," + name;

    const endpoint = `unisat://request?method=connect&from=http://${host}:${port}/manage-unisat-resp/fbtc-wallet?payload=${payload}`;

    res.redirect(endpoint);
  } catch (e) {
    res.sendStatus(500);
    return;
  }
});

bot.start();
