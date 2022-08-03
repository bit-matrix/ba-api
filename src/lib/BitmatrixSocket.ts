import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { ChartProvider } from "../providers/ChartProvider";

export class BitmatrixSocket {
  private io: Server;
  private static instance: BitmatrixSocket;

  currentSocket?: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;

  constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
      },
    });

    this.connect();
  }

  public static getInstance(server?: HttpServer): BitmatrixSocket {
    if (!BitmatrixSocket.instance) {
      if (server) BitmatrixSocket.instance = new BitmatrixSocket(server);
    }

    return BitmatrixSocket.instance;
  }

  private connect = () => {
    this.io.on("connection", async (socket) => {
      console.log("a user connected");

      // const chartProvider = await ChartProvider.getProvider();
      // const chartData = await chartProvider.get("0b427dc1862dc6d658ccd109b8d54cf0dcd8848626c2bdb5e0ddce0f17383ff7");

      // socket.emit("poolchart", chartData);

      this.currentSocket = socket;

      socket.on("disconnect", () => {
        console.log("user disconnected");
      });
    });
  };
}
