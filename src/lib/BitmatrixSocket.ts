import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { PoolTxHistoryProvider } from "../providers/PoolTxHistoryProvider";
import { calculateChartData } from "../utils";
import { BmChartResult, TxStatus } from "@bitmatrix/models";
import { fetchRedisAllData } from "../utils/redis";
import Redis from "ioredis";
import { CommitmentTxHistoryProvider } from "../providers/CommitmentTxHistoryProvider";
import { checkTxStatus } from "../utils/tracking";

type FollowUp = {
  socketId: string;
  txIds: string[];
};

export class BitmatrixSocket {
  private static instance: BitmatrixSocket;
  io: Server;
  trackingList: FollowUp[] = [];

  constructor(server: HttpServer, redisClient: Redis) {
    this.io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    this.connect(redisClient);
  }

  public static getInstance(server?: HttpServer, redisClient?: Redis): BitmatrixSocket {
    if (!BitmatrixSocket.instance) {
      if (server && redisClient) BitmatrixSocket.instance = new BitmatrixSocket(server, redisClient);
    }

    return BitmatrixSocket.instance;
  }

  private connect = (client: Redis) => {
    this.io.on("connection", async (socket) => {
      console.log("a user connected");
      this.trackingList.push({ socketId: socket.id, txIds: [] });

      const poolTxHistoryProvider = await PoolTxHistoryProvider.getProvider();
      const chartData = await poolTxHistoryProvider.getMany();

      const calculatedPoolsData = chartData.map((data: BmChartResult) => {
        return calculateChartData(data.val, data.key);
      });

      socket.emit("poolschart", calculatedPoolsData);

      const redisData = await fetchRedisAllData(client);

      socket.emit("redis-values", redisData);

      const commitmentTxHistoryProvider = await CommitmentTxHistoryProvider.getProvider();
      const allCtxHistory = await commitmentTxHistoryProvider.getMany();

      socket.emit("ctxHistory", allCtxHistory);

      socket.on("checkTxStatus", async (txIds) => {
        if (txIds !== "") {
          const txIdsArr: string[] = txIds.split(",");
          const willUpdatedSocketIndex = this.trackingList.findIndex((item) => item.socketId === socket.id);

          const txStatus = await checkTxStatus(txIdsArr, client);

          const txStatusResults: TxStatus[] = await Promise.all(txStatus);

          socket.emit("checkTxStatusResponse", txStatusResults);

          this.trackingList[willUpdatedSocketIndex].txIds = txIdsArr;
        }
      });

      socket.on("disconnect", () => {
        console.log("user disconnected");
        this.trackingList = this.trackingList.filter((item) => item.socketId !== socket.id);
      });
    });
  };
}
