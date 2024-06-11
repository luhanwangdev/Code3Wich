import { z } from "zod";
import pool from "./databasePool.js";
import instanceOfSetHeader from "../utils/instanceOfSetHeader.js";
import AppError from "../utils/appError.js";

export const createProject = async (
  name: string,
  location: string,
  userId: number
) => {
  const results = await pool.query(
    `
    INSERT INTO file(name, location, userId)
    VALUES (?, ?, ?)
    `,
    [name, location, userId]
  );

  if (Array.isArray(results) && instanceOfSetHeader(results[0])) {
    return results[0].insertId;
  }

  throw new AppError("create file failed", 400);
};

const PorjectSchema = z.object({
  id: z.number(),
  name: z.string(),
  location: z.string(),
  user_id: z.number(),
});

export const getProject = async (id: number) => {
  const results = await pool.query(
    `
    SELECT * FROM project
    WHERE id = ?
    `,
    [id]
  );

  const file = z.array(PorjectSchema).parse(results[0]);
  return file[0];
};
