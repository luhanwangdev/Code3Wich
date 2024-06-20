import { z } from "zod";
import pool from "./databasePool.js";
import instanceOfSetHeader from "../utils/instanceOfSetHeader.js";
import AppError from "../utils/appError.js";

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  password: z.string(),
  picture: z.any(),
});

export const getUser = async (id: number) => {
  const results = await pool.query(
    `
      SELECT * FROM user
      WHERE id = ?
      `,
    [id]
  );

  const user = z.array(UserSchema).parse(results[0]);
  return user[0];
};

export const createUser = async (
  name: string,
  email: string,
  password: string
) => {
  const results = await pool.query(
    `
      INSERT INTO user(name, email, password)
      VALUES (?, ?, ?)
      `,
    [name, email, password]
  );

  if (Array.isArray(results) && instanceOfSetHeader(results[0])) {
    return results[0].insertId;
  }

  throw new AppError("create user failed", 400);
};
