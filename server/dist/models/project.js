import { z } from "zod";
import pool from "./databasePool.js";
import instanceOfSetHeader from "../utils/instanceOfSetHeader.js";
import AppError from "../utils/appError.js";
const PorjectSchema = z.object({
    id: z.number(),
    name: z.string(),
    location: z.string(),
    user_id: z.number(),
    url: z.string(),
    container_id: z.string(),
    type: z.string(),
});
export const getProject = async (id) => {
    const results = await pool.query(`
    SELECT * FROM project
    WHERE id = ?
    `, [id]);
    const project = z.array(PorjectSchema).parse(results[0]);
    return project[0];
};
export const createProject = async (name, userId, type) => {
    const results = await pool.query(`
    INSERT INTO project(name, user_id, type)
    VALUES (?, ?, ?)
    `, [name, userId, type]);
    if (Array.isArray(results) && instanceOfSetHeader(results[0])) {
        const id = results[0].insertId;
        const location = `codeFiles/project${id}`;
        await pool.query(`
      UPDATE project
      SET location = ?
      WHERE id = ?
      `, [location, id]);
        return { id, name, location, user_id: userId };
    }
    throw new AppError("create file failed", 400);
};
export const updateProjectAboutContainer = async (containerId, url, id) => {
    const result = await pool.query(`
    UPDATE project
    SET container_id = ?, url = ?
    WHERE id = ?
    `, [containerId, url, id]);
    return result;
};
export const getProjectContainerId = async (id) => {
    const [results] = await pool.query(`
    SELECT container_id FROM project
    WHERE id = ?
    `, [id]);
    return results[0].container_id;
};
export const getProjectsByUserId = async (userId) => {
    const results = await pool.query(`
    SELECT * FROM project
    WHERE user_id = ?
    `, [userId]);
    const projects = results
        .slice(0, -1)
        .map((result) => z.array(PorjectSchema).parse(result));
    return projects[0];
};
export const deleteProject = async (id) => {
    await pool.query(`
    DELETE FROM project
    WHERE id = ?
    `, [id]);
};
