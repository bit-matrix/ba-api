import Redis from "ioredis";
import { CommitmentTxHistoryProvider } from "../providers/CommitmentTxHistoryProvider";
import { fetchRedisAllData } from "./redis";
import { CommitmentTxHistory, TX_STATUS } from "@bitmatrix/models";

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

      return { txId: tia, poolTxId: ctxHistory.txId, status: TX_STATUS.FAILED, errorMessages: ctxHistory.failReasons };
    }

    return { txId: tia, poolTxId: "", status: TX_STATUS.PENDING };
  });
};

export const checkTxStatusWithoutHistory = async (txIdsArr: string[], client: Redis) => {
  const parsedValues = await fetchRedisAllData(client);

  return txIdsArr.map(async (tia) => {
    const redisData = parsedValues.find((val) => val.commitmentData.transaction.txid === tia);

    // founded ctx
    if (redisData) {
      if (redisData.poolTxInfo) {
        return { txId: tia, poolTxId: redisData.poolTxInfo?.txId, status: TX_STATUS.WAITING_PTX_CONFIRM };
      }

      return { txId: tia, poolTxId: "", status: TX_STATUS.WAITING_PTX };
    }

    return { txId: tia, poolTxId: "", status: TX_STATUS.PENDING };
  });
};

export const checkTxStatusOnlyHistory = async (txIdsArr: string[], provider: CommitmentTxHistoryProvider) => {
  return txIdsArr.map(async (tia) => {
    const ctxHistory = await provider.get(tia);

    if (ctxHistory) {
      if (ctxHistory.isSuccess) {
        return { txId: tia, poolTxId: ctxHistory.txId, status: TX_STATUS.SUCCESS };
      }

      return { txId: tia, poolTxId: ctxHistory.txId, status: TX_STATUS.FAILED, errorMessages: ctxHistory.failReasons };
    }

    return { txId: tia, poolTxId: "", status: TX_STATUS.PENDING };
  });
};
