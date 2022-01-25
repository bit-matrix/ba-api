export const DATA_DIR: string = process.env.DATA_DIR || "/datavolume1/new-pool/";
export const LISTEN_PORT: number = Number(process.env.PORT || 9950);
export const ELECTRS_URL = process.env.DB_URL || "http://127.0.0.1:3000/";
export const DB_URL = process.env.DB_URL || "http://127.0.0.1:4499/";
