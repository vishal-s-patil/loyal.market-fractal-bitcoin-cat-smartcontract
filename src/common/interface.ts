import { ACTION_CODES, LoyaltyVersion, Network, PLATFORM_CODES } from "./enums";
import * as bitcoin from "bitcoinjs-lib";

export interface ICreateLoyaltyPsbtPayload {
  userActions: IUserAction[];
  userTaprootAddress: string;
  userTaprootAddressPubkey: string;
  network: Network;
  feeRate: number;
}

export interface IUserAction {
  version: LoyaltyVersion;
  platformCode: PLATFORM_CODES;
  actionCode: ACTION_CODES;
  interactionId: string;
  // timestamp: number;
  // userId: string;
}

export interface IGetFeeByPsbt {
  psbt: bitcoin.Psbt;
  feeRate: number;
}

export interface CustomErrorResp {
  errorCode: string;
  statusCode: number;
  body: string;
}
