import IssueEvent from '../models/IssueEvent.js';

export const issueEventRepository = {
  create(data) {
    return IssueEvent.create(data);
  },

  findByIssue(issueId) {
    return IssueEvent.find({ issueId }).sort({ createdAt: 1 });
  },
};
