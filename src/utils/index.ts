import { BmChart, CALL_METHOD, ChartSummary, CommitmentTxHistory } from "@bitmatrix/models";
import { ChartData } from "@bitmatrix/models";
import { CommitmentTxHistoryProvider } from "../providers/CommitmentTxHistoryProvider";

const unitValue = 100000000;

export const groupBydailyPrice = (chartData: BmChart[]): any[] => {
  if (chartData.length === 0) return [{ date: "", close: 0 }];

  const res = chartData.map((d) => {
    const datetime = new Date(d.time * 1000);
    const date = datetime.getUTCFullYear() + "-" + (datetime.getUTCMonth() + 1).toString().padStart(2, "0") + "-" + datetime.getUTCDate().toString().padStart(2, "0");
    return { price: d.price, date };
  });

  const result = [];

  let currentDate = res[0].date;
  let lastPrice = res[0].price;

  for (let i = 1; i < res.length; i++) {
    const r = res[i];

    if (currentDate === r.date) {
      lastPrice = r.price;
    } else {
      result.push({ date: res[i - 1].date, close: Math.floor(lastPrice) });
      currentDate = r.date;
    }
  }

  result.push({ date: res[res.length - 1].date, close: Math.floor(lastPrice) });
  return result;
};

export const groupByDailyTvl = (chartData: BmChart[]): ChartData[] => {
  if (chartData.length === 0) return [{ date: "", close: 0 }];

  const res = chartData.map((d) => {
    const datetime = new Date(d.time * 1000);
    const date = datetime.getUTCFullYear() + "-" + (datetime.getUTCMonth() + 1).toString().padStart(2, "0") + "-" + datetime.getUTCDate().toString().padStart(2, "0");
    return { close: Math.floor(d.value.quote / unitValue), date };
  });

  const result = [];

  let currentDate = res[0].date;
  let cumclose = res[0].close;
  let j = 1;

  for (let i = 1; i < res.length; i++) {
    const r = res[i];

    if (currentDate === r.date) {
      cumclose += r.close;
      j++;
    } else {
      result.push({ date: res[i - 1].date, close: Math.floor(cumclose / j) * 2 });

      currentDate = r.date;
      cumclose = r.close;
      j = 1;
    }
  }

  result.push({ date: res[res.length - 1].date, close: Math.floor(cumclose / j) * 2 });

  return result;
};

export const groupBydailyVolume = (data: CommitmentTxHistory[]): ChartData[] => {
  const chartData = data.filter((dt) => dt.method === CALL_METHOD.SWAP_QUOTE_FOR_TOKEN || dt.method === CALL_METHOD.SWAP_TOKEN_FOR_QUOTE);

  if (chartData.length === 0) return [{ date: "", close: 0 }];

  const res = chartData.map((d) => {
    const datetime = new Date(d.timestamp * 1000);
    const date = datetime.getUTCFullYear() + "-" + (datetime.getUTCMonth() + 1).toString().padStart(2, "0") + "-" + datetime.getUTCDate().toString().padStart(2, "0");
    return { volume: Number(d.value), date };
  });

  const result = [];

  let currentDate = res[0].date;
  let totalVolume = res[0].volume;

  for (let i = 1; i < res.length; i++) {
    const r = res[i];

    if (currentDate === r.date) {
      totalVolume += r.volume;
    } else {
      result.push({ date: res[i - 1].date, close: totalVolume });

      currentDate = r.date;
      totalVolume = r.volume;
    }
  }

  result.push({ date: res[res.length - 1].date, close: totalVolume });
  return result;
};

const chartDataDiff = (currentData: number, previousData: number) => {
  let currentValue = 0;
  let direction = "";

  if (currentData > previousData) {
    if (previousData !== 0) {
      currentValue = ((currentData - previousData) / previousData) * 100;
    }
    direction = "up";
  } else {
    if (currentData !== 0) {
      currentValue = ((currentData - previousData) / currentData) * 100;
    }
    direction = "down";
  }

  return { value: Math.abs(currentValue).toFixed(2), direction };
};

export const calculateChartData = async (chartData: BmChart[], poolId: string): Promise<ChartSummary> => {
  const commitmentTxHistoryProvider = await CommitmentTxHistoryProvider.getProvider();
  const allCtxHistory: {
    key: string;
    val: CommitmentTxHistory;
  }[] = await commitmentTxHistoryProvider.getMany();
  const data: CommitmentTxHistory[] = allCtxHistory.map((ach) => ach.val);

  const poolData = data.filter((dt) => dt.poolId === poolId);

  const allPriceData = groupBydailyPrice(chartData);
  const allVolumeData = groupBydailyVolume(poolData);
  const allTvlData = groupByDailyTvl(chartData);
  const allFeesData: ChartData[] = groupBydailyVolume(poolData).map((d) => ({ ...d, close: d.close / chartData[0].lpFeeTier }));
  const lastElement = chartData[chartData.length - 1];

  // live current time data
  const todayVolumeData = allVolumeData[allVolumeData.length - 1];
  const todayFeeData = allFeesData[allFeesData.length - 1];
  const todayTvlData = (lastElement.value.quote * 2) / unitValue;
  const todayPrice = lastElement.price;

  // previous data
  let previousVolumeData: ChartData = { date: "", close: 0 };
  let previousFeeData: ChartData = { date: "", close: 0 };
  let previousTvlData: ChartData = { date: "", close: 0 };
  let previousPriceData: ChartData = { date: "", close: 0 };

  let volumeRate = {
    value: "0",
    direction: "up",
  };

  let feeRate = {
    value: "0",
    direction: "up",
  };

  let tvlRate = {
    value: "0",
    direction: "up",
  };

  let priceRate = {
    value: "0",
    direction: "up",
  };

  if (allPriceData.length > 2) {
    previousPriceData = allPriceData[allPriceData.length - 2];
    const data = chartDataDiff(todayPrice, previousPriceData.close);

    priceRate = {
      value: data.value,
      direction: data.direction,
    };
  }

  if (allVolumeData.length > 2) {
    previousVolumeData = allVolumeData[allVolumeData.length - 2];

    const data = chartDataDiff(todayVolumeData.close, previousVolumeData.close);

    volumeRate = {
      value: data.value,
      direction: data.direction,
    };
  }

  if (allFeesData.length > 2) {
    previousFeeData = allFeesData[allFeesData.length - 2];
    const data = chartDataDiff(todayFeeData.close, previousFeeData.close);

    feeRate = {
      value: data.value,
      direction: data.direction,
    };
  }

  if (allTvlData.length > 2) {
    previousTvlData = allTvlData[allTvlData.length - 2];
    const data = chartDataDiff(todayTvlData, previousTvlData.close);

    tvlRate = {
      value: data.value,
      direction: data.direction,
    };
  }

  const result: ChartSummary = {
    poolId,
    tvl: {
      todayValue: todayTvlData,
      rate: tvlRate,
      allTvlData,
    },

    volume: {
      todayValue: todayVolumeData.close,
      rate: volumeRate,
      allVolumeData,
    },

    price: {
      todayValue: todayPrice,
      rate: priceRate,
      allPriceData,
    },

    fees: {
      todayValue: todayFeeData.close,
      rate: feeRate,
      allFeesData,
    },
  };

  return result;
};
