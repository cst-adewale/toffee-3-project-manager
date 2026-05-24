import { apiRequest } from './client';

export function listSprints(token, projectId) {
  return apiRequest(`/sprints?projectId=${projectId}`, token);
}

export function createSprint(token, payload) {
  return apiRequest('/sprints', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function startSprint(token, sprintId) {
  return apiRequest(`/sprints/${sprintId}/start`, token, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export function completeSprint(token, sprintId) {
  return apiRequest(`/sprints/${sprintId}/complete`, token, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}
