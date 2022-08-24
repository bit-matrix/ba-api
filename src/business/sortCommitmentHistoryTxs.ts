import { CommitmentTxHistory } from "@bitmatrix/models";

type CTXHistoryResult = {
  key: string;
  val: CommitmentTxHistory;
};

export const sortCommitmentHistoryTxs = async (commitmentHistoryTxs: CTXHistoryResult[]): Promise<CTXHistoryResult[]> => {
  const copyTxs = [...commitmentHistoryTxs];

  const sortedCommitmentHistoryTxs = copyTxs.sort((first: CTXHistoryResult, last: CTXHistoryResult) => {
    if (last.val.timestamp && first.val.timestamp) {
      return last.val.timestamp - first.val.timestamp;
    }
    return 0;
  });

  return sortedCommitmentHistoryTxs;
};
