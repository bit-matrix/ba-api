import http from "http";
import express from "express";
import cors from "cors";
import Redis from "ioredis";
import { DATA_DIR, LISTEN_PORT, REDIS_URL } from "./env";
import { BitmatrixSocket } from "./lib/BitmatrixSocket";
import chartRoutes from "./routes/chartRoutes";
import ctxHistoryRoutes from "./routes/commitmentTxHistoryRoutes";
import { fetchRedisAllData } from "./utils/redis";
import { checkTxStatusWithoutHistory } from "./utils/tracking";
import { TxStatus } from "@bitmatrix/models";

const client = new Redis(REDIS_URL);

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
    if (args[0] === "SETEX" || args[0] === "DEL") {
      const parsedValues = await fetchRedisAllData(client);
      socketInstance.io.sockets.emit("redis-values", parsedValues);

      const wantedTxId = args[1];
      const waitingList = socketInstance.getWaitinglist();

      if (args[0] === "SETEX") {
        waitingList.forEach(async (followUp) => {
          const index = followUp.txIds.findIndex((txId) => txId === wantedTxId);

          if (index > -1) {
            const emitSocketId = followUp.socketId;

            const txStatus = await checkTxStatusWithoutHistory(followUp.txIds, client);

            const txStatusResults: TxStatus[] = await Promise.all(txStatus);

            socketInstance.io.to(emitSocketId).emit("checkTxStatusResponse", txStatusResults);
          }
        });
      }
    }
  });
});

server.listen(LISTEN_PORT, () => {
  console.log("BA API Service is using DATA_DIR:" + DATA_DIR);
  console.log("BA API Service started on *:" + LISTEN_PORT);
});
