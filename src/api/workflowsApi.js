import { apiRequest } from './client';

export function listWorkflowStates(token) {
  return apiRequest('/workflows/states', token);
}

export function listWorkflowTransitions(token) {
  return apiRequest('/workflows/transitions', token);
}
