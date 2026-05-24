import { z } from 'zod';

export const createSprintSchema = z.object({
  projectId: z.string().min(1, 'Select a project before creating a sprint.'),
  name: z.string().trim().min(1, 'Sprint name is required.'),
  goal: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
