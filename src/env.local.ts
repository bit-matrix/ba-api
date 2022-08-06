export const DATA_DIR: string = process.env.DATA_DIR || "./dist/data-dir/";
export const LISTEN_PORT: number = Number(process.env.PORT || 9902);
export const ELECTRS_URL = process.env.DB_URL || "https://electrs.basebitmatrix.com/";
export const DB_URL = process.env.DB_URL || "https://rocksdb.electrs.basebitmatrix.com/";
