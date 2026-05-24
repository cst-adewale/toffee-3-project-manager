import mongoose from 'mongoose';
import { ISSUE_EVENT_TYPES } from '../domain/workflows/defaultWorkflow.js';

const issueEventSchema = new mongoose.Schema({
  issueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: Object.values(ISSUE_EVENT_TYPES),
    required: true,
    index: true,
  },
  fromValue: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  toValue: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, { timestamps: { createdAt: true, updatedAt: false } });

export default mongoose.model('IssueEvent', issueEventSchema);
