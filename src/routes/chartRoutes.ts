import { Router } from "express";
import { chartController } from "../controllers/chartController";

const ptxRoutes = Router();

ptxRoutes.route("/:asset").put(chartController.put);

export default ptxRoutes;
