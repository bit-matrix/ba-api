import { NextFunction, Request, Response } from "express";
import { updateChart } from "../business/updateChart";
import { dummyChartData } from "../data/dummyChartData";
import { ChartProvider } from "../providers/ChartProvider";

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
      return res.status(200).send(dummyChartData);
    } catch (error) {
      return res.status(501).send({ status: false, error });
    }
  },

  put: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const asset = req.params.asset;
      const limit = Number(req.query.limit?.toString() || 10000);

      const newChart = await updateChart(asset, limit);

      return res.status(200).send(newChart);
    } catch (error) {
      return res.status(501).send({ status: false, error });
    }
  },
};
