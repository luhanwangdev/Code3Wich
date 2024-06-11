import { Router } from "express";
import asyncWrapper from "../middlewares/asyncWrapper.js";
import { getProject } from "../controllers/project.js";

const router = Router();

router.route("/").get(asyncWrapper(getProject));

export default router;
