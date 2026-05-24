import mongoose from 'mongoose';

const workflowTransitionSchema = new mongoose.Schema({
  fromStateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkflowState',
    required: true,
  },
  toStateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkflowState',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  requiresReview: {
    type: Boolean,
    default: false,
  },
  requiresAssignee: {
    type: Boolean,
    default: false,
  },
  allowedRoles: [{
    type: String,
    trim: true,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

workflowTransitionSchema.index({ fromStateId: 1, toStateId: 1 }, { unique: true });

export default mongoose.model('WorkflowTransition', workflowTransitionSchema);
