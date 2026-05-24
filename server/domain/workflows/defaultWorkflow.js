export const WORKFLOW_STATE_KEYS = {
  BACKLOG: 'backlog',
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  TESTING: 'testing',
  DONE: 'done',
  BLOCKED: 'blocked',
};

export const ISSUE_TYPES = ['epic', 'story', 'task', 'bug', 'subtask'];
export const ISSUE_PRIORITIES = ['low', 'medium', 'high', 'critical'];

export const ISSUE_EVENT_TYPES = {
  ISSUE_CREATED: 'issue_created',
  STATUS_CHANGED: 'status_changed',
  ASSIGNED: 'assigned',
  COMMENT_ADDED: 'comment_added',
  ESTIMATE_CHANGED: 'estimate_changed',
};

export const DEFAULT_WORKFLOW_STATES = [
  { key: WORKFLOW_STATE_KEYS.BACKLOG, name: 'Backlog', category: 'backlog', order: 0, color: '#64748b' },
  { key: WORKFLOW_STATE_KEYS.TODO, name: 'To Do', category: 'todo', order: 1, color: '#2563eb' },
  { key: WORKFLOW_STATE_KEYS.IN_PROGRESS, name: 'In Progress', category: 'in_progress', order: 2, color: '#d97706' },
  { key: WORKFLOW_STATE_KEYS.REVIEW, name: 'Review', category: 'in_progress', order: 3, color: '#7c3aed' },
  { key: WORKFLOW_STATE_KEYS.TESTING, name: 'Testing', category: 'in_progress', order: 4, color: '#0891b2' },
  { key: WORKFLOW_STATE_KEYS.DONE, name: 'Done', category: 'done', order: 5, color: '#16a34a' },
  { key: WORKFLOW_STATE_KEYS.BLOCKED, name: 'Blocked', category: 'blocked', order: 6, color: '#dc2626' },
];

export const DEFAULT_WORKFLOW_TRANSITIONS = [
  ['backlog', 'todo', 'Move to To Do'],
  ['todo', 'in_progress', 'Start Work'],
  ['in_progress', 'review', 'Send to Review'],
  ['review', 'testing', 'Send to Testing'],
  ['testing', 'done', 'Mark Done'],
  ['review', 'in_progress', 'Request Changes'],
  ['testing', 'in_progress', 'Return to Development'],
  ['todo', 'blocked', 'Block'],
  ['in_progress', 'blocked', 'Block'],
  ['review', 'blocked', 'Block'],
  ['testing', 'blocked', 'Block'],
  ['blocked', 'todo', 'Unblock to To Do'],
  ['blocked', 'in_progress', 'Unblock to Progress'],
];
