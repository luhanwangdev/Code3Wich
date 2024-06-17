import { Router } from "express";
import asyncWrapper from "../middlewares/asyncWrapper.js";
import {
  getProject,
  getAllProjects,
  getProjectsByUserId,
  createProject,
} from "../controllers/project.js";

const router = Router();

router
  .route("/")
  .get(asyncWrapper(getProject))
  .post(asyncWrapper(createProject));

router.route("/all").get(asyncWrapper(getAllProjects));

router.route("/user").get(asyncWrapper(getProjectsByUserId));

export default router;
