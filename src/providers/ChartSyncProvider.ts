import rocksdb from "rocksdb";
import { DATA_DIR } from "../env";
import { RocksDbProvider } from "./RocksDbProvider";

export class ChartSyncProvider {
  private static location: string = DATA_DIR + "chart-sync";
  private static _dbProvider: RocksDbProvider;
  private static _provider: ChartSyncProvider;
  private constructor() {}

  public static getProvider = async (): Promise<ChartSyncProvider> => {
    if (ChartSyncProvider._provider === undefined) {
      const db = rocksdb(this.location);

      const openPromise = new Promise<void>((resolve, reject) => {
        db.open({ createIfMissing: true, errorIfExists: false }, (err) => {
          if (err) {
            console.error("ChartSyncProvider.constructor.db.open.error", err);
            reject(err);
          }
          resolve();
        });
      });
      await openPromise;

      ChartSyncProvider._dbProvider = new RocksDbProvider(db);
      ChartSyncProvider._provider = new ChartSyncProvider();
    }
    return ChartSyncProvider._provider;
  };

  get = async (key: string): Promise<string | undefined> => ChartSyncProvider._dbProvider.get<string>(key);
  put = async (key: string, value: string): Promise<void> => ChartSyncProvider._dbProvider.put<string>(key, value);
}
