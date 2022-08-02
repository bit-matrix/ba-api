import { BmChart } from "../model/BmChart";
import { ChartProvider } from "../providers/ChartProvider";

export const updateChart = async (asset: string, data: BmChart): Promise<BmChart[]> => {
  const chartProvider = await ChartProvider.getProvider();
  const exist: BmChart[] = (await chartProvider.get(asset)) || [];

  const result: BmChart[] = [...exist];

  result.push(data);

  result.sort((a, b) => a.time - b.time);

  await chartProvider.put(asset, result);

  return result;
};
