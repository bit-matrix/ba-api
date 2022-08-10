import { NextFunction, Request, Response } from "express";
import { BitmatrixSocket } from "../lib/BitmatrixSocket";
import { CommitmentTxHistoryProvider } from "../providers/CommitmentTxHistoryProvider";

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
      data.time = new Date().getTime();

      const commitmentTxHistoryProvider = await CommitmentTxHistoryProvider.getProvider();
      const newHistory = await commitmentTxHistoryProvider.post(txId, data);
      const allCtxHistory = await commitmentTxHistoryProvider.getMany();

      const bitmatrixSocket = BitmatrixSocket.getInstance();
      bitmatrixSocket.currentSocket?.emit("ctxHistory", allCtxHistory);

      return res.status(200).send(newHistory);
    } catch (error) {
      return res.status(501).send({ status: false, error });
    }
  },
};
