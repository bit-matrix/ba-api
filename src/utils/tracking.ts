import Redis from "ioredis";
import { CommitmentTxHistoryProvider } from "../providers/CommitmentTxHistoryProvider";
import { fetchRedisAllData } from "./redis";

enum TX_STATUS {
  PENDING,
  WAITING_PTX,
  WAITING_PTX_CONFIRM,
  SUCCESS,
  FAILED,
}

export const checkTxStatus = async (txIdsArr: string[], client: Redis) => {
  const parsedValues = await fetchRedisAllData(client);
  const ctxHistoryProvider = await CommitmentTxHistoryProvider.getProvider();

  return txIdsArr.map(async (tia) => {
    const redisData = parsedValues.find((val) => val.commitmentData.transaction.txid === tia);

    // founded ctx
    if (redisData) {
      if (redisData.poolTxInfo) {
        return { txId: tia, poolTxId: redisData.poolTxInfo?.txId, status: TX_STATUS.WAITING_PTX_CONFIRM };
      }

      return { txId: tia, poolTxId: "", status: TX_STATUS.WAITING_PTX };
    }

    const ctxHistory = await ctxHistoryProvider.get(tia);

    if (ctxHistory) {
      if (ctxHistory.isSuccess) {
        return { txId: tia, poolTxId: ctxHistory.txId, status: TX_STATUS.SUCCESS };
      }

      return { txId: tia, poolTxId: ctxHistory.txId, status: TX_STATUS.FAILED, errorMessages: ctxHistory.failReasons ? ctxHistory.failReasons.join(",") : [] };
    }

    return { txId: tia, poolTxId: "", status: TX_STATUS.PENDING };
  });
};
