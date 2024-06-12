import { Router } from "express";
import asyncWrapper from "../middlewares/asyncWrapper.js";
import { getProject, packageProject } from "../controllers/project.js";

const router = Router();

router.route("/").get(asyncWrapper(getProject));

router.route("/package").post(asyncWrapper(packageProject));

export default router;
