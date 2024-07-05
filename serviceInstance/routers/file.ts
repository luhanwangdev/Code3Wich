import { Router } from "express";
import asyncWrapper from "../middlewares/asyncWrapper.js";
import { updateFile, loadFile, deleteFile } from "../controllers/file.js";

const router = Router();

router.route("/:id").delete(asyncWrapper(deleteFile));

router
  .route("/edit")
  .get(asyncWrapper(loadFile))
  .post(asyncWrapper(updateFile));

export default router;
