import { z } from "zod";
import pool from "./databasePool.js";
import instanceOfSetHeader from "../utils/instanceOfSetHeader.js";
import AppError from "../utils/appError.js";
import { RowDataPacket } from "mysql2";

export const createFile = async (
  name: string,
  type: string,
  location: string,
  projectId: number,
  isFolder: boolean,
  parentId: number
) => {
  const results = await pool.query(
    `
    INSERT INTO file(name, type, location, project_id, isFolder, parent_file_id)
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [name, type, location, projectId, isFolder, parentId]
  );

  if (Array.isArray(results) && instanceOfSetHeader(results[0])) {
    return results[0].insertId;
  }

  throw new AppError("create file failed", 400);
};

const FileSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.string(),
  location: z.string(),
  project_id: z.number(),
  isFolder: z.number(),
  parent_file_id: z.number(),
});

interface FileRow extends RowDataPacket {
  id: number;
  name: string;
  type: string;
  location: string;
  project_id: number;
  isFolder: number;
  parent_file_id: number;
}

export const getFile = async (id: number) => {
  const results = await pool.query(
    `
    SELECT * FROM file
    WHERE id = ?
    `,
    [id]
  );

  const file = z.array(FileSchema).parse(results[0]);
  return file[0];
};

export const getFilePath = async (id: number): Promise<string> => {
  const results = await pool.query<FileRow[]>(
    `
    SELECT location FROM file
    WHERE id = ?
    `,
    [id]
  );

  return results[0][0].location;
};

export const getFilesByProjectId = async (projectId: number) => {
  const results = await pool.query(
    `
    SELECT * FROM file
    WHERE project_id = ?
    `,
    [projectId]
  );

  const files = results
    .slice(0, -1)
    .map((result) => z.array(FileSchema).parse(result));

  return files[0];
};

export const getFileByFileNameandProjectId = async (
  name: string,
  projectId: number
) => {
  const results = await pool.query(
    `
    SELECT * FROM file
    WHERE name = ? AND project_id = ?
    `,
    [name, projectId]
  );

  const file = z.array(FileSchema).parse(results[0]);
  return file[0];
};

export const deleteFileByPath = async (path: string) => {
  await pool.query(
    `
    DELETE FROM file
    WHERE location = ?
    `,
    [path]
  );
};
