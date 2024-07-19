import dotenv from "dotenv";
import { promisify } from "util";
import { Socket } from "socket.io-client";
import { exec } from "child_process";
import Docker from "dockerode";
import AppError from "./appError.js";

const execAsync = promisify(exec);
const docker = new Docker();
dotenv.config();

export const setUpContainer = async (id: number, type: string) => {
  try {
    const projectDir = `codeFiles/project${id}`;
    const absolutePath = process.env.SERVICE_INSTANCE_PATH + projectDir;

    const imageName =
      type === "node" ? "luhanwang/node" : "luhanwang/vanilla_js";
    const containerName = `project_${id}_container`;

    const port = (() => {
      switch (type) {
        case "vanilla":
          return 80;
        case "node":
          return 3000;
        default:
          throw new AppError("Unknown Type for port", 500);
      }
    })();

    const containerPath = (() => {
      switch (type) {
        case "vanilla":
          return "/usr/share/nginx/html";
        case "node":
          return "/app";
        default:
          throw new AppError("Unknown Type for containerPath", 500);
      }
    })();

    switch (type) {
      case "vanilla":
        await execAsync(
          `docker container run -d -p 0:${port} --name ${containerName} -v "${absolutePath}:${containerPath}" --cpus 0.8 -m 100m ${imageName}`
        );
        break;
      case "node":
        await execAsync(
          `docker run -d --name temp-container-${id} ${imageName}`
        );
        await execAsync(`docker cp temp-container-${id}:/app/. ${projectDir}`);
        await execAsync(`docker stop temp-container-${id}`);
        await execAsync(`docker rm temp-container-${id}`);
        await execAsync(
          `docker container run -d -p 0:${port} --name ${containerName} -v "${absolutePath}:${containerPath}" --cpus 0.8 -m 100m ${imageName}`
        );
        break;
      default:
        throw new AppError("No project type", 500);
    }

    const { stdout: urlStdout } = await execAsync(
      `docker inspect --format="{{(index (index .NetworkSettings.Ports \\"${port}/tcp\\") 0).HostPort}}" ${containerName}`
    );

    const { stdout: idStdout } = await execAsync(
      `docker ps -aqf "name=${containerName}"`
    );

    const containerPort = parseInt(urlStdout.trim(), 10);
    const serviceInstanceId = parseInt(
      process.env.SERVICE_INSTANCE_ID as string,
      10
    );
    const modifiedContainerPort = 100 * containerPort + serviceInstanceId;

    const containerUrl = `${process.env.HOST_PATH}/container/${modifiedContainerPort}/`;
    const containerId = idStdout.trim();

    return { containerId, containerUrl, err: null };
  } catch (err: any) {
    return { containerId: null, containerUrl: null, err: err.message };
  }
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

  exec.start({ hijack: true, stdin: true }, (err: Error, stream: any) => {
    if (err) {
      socket.emit("execError", err.message);
      throw new AppError(err.message, 500);
    }

    let dataOutput = "";

    stream.on("data", (data: any) => {
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

        socket.emit("execOutput", finalOutput);

        dataOutput = "";
      } else {
        dataOutput += dataStr;
      }
    });

    stream.on("end", () => {
      // console.log('End of stream');
    });

    stream.on("error", (error: any) => {
      socket.emit("execError", error.message);
      throw new AppError(`Error during stream: ${error.message}`, 500);
    });

    socket.on("execCommand", (command) => {
      if (stream.writable) {
        stream.write(command + "\n");
      } else {
        socket.emit("execError", "Stream is not writable");
      }
    });

    socket.on("clientDisconnect", () => {
      stream.end();
      socket.disconnect();
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
};
