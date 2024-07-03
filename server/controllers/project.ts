import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import * as projectModel from '../models/project.js';
import * as fileModel from '../models/file.js';
import AppError from '../utils/appError.js';
import {
  execContainer,
  removeContainer,
  removeImage,
} from '../utils/container.js';
import { getRabbitMQChannel } from '../utils/rabbitmq.js';

const createFile = async (
  name: string,
  type: string,
  projectId: number,
  code: string
) => {
  const file = await fileModel.getFileByFileNameandProjectId(name, projectId);
  const filePath = path.join(`codeFiles/project${projectId}/${name}`);

  if (!file) {
    await fileModel.createFile(name, type, filePath, projectId, false, 0);
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFile(filePath, code, (err) => {
    if (err) {
      throw new AppError(err.message, 500);
    }
  });
};

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
  // console.log('connecting to terminal...');
  const { id } = req.query as unknown as { id: number };

  const io = req.app.get('socketio');
  const userSocketMap = req.app.get('userSocketMap');
  const userSocketId = userSocketMap[`project${id}`];
  const userSocket = io.sockets.sockets.get(userSocketId);

  // console.log(`project${id}: ${userSocketId}`);

  // if (!userSocket) {
  //   throw new AppError('User socket not found', 500);
  // }

  const containerId = await projectModel.getProjectContainerId(id);
  await execContainer(userSocket, containerId);
  res.status(200).send('ok');
};

export const createProject = async (req: Request, res: Response) => {
  const { name, userId, type } = req.body as unknown as {
    name: string;
    userId: number;
    type: string;
  };
  console.log('create Project!');

  const project = await projectModel.createProject(name, userId, type);
  const initialHTML = `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="stylesheet" href="./style.css" />
      <script defer src="./index.js"></script>
      <title>Project</title>
    </head>
    <body>
      <h1 class="hello"></h1>
    </body>
  </html>
    `;
  const initialCSS = `h1{
    color: lightseagreen;
  };`;
  const initialJS = `const helloArea = document.querySelector("h1");
  const helloText = "Hello from Code3Wich";

  helloArea.innerText = helloText;`;

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
    case 'vanilla':
      await Promise.all([
        createFile('index.html', 'html', project.id, initialHTML),
        createFile('style.css', 'css', project.id, initialCSS),
        createFile('index.js', 'javascript', project.id, initialJS),
      ]);
      break;
    case 'node':
      await createFile('index.js', 'javascript', project.id, serverCode);
      break;
    case 'bun':
      await createFile('index.js', 'javascript', project.id, serverCode);
      break;
    case 'react':
      await createFile('index.js', 'javascript', project.id, serverCode);
      break;
    default:
      throw new AppError('The project type is invalid', 500);
  }

  const channel = await getRabbitMQChannel();
  const queue = 'createProjectQueue';

  await channel.assertQueue(queue, {
    durable: false,
  });

  const message = { projectId: project.id, type };
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
  console.log(`Sent: ${JSON.stringify(message)}`);

  await projectModel.updateProjectStatus('loading', project.id);

  res.status(200).json({
    status: true,
    message: 'The project is passed to worker successfuly',
  });
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
