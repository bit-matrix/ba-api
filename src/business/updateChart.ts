import { BmChart } from "../model/BmChart";
import { ChartProvider } from "../providers/ChartProvider";

export const updateChart = async (asset: string, data: BmChart): Promise<BmChart[]> => {
  const chartProvider = await ChartProvider.getProvider();
  let exist: BmChart[] = [];

  const databaseData = await chartProvider.get(asset);

  if (databaseData && databaseData[0] !== null) exist = databaseData;

  const result: BmChart[] = [...exist];

  result.push(data);

  result.sort((a, b) => a.time - b.time);

  await chartProvider.put(asset, result);

  return result;
};
