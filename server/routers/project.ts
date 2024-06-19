import { Router } from "express";
import asyncWrapper from "../middlewares/asyncWrapper.js";
import {
  getProject,
  getAllProjects,
  getProjectsByUserId,
  createProject,
  connectProjectTerminal,
  deleteProject,
} from "../controllers/project.js";

const router = Router();

router
  .route("/")
  .get(asyncWrapper(getProject))
  .post(asyncWrapper(createProject))
  .delete(asyncWrapper(deleteProject));

router.route("/all").get(asyncWrapper(getAllProjects));

router.route("/user").get(asyncWrapper(getProjectsByUserId));

router.route("/terminal").get(asyncWrapper(connectProjectTerminal));

export default router;
