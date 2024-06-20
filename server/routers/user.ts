import { Router } from "express";
import asyncWrapper from "../middlewares/asyncWrapper.js";
import jwtAuthMiddleware from "../middlewares/authenticate.js";
import {
  getUser,
  getUserInfo,
  getUserProjects,
  handleSignin,
  handleSignup,
} from "../controllers/user.js";

const router = Router();

router.route("/").get(asyncWrapper(getUser));

router.route("/signup").post(asyncWrapper(handleSignup));

router.route("/signin").post(asyncWrapper(handleSignin));

router.route("/projects").get(jwtAuthMiddleware, asyncWrapper(getUserProjects));

router.route("/info").get(jwtAuthMiddleware, asyncWrapper(getUserInfo));

export default router;
