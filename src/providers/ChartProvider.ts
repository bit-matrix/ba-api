import rocksdb from "rocksdb";
import { DATA_DIR } from "../env";
import { BmChart } from "../model/BmChart";
import { RocksDbProvider } from "./RocksDbProvider";

export class ChartProvider {
  private static location: string = DATA_DIR + "chart";
  private static _dbProvider: RocksDbProvider;
  private static _provider: ChartProvider;
  private constructor() {}

  public static getProvider = async (): Promise<ChartProvider> => {
    if (ChartProvider._provider === undefined) {
      const db = rocksdb(this.location);

      const openPromise = new Promise<void>((resolve, reject) => {
        db.open({ createIfMissing: true, errorIfExists: false }, (err) => {
          if (err) {
            console.error("ChartProvider.constructor.db.open.error", err);
            reject(err);
          }
          resolve();
        });
      });
      await openPromise;

      ChartProvider._dbProvider = new RocksDbProvider(db);
      ChartProvider._provider = new ChartProvider();
    }
    return ChartProvider._provider;
  };

  get = async (key: string): Promise<BmChart[] | undefined> => ChartProvider._dbProvider.get<BmChart[]>(key);
  put = async (key: string, value: BmChart[]): Promise<void> => ChartProvider._dbProvider.put<BmChart[]>(key, value);
  // getMany = async (key: string, value: BmChart[]): Promise<void> => ChartProvider._dbProvider.getMany<BmChart[]>(key, value);
}
