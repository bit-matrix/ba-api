import { Router } from "express";
import { poolTxHistoryController } from "../controllers/poolTxHistoryController";

const ptxRoutes = Router();

ptxRoutes.route("/:asset").put(poolTxHistoryController.put);

export default ptxRoutes;
