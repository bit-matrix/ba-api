import http from "http";
import express from "express";
import cors from "cors";
import Redis from "ioredis";
import { DATA_DIR, LISTEN_PORT, REDIS_URL } from "./env";
import { BitmatrixSocket } from "./lib/BitmatrixSocket";
import chartRoutes from "./routes/chartRoutes";
import ctxHistoryRoutes from "./routes/commitmentTxHistoryRoutes";
import { fetchRedisAllData } from "./utils/redis";

const client = new Redis(REDIS_URL);

enum TX_STATUS {
  PENDING,
  WAITING_PTX,
  WAITING_PTX_CONFIRM,
  SUCCESS,
  FAILED,
}

const onExit = async () => {
  console.log("BA API Service stopped.");
};
process.on("exit", onExit);
process.on("SIGINT", () => {
  process.exit();
});

const app = express();
app.use(express.json()); // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies
app.use(cors());

const server = http.createServer(app);

app.get("/", async (req, res, next) => {
  res.send("hello from ba-api");
});

app.use("/chart", chartRoutes);
app.use("/ctxHistory", ctxHistoryRoutes);

const socketInstance = BitmatrixSocket.getInstance(server, client);

client.monitor((err, monitor) => {
  monitor?.on("monitor", async (time, args) => {
    if (args[0] === "set" || args[0] === "del" || args[0] === "put") {
      const parsedValues = await fetchRedisAllData(client);

      socketInstance.currentSocket?.emit("redis-values", parsedValues);
    }
  });
});

// io.currentSocket?.on("checkTxStatus", async (txIds) => {
//   const txIdsArr: string[] = txIds.split(",");
//   // const chartProvider = await ChartProvider.getProvider();

//   console.log("txIdsArr", txIdsArr);

//   const result = txIdsArr.map(async (tia) => {
//     const redisData = parsedValues.find((val) => val.commitmentData.transaction.txid === tia);

//     if (redisData) {
//       if (redisData.poolTxInfo) {
//         console.log("case1 : ", tia);
//         return { txId: tia, poolTxId: redisData.poolTxInfo?.txId, status: TX_STATUS.WAITING_PTX_CONFIRM };
//       }
//       console.log("case2: ", tia);
//       return { txId: tia, poolTxId: "", status: TX_STATUS.WAITING_PTX };
//     }

//     // const allPoolHistory: BmChartResult[] | undefined = await chartProvider.getMany();

//     // if (allPoolHistory) {
//     //   const isExist = allPoolHistory.findIndex((poolHistory) => poolHistory.ptxid === fd.poolTxInfo?.txId);

//     //   if (isExist) {
//     //     const status = fd.poolTxInfo?.isSuccess ? TX_STATUS.SUCCESS : TX_STATUS.FAILED;
//     //     return { txId: fd.commitmentData.transaction.txid, poolTxId: fd.poolTxInfo?.txId, status };
//     //   }
//     // }
//     console.log("case3: ", tia);
//     return { txId: tia, poolTxId: "", status: TX_STATUS.PENDING };
//   });

//   io.currentSocket?.emit("checkTxStatusResponse", result);
// });

server.listen(LISTEN_PORT, () => {
  console.log("BA API Service is using DATA_DIR:" + DATA_DIR);
  console.log("BA API Service started on *:" + LISTEN_PORT);
});
