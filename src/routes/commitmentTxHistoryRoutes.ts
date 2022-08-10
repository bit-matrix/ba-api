import { Router } from "express";
import { commitmentTxHistoryController } from "../controllers/commitmentTxHistoryController";

const ctxHistoryRoutes = Router();

ctxHistoryRoutes.route("/:txId").get(commitmentTxHistoryController.get).post(commitmentTxHistoryController.post);

export default ctxHistoryRoutes;
