import { NextFunction, Request, Response } from "express";
import { updateCmtHistory } from "../business/updateCmtHistory";
import { BitmatrixSocket } from "../lib/BitmatrixSocket";
import { CommitmentTxHistoryProvider } from "../providers/CommitmentTxHistoryProvider";

export const commitmentTxHistoryController = {
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const txId = req.params.txId;
      const commitmentTxHistoryProvider = await CommitmentTxHistoryProvider.getProvider();
      const txDetail = await commitmentTxHistoryProvider.get(txId);
      console.log("txDetail", txDetail);
      const bitmatrixSocket = BitmatrixSocket.getInstance();
      bitmatrixSocket.currentSocket?.emit("cmtHistory", txDetail);

      return res.status(200).send(txDetail);
    } catch (error) {
      return res.status(501).send({ status: false, error });
    }
  },

  // Pool history update
  put: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const txId = req.params.txId;
      const data = req.body;
      console.log("data", data);
      console.log("txId", txId);

      const newHistory = await updateCmtHistory(txId, data);
      console.log("new hsi", newHistory);
      const bitmatrixSocket = BitmatrixSocket.getInstance();

      const commitmentTxHistoryProvider = await CommitmentTxHistoryProvider.getProvider();
      const chartData = await commitmentTxHistoryProvider.get(txId);
      console.log(chartData, "chartData");
      bitmatrixSocket.currentSocket?.emit("cmtHistory", chartData);

      return res.status(200).send(newHistory);
    } catch (error) {
      return res.status(501).send({ status: false, error });
    }
  },
};
