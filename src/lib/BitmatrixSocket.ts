import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { PoolTxHistoryProvider } from "../providers/PoolTxHistoryProvider";
import { calculateChartData } from "../utils";
import { BmChartResult } from "@bitmatrix/models";
import { fetchRedisAllData } from "../utils/redis";
import Redis from "ioredis";
import { CommitmentTxHistoryProvider } from "../providers/CommitmentTxHistoryProvider";

export class BitmatrixSocket {
  private static instance: BitmatrixSocket;
  io: Server;

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

      socket.on("checkTxStatus", (txIds) => {
        const txIdsArr = txIds.split(",");

        enum TX_STATUS {
          PENDING,
          WAITING_PTX,
          WAITING_PTX_CONFIRM,
          SUCCESS,
          FAILED,
        }

        const txStatuses = txIdsArr.map((tx: any) => {
          return {
            txId: tx,
            poolTxId: "",
            status: TX_STATUS.PENDING,
            timestamp: Math.floor(Date.now() / 1000),
          };
        });

        socket.emit("checkTxStatusResponse", txStatuses);
      });

      socket.on("disconnect", () => {
        console.log("user disconnected");
      });
    });
  };
}
