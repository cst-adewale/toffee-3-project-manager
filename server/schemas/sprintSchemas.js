import { z } from 'zod';

export const createSprintSchema = z.object({
  projectId: z.string().min(1, 'Project is required.'),
  name: z.string().trim().min(1, 'Sprint name is required.'),
  goal: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const assignIssueSprintSchema = z.object({
  sprintId: z.string().nullable(),
});

export const sprintActionSchema = z.object({
  projectId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
