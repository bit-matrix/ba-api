export const DATA_DIR: string = process.env.DATA_DIR || "/historydatavolume/";
export const LISTEN_PORT: number = Number(process.env.PORT || 9901);
export const ELECTRS_URL = "https://electrs.basebitmatrix.com/";
export const REDIS_URL = "host.docker.internal:6379";

// for local testing
export const DB_URL = process.env.DB_URL || "http://host.docker.internal:4499/";

// for production testing
// export const DB_URL = process.env.DB_URL || "http://127.0.0.1:4499/";
