import { Router } from "express";
import asyncWrapper from "../middlewares/asyncWrapper.js";
import { getUser, createUser } from "../controllers/user.js";

const router = Router();

router.route("/").get(asyncWrapper(getUser)).post(asyncWrapper(createUser));

export default router;
