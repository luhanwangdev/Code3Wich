import fs from "fs";
import path from "path";
import AppError from "../utils/appError.js";
import * as fileModel from "../models/file.js";
export const updateFile = async (req, res) => {
    const { name, type, projectId, parentId, code } = req.body;
    const file = await fileModel.getFileByFileNameandProjectId(name, projectId);
    let filePath;
    if (!file) {
        let isFolder = false;
        if (type === "folder") {
            isFolder = true;
        }
        if (parentId === 0) {
            filePath = `codeFiles/project${projectId}/${name}`;
        }
        else {
            const parentPath = await fileModel.getFilePath(parentId);
            filePath = `${parentPath}/${name}`;
        }
        fileModel.createFile(name, type, filePath, projectId, isFolder, parentId);
        if (isFolder) {
            fs.mkdirSync(filePath, { recursive: true });
            res.status(200).json({ success: true, path: filePath });
            return;
        }
    }
    else {
        filePath = file.location;
    }
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFile(filePath, code, (err) => {
        if (err) {
            throw new AppError(err.message, 500);
        }
    });
    res.status(200).json({ success: true, path: filePath, code });
};
export const loadFile = async (req, res) => {
    const { id } = req.query;
    const filePath = await fileModel.getFilePath(id);
    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            throw new AppError(err.message, 500);
        }
        res.status(200).json({ status: true, code: data });
    });
};
