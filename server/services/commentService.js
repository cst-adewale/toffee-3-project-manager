import Comment from '../models/Comment.js';
import { ISSUE_EVENT_TYPES } from '../domain/workflows/defaultWorkflow.js';
import { recordEvent } from './workflowService.js';

export async function addComment({ issueId, userId, body }) {
  const comment = await Comment.create({
    issueId,
    authorId: userId,
    body,
  });

  await recordEvent({
    issueId,
    userId,
    type: ISSUE_EVENT_TYPES.COMMENT_ADDED,
    toValue: comment._id,
  });

  return comment;
}
