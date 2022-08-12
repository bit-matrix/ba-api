import { Server, Socket } from "socket.io";
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
  private trackingList: FollowUp[] = [];
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

      this.setWaitingList(socket.id, []);

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
        const txIdsArr: string[] = txIds.split(",");

        this.setWaitingList(socket.id, txIdsArr);

        if (txIdsArr.length === 0) {
          socket.emit("checkTxStatusResponse", []);
        } else {
          const txStatus = await checkTxStatus(txIdsArr, client);

          const txStatusResults: TxStatus[] = await Promise.all(txStatus);

          socket.emit("checkTxStatusResponse", txStatusResults);
        }
      });

      socket.on("disconnect", () => {
        console.log("user disconnected");
        this.removeWaitingSocket(socket.id);
      });
    });
  };

  getWaitinglist = () => {
    return this.trackingList;
  };

  setWaitingList = (socketId: string, txIds: string[]) => {
    const clonedList = [...this.trackingList];
    const currentSocketIndex = clonedList.findIndex((item) => item.socketId === socketId);

    if (currentSocketIndex > -1) {
      clonedList[currentSocketIndex].txIds = [...clonedList[currentSocketIndex].txIds, ...txIds];
    } else {
      clonedList.push({ socketId, txIds });
    }

    this.trackingList = clonedList;
  };

  removeWaitingSocket = (socketId: string) => {
    const clonedList = [...this.trackingList];

    const currentSocketIndex = clonedList.findIndex((item) => item.socketId === socketId);

    clonedList.splice(currentSocketIndex, 1);

    this.trackingList = clonedList;
  };

  // removeWaitingTxId = (socketId: string, txId: string) => {
  //   const clonedList = [...this.trackingList];

  //   const currentSocket = clonedList.find((item) => item.socketId === socketId);

  //   if (currentSocket) {
  //     const currentTxIdIndex = currentSocket.txIds.findIndex((item) => item === txId);

  //     if (currentTxIdIndex === 0) {
  //       this.removeWaitingSocket(currentSocket.socketId);
  //     } else {
  //       currentSocket.txIds.splice(currentTxIdIndex, 1);
  //     }
  //   }

  //   this.trackingList = clonedList;
  // };
}
