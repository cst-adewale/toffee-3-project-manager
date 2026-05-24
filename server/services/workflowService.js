import mongoose from 'mongoose';
import { ISSUE_EVENT_TYPES, WORKFLOW_STATE_KEYS } from '../domain/workflows/defaultWorkflow.js';
import { issueRepository } from '../repositories/issueRepository.js';
import { issueEventRepository } from '../repositories/issueEventRepository.js';
import { workflowRepository } from '../repositories/workflowRepository.js';

class WorkflowError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = 'WorkflowError';
    this.statusCode = statusCode;
  }
}

function serializeValue(value) {
  if (!value) return null;
  if (typeof value === 'object' && value._id) return String(value._id);
  return String(value);
}

export async function validateTransition({ issueId, targetStateId, user }) {
  if (!mongoose.Types.ObjectId.isValid(issueId) || !mongoose.Types.ObjectId.isValid(targetStateId)) {
    throw new WorkflowError('Invalid issue or workflow state id.');
  }

  const issue = await issueRepository.findById(issueId);
  if (!issue) {
    throw new WorkflowError('Issue not found.', 404);
  }

  const targetState = await workflowRepository.findStateById(targetStateId);
  if (!targetState) {
    throw new WorkflowError('Target workflow state not found.', 404);
  }

  const transition = await workflowRepository.findTransition(issue.statusId, targetStateId);
  if (!transition) {
    throw new WorkflowError('This workflow transition is not allowed.');
  }

  if (transition.allowedRoles.length > 0 && !transition.allowedRoles.includes(user.role)) {
    throw new WorkflowError('You do not have permission to perform this transition.', 403);
  }

  if (transition.requiresAssignee && !issue.assigneeId) {
    throw new WorkflowError('This transition requires an assignee.');
  }

  return { issue, targetState, transition };
}

export async function recordEvent({ issueId, userId, type, fromValue = null, toValue = null, metadata = {} }) {
  return issueEventRepository.create({
    issueId,
    userId,
    type,
    fromValue,
    toValue,
    metadata,
  });
}

export async function createIssue(data) {
  const initialState = data.statusId
    ? await workflowRepository.findStateById(data.statusId)
    : await workflowRepository.findStateByKey(WORKFLOW_STATE_KEYS.BACKLOG);

  if (!initialState) {
    throw new WorkflowError('Default workflow has not been initialized.', 500);
  }

  const issue = await issueRepository.create({
    ...data,
    statusId: initialState._id,
    status: initialState.key,
    projectId: data.projectId,
    reporterId: data.reporterId,
  });

  await recordEvent({
    issueId: issue._id,
    userId: data.reporterId,
    type: ISSUE_EVENT_TYPES.ISSUE_CREATED,
    toValue: issue.title,
    metadata: { statusId: initialState._id, status: initialState.key },
  });

  return issue;
}

export async function transitionIssue({ issueId, userId, targetStateId, user = {} }) {
  const { issue, targetState, transition } = await validateTransition({
    issueId,
    targetStateId,
    user,
  });

  const previousStateId = issue.statusId;
  const previousStatus = issue.status;

  const updatedIssue = await issueRepository.updateById(issueId, {
    statusId: targetState._id,
    status: targetState.key,
  });

  await recordEvent({
    issueId,
    userId,
    type: ISSUE_EVENT_TYPES.STATUS_CHANGED,
    fromValue: serializeValue(previousStateId),
    toValue: serializeValue(targetState._id),
    metadata: {
      fromStatus: previousStatus,
      toStatus: targetState.key,
      transitionId: transition._id,
      transitionName: transition.name,
    },
  });

  return updatedIssue;
}

export async function assignIssue({ issueId, userId, assigneeId }) {
  const issue = await issueRepository.findById(issueId);
  if (!issue) throw new WorkflowError('Issue not found.', 404);

  const updatedIssue = await issueRepository.updateById(issueId, {
    assigneeId,
    assignee: assigneeId,
  });

  await recordEvent({
    issueId,
    userId,
    type: ISSUE_EVENT_TYPES.ASSIGNED,
    fromValue: serializeValue(issue.assigneeId),
    toValue: serializeValue(assigneeId),
  });

  return updatedIssue;
}

export async function updateEstimate({ issueId, userId, estimate, storyPoints }) {
  const issue = await issueRepository.findById(issueId);
  if (!issue) throw new WorkflowError('Issue not found.', 404);

  const update = {};
  const metadata = {};

  if (estimate !== undefined) {
    update.estimate = estimate;
    metadata.fromEstimate = issue.estimate;
    metadata.toEstimate = estimate;
  }

  if (storyPoints !== undefined) {
    update.storyPoints = storyPoints;
    metadata.fromStoryPoints = issue.storyPoints;
    metadata.toStoryPoints = storyPoints;
  }

  const updatedIssue = await issueRepository.updateById(issueId, update);

  await recordEvent({
    issueId,
    userId,
    type: ISSUE_EVENT_TYPES.ESTIMATE_CHANGED,
    fromValue: metadata.fromStoryPoints ?? metadata.fromEstimate,
    toValue: metadata.toStoryPoints ?? metadata.toEstimate,
    metadata,
  });

  return updatedIssue;
}

export { WorkflowError };
