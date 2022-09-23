import { TxStatus } from "@bitmatrix/models";
import { NextFunction, Request, Response } from "express";
import { sortCommitmentHistoryTxs } from "../business/sortCommitmentHistoryTxs";
import { BitmatrixSocket } from "../lib/BitmatrixSocket";
import { CommitmentTxHistoryProvider } from "../providers/CommitmentTxHistoryProvider";
import { checkTxStatus } from "../utils/tracking";

export const commitmentTxHistoryController = {
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const txId = req.params.txId;
      const commitmentTxHistoryProvider = await CommitmentTxHistoryProvider.getProvider();
      const txDetail = await commitmentTxHistoryProvider.get(txId);

      return res.status(200).send(txDetail);
    } catch (error) {
      return res.status(501).send({ status: false, error });
    }
  },

  post: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const txId = req.params.txId;
      const data = { ...req.body };

      const commitmentTxHistoryProvider = await CommitmentTxHistoryProvider.getProvider();
      const newHistory = await commitmentTxHistoryProvider.post(txId, data);
      const allCtxHistory = await commitmentTxHistoryProvider.getMany();

      const sortedAllCtxHistory = sortCommitmentHistoryTxs(allCtxHistory);

      const bitmatrixSocket = BitmatrixSocket.getInstance();
      bitmatrixSocket.io.sockets.emit("ctxHistory", sortedAllCtxHistory);

      bitmatrixSocket.getWaitinglist().forEach(async (followUp) => {
        const index = followUp.txIds.findIndex((txid) => txid === txId);

        if (index > -1) {
          const emitSocketId = followUp.socketId;

          const txStatus = await checkTxStatus(followUp.txIds, bitmatrixSocket.redis, commitmentTxHistoryProvider);

          const txStatusResults: TxStatus[] = await Promise.all(txStatus);

          bitmatrixSocket.io.to(emitSocketId).emit("checkTxStatusResponse", txStatusResults);
        }
      });

      return res.status(200).send(newHistory);
    } catch (error) {
      return res.status(501).send({ status: false, error });
    }
  },
};
