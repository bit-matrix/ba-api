import { esploraClient } from "@bitmatrix/esplora-api-client";
import { BmPtx, CALL_METHOD } from "@bitmatrix/models";
import { ptxs } from "./db-client";
import { BmChart } from "../model/BmChart";
import { ChartProvider } from "../providers/ChartProvider";

export const getChart = async (ptx: BmPtx): Promise<BmChart> => {
  const txDetail = await esploraClient.tx(ptx.poolTx.txid);

  const poolQuoteValue = txDetail.vout[3].value || 0;
  const poolTokenValue = txDetail.vout[1].value || 0;
  const poolLpValue = txDetail.vout[2].value || 0;

  const price = Math.floor(Number(poolTokenValue) / Number(poolQuoteValue));

  let volumeQuote = 0;
  let volumeToken = 0;

  if (ptx.callData.method === CALL_METHOD.SWAP_QUOTE_FOR_TOKEN) {
    volumeQuote = ptx.callData.value.quote;
    volumeToken = volumeQuote * price;
  } else {
    volumeToken = ptx.callData.value.token;
    volumeQuote = Math.floor(volumeToken / price);
  }

  const result: BmChart = {
    time: txDetail.status.block_time,
    ptxid: ptx.poolTx.txid,
    method: ptx.callData.method,
    value: {
      quote: poolQuoteValue,
      token: poolTokenValue,
      lp: poolLpValue,
    },
    price,
    volume: {
      quote: volumeQuote,
      token: volumeToken,
    },
  };

  return result;
};

/* export const getCharts = async (asset: string, limit: number): Promise<BmChart[]> => {
  const result: BmChart[] = [];
  const ps = await ptxs(asset, limit);

  for (let i = 0; i < ps.length; i++) {
    const p = ps[i];
    const r = await getChart(p);
    result.push(r);
  }

  return result;
}; */

export const updateChart = async (asset: string, limit: number): Promise<BmChart[]> => {
  const chartProvider = await ChartProvider.getProvider();
  const exist: BmChart[] = (await chartProvider.get(asset)) || [];

  const ps = await ptxs(asset, limit);

  const result: BmChart[] = [...exist];

  let gotNew: boolean = false;
  for (let i = 0; i < ps.length; i++) {
    const p = ps[i];
    if (result.findIndex((e) => e.ptxid === p.poolTx.txid) === -1) {
      gotNew = true;
      result.push(await getChart(p));
    }
  }

  if (gotNew) result.sort((a, b) => a.time - b.time);

  await chartProvider.put(asset, result);

  return result;
};
