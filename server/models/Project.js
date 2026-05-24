import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  key: {
    type: String, // e.g., 'ENG', 'MKT'. Used to generate Issue IDs like ENG-1
    required: true,
    unique: true,
    uppercase: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['Manager', 'Developer', 'Viewer'],
      default: 'Developer'
    }
  }],
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
