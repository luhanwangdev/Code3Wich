import { z } from 'zod';
import { RowDataPacket } from 'mysql2';
import pool from './databasePool.js';

const FileSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.string(),
  location: z.string(),
  project_id: z.number(),
  isFolder: z.number(),
  parent_file_id: z.number(),
  service_instance_id: z.number(),
});

interface FileRow extends RowDataPacket {
  id: number;
  name: string;
  type: string;
  location: string;
  project_id: number;
  isFolder: number;
  parent_file_id: number;
  service_instance_id: number;
}

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

export const getFileServiceInstance = async (id: number): Promise<number> => {
  const results = await pool.query<FileRow[]>(
    `
    SELECT service_instance_id FROM file
    WHERE id = ?
    `,
    [id]
  );

  return results[0][0].service_instance_id;
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
