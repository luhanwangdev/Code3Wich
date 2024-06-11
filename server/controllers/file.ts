import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import AppError from "../utils/appError.js";
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

export const updateFile = async (req: Request, res: Response) => {
  const { name, type, projectId, code } = req.body as unknown as {
    name: string;
    type: string;
    projectId: number;
    code: string;
  };

  const file = await fileModel.getFileByFileNameandProjectId(name, projectId);
  const filePath = `codeFiles/project${projectId}/${name}`;

  if (!file) {
    fileModel.createFile(name, type, filePath, projectId);
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFile(filePath, code, (err) => {
    if (err) {
      throw new AppError(err.message, 500);
    }
  });

  res.status(200).json({ success: true, path: filePath });
};

export const loadFile = async (req: Request, res: Response) => {
  const { name, projectId } = req.query as unknown as {
    name: string;
    projectId: number;
  };

  const filePath = `codeFiles/project${projectId}/${name}`;

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      throw new AppError(err.message, 500);
    }
    res.status(200).json({ status: true, code: data });
  });
};
