import Issue from '../models/Issue.js';

export const issueRepository = {
  create(data) {
    return Issue.create(data);
  },

  findById(issueId) {
    return Issue.findById(issueId);
  },

  findByProject(projectId) {
    return Issue.find({ projectId }).sort({ position: 1, createdAt: 1 });
  },

  updateById(issueId, update, options = { new: true }) {
    return Issue.findByIdAndUpdate(issueId, update, options);
  },
};
