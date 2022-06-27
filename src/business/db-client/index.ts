import axios from "axios";
import { DB_URL } from "../../env";
import { BmPtx, Pool } from "@bitmatrix/models";

export const clear = (): Promise<void> => axios.delete<void>(DB_URL + "clear").then((res) => res.data);

export const pools = (): Promise<Pool[]> => axios.get<Pool[]>(DB_URL + "pools").then((res) => res.data);
export const pool = (asset: string): Promise<Pool> => axios.get<Pool>(DB_URL + "pools/" + asset).then((res) => res.data);

export const ptxs = (asset: string, limit: number): Promise<BmPtx[]> =>
  axios
    .get<BmPtx[]>(DB_URL + "ptx/" + asset + "?limit=" + limit)
    .then((res) => res.data)
    .catch((res) => {
      console.error("ctxsMempool", res);
      throw res.message;
    });

export const ptx = (asset: string, ptxid: string): Promise<BmPtx> =>
  axios
    .get<BmPtx>(DB_URL + "ptx/" + asset + "/" + ptxid)
    .then((res) => res.data)
    .catch((res) => {
      console.error("ctxsMempool", res);
      throw res.message;
    });
