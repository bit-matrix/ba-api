const base_host = process.env.BASE_HOST || "host.docker.internal";

const api_internal_port = process.env.API_INTERNAL_PORT || "9901";
const api_internal_data_dir = process.env.API_INTERNAL_DATA_DIR || "data_dir";

const redis_port = process.env.REDIS_PORT || "6379";
const redis_host = process.env.REDIS_HOST || base_host;
const redis_url = process.env.UI_REDIS_URL || `redis://${redis_host}:${redis_port}`;

export const DATA_DIR: string = api_internal_data_dir + "/";
export const LISTEN_PORT: number = Number(api_internal_port);
export const REDIS_URL = redis_url;
