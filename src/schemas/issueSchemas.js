import { z } from 'zod';

export const issueTypes = ['epic', 'story', 'task', 'bug', 'subtask'];
export const priorities = ['low', 'medium', 'high', 'critical'];

export const createIssueSchema = z.object({
  projectId: z.string().min(1, 'Select a project before creating an issue.'),
  title: z.string().trim().min(1, 'Issue title is required.'),
  type: z.enum(issueTypes),
  priority: z.enum(priorities),
  storyPoints: z.coerce.number().min(0).default(0),
});

export const transitionIssueSchema = z.object({
  targetStateId: z.string().min(1, 'Target workflow state is required.'),
});

export const updateEstimateSchema = z.object({
  storyPoints: z.coerce.number().min(0, 'Story points cannot be negative.'),
  estimate: z.coerce.number().min(0, 'Estimate cannot be negative.'),
});

export const updateIssueDatesSchema = z.object({
  dueDate: z.string().nullable(),
});

export const addCommentSchema = z.object({
  body: z.string().trim().min(1, 'Comment cannot be empty.'),
});
