const base_host = process.env.BASE_HOST || "host.docker.internal";

const api_port = process.env.API_PORT || "8000";

const db_port = process.env.DB_PORT || "8001";
const db_host = process.env.DB_HOST || base_host;
const db_url = process.env.DB_URL || `http://${db_host}:${db_port}`;

const redis_port = process.env.REDIS_PORT || "6379";
const redis_host = process.env.REDIS_HOST || base_host;
const redis_url = process.env.REDIS_URL || `${redis_host}:${redis_port}`;

export const DATA_DIR: string = (process.env.API_INTERNAL_DATA_DIR || "/historydatavolumemulti") + "/";
export const LISTEN_PORT: number = Number(api_port);
export const REDIS_URL = redis_url;

export const DB_URL = db_url + "/";

// for production testing
// export const DB_URL = process.env.DB_URL || "http://127.0.0.1:4499/";
