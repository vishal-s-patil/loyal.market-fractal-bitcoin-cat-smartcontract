export type TUtxoResp = {
  txid: string;
  vout: number;
  status: {
    confirmed: boolean;
    block_height: number;
    block_hash: string;
    block_time: number;
  };
  value: number;
};

export type TCreateLoyaltyPsbtResp = {
  unsignedPsbtHex: string;
  unsignedPsbtBase64: string;
};
