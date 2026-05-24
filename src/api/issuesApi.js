import { apiRequest } from './client';

export function listIssues(token, projectId) {
  return apiRequest(`/issues?projectId=${projectId}`, token);
}

export function createIssue(token, payload) {
  return apiRequest('/issues', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function transitionIssue(token, issueId, targetStateId) {
  return apiRequest(`/issues/${issueId}/transitions`, token, {
    method: 'POST',
    body: JSON.stringify({ targetStateId }),
  });
}

export function listIssueEvents(token, issueId) {
  return apiRequest(`/issues/${issueId}/events`, token);
}

export function listIssueComments(token, issueId) {
  return apiRequest(`/issues/${issueId}/comments`, token);
}

export function addIssueComment(token, issueId, body) {
  return apiRequest(`/issues/${issueId}/comments`, token, {
    method: 'POST',
    body: JSON.stringify({ body }),
  });
}

export function updateIssueEstimate(token, issueId, payload) {
  return apiRequest(`/issues/${issueId}/estimate`, token, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function assignIssueSprint(token, issueId, sprintId) {
  return apiRequest(`/issues/${issueId}/sprint`, token, {
    method: 'PATCH',
    body: JSON.stringify({ sprintId }),
  });
}

export function updateIssueDates(token, issueId, payload) {
  return apiRequest(`/issues/${issueId}/dates`, token, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function uploadIssueAttachment(token, issueId, file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`http://localhost:5000/api/issues/${issueId}/attachments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message || 'Upload failed.');
  }

  return data;
}
