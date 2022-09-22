import { BmChartResult } from "@bitmatrix/models";
import { NextFunction, Request, Response } from "express";
import { updateChart } from "../business/updateChart";
import { BitmatrixSocket } from "../lib/BitmatrixSocket";
import { PoolTxHistoryProvider } from "../providers/PoolTxHistoryProvider";
import { calculateChartData } from "../utils";

export const poolTxHistoryController = {
  // Pool history update
  put: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const asset = req.params.asset;
      const data = req.body;
      const newChart = await updateChart(asset, data);

      const bitmatrixSocket = BitmatrixSocket.getInstance();

      const poolTxHistoryProvider = await PoolTxHistoryProvider.getProvider();
      const chartData = await poolTxHistoryProvider.getMany();

      const calculatedPoolsData = chartData.map((data: BmChartResult) => {
        return calculateChartData(data.val, data.key);
      });

      const finalData = await Promise.all(calculatedPoolsData);

      bitmatrixSocket.io.sockets?.emit("poolschart", finalData);

      return res.status(200).send(newChart);
    } catch (error) {
      return res.status(501).send({ status: false, error });
    }
  },
};
