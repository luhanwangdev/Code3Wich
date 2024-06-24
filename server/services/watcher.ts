import chokidar from 'chokidar';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import AppError from '../utils/appError.js';
import * as fileModel from '../models/file.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(dirname(dirname(__filename)));

const watchDirectory = 'codeFiles';

const watcher = chokidar.watch(watchDirectory, {
  persistent: true,
  ignoreInitial: true,
  ignored: path.join(watchDirectory, 'project*/node_modules'),
});

watcher
  .on('add', (filePath: string) => {
    const projectId = getProjectIdFromPath(filePath);
    addFile(filePath, projectId);
  })
  .on('addDir', (dirPath: string) => {
    const projectId = getProjectIdFromPath(dirPath);
    addDir(dirPath, projectId);
  })
  .on('unlink', (filePath: string) => {
    fileModel.deleteFileByPath(filePath);
  })

  .on('error', (error: Error) => console.log(`Watcher error: ${error}`))
  .on('ready', () => console.log('Initial scan complete. Ready for changes'));

const getProjectIdFromPath = (filePath: string): number => {
  const relativePath = path.relative(watchDirectory, filePath);
  const match = relativePath.match(/^project(\d+)/);
  return match ? match[1] : 'unknown';
};

const addFile = async (filePath: string, projectId: number) => {
  const projectPath = `codeFiles/project${projectId}`;
  const fileName = path.basename(filePath);
  const parentPath = path.dirname(filePath);
  const fullPath = path.join(projectPath);

  if (parentPath === fullPath) {
    const ext = fileName.split('.').pop();
    // console.log(`extention: ${ext}`);
    switch (ext) {
      case 'js':
        fileModel.createFile(
          fileName,
          'javascript',
          filePath,
          projectId,
          false,
          0
        );
        break;
      case 'html':
        fileModel.createFile(fileName, 'html', filePath, projectId, false, 0);
        break;
      case 'css':
        fileModel.createFile(fileName, 'css', filePath, projectId, false, 0);
        break;
      default:
        fileModel.createFile(fileName, 'json', filePath, projectId, false, 0);
    }
  } else {
    const parentFolder = await fileModel.getFileByPath(parentPath);

    if (!parentFolder) {
      throw new AppError(`${filePath}'s folder doesn't exist`, 500);
    }

    fileModel.createFile(
      fileName,
      'json',
      filePath,
      projectId,
      false,
      parentFolder.id
    );
  }
};

const addDir = async (dirPath: string, projectId: number) => {
  const projectPath = `codeFiles/project${projectId}`;
  const dirName = path.basename(dirPath);

  if (dirName !== `project${projectId}`) {
    const parentPath = path.dirname(dirPath);
    const fullPath = path.join(projectPath);
    if (parentPath === fullPath) {
      fileModel.createFile(dirName, 'folder', dirPath, projectId, true, 0);
    } else {
      const parentFolder = await fileModel.getFileByPath(parentPath);
      if (!parentFolder) {
        throw new AppError(`${dirPath}'s folder doesn't exist`, 500);
      }

      fileModel.createFile(
        dirName,
        'folder',
        dirPath,
        projectId,
        true,
        parentFolder.id
      );
    }
  }
};
