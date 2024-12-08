export const FractalMempoolTestnetApi =
  "https://mempool-testnet.fractalbitcoin.io/api";

export const FractalMempoolMainnetApi = "https://mempool.fractalbitcoin.io/api";

export const MINIMUM_UTXO_FOR_FRACTAL_INSCRIPTION_CHECK = 1000;

export const RbfDefaultSequenceNumber = 0xfffffffd;

export const LoyaltyCode = "777";

export class CustomError extends Error {
  public errorType: string;
  public statusCode: number;
  public errorCode: string;

  constructor(
    errorType: string,
    errorMessage: string,
    statusCode: number,
    errorCode: string
  ) {
    super(errorMessage);
    this.name = this.constructor.name;
    this.errorType = errorType;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export interface CustomErrorResp {
  errorCode: string;
  statusCode: number;
  body: string;
}

export const ErrorCodes = {
  GENERIC_ERROR: function (
    message: string = "Something went wrong, please try again"
  ) {
    return new CustomError(
      "InternalServerError",
      message,
      500,
      "LOYALTYAPIERROR001"
    );
  },

  NO_INSCRIPTION_FREE_UTXOS: function () {
    return new CustomError(
      "BadRequest",
      "Insufficient funds in wallet",
      400,
      "LOYALTYAPIERROR002"
    );
  },

  INSUFFICICENT_BALANCE: function (shortageAmountInSats: number) {
    return new CustomError(
      "BadRequest",
      "Insufficient funds in wallet",
      400,
      "LOYALTYAPIERROR003"
    );
  },
};
