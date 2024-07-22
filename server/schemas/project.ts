import { z } from 'zod';

export const getFilesByProjectSchema = z.object({
  id: z
    .string()
    .refine((value) => !Number.isNaN(Number(value)), {
      message: 'id must be a number'
    })
    .transform((value) => Number(value))
});

export const getProjectSchema = z.object({
  id: z
    .string()
    .refine((value) => !Number.isNaN(Number(value)), {
      message: 'id must be a number'
    })
    .transform((value) => Number(value))
});

export const connectProjectTerminalSchema = z.object({
  id: z
    .string()
    .refine((value) => !Number.isNaN(Number(value)), {
      message: 'id must be a number'
    })
    .transform((value) => Number(value))
});

export const createProjectSchema = z.object({
  name: z.string().max(10),
  userId: z.number().int().positive(),
  type: z.string()
});

export const deleteProjectSchema = z.object({
  id: z
    .string()
    .refine((value) => !Number.isNaN(Number(value)), {
      message: 'id must be a number'
    })
    .transform((value) => Number(value))
});
