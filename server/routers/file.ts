import { Router } from "express";
import asyncWrapper from "../middlewares/asyncWrapper.js";
import { updateFile, loadFile } from "../controllers/file.js";

const router = Router();

router
  .route("/edit")
  .get(asyncWrapper(loadFile))
  .post(asyncWrapper(updateFile));

export default router;
