import http from "http";
import express from "express";
import cors from "cors";
import { DATA_DIR, LISTEN_PORT, REDIS_URL } from "./env";

import chartRoutes from "./routes/chartRoutes";
import Redis from "ioredis";

const client = new Redis(REDIS_URL);
import { BitmatrixSocket } from "./lib/BitmatrixSocket";

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
BitmatrixSocket.getInstance(server);

app.get("/", async (req, res, next) => {
  res.send("hello from ba-api");
});

app.use("/chart", chartRoutes);

client.monitor((err, monitor) => {
  monitor?.on("monitor", (time, args) => {
    if (args[0] === "set" || args[0] === "del" || args[0] === "put") {
      client.keys("*").then((result) => {
        console.log("data", result); // Prints "value"
      });
    }
  });
});

server.listen(LISTEN_PORT, () => {
  console.log("BA API Service is using DATA_DIR:" + DATA_DIR);
  console.log("BA API Service started on *:" + LISTEN_PORT);
});
