import { z } from "zod";
import pool from "./databasePool.js";
import instanceOfSetHeader from "../utils/instanceOfSetHeader.js";
import AppError from "../utils/appError.js";

export const createFile = async (
  name: string,
  type: string,
  location: string,
  userId: number
) => {
  const results = await pool.query(
    `
    INSERT INTO file(name, type, location, userId)
    VALUES (?, ?, ?, ?)
    `,
    [name, type, location, userId]
  );

  if (Array.isArray(results) && instanceOfSetHeader(results[0])) {
    return results[0].insertId;
  }

  throw new AppError("create file failed", 400);
};

const FileSchema = z.object({
  id: z.number(),
  type: z.string(),
  location: z.string(),
  userId: z.number(),
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
