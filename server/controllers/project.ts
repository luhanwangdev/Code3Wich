import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { exec } from "child_process";
import * as projectModel from "../models/project.js";
import AppError from "../utils/appError.js";

const execAsync = promisify(exec);

export const getProject = async (req: Request, res: Response) => {
  const { id } = req.query as unknown as { id: number };

  const project = await projectModel.getProject(id);

  res.status(200).send(project);
};

export const packageProject = async (req: Request, res: Response) => {
  const { id } = req.body as unknown as { id: number };

  const projectDir = `codeFiles/project${id}`;
  const dockerfilePath = "Dockerfile";
  const imageName = `project_${id}_image`;
  const containerName = `project_${id}_container`;

  const dockerfileContent = `
  FROM nginx:1.27.0-alpine
  COPY ${projectDir} /usr/share/nginx/html
  EXPOSE 80
  CMD ["nginx", "-g", "daemon off;"]
  `;
  fs.writeFileSync(dockerfilePath, dockerfileContent);

  await execAsync(`docker image build -t ${imageName} .`);

  await execAsync(
    `docker container run -d -p 0:80 --name ${containerName} ${imageName}`
  );

  const { stdout: inspectStdout } = await execAsync(
    `docker inspect --format="{{(index (index .NetworkSettings.Ports \\"80/tcp\\") 0).HostPort}}" ${containerName}`
  );

  const containerPort = inspectStdout.trim();
  const containerUrl = `http://localhost:${containerPort}`;

  res.status(200).json({ status: true, projectId: id, url: containerUrl });
};
