import rocksdb from "rocksdb";
import { DATA_DIR } from "../env";
import { CommitmentTxHistory } from "@bitmatrix/models";
import { RocksDbProvider } from "./RocksDbProvider";

export class CommitmentTxHistoryProvider {
  private static location: string = DATA_DIR + "commitmentTxHistory";
  private static _dbProvider: RocksDbProvider;
  private static _provider: CommitmentTxHistoryProvider;
  private constructor() {}

  public static getProvider = async (): Promise<CommitmentTxHistoryProvider> => {
    if (CommitmentTxHistoryProvider._provider === undefined) {
      const db = rocksdb(this.location);

      const openPromise = new Promise<void>((resolve, reject) => {
        db.open({ createIfMissing: true, errorIfExists: false }, (err) => {
          if (err) {
            console.error("CommitmentTxHistoryProvider.constructor.db.open.error", err);
            reject(err);
          }
          resolve();
        });
      });
      await openPromise;

      CommitmentTxHistoryProvider._dbProvider = new RocksDbProvider(db);
      CommitmentTxHistoryProvider._provider = new CommitmentTxHistoryProvider();
    }
    return CommitmentTxHistoryProvider._provider;
  };

  get = async (key: string): Promise<CommitmentTxHistory | undefined> => CommitmentTxHistoryProvider._dbProvider.get<CommitmentTxHistory>(key);

  post = async (key: string, value: CommitmentTxHistory): Promise<CommitmentTxHistory> => CommitmentTxHistoryProvider._dbProvider.put<CommitmentTxHistory>(key, value);

  getMany = async (): Promise<{ key: string; val: CommitmentTxHistory }[]> => CommitmentTxHistoryProvider._dbProvider.getMany<CommitmentTxHistory>();
}
