import dotenv from 'dotenv';
import { Request, Response } from 'express';
import * as projectModel from '../models/project.js';
import * as fileModel from '../models/file.js';
import * as serviceInstanceModel from '../models/serviceInstance.js';
import { getRabbitMQChannel } from '../utils/rabbitmq.js';
import AppError from '../utils/appError.js';

dotenv.config();

const processLimit = parseInt(process.env.PROCESS_LIMIT as string, 10);

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

  const serviceInstanceId = await projectModel.getProjectServiceInstance(id);
  const serviceInstanceUrl = await serviceInstanceModel.getServiceInstanceUrl(
    serviceInstanceId
  );

  await fetch(
    `http://${serviceInstanceUrl}:5000/api/project/terminal?id=${id}`
  );

  const io = req.app.get('socketio');
  const userSocketMap = req.app.get('userSocketMap');
  const clientSocketId = userSocketMap[`project${id}`];
  const instanceSocketId = userSocketMap[`instance${id}`];

  const clientSocket = io.sockets.sockets.get(clientSocketId);
  const instanceSocket = io.sockets.sockets.get(instanceSocketId);

  clientSocket.on('execCommand', (command: any) => {
    instanceSocket.emit('execCommand', command);
  });

  clientSocket.on('disconnect', () => {
    instanceSocket.emit('clientDisconnect');
    clientSocket.emit('execEnd', 'Socket disconnected and stream ended');
  });

  instanceSocket.on('execError', (error: any) => {
    clientSocket.emit('execError', error.message);
  });

  instanceSocket.on('execOutput', (finalOutput: any) => {
    clientSocket.emit('execOutput', finalOutput);
  });

  res.status(200).send('ok');
};

export const createProject = async (req: Request, res: Response) => {
  const { name, userId, type } = req.body as unknown as {
    name: string;
    userId: number;
    type: string;
  };
  const projects = await projectModel.getProjectsByUserId(userId);

  if (projects.length >= processLimit) {
    throw new AppError(
      'Project holding limit reached. Please delete some of project before creating a new one',
      403
    );
  }

  const project = await projectModel.createProject(name, userId, type);

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

  const serviceInstanceId = await projectModel.getProjectServiceInstance(id);
  const serviceInstanceUrl = await serviceInstanceModel.getServiceInstanceUrl(
    serviceInstanceId
  );

  await fetch(`http://${serviceInstanceUrl}:5000/api/project?id=${id}`, {
    method: 'DELETE',
  });

  res.status(200).json({ id, message: `Delete project${id} successfully` });
};
