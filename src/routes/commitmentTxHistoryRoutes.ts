import { Router } from "express";
import { commitmentTxHistoryController } from "../controllers/commitmentTxHistoryController";

const cmtxRoutes = Router();

cmtxRoutes.route("/:txId").get(commitmentTxHistoryController.get).put(commitmentTxHistoryController.put);

export default cmtxRoutes;
