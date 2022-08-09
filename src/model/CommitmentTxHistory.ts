import { CALL_METHOD } from "@bitmatrix/models";

export type CommitmentTxHistory = {
  time: number;
  poolId: string;
  method: CALL_METHOD;
  txId: string;
  isSuccess: boolean;
  failReasons?: string[];
};
