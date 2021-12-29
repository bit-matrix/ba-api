import http from "http";
import express from "express";
import cors from "cors";
import { DATA_DIR, LISTEN_PORT, ELECTRS_URL } from "./env";

import chartRoutes from "./routes/chartRoutes";
import { init } from "@bitmatrix/esplora-api-client";
import { updateChart } from "./business/updateChart";

init(ELECTRS_URL);

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

server.listen(LISTEN_PORT, () => {
  console.log("BA API Service is using DATA_DIR:" + DATA_DIR);
  console.log("BA API Service started on *:" + LISTEN_PORT);
  worker();
});

const worker = async () => {
  try {
    await updateChart("db7a0fa02b9649bb70d084f24412028a8b4157c91d07715a56870a161f041cb3", 10000);
  } catch (error) {
    console.error(error);
  } finally {
    setTimeout(() => worker(), 60 * 1000);
  }
};
