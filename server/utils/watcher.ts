import chokidar, { FSWatcher } from 'chokidar';
import path from 'path';
import AppError from './appError.js';
import * as fileModel from '../models/file.js';

const watchDirectory = 'codeFiles';

const watcher: FSWatcher = chokidar.watch(watchDirectory, {
  persistent: true,
  ignoreInitial: true,
  ignored: path.join(watchDirectory, 'project*/node_modules'),
});

const getProjectIdFromPath = (filePath: string): any => {
  const relativePath = path.relative(watchDirectory, filePath);
  const match = relativePath.match(/^project(\d+)/);
  return match ? match[1] : 'unknown';
};

const addFile = async (filePath: string, projectId: number) => {
  const projectPath = `codeFiles/project${projectId}`;
  const fileName = path.basename(filePath);

  if (
    fileName !== 'index.js' &&
    fileName !== 'index.html' &&
    fileName !== 'style.css'
  ) {
    const parentPath = path.dirname(filePath);
    const fullPath = path.join(projectPath);
    if (parentPath === fullPath) {
      const ext = fileName.split('.').pop();

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
        case 'ts':
          fileModel.createFile(
            fileName,
            'typescript',
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

      const ext = fileName.split('.').pop();

      switch (ext) {
        case 'js':
          fileModel.createFile(
            fileName,
            'javascript',
            filePath,
            projectId,
            false,
            parentFolder.id
          );
          break;
        case 'ts':
          fileModel.createFile(
            fileName,
            'typescript',
            filePath,
            projectId,
            false,
            parentFolder.id
          );
          break;
        case 'html':
          fileModel.createFile(
            fileName,
            'html',
            filePath,
            projectId,
            false,
            parentFolder.id
          );
          break;
        case 'css':
          await fileModel.createFile(
            fileName,
            'css',
            filePath,
            projectId,
            false,
            parentFolder.id
          );
          break;
        default:
          await fileModel.createFile(
            fileName,
            'json',
            filePath,
            projectId,
            false,
            parentFolder.id
          );
      }
    }
  }
};

const addDir = async (dirPath: string, projectId: number) => {
  const projectPath = `codeFiles/project${projectId}`;
  const dirName = path.basename(dirPath);

  if (dirName !== `project${projectId}`) {
    const parentPath = path.dirname(dirPath);
    const fullPath = path.join(projectPath);
    if (parentPath === fullPath) {
      await fileModel.createFile(
        dirName,
        'folder',
        dirPath,
        projectId,
        true,
        0
      );
    } else {
      const parentFolder = await fileModel.getFileByPath(parentPath);
      if (!parentFolder) {
        throw new AppError(`${dirPath}'s folder doesn't exist`, 500);
      }

      await fileModel.createFile(
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

export const startWatcher = () => {
  watcher
    .on('add', (filePath: string) => {
      const projectId = getProjectIdFromPath(filePath);
      addFile(filePath, projectId);
    })
    .on('addDir', (dirPath: string) => {
      const projectId = getProjectIdFromPath(dirPath);
      addDir(dirPath, projectId);
    })
    .on('unlinkDir', (filePath: string) => {
      if (filePath.charAt(0) === 'c') {
        fileModel.deleteFileByPath(filePath);
      } else {
        fileModel.deleteFileByPath(filePath.split('server\\')[1]);
      }
    })
    .on('unlink', (filePath: string) => {
      fileModel.deleteFileByPath(filePath);
    })
    .on('error', (error: Error) => console.log(`Watcher error: ${error}`))
    .on('ready', () => console.log('Initial scan complete. Ready for changes'));
};

export async function stopWatcher() {
  if (watcher) {
    await watcher.close();
  }
}
