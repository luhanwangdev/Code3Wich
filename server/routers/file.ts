import { Router } from "express";
import asyncWrapper from "../middlewares/asyncWrapper.js";
import {
  getSingleFile,
  getFilesByProject,
  updateFile,
  loadFile,
} from "../controllers/file.js";

const router = Router();

router.route("/single").get(asyncWrapper(getSingleFile));

router.route("/project").get(asyncWrapper(getFilesByProject));

router.route("/test").get(loadFile).post(updateFile);

export default router;
