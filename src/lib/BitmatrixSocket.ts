import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { ChartProvider } from "../providers/ChartProvider";
import { calculateChartData } from "../utils";
import { BmChartResult } from "@bitmatrix/models";
import { fetchRedisAllData } from "../utils/redis";
import Redis from "ioredis";

export class BitmatrixSocket {
  private io: Server;
  private static instance: BitmatrixSocket;

  currentSocket?: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;

  constructor(server: HttpServer, redisClient: Redis) {
    this.io = new Server(server, {
      cors: {
        origin: "http://localhost:3000",
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

      const chartProvider = await ChartProvider.getProvider();
      const chartData = await chartProvider.getMany();

      const calculatedPoolsData = chartData.map((data: BmChartResult) => {
        return calculateChartData(data.val, data.key);
      });

      socket.emit("poolschart", calculatedPoolsData);

      const redisData = await fetchRedisAllData(client);

      socket.emit("redis-values", redisData);

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

      this.currentSocket = socket;

      socket.on("disconnect", () => {
        console.log("user disconnected");
      });
    });
  };
}
