import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import io from "socket.io-client";
import * as projectModel from "../models/project.js";
import * as fileModel from "../models/file.js";
import AppError from "../utils/appError.js";
import {
  execContainer,
  removeContainer,
  removeImage,
} from "../utils/container.js";
import { getRabbitMQChannel } from "../utils/rabbitmq.js";
// import { getRabbitMQChannel } from "../utils/rabbitmq.js";

export const getFilesByProject = async (req: Request, res: Response) => {
  const { id } = req.query as unknown as { id: number };

  const files = await fileModel.getFilesByProjectId(id);

  res.status(200).send(files);
};

export const getProject = async (req: Request, res: Response) => {
  const { id } = req.query as unknown as { id: number };

  const project = await projectModel.getProject(id);

  res.status(200).send(project);
};

export const connectProjectTerminal = async (req: Request, res: Response) => {
  // console.log("connecting to terminal...");
  const { id } = req.query as unknown as {
    id: number;
  };
  const socket = io(process.env.SERVER_PATH as string);

  socket.emit("register", `instance${id}`, (response: any) => {
    if (response === "success") {
      // console.log("success");
      res.status(200).send("ok");
    }
  });

  // console.log(`project${id}: ${userSocketId}`);

  // if (!userSocket) {
  //   throw new AppError('User socket not found', 500);
  // }

  const containerId = await projectModel.getProjectContainerId(id);
  await execContainer(socket, containerId);
};

export const deleteProject = async (req: Request, res: Response) => {
  const { id } = req.query as unknown as { id: number };
  const folderPath = `codeFiles/project${id}`;

  projectModel.deleteProject(id);
  fs.rmSync(path.join(folderPath), { recursive: true });
  await removeContainer(id);
  await removeImage(id);

  res.status(200).json({ id, message: `Delete project${id} successfully` });
};
