import * as amqp from 'amqplib';
import io from 'socket.io-client';
import fs from 'fs';
import path from 'path';
import * as projectModel from '../models/project.js';
import AppError from '../utils/appError.js';
import { setUpContainer } from '../utils/container.js';

const socket = io('http://localhost:3000');

const createProjectContainer = async (projectId: number, type: string) => {
  const { containerId, containerUrl, err } = await setUpContainer(
    projectId,
    type
  );

  if (err) {
    const folderPath = `codeFiles/project${projectId}`;

    await projectModel.deleteProject(projectId);
    fs.rmSync(path.join(folderPath), { recursive: true });

    throw new AppError(err, 500);
  }

  // console.log(`containerId: ${containerId}`);
  // console.log(`containerUrl: ${containerUrl}`);

  if (!(containerId && containerUrl)) {
    console.log('inside !(containerId && containerUrl)');
    const folderPath = `codeFiles/project${projectId}`;

    await projectModel.deleteProject(projectId);
    fs.rmSync(path.join(folderPath), { recursive: true });

    throw new AppError('Container id is null', 500);
  }

  await projectModel.updateProjectAboutContainer(
    containerId as string,
    containerUrl as string,
    projectId
  );

  return { projectId, url: containerUrl };
};

async function receiveMessages() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    const queue = 'createProjectQueue';

    await channel.assertQueue(queue, {
      durable: false,
    });

    console.log(`Waiting for messages in ${queue}...`);

    channel.prefetch(1);

    channel.consume(
      queue,
      async (msg: any) => {
        if (msg !== null) {
          const messageContent = msg.content.toString();

          const messageObject = JSON.parse(messageContent);
          const { projectId, type } = messageObject;

          try {
            await createProjectContainer(projectId, type);
            await projectModel.updateProjectStatus('done', projectId);

            console.log(
              `Project${projectId}'s container is created successfully`
            );

            socket.emit('projectStatus', { id: projectId, status: 'success' });
          } catch (error) {
            console.error('Error processing project:', error);

            socket.emit('projectStatus', { id: projectId, status: 'failed' });
          }

          channel.ack(msg);
        }
      },
      {
        noAck: false,
      }
    );
  } catch (error) {
    console.error('Error:', error);
  }
}

receiveMessages();
