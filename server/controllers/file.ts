import { Request, Response } from 'express';
import * as fileModel from '../models/file.js';
import * as projectModel from '../models/project.js';
import * as serviceInstanceModel from '../models/serviceInstance.js';

export const updateFile = async (req: Request, res: Response) => {
  const { name, isFolder, projectId, parentId, code } = req.body as unknown as {
    name: string;
    isFolder: boolean;
    projectId: number;
    parentId: number;
    code: string;
  };

  const serviceInstanceId = await projectModel.getProjectServiceInstance(
    projectId
  );
  const serviceInstanceUrl = await serviceInstanceModel.getServiceInstanceUrl(
    serviceInstanceId
  );

  const updateResponse = await fetch(
    `http://${serviceInstanceUrl}:5000/api/file/edit`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        isFolder,
        projectId,
        parentId,
        code,
      }),
    }
  );

  const updateData = await updateResponse.json();
  const updatePath = updateData.path;
  const updateCode = updateData.code;

  res.status(200).json({ success: true, path: updatePath, code: updateCode });
};

export const loadFile = async (req: Request, res: Response) => {
  const { id } = req.query as unknown as {
    id: number;
  };

  const serviceInstanceId = await fileModel.getFileServiceInstance(id);
  const serviceInstanceUrl = await serviceInstanceModel.getServiceInstanceUrl(
    serviceInstanceId
  );

  const codeResponse = await fetch(
    `http://${serviceInstanceUrl}:5000/api/file/edit?id=${id}`
  );
  const codeData = await codeResponse.json();
  const data = codeData.code;

  res.status(200).json({ status: true, code: data });
};

export const deleteFile = async (req: Request, res: Response) => {
  const { id } = req.params as unknown as {
    id: number;
  };

  const serviceInstanceId = await fileModel.getFileServiceInstance(id);
  const serviceInstanceUrl = await serviceInstanceModel.getServiceInstanceUrl(
    serviceInstanceId
  );

  await fetch(`http://${serviceInstanceUrl}:5000/api/file/${id}`, {
    method: 'DELETE',
  });

  res
    .status(200)
    .json({ status: true, message: 'Folder deleted successfully' });
};
