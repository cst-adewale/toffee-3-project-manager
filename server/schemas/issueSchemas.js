import { z } from 'zod';
import { ISSUE_PRIORITIES, ISSUE_TYPES } from '../domain/workflows/defaultWorkflow.js';

export const createIssueSchema = z.object({
  issueKey: z.string().trim().optional(),
  projectId: z.string().min(1, 'Project is required.'),
  title: z.string().trim().min(1, 'Issue title is required.'),
  description: z.string().optional(),
  type: z.enum(ISSUE_TYPES),
  priority: z.enum(ISSUE_PRIORITIES).default('medium'),
  assigneeId: z.string().nullable().optional(),
  parentIssueId: z.string().nullable().optional(),
  epicId: z.string().nullable().optional(),
  sprintId: z.string().nullable().optional(),
  estimate: z.coerce.number().min(0).optional(),
  storyPoints: z.coerce.number().min(0).default(0),
  labels: z.array(z.string().trim()).optional(),
  dueDate: z.string().nullable().optional(),
  position: z.coerce.number().optional(),
});

export const transitionIssueSchema = z.object({
  targetStateId: z.string().min(1, 'Target workflow state is required.'),
});

export const assignIssueSchema = z.object({
  assigneeId: z.string().nullable(),
});

export const assignIssueSprintSchema = z.object({
  sprintId: z.string().nullable(),
});

export const updateEstimateSchema = z.object({
  estimate: z.coerce.number().min(0).optional(),
  storyPoints: z.coerce.number().min(0).optional(),
}).refine((data) => data.estimate !== undefined || data.storyPoints !== undefined, {
  message: 'Estimate or story points are required.',
});

export const updateIssueDatesSchema = z.object({
  dueDate: z.string().nullable(),
});

export const addCommentSchema = z.object({
  body: z.string().trim().min(1, 'Comment body is required.'),
});
