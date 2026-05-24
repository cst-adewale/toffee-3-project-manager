import mongoose from 'mongoose';

const workflowStateSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ['backlog', 'todo', 'in_progress', 'done', 'blocked'],
    required: true,
  },
  order: {
    type: Number,
    required: true,
  },
  color: {
    type: String,
    default: '#64748b',
  },
}, { timestamps: true });

export default mongoose.model('WorkflowState', workflowStateSchema);
