import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import * as projectModel from "../models/project.js";
import * as fileModel from "../models/file.js";
import AppError from "../utils/appError.js";
import {
  setUpContainer,
  execContainer,
  runCommand,
} from "../utils/container.js";

export const getProject = async (req: Request, res: Response) => {
  const { id } = req.query as unknown as { id: number };

  const io = req.app.get("socketio");
  const userSocketMap = req.app.get("userSocketMap");
  const userSocketId = userSocketMap.terminal;
  const userSocket = io.sockets.sockets.get(userSocketId);

  if (!userSocket) {
    throw new AppError("User socket not found", 500);
  }

  const project = await projectModel.getProject(id);

  const containerId = await projectModel.getProjectContainerId(id);
  execContainer(userSocket, containerId);

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

  const { containerId, containerUrl } = await setUpContainer(project.id);
  await projectModel.updateProjectAboutContainer(
    containerId,
    containerUrl,
    project.id
  );

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

export const sendCommandToContainer = async (req: Request, res: Response) => {
  const { projectId, command } = req.body as unknown as {
    projectId: number;
    command: string;
  };

  const io = req.app.get("socketio");
  const userSocketMap = req.app.get("userSocketMap");

  const userSocketId = userSocketMap.terminal;
  const userSocket = io.sockets.sockets.get(userSocketId);

  const containerId = await projectModel.getProjectContainerId(projectId);
  const response = await execContainer(userSocket, containerId);
  // const response = await runCommand("ls");
  // await runCommand("exit");

  res.status(200).json({ containerId, response });
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
    fileModel.createFile(name, type, filePath, projectId, false, 0);
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFile(filePath, code, (err) => {
    if (err) {
      throw new AppError(err.message, 500);
    }
  });
};
