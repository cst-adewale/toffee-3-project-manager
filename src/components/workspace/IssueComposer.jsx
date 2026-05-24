import { useState } from 'react';
import { createIssueSchema, issueTypes, priorities } from '../../schemas/issueSchemas';

function IssueComposer({ selectedProjectId, onCreateIssue }) {
  const [issueForm, setIssueForm] = useState({
    title: '',
    type: 'story',
    priority: 'medium',
    storyPoints: 0,
  });

  const submitIssue = (event) => {
    event.preventDefault();
    const parsed = createIssueSchema.safeParse({
      ...issueForm,
      projectId: selectedProjectId,
    });

    if (!parsed.success) {
      onCreateIssue(null, parsed.error.issues[0]?.message || 'Invalid issue.');
      return;
    }

    onCreateIssue(parsed.data);
    setIssueForm({ title: '', type: 'story', priority: 'medium', storyPoints: 0 });
  };

  return (
    <form className="issue-composer" onSubmit={submitIssue}>
      <input
        value={issueForm.title}
        onChange={(event) => setIssueForm({ ...issueForm, title: event.target.value })}
        placeholder="Write a clear issue title"
        required
        disabled={!selectedProjectId}
      />
      <select
        value={issueForm.type}
        onChange={(event) => setIssueForm({ ...issueForm, type: event.target.value })}
        disabled={!selectedProjectId}
      >
        {issueTypes.map((type) => <option key={type} value={type}>{type}</option>)}
      </select>
      <select
        value={issueForm.priority}
        onChange={(event) => setIssueForm({ ...issueForm, priority: event.target.value })}
        disabled={!selectedProjectId}
      >
        {priorities.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
      </select>
      <input
        className="points-input"
        type="number"
        min="0"
        value={issueForm.storyPoints}
        onChange={(event) => setIssueForm({ ...issueForm, storyPoints: event.target.value })}
        disabled={!selectedProjectId}
      />
      <button type="submit" disabled={!selectedProjectId}>Create Issue</button>
    </form>
  );
}

export default IssueComposer;
