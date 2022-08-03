import { NextFunction, Request, Response } from "express";
import { updateChart } from "../business/updateChart";
import { BitmatrixSocket } from "../lib/BitmatrixSocket";
import { ChartProvider } from "../providers/ChartProvider";
import { calculateChartData } from "../utils";

// export const chartController = {
//   get: async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const asset = req.params.asset;

//        const chartProvider = await ChartProvider.getProvider();
//        const result = await chartProvider.get(asset);

//        return res.status(200).send(result);

//     } catch (error) {
//       return res.status(501).send({ status: false, error });
//     }
//   },

export const chartController = {
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const asset = req.params.asset;
      const chartProvider = await ChartProvider.getProvider();
      const chartData = await chartProvider.get(asset);
      const data = calculateChartData(chartData || [], asset);

      return res.status(200).send(data);
    } catch (error) {
      return res.status(501).send({ status: false, error });
    }
  },

  // Pool history update
  put: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const asset = req.params.asset;
      const data = req.body;
      const newChart = await updateChart(asset, data);

      const bitmatrixSocket = BitmatrixSocket.getInstance();
      const calculatedData = calculateChartData(newChart, asset);

      bitmatrixSocket.currentSocket?.emit("poolchart", calculatedData);

      return res.status(200).send(newChart);
    } catch (error) {
      return res.status(501).send({ status: false, error });
    }
  },

  getPoolsChart: async (req: any, res: Response, next: NextFunction) => {
    try {
      const poolIds: string = req.query.ids;
      const poolIdArray: string[] = poolIds.split(",");

      // @TO-DO data çekilecek
      const chartProvider = await ChartProvider.getProvider();

      const poolsData = await Promise.all(
        poolIdArray.map(async (poolId) => {
          const chartData = await chartProvider.get(poolId);

          return calculateChartData(chartData as any, poolId);
        })
      );

      return res.status(200).send(poolsData);
    } catch (error) {
      return res.status(501).send({ status: false, error });
    }
  },
};
