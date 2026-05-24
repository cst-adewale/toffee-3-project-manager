import mongoose from 'mongoose';

const sprintSchema = new mongoose.Schema({
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
  goal: {
    type: String,
    default: '',
  },
  startDate: Date,
  endDate: Date,
  status: {
    type: String,
    enum: ['planned', 'active', 'completed'],
    default: 'planned',
  },
  metrics: {
    committedPoints: { type: Number, default: 0 },
    completedPoints: { type: Number, default: 0 },
    velocity: { type: Number, default: 0 },
  },
}, { timestamps: true });

export default mongoose.model('Sprint', sprintSchema);
