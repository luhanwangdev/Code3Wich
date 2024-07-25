import { z } from 'zod';

export const updateFileSchema = z.object({
  name: z.string().max(10),
  isFolder: z.boolean().optional(),
  projectId: z.number().int().positive(),
  parentId: z.number().int().optional(),
  code: z.string().optional()
});

export const loadFileSchema = z.object({
  id: z
    .string()
    .refine((value) => !Number.isNaN(Number(value)), {
      message: 'id must be a number'
    })
    .transform((value) => Number(value))
});

export const deleteFileSchema = z.object({
  id: z
    .string()
    .refine((value) => !Number.isNaN(Number(value)), {
      message: 'id must be a number'
    })
    .transform((value) => Number(value))
});

export const checkFileExistedSchema = z.object({
  name: z.string().max(10),
  projectId: z.number().int().positive()
});
