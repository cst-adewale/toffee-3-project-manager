import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, 'Project name is required.'),
  key: z.string()
    .trim()
    .min(1, 'Project key is required.')
    .max(8, 'Project key can be at most 8 characters.')
    .regex(/^[a-zA-Z0-9]+$/, 'Project key can only contain letters and numbers.')
    .transform((value) => value.toUpperCase()),
});
