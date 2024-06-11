import { Request, Response } from "express";
import * as fileModel from "../models/file.js";

export const getSingleFile = async (req: Request, res: Response) => {
  const { id } = req.query as unknown as { id: number };

  const file = await fileModel.getFile(id);

  res.status(200).send(file);
};

export const getFilesByProject = async (req: Request, res: Response) => {
  const { projectId } = req.query as unknown as { projectId: number };

  const files = await fileModel.getFilesByProjectId(projectId);

  res.status(200).send(files);
};
