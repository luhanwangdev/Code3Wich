import { Request, Response } from "express";
import AppError from "../utils/appError.js";
import * as userModel from "../models/user.js";

export const getUser = async (req: Request, res: Response) => {
  const { id } = req.query as unknown as { id: number };

  const user = await userModel.getUser(id);

  res.status(200).json(user);
};

export const createUser = async (req: Request, res: Response) => {
  const { name, email, password } = req.body as unknown as {
    name: string;
    email: string;
    password: string;
  };

  const userId = await userModel.createUser(name, email, password);

  res.status(200).json(userId);
};
