import { Request, Response } from 'express';
import fs from 'fs';
import fsExtra from 'fs-extra';
import path from 'path';
import AppError from '../utils/appError.js';
import * as fileModel from '../models/file.js';

export const updateFile = async (req: Request, res: Response) => {
  const { name, isFolder, projectId, parentId, code } = req.body as unknown as {
    name: string;
    isFolder: boolean;
    projectId: number;
    parentId: number;
    code: string;
  };

  const file = await fileModel.getFileByFileNameandProjectId(name, projectId);

  let filePath;

  if (!file) {
    if (parentId === 0) {
      filePath = `codeFiles/project${projectId}/${name}`;
    } else {
      const parentPath = await fileModel.getFilePath(parentId);
      filePath = `${parentPath}/${name}`;
    }

    // fileModel.createFile(name, type, filePath, projectId, isFolder, parentId);

    if (isFolder) {
      fs.mkdirSync(filePath, { recursive: true });
      res.status(200).json({ success: true, path: filePath });
      return;
    }
  } else {
    filePath = file.location;
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, code);

  res.status(200).json({ success: true, path: filePath, code });
};

export const loadFile = async (req: Request, res: Response) => {
  const { id } = req.query as unknown as {
    id: number;
  };

  const filePath = await fileModel.getFilePath(id);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      throw new AppError(err.message, 500);
    }
    res.status(200).json({ status: true, code: data });
  });
};

export const deleteFile = async (req: Request, res: Response) => {
  const { id } = req.params as unknown as {
    id: number;
  };

  const filePath = await fileModel.getFilePath(id);

  await fsExtra.remove(filePath);

  res
    .status(200)
    .json({ status: true, message: 'Folder deleted successfully' });
};
