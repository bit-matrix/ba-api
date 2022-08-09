import { CommitmentTxHistory } from "../model/CommitmentTxHistory";
import { CommitmentTxHistoryProvider } from "../providers/CommitmentTxHistoryProvider";

export const updateCmtHistory = async (txId: string, data: CommitmentTxHistory): Promise<CommitmentTxHistory[]> => {
  const commitmentTxHistoryProvider = await CommitmentTxHistoryProvider.getProvider();
  let exist: CommitmentTxHistory[] = [];

  const databaseData = await commitmentTxHistoryProvider.get(txId);

  if (databaseData && databaseData !== undefined) exist[0] = databaseData;

  const result: CommitmentTxHistory[] = [...exist];

  result.push(data);

  result.sort((a, b) => a.time - b.time);

  await commitmentTxHistoryProvider.put(txId, result[0]);

  return result;
};
