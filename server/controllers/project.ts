import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import chokidar from "chokidar";
import * as projectModel from "../models/project.js";
import * as fileModel from "../models/file.js";
import AppError from "../utils/appError.js";
import {
  setUpContainer,
  execContainer,
  removeContainer,
  removeImage,
} from "../utils/container.js";

export const getProject = async (req: Request, res: Response) => {
  const { id } = req.query as unknown as { id: number };

  const project = await projectModel.getProject(id);

  res.status(200).send(project);
};

export const connectProjectTerminal = async (req: Request, res: Response) => {
  const { id } = req.query as unknown as { id: number };

  const io = req.app.get("socketio");
  const userSocketMap = req.app.get("userSocketMap");
  const userSocketId = userSocketMap[`project${id}`];
  const userSocket = io.sockets.sockets.get(userSocketId);

  console.log(`project${id}: ${userSocketId}`);

  if (!userSocket) {
    throw new AppError("User socket not found", 500);
  }

  const containerId = await projectModel.getProjectContainerId(id);
  execContainer(userSocket, containerId);
};

export const createProject = async (req: Request, res: Response) => {
  const { name, userId, type } = req.body as unknown as {
    name: string;
    userId: number;
    type: string;
  };
  console.log("create Project!");

  const project = await projectModel.createProject(name, userId, type);
  const projectPath = `codeFiles/project${project.id}`;
  const serverCode = `const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello, Docker World!');
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
  `;

  switch (type) {
    case "vanilla":
      createFile("index.html", "html", project.id, "");
      createFile("style.css", "css", project.id, "");
      createFile("index.js", "javascript", project.id, "");
      break;
    case "node":
      createFile("index.js", "javascript", project.id, serverCode);
      break;
    case "react":
      createFile("index.js", "javascript", project.id, serverCode);
      break;
  }

  const watcher = chokidar.watch(projectPath, {
    persistent: true,
    ignored: `${projectPath}/node_modules`,
  });

  watcher.on("add", (filePath: string) => {
    addFile(filePath, project.id);
  });

  watcher.on("addDir", (dirPath: string) => {
    addDir(dirPath, project.id);
  });

  watcher.on("unlink", (filePath) => {
    fileModel.deleteFileByPath(filePath);
  });

  watcher.on("error", (error: Error) => {
    throw new AppError(`Watcher error: ${error}`, 500);
  });

  const { containerId, containerUrl } = await setUpContainer(project.id, type);
  await projectModel.updateProjectAboutContainer(
    containerId,
    containerUrl,
    project.id
  );

  res
    .status(200)
    .json({ status: true, projectId: project.id, url: containerUrl });
};

export const deleteProject = async (req: Request, res: Response) => {
  const { id } = req.query as unknown as { id: number };
  const folderPath = `codeFiles/project${id}`;

  projectModel.deleteProject(id);
  await removeContainer(id);
  await removeImage(id);
  fs.rmSync(path.join(folderPath), { recursive: true });

  res.status(200).json({ id, message: `Delete project${id} successfully` });
};

export const getAllProjects = async (req: Request, res: Response) => {
  const projects = await projectModel.getAllProjects();

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
    fileModel.createFile(name, type, filePath, projectId, false, 0);
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFile(filePath, code, (err) => {
    if (err) {
      throw new AppError(err.message, 500);
    }
  });
};

const addFile = async (filePath: string, projectId: number) => {
  const projectPath = `codeFiles/project${projectId}`;
  const fileName = path.basename(filePath);

  if (
    fileName !== "index.js" &&
    fileName !== "index.html" &&
    fileName !== "style.css"
  ) {
    const parentPath = path.dirname(filePath);
    const fullPath = path.join(projectPath);
    if (parentPath === fullPath) {
      fileModel.createFile(fileName, "json", filePath, projectId, false, 0);
    } else {
      const parentFolder = await fileModel.getFileByPath(parentPath);

      if (!parentFolder) {
        throw new AppError(`${filePath}'s folder doesn't exist`, 500);
      }

      fileModel.createFile(
        fileName,
        "json",
        filePath,
        projectId,
        false,
        parentFolder.id
      );
    }
  }
};

const addDir = async (dirPath: string, projectId: number) => {
  const projectPath = `codeFiles/project${projectId}`;
  const dirName = path.basename(dirPath);

  if (dirName !== `project${projectId}`) {
    const parentPath = path.dirname(dirPath);
    const fullPath = path.join(projectPath);
    if (parentPath === fullPath) {
      fileModel.createFile(dirName, "folder", dirPath, projectId, true, 0);
    } else {
      const parentFolder = await fileModel.getFileByPath(parentPath);
      if (!parentFolder) {
        throw new AppError(`${dirPath}'s folder doesn't exist`, 500);
      }

      fileModel.createFile(
        dirName,
        "folder",
        dirPath,
        projectId,
        true,
        parentFolder.id
      );
    }
  }
};
