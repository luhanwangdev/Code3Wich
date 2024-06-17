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

export const setUpContainer = async (id: number) => {
  const projectDir = `codeFiles/project${id}`;
  const absolutePath = process.env.SERVER_PATH + projectDir;
  const containerPath = "/usr/share/nginx/html";
  const dockerfilePath = "Dockerfile";

  const imageName = `project_${id}_image`;
  const containerName = `project_${id}_container`;

  const dockerfileContent = `
  FROM nginx:1.27.0-alpine
  COPY ${projectDir} ${containerPath}
  EXPOSE 80
  CMD ["nginx", "-g", "daemon off;"]
  `;
  fs.writeFileSync(dockerfilePath, dockerfileContent);

  await execAsync(`docker image build -t ${imageName} .`);

  await execAsync(
    `docker container run -d -p 0:80 --name ${containerName} -v "${absolutePath}:${containerPath}" ${imageName}`
  );

  const { stdout: urlStdout } = await execAsync(
    `docker inspect --format="{{(index (index .NetworkSettings.Ports \\"80/tcp\\") 0).HostPort}}" ${containerName}`
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
  // command: string
): Promise<string> => {
  // await execAsync(`docker container exec -it ${containerId} ash`);

  const container = docker.getContainer(containerId);
  const exec = await container.exec({
    AttachStdout: true,
    AttachStdin: true,
    AttachStderr: true,
    Tty: true,
    // Cmd: ["ash", "-c", "cd usr/share/nginx/html && ls "],
    Cmd: ["ash"],
  });

  // return new Promise((resolve, reject) => {
  //   let output = "";

  //   exec.start({ hijack: true, stdin: true }, (err: Error, stream: Duplex) => {
  //     if (err) {
  //       reject(new AppError(err.message, 500));
  //       return;
  //     }

  //     stream.on("data", (data) => {
  //       output += data.toString();
  //     });

  //     stream.on("end", () => {
  //       resolve(output);
  //     });

  //     stream.on("error", (error) => {
  //       console.error("Error during stream:", error);
  //       reject(new AppError(error.message, 500));
  //     });

  //     socket.on("execCommand", (command) => {
  //       if (stream.writable) {
  //         stream.write(command + "\n");
  //       } else {
  //         socket.emit("execError", "Stream is not writable");
  //       }
  //     });

  //     socket.on("disconnect", () => {
  //       stream.end();
  //       socket.emit("execEnd", "Socket disconnected and stream ended");
  //     });
  //   });
  // });

  exec.start({ hijack: true, stdin: true }, (err: Error, stream: Duplex) => {
    if (err) {
      socket.emit("execError", err.message);
      throw new AppError(err.message, 500);
    }

    console.log("Container exec session started");
    let dataCount = 0;

    stream.on("data", (data) => {
      dataCount += 1;
      const dataStr = data.toString();

      console.log("Received data from container:", dataStr);
      console.log(dataCount);

      if (dataCount % 2 === 1) {
        socket.emit("execOutput", dataStr);
      }
    });

    stream.on("error", (error) => {
      socket.emit("execError", error.message);
      throw new AppError(`Error during stream: ${error.message}`, 500);
    });

    socket.on("execCommand", (command) => {
      console.log("Received command from client:", command);
      if (stream.writable) {
        stream.write(command + "\n");
      } else {
        socket.emit("execError", "Stream is not writable");
      }
    });

    socket.on("disconnect", () => {
      stream.end();
      socket.emit("execEnd", "Socket disconnected and stream ended");
    });
  });
};

export const runCommand = async (command: string) => {
  const { stdout } = await execAsync(command);
  return stdout;
};
