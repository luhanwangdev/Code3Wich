import { z } from "zod";
import pool from "./databasePool.js";
import instanceOfSetHeader from "../utils/instanceOfSetHeader.js";
import AppError from "../utils/appError.js";

export const createProject = async (name: string, userId: number) => {
  const results = await pool.query(
    `
    INSERT INTO project(name, user_id)
    VALUES (?, ?)
    `,
    [name, userId]
  );

  if (Array.isArray(results) && instanceOfSetHeader(results[0])) {
    const id = results[0].insertId;
    const location = `codeFiles/project${id}`;

    await pool.query(
      `
      UPDATE project
      SET location = ?
      WHERE id = ?
      `,
      [location, id]
    );

    return { id, name, location, user_id: userId };
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

  const project = z.array(PorjectSchema).parse(results[0]);
  return project[0];
};

export const getAllProjects = async () => {
  const results = await pool.query(
    `
    SELECT * FROM project
    `
  );

  const projects = results
    .slice(0, -1)
    .map((result) => z.array(PorjectSchema).parse(result));

  return projects[0];
};

export const getProjectsByUserId = async (userId: number) => {
  const results = await pool.query(
    `
    SELECT * FROM project
    WHERE user_id = ?
    `,
    [userId]
  );

  const projects = results
    .slice(0, -1)
    .map((result) => z.array(PorjectSchema).parse(result));

  return projects[0];
};
