import { z } from 'zod';

export const getUserSchema = z.object({
  id: z
    .string()
    .refine((value) => !Number.isNaN(Number(value)), {
      message: 'id must be a number'
    })
    .transform((value) => Number(value))
});

export const handleSignupSchema = z.object({
  name: z.string().max(20),
  email: z.string().email(),
  password: z.string()
});

export const handleSigninSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export const getUserProjectsSchema = z.object({
  id: z.number().int().positive()
});

export const getUserInfoSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().max(20),
  email: z.string().email()
});
