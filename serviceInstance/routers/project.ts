import { Router } from "express";
import asyncWrapper from "../middlewares/asyncWrapper.js";
import {
  getProject,
  connectProjectTerminal,
  deleteProject,
  getFilesByProject,
} from "../controllers/project.js";

const router = Router();

router
  .route("/")
  .get(asyncWrapper(getProject))
  .delete(asyncWrapper(deleteProject));

router.route("/file").get(asyncWrapper(getFilesByProject));

router.route("/terminal").get(asyncWrapper(connectProjectTerminal));

export default router;
