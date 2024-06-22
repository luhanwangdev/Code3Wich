import chokidar from "chokidar";
import path from "path";
import AppError from "../utils/appError.js";
import * as fileModel from "../models/file.js";
const projectPath = 0;
const watcher = chokidar.watch(projectPath, { persistent: true });
watcher.on("add", (filePath) => {
    const fileName = path.basename(filePath);
    fileModel.createFile(fileName, "json", filePath, project.id, false, 0);
});
// watcher.on("addDir", (dirPath: string) => {
//   const dirName = path.basename(dirPath);
//   fileModel.createFile(
//     dirName,
//     "json",
//     `${dirPath}/${dirName}`,
//     project.id,
//     true,
//     0
//   );
// });
watcher.on("unlink", (filePath) => {
    fileModel.deleteFileByPath(filePath);
});
watcher.on("error", (error) => {
    throw new AppError(`Watcher error: ${error}`, 500);
});
