import * as amqp from "amqplib";
import io from "socket.io-client";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import * as projectModel from "../models/project.js";
import * as fileModel from "../models/file.js";
import AppError from "../utils/appError.js";
import { setUpContainer } from "../utils/container.js";

dotenv.config();
const socket = io(process.env.SERVER_PATH as string);

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

const createProject = async (projectId: number, type: string) => {
  const serviceInstanceId = parseInt(
    process.env.SERVICE_INSTANCE_ID as string,
    10
  );
  await projectModel.updateProjectServiceInstanceId(
    serviceInstanceId,
    projectId
  );

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
    case "vanilla":
      await Promise.all([
        createFile("index.html", "html", projectId, initialHTML),
        createFile("style.css", "css", projectId, initialCSS),
        createFile("index.js", "javascript", projectId, initialJS),
      ]);
      break;
    case "node":
      await createFile("index.js", "javascript", projectId, serverCode);
      break;
    case "bun":
      await createFile("index.js", "javascript", projectId, serverCode);
      break;
    case "react":
      await createFile("index.js", "javascript", projectId, serverCode);
      break;
    default:
      throw new AppError("The project type is invalid", 500);
  }

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
    console.log("inside !(containerId && containerUrl)");
    const folderPath = `codeFiles/project${projectId}`;

    await projectModel.deleteProject(projectId);
    fs.rmSync(path.join(folderPath), { recursive: true });

    throw new AppError("Container id is null", 500);
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
    const connection = await amqp.connect(
      `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_SERVER}:5672//`
    );
    const channel = await connection.createChannel();
    const queue = "createProjectQueue";

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
          console.log(projectId);
          console.log(type);

          try {
            await createProject(projectId, type);
            await projectModel.updateProjectStatus("done", projectId);

            console.log(
              `Project${projectId}'s container is created successfully`
            );

            socket.emit("projectStatus", { id: projectId, status: "success" });
          } catch (error) {
            console.error("Error processing project:", error);

            socket.emit("projectStatus", { id: projectId, status: "failed" });
          }

          channel.ack(msg);
        }
      },
      {
        noAck: false,
      }
    );
  } catch (error) {
    console.error("Error:", error);
  }
}

receiveMessages();
