import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addIssueComment,
  listIssueComments,
  listIssueEvents,
  updateIssueDates,
  updateIssueEstimate,
} from '../../api/issuesApi';
import { addCommentSchema, updateEstimateSchema, updateIssueDatesSchema } from '../../schemas/issueSchemas';

function formatDate(value) {
  if (!value) return 'No date';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function describeEvent(event) {
  if (event.type === 'status_changed') {
    return `Moved from ${event.metadata?.fromStatus || 'unknown'} to ${event.metadata?.toStatus || 'unknown'}`;
  }

  if (event.type === 'issue_created') return 'Issue created';
  if (event.type === 'comment_added') return 'Comment added';
  if (event.type === 'estimate_changed') return 'Estimate changed';
  if (event.type === 'assigned') return 'Assignee changed';
  return event.type.replaceAll('_', ' ');
}

function IssueDetailPanel({ token, issue, states, onClose, onIssueUpdated, onError }) {
  const queryClient = useQueryClient();
  const [commentBody, setCommentBody] = useState('');
  const [estimateForm, setEstimateForm] = useState({
    storyPoints: issue?.storyPoints || 0,
    estimate: issue?.estimate || 0,
  });
  const [dueDate, setDueDate] = useState(() => issue?.dueDate ? issue.dueDate.slice(0, 10) : '');

  const status = useMemo(() => {
    const statusId = issue?.statusId?._id || issue?.statusId;
    return states.find((state) => state._id === statusId);
  }, [issue, states]);

  const eventsQuery = useQuery({
    queryKey: ['issueEvents', issue?._id],
    queryFn: () => listIssueEvents(token, issue._id),
    enabled: Boolean(token && issue?._id),
  });

  const commentsQuery = useQuery({
    queryKey: ['issueComments', issue?._id],
    queryFn: () => listIssueComments(token, issue._id),
    enabled: Boolean(token && issue?._id),
  });

  const updateEstimateMutation = useMutation({
    mutationFn: (payload) => updateIssueEstimate(token, issue._id, payload),
    onSuccess: (updatedIssue) => {
      onIssueUpdated(updatedIssue);
      queryClient.invalidateQueries({ queryKey: ['issueEvents', issue._id] });
    },
    onError: (err) => onError(err.message),
  });

  const addCommentMutation = useMutation({
    mutationFn: (body) => addIssueComment(token, issue._id, body),
    onSuccess: () => {
      setCommentBody('');
      queryClient.invalidateQueries({ queryKey: ['issueComments', issue._id] });
      queryClient.invalidateQueries({ queryKey: ['issueEvents', issue._id] });
    },
    onError: (err) => onError(err.message),
  });

  const updateDatesMutation = useMutation({
    mutationFn: (payload) => updateIssueDates(token, issue._id, payload),
    onSuccess: (updatedIssue) => {
      onIssueUpdated(updatedIssue);
    },
    onError: (err) => onError(err.message),
  });

  if (!issue) return null;

  const submitEstimate = (event) => {
    event.preventDefault();
    const parsed = updateEstimateSchema.safeParse(estimateForm);
    if (!parsed.success) {
      onError(parsed.error.issues[0]?.message || 'Invalid estimate.');
      return;
    }
    updateEstimateMutation.mutate(parsed.data);
  };

  const submitComment = (event) => {
    event.preventDefault();
    const parsed = addCommentSchema.safeParse({ body: commentBody });
    if (!parsed.success) {
      onError(parsed.error.issues[0]?.message || 'Invalid comment.');
      return;
    }
    addCommentMutation.mutate(parsed.data.body);
  };

  const submitDates = (event) => {
    event.preventDefault();
    const parsed = updateIssueDatesSchema.safeParse({ dueDate: dueDate || null });
    if (!parsed.success) {
      onError(parsed.error.issues[0]?.message || 'Invalid date.');
      return;
    }
    updateDatesMutation.mutate(parsed.data);
  };

  return (
    <aside className="issue-panel" aria-label="Issue details">
      <div className="issue-panel-header">
        <div>
          <p className="eyebrow">{issue.issueKey}</p>
          <h2>{issue.title}</h2>
        </div>
        <button className="icon-button" onClick={onClose} type="button" aria-label="Close issue details">x</button>
      </div>

      <div className="detail-grid">
        <span>Type</span><strong>{issue.type}</strong>
        <span>Status</span><strong>{status?.name || issue.status}</strong>
        <span>Priority</span><strong>{issue.priority}</strong>
        <span>Due</span><strong>{issue.dueDate ? formatDate(issue.dueDate) : 'Unscheduled'}</strong>
      </div>

      <section className="panel-section">
        <h3>Description</h3>
        <p className="description-text">{issue.description || 'No description yet.'}</p>
      </section>

      <form className="panel-section date-form" onSubmit={submitDates}>
        <h3>Schedule</h3>
        <label>
          Due date
          <input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
        </label>
        <button type="submit">Save Date</button>
      </form>

      <form className="panel-section estimate-form" onSubmit={submitEstimate}>
        <h3>Estimate</h3>
        <label>
          Story points
          <input
            type="number"
            min="0"
            value={estimateForm.storyPoints}
            onChange={(event) => setEstimateForm({ ...estimateForm, storyPoints: event.target.value })}
          />
        </label>
        <label>
          Estimate
          <input
            type="number"
            min="0"
            value={estimateForm.estimate}
            onChange={(event) => setEstimateForm({ ...estimateForm, estimate: event.target.value })}
          />
        </label>
        <button type="submit">Save Estimate</button>
      </form>

      <section className="panel-section">
        <h3>Comments</h3>
        <form className="comment-form" onSubmit={submitComment}>
          <textarea
            value={commentBody}
            onChange={(event) => setCommentBody(event.target.value)}
            placeholder="Add a comment"
          />
          <button type="submit">Comment</button>
        </form>
        <div className="comment-list">
          {(commentsQuery.data || []).map((comment) => (
            <article className="comment-item" key={comment._id}>
              <strong>{comment.authorId?.name || 'User'}</strong>
              <p>{comment.body}</p>
              <time>{formatDate(comment.createdAt)}</time>
            </article>
          ))}
        </div>
      </section>

      <section className="panel-section">
        <h3>History</h3>
        <div className="event-list">
          {(eventsQuery.data || []).map((event) => (
            <article className="event-item" key={event._id}>
              <span>{describeEvent(event)}</span>
              <time>{formatDate(event.createdAt)}</time>
            </article>
          ))}
        </div>
      </section>
    </aside>
  );
}

export default IssueDetailPanel;
