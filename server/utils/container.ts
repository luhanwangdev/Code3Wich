import dotenv from "dotenv";
import fs from "fs";
import { promisify } from "util";
import { Duplex } from "stream";
import { Socket } from "socket.io";
import { exec } from "child_process";
import Docker from "dockerode";
import AppError from "./appError.js";

const execAsync = promisify(exec);
const docker = new Docker();
dotenv.config();

export const setUpContainer = async (id: number, isDynamic: boolean) => {
  const projectDir = `codeFiles/project${id}`;
  const absolutePath = process.env.SERVER_PATH + projectDir;
  const dockerfilePath = "Dockerfile";

  const imageName = `project_${id}_image`;
  const containerName = `project_${id}_container`;
  const port = isDynamic ? 3000 : 80;
  const containerPath = isDynamic ? "/app" : "/usr/share/nginx/html";

  let dockerfileContent;

  if (isDynamic) {
    // dockerfileContent = `
    // FROM node:22-alpine
    // WORKDIR /app
    // COPY ${projectDir} .
    // EXPOSE ${port}
    // CMD ["node", "index.js"]
    // `;

    dockerfileContent = `
    FROM node:22-alpine
    WORKDIR /app
    COPY ${projectDir} .
    RUN npm init -y && npm install -g nodemon
    EXPOSE ${port}
    CMD ["nodemon", "-L", "index.js"]
    `;
  } else {
    dockerfileContent = `
    FROM nginx:1.27.0-alpine
    COPY ${projectDir} ${containerPath}
    EXPOSE ${port}
    CMD ["nginx", "-g", "daemon off;"]
    `;
  }

  fs.writeFileSync(dockerfilePath, dockerfileContent);

  await execAsync(`docker image build -t ${imageName} .`);

  if (isDynamic) {
    await execAsync(`docker run -d --name temp-container ${imageName}`);
    await execAsync(`docker cp temp-container:/app/. ${projectDir}`);
    await execAsync(`docker stop temp-container`);
    await execAsync(`docker rm temp-container`);
  }

  await execAsync(
    `docker container run -d -p 0:${port} --name ${containerName} -v "${absolutePath}:${containerPath}" ${imageName}`
  );

  const { stdout: urlStdout } = await execAsync(
    `docker inspect --format="{{(index (index .NetworkSettings.Ports \\"${port}/tcp\\") 0).HostPort}}" ${containerName}`
  );

  const { stdout: idStdout } = await execAsync(
    `docker ps -aqf "name=${containerName}"`
  );

  const containerPort = urlStdout.trim();
  const containerUrl = `http://localhost:${containerPort}`;
  const containerId = idStdout.trim();

  return { containerId, containerUrl };
};

export const execContainer = async (
  socket: Socket,
  containerId: string
): Promise<void> => {
  const container = docker.getContainer(containerId);
  const exec = await container.exec({
    AttachStdout: true,
    AttachStdin: true,
    AttachStderr: true,
    Tty: true,
    Cmd: ["ash"],
  });

  exec.start({ hijack: true, stdin: true }, (err: Error, stream: Duplex) => {
    if (err) {
      socket.emit("execError", err.message);
      throw new AppError(err.message, 500);
    }

    console.log("Container exec session started");
    let dataOutput = "";

    stream.on("data", (data) => {
      const dataStr = data
        .toString("utf8")
        .replace(
          /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
          ""
        );

      const lines = dataStr.split("\n");

      if (lines[lines.length - 1].slice(-2) === "# ") {
        lines.splice(-2, 1);

        dataOutput += lines.join("\n");

        const contentList = dataOutput.split("\n");
        contentList.shift();
        const output = contentList.join("\n");
        const finalOutput = output.trim();

        // console.log("Received data from container:", finalOutput);
        socket.emit("execOutput", finalOutput);

        dataOutput = "";
      } else {
        dataOutput += dataStr;
      }
    });

    stream.on("end", () => {
      console.log("End of stream");
    });

    stream.on("error", (error) => {
      socket.emit("execError", error.message);
      throw new AppError(`Error during stream: ${error.message}`, 500);
    });

    socket.on("execCommand", (command) => {
      // console.log("Received command from client:", command);
      if (stream.writable) {
        stream.write(command + "\n");
      } else {
        socket.emit("execError", "Stream is not writable");
      }
    });

    socket.on("disconnect", () => {
      // userSocketMap[user] = socket.id;
      stream.end();
      console.log("client disconnect");
      socket.emit("execEnd", "Socket disconnected and stream ended");
    });
  });
};

export const removeContainer = async (id: number) => {
  const containerName = `project_${id}_container`;

  const containers = await docker.listContainers({ all: true });

  const container = containers.find((container) =>
    container.Names.includes(`/${containerName}`)
  );

  if (!container) {
    console.log(`Container '${containerName}' not found.`);
    return;
  }

  const containerInstance = docker.getContainer(container.Id);

  await containerInstance.remove({ force: true });

  // docker.listContainers(
  //   { all: true },
  //   (err: Error, containers: ContainerInfo[]) => {
  //     if (err) {
  //       throw new AppError(`Error listing containers: ${err}`, 500);
  //     }

  //     const container = containers.find((container) =>
  //       container.Names.includes(`/${containerName}`)
  //     );

  //     if (!container) {
  //       console.log(`Container '${containerName}' not found.`);
  //       return;
  //     }

  //     docker.getContainer(container.Id).remove({ force: true }, (err, data) => {
  //       if (err) {
  //         throw new AppError(`Error removing container: ${err}`, 500);
  //       } else {
  //         console.log("Container removed successfully:", data);
  //       }
  //     });
  //   }
  // );
};

export const removeImage = async (id: number) => {
  const imageName = `project_${id}_image`;

  const images = await docker.listImages();

  const image = images.find(
    (img) => img.RepoTags && img.RepoTags.includes(`${imageName}:latest`)
  );

  if (!image) {
    console.log(`Image '${imageName}' not found.`);
    return;
  }

  const imageInstance = docker.getImage(image.Id);

  await imageInstance.remove({ force: true });

  // docker.listImages((err: Error, images: ImageInfo[]) => {
  //   if (err) {
  //     throw new AppError(`Error listing images: ${err}`, 500);
  //   }

  //   const image = images.find((img) =>
  //     img.RepoTags.includes(`${imageName}:latest`)
  //   );

  //   if (!image) {
  //     console.log(`Image '${imageName}' not found.`);
  //     return;
  //   }

  //   docker.getImage(image.Id).remove({ force: true }, (err, data) => {
  //     if (err) {
  //       throw new AppError(`Error removing image: ${err}`, 500);
  //     } else {
  //       console.log("Image removed successfully:", data);
  //     }
  //   });
  // });
};
