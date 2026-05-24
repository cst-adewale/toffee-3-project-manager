import { apiRequest } from './client';

export function listProjects(token) {
  return apiRequest('/projects', token);
}

export function createProject(token, payload) {
  return apiRequest('/projects', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
