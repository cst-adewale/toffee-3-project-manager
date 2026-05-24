import WorkflowState from '../models/WorkflowState.js';
import WorkflowTransition from '../models/WorkflowTransition.js';

export const workflowRepository = {
  createState(data) {
    return WorkflowState.create(data);
  },

  listStates() {
    return WorkflowState.find().sort({ order: 1 });
  },

  findStateById(stateId) {
    return WorkflowState.findById(stateId);
  },

  findStateByKey(key) {
    return WorkflowState.findOne({ key });
  },

  upsertState(filter, data) {
    return WorkflowState.findOneAndUpdate(filter, data, { upsert: true, new: true, setDefaultsOnInsert: true });
  },

  createTransition(data) {
    return WorkflowTransition.create(data);
  },

  listTransitions() {
    return WorkflowTransition.find({ isActive: true }).populate('fromStateId toStateId');
  },

  findTransition(fromStateId, toStateId) {
    return WorkflowTransition.findOne({ fromStateId, toStateId, isActive: true });
  },

  upsertTransition(filter, data) {
    return WorkflowTransition.findOneAndUpdate(filter, data, { upsert: true, new: true, setDefaultsOnInsert: true });
  },
};
