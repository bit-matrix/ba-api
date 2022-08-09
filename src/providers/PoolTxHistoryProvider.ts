import { BmChart, BmChartResult } from "@bitmatrix/models";
import rocksdb from "rocksdb";
import { DATA_DIR } from "../env";
import { RocksDbProvider } from "./RocksDbProvider";

export class PoolTxHistoryProvider {
  private static location: string = DATA_DIR + "chart";
  private static _dbProvider: RocksDbProvider;
  private static _provider: PoolTxHistoryProvider;
  private constructor() {}

  public static getProvider = async (): Promise<PoolTxHistoryProvider> => {
    if (PoolTxHistoryProvider._provider === undefined) {
      const db = rocksdb(this.location);

      const openPromise = new Promise<void>((resolve, reject) => {
        db.open({ createIfMissing: true, errorIfExists: false }, (err) => {
          if (err) {
            console.error("PoolTxHistoryProvider.constructor.db.open.error", err);
            reject(err);
          }
          resolve();
        });
      });
      await openPromise;

      PoolTxHistoryProvider._dbProvider = new RocksDbProvider(db);
      PoolTxHistoryProvider._provider = new PoolTxHistoryProvider();
    }
    return PoolTxHistoryProvider._provider;
  };

  get = async (key: string): Promise<BmChart[] | undefined> => PoolTxHistoryProvider._dbProvider.get<BmChart[]>(key);
  put = async (key: string, value: BmChart[]): Promise<BmChart[]> => PoolTxHistoryProvider._dbProvider.put<BmChart[]>(key, value);
  // getMany = async (key: string, value: BmChart[]): Promise<void> => ChartProvider._dbProvider.getMany<BmChart[]>(key, value);

  //getMany = async (limit = 1000, reverse = true): Promise<BmChartResult[]> => ChartProvider._dbProvider.getMany<BmChart[]>(limit, reverse);

  getMany = async (): Promise<BmChartResult[]> => PoolTxHistoryProvider._dbProvider.getMany<BmChart[]>();
}
