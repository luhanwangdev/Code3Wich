import { z } from 'zod';
import pool from './databasePool.js';
import instanceOfSetHeader from '../utils/instanceOfSetHeader.js';
import AppError from '../utils/appError.js';
import { RowDataPacket } from 'mysql2';

const ServiceInstanceSchema = z.object({
  id: z.number(),
  url: z.string(),
});

interface ServiceInstanceRow extends RowDataPacket {
  id: number;
  url: string;
}

export const getServiceInstanceUrl = async (id: number): Promise<string> => {
  const [results] = await pool.query<ServiceInstanceRow[]>(
    `
    SELECT url FROM service_instance
    WHERE id = ?
    `,
    [id]
  );

  return results[0].url;
};
