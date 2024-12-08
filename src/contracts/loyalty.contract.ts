import {
  assert,
  ByteString,
  hash256,
  method,
  prop,
  sha256,
  Sha256,
  SmartContract,
} from "scrypt-ts";

export class Loyalty extends SmartContract {
  @prop(true)
  loyalPoints: BigInt;

  @prop()
  ownerPubKey: Sha256;

  constructor(ownerPubKey: Sha256) {
    super(...arguments);
    this.loyalPoints = BigInt(0);
    this.ownerPubKey = ownerPubKey;
  }

  @method()
  public increaseLoyalPoints(points: BigInt) {
    this.loyalPoints = points;
    const amount: bigint = this.ctx.utxo.value;
    const outputs: ByteString =
      this.buildStateOutput(amount) + this.buildChangeOutput();
    assert(this.ctx.hashOutputs == hash256(outputs), "hashOutputs mismatch");
  }

  @method()
  public redeemPoints() {
    assert(this.ctx.hashOutputs === this.ownerPubKey, "owner has to redeem");
  }
}
