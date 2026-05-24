import mongoose from 'mongoose';

const boardColumnSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  workflowStateIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkflowState',
  }],
}, { _id: false });

const boardSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  columns: [boardColumnSchema],
}, { timestamps: true });

export default mongoose.model('Board', boardSchema);
