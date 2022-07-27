import { Router } from "express";
import { chartController } from "../controllers/chartController";

const ptxRoutes = Router();

ptxRoutes.route("/:asset").get(chartController.get).put(chartController.put);

ptxRoutes.route("/").get(chartController.getPoolsChart);

export default ptxRoutes;
