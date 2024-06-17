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
): Promise<void> => {
  // await execAsync(`docker container exec -it ${containerId} ash`);

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

        console.log("Received data from container:", finalOutput);
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
