import dotenv from "dotenv";
import fs from "fs";
import { promisify } from "util";
import { exec } from "child_process";

const execAsync = promisify(exec);
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

export const execContainer = async (containerId: string) => {
  await execAsync(`docker container exec -it ${containerId} ash`);
};

export const runCommand = async (command: string) => {
  const { stdout } = await execAsync(command);
  return stdout;
};
