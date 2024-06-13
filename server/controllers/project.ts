import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import * as projectModel from "../models/project.js";
import * as fileModel from "../models/file.js";
import AppError from "../utils/appError.js";
import setUpContainer from "../utils/container.js";

export const getProject = async (req: Request, res: Response) => {
  const { id } = req.query as unknown as { id: number };

  const project = await projectModel.getProject(id);

  res.status(200).send(project);
};

export const createProject = async (req: Request, res: Response) => {
  const { name, userId } = req.body as unknown as {
    name: string;
    userId: number;
  };

  const project = await projectModel.createProject(name, userId);

  createFile("index.html", "html", project.id, "");
  createFile("index.js", "javascript", project.id, "");
  createFile("style.css", "css", project.id, "");

  const containerUrl = await setUpContainer(project.id);
  await projectModel.updateProjectUrl(containerUrl, project.id);

  res
    .status(200)
    .json({ status: true, projectId: project.id, url: containerUrl });
};

export const getAllProjects = async (req: Request, res: Response) => {
  const projects = await projectModel.getAllProjects();

  res.status(200).send(projects);
};

export const getProjectsByUserId = async (req: Request, res: Response) => {
  const { id } = req.query as unknown as { id: number };

  const projects = await projectModel.getProjectsByUserId(id);

  res.status(200).send(projects);
};

const createFile = async (
  name: string,
  type: string,
  projectId: number,
  code: string
) => {
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
};
