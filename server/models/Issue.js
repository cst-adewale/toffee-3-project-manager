import mongoose from 'mongoose';
import { ISSUE_PRIORITIES, ISSUE_TYPES } from '../domain/workflows/defaultWorkflow.js';

const issueSchema = new mongoose.Schema({
  issueKey: {
    type: String, // e.g., 'ENG-12'
    required: true,
    unique: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ISSUE_TYPES,
    lowercase: true,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    default: 'todo',
  },
  statusId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkflowState',
    required: true,
    index: true,
  },
  priority: {
    type: String,
    enum: ISSUE_PRIORITIES,
    lowercase: true,
    default: 'medium',
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  assigneeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  epicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
    default: null,
  },
  sprintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sprint',
    default: null,
    index: true,
  },
  estimate: {
    type: Number,
    default: 0,
  },
  storyPoints: {
    type: Number,
    default: 0,
  },
  labels: [{
    type: String,
    trim: true,
  }],
  dueDate: {
    type: Date,
    default: null,
  },
  position: {
    type: Number,
    default: 0,
  },
  parentIssue: {
    // Used if this is a Subtask belonging to a Story, or a Story belonging to an Epic
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
    default: null,
  },
  parentIssueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
    default: null,
  },
}, { timestamps: true });

issueSchema.pre('validate', function syncLegacyFields() {
  if (!this.project && this.projectId) this.project = this.projectId;
  if (!this.reporter && this.reporterId) this.reporter = this.reporterId;
  if (!this.assignee && this.assigneeId) this.assignee = this.assigneeId;
  if (!this.parentIssue && this.parentIssueId) this.parentIssue = this.parentIssueId;
});

export default mongoose.model('Issue', issueSchema);
