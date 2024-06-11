import { z } from "zod";
import pool from "./databasePool.js";
import instanceOfSetHeader from "../utils/instanceOfSetHeader.js";
import AppError from "../utils/appError.js";

export const createFile = async (
  name: string,
  type: string,
  location: string,
  projectId: number
) => {
  const results = await pool.query(
    `
    INSERT INTO file(name, type, location, projectId)
    VALUES (?, ?, ?, ?)
    `,
    [name, type, location, projectId]
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
});

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
