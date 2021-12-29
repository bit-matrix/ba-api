import rocksdb from "rocksdb";

export class RocksDbProvider {
  private db: rocksdb;

  constructor(db: rocksdb) {
    this.db = db;
  }

  get = async <T>(key: string): Promise<T | undefined> => {
    return new Promise<T | undefined>((resolve, reject) => {
      this.db.get(key, { sync: true }, (err: Error | undefined, val: rocksdb.Bytes) => {
        if (err) {
          if (err.message === "NotFound: ") return resolve(undefined);
          console.error("RocksDbProvider.get.error", err.message, err.message === "NotFound: ");
          return reject(err);
        }

        if (val) return resolve(JSON.parse(val.toString("utf8")));
        else return reject();
      });
    });
  };

  put = async <T>(key: string, value: T): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      this.db.put(key, Buffer.from(JSON.stringify(value)), { sync: true }, (err: Error | undefined) => {
        if (err) {
          console.error("RocksDbProvider.put.error", err);
          return reject(err);
        }
        return resolve();
      });
    });
  };

  del = async (key: string): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      this.db.del(key, (err: Error | undefined) => {
        if (err) {
          console.error("RocksDbProvider.del.error", err);
          return reject(err);
        }
        return resolve();
      });
    });
  };

  getMany = async <T>(limit = 10, reverse = true): Promise<{ key: string; val: T }[]> => {
    return new Promise<{ key: string; val: T }[]>(async (resolve, reject) => {
      const result: { key: string; val: T }[] = [];

      try {
        const it: rocksdb.Iterator = this.db.iterator({ reverse, limit });

        let i = 0;
        const next = () => {
          if (i < limit) {
            i++;

            it.next((err: Error | undefined, key: rocksdb.Bytes, val: rocksdb.Bytes) => {
              if (err) {
                if (err.message === "NotFound: ") return resolve([]);
                console.error("RocksDbProvider.getMany.iterator.next.error", err);
                return reject();
              } else if (key === undefined && val === undefined) {
                it.end(() => {});
                // console.log("it.next.finished");
                return resolve(result);
              } else {
                // console.log("r: " + key.toString());
                result.push({
                  key: key.toString("utf8"),
                  val: <T>JSON.parse(val.toString("utf8")),
                });
                next();
              }
            });
          } else {
            it.end(() => {});
            return resolve(result);
          }
        };

        next();
      } catch (err) {
        console.error("RocksDbProvider.getMany.error", err);
        return reject();
      }
    });
  };

  deleteAll = async <T>(): Promise<void> => {
    return new Promise<void>(async (resolve, reject) => {
      const it: rocksdb.Iterator = this.db.iterator();
      try {
        const next = () => {
          it.next((err: Error | undefined, key: rocksdb.Bytes, val: rocksdb.Bytes) => {
            if (err) {
              if (err.message === "NotFound: ") return resolve();
              console.error("RocksDbProvider.deleteAll.iterator.next.error", err);
              return reject();
            } else if (key === undefined && val === undefined) {
              it.end(() => {});
              // console.log("it.next.finished");
              return resolve();
            } else {
              this.db.del(key, (err2: Error | undefined) => {
                if (err2) {
                  console.error("RocksDbProvider.deleteAll.del.error", err);
                  it.end(() => {});
                  return reject();
                } else {
                  next();
                }
              });
            }
          });
        };

        next();
      } catch (err) {
        console.error("RocksDbProvider.deleteAll.error", err);
        it.end(() => {});
        return reject();
      }
    });
  };
}
