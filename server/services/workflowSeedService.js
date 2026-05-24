import {
  DEFAULT_WORKFLOW_STATES,
  DEFAULT_WORKFLOW_TRANSITIONS,
} from '../domain/workflows/defaultWorkflow.js';
import { workflowRepository } from '../repositories/workflowRepository.js';

export async function ensureDefaultWorkflow() {
  const statesByKey = new Map();

  for (const state of DEFAULT_WORKFLOW_STATES) {
    const savedState = await workflowRepository.upsertState({ key: state.key }, state);
    statesByKey.set(savedState.key, savedState);
  }

  for (const [fromKey, toKey, name] of DEFAULT_WORKFLOW_TRANSITIONS) {
    const fromState = statesByKey.get(fromKey);
    const toState = statesByKey.get(toKey);

    await workflowRepository.upsertTransition(
      { fromStateId: fromState._id, toStateId: toState._id },
      { fromStateId: fromState._id, toStateId: toState._id, name },
    );
  }

  return {
    states: Array.from(statesByKey.values()),
    transitions: await workflowRepository.listTransitions(),
  };
}
