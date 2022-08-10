import { BmChart } from "@bitmatrix/models";
import { PoolTxHistoryProvider } from "../providers/PoolTxHistoryProvider";

export const updateChart = async (asset: string, data: BmChart): Promise<BmChart[]> => {
  const poolTxHistoryProvider = await PoolTxHistoryProvider.getProvider();
  let exist: BmChart[] = [];

  const databaseData = await poolTxHistoryProvider.get(asset);

  if (databaseData && databaseData[0] !== null) exist = databaseData;

  const result: BmChart[] = [...exist];

  result.push(data);

  result.sort((a, b) => a.time - b.time);

  await poolTxHistoryProvider.put(asset, result);

  return result;
};
