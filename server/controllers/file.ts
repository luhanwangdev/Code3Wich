import { Request, Response } from 'express';
import * as fileModel from '../models/file.js';
import * as projectModel from '../models/project.js';
import * as serviceInstanceModel from '../models/serviceInstance.js';
import {
  checkFileExistedSchema,
  deleteFileSchema,
  loadFileSchema,
  updateFileSchema
} from '../schemas/file.js';

export const updateFile = async (req: Request, res: Response) => {
  const { name, isFolder, projectId, parentId, code } = updateFileSchema.parse(
    req.body
  );

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
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        isFolder,
        projectId,
        parentId,
        code
      })
    }
  );

  const updateData = await updateResponse.json();
  const updatePath = updateData.path;
  const updateCode = updateData.code;

  res.status(200).json({ success: true, path: updatePath, code: updateCode });
};

export const loadFile = async (req: Request, res: Response) => {
  const { id } = loadFileSchema.parse(req.query);

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
  const { id } = deleteFileSchema.parse(req.params);

  const serviceInstanceId = await fileModel.getFileServiceInstance(id);
  const serviceInstanceUrl = await serviceInstanceModel.getServiceInstanceUrl(
    serviceInstanceId
  );

  await fetch(`http://${serviceInstanceUrl}:5000/api/file/${id}`, {
    method: 'DELETE'
  });

  res
    .status(200)
    .json({ status: true, message: 'Folder deleted successfully' });
};

export const checkFileExisted = async (req: Request, res: Response) => {
  const { name, projectId } = checkFileExistedSchema.parse(req.body);

  const existFile = await fileModel.getFileByFileNameandProjectId(
    name,
    projectId
  );

  if (existFile) {
    res.status(200).json({ existed: true });
    return;
  }

  res.status(200).json({ existed: false });
};
