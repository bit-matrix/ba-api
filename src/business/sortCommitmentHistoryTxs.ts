import { CommitmentTxHistory } from "@bitmatrix/models";

type CTXHistoryResult = {
  key: string;
  val: CommitmentTxHistory;
};

export const sortCommitmentHistoryTxs = (commitmentHistoryTxs: CTXHistoryResult[], reverted = false): CTXHistoryResult[] => {
  const copyTxs = [...commitmentHistoryTxs];
  let sortedCommitmentHistoryTxs: CTXHistoryResult[] = [];

  if (reverted) {
    sortedCommitmentHistoryTxs = copyTxs.sort((first: CTXHistoryResult, last: CTXHistoryResult) => {
      if (last.val.timestamp && first.val.timestamp) {
        return first.val.timestamp - last.val.timestamp;
      }
      return 0;
    });
  } else {
    sortedCommitmentHistoryTxs = copyTxs.sort((first: CTXHistoryResult, last: CTXHistoryResult) => {
      if (last.val.timestamp && first.val.timestamp) {
        return last.val.timestamp - first.val.timestamp;
      }
      return 0;
    });
  }

  return sortedCommitmentHistoryTxs;
};
