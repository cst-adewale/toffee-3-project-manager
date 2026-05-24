import { useMemo, useState } from 'react';
import { createSprintSchema } from '../../schemas/sprintSchemas';

function formatRange(sprint) {
  const start = sprint.startDate ? new Date(sprint.startDate).toLocaleDateString() : 'No start';
  const end = sprint.endDate ? new Date(sprint.endDate).toLocaleDateString() : 'No end';
  return `${start} - ${end}`;
}

function SprintPlanner({
  projectId,
  sprints,
  issues,
  selectedSprintId,
  onSelectSprint,
  onCreateSprint,
  onAssignIssueSprint,
  onStartSprint,
  onCompleteSprint,
  onError,
}) {
  const [form, setForm] = useState({
    name: '',
    goal: '',
    startDate: '',
    endDate: '',
  });

  const backlogIssues = useMemo(() => issues.filter((issue) => !issue.sprintId), [issues]);
  const plannedSprints = sprints.filter((sprint) => sprint.status !== 'completed');

  const submitSprint = (event) => {
    event.preventDefault();
    const parsed = createSprintSchema.safeParse({ ...form, projectId });

    if (!parsed.success) {
      onError(parsed.error.issues[0]?.message || 'Invalid sprint.');
      return;
    }

    onCreateSprint(parsed.data);
    setForm({ name: '', goal: '', startDate: '', endDate: '' });
  };

  return (
    <section className="sprint-planner">
      <div className="planner-header">
        <div>
          <p className="eyebrow">Planning</p>
          <h3>Backlog & Sprints</h3>
        </div>
        <select value={selectedSprintId} onChange={(event) => onSelectSprint(event.target.value)}>
          <option value="all">All issues</option>
          <option value="backlog">Backlog</option>
          {sprints.map((sprint) => (
            <option key={sprint._id} value={sprint._id}>
              {sprint.name} ({sprint.status})
            </option>
          ))}
        </select>
      </div>

      <form className="sprint-form" onSubmit={submitSprint}>
        <input
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          placeholder="Sprint name"
          disabled={!projectId}
          required
        />
        <input
          value={form.goal}
          onChange={(event) => setForm({ ...form, goal: event.target.value })}
          placeholder="Sprint goal"
          disabled={!projectId}
        />
        <input
          type="date"
          value={form.startDate}
          onChange={(event) => setForm({ ...form, startDate: event.target.value })}
          disabled={!projectId}
        />
        <input
          type="date"
          value={form.endDate}
          onChange={(event) => setForm({ ...form, endDate: event.target.value })}
          disabled={!projectId}
        />
        <button type="submit" disabled={!projectId}>Create Sprint</button>
      </form>

      <div className="planner-lanes">
        <div className="planning-lane">
          <div className="planning-lane-header">
            <strong>Backlog</strong>
            <span>{backlogIssues.length}</span>
          </div>
          <div className="planning-items">
            {backlogIssues.map((issue) => (
              <article className="planning-item" key={issue._id}>
                <span>{issue.issueKey}</span>
                <strong>{issue.title}</strong>
                <select
                  value=""
                  onChange={(event) => onAssignIssueSprint(issue._id, event.target.value || null)}
                >
                  <option value="">Move to sprint</option>
                  {plannedSprints.map((sprint) => (
                    <option key={sprint._id} value={sprint._id}>{sprint.name}</option>
                  ))}
                </select>
              </article>
            ))}
          </div>
        </div>

        <div className="planning-lane sprint-list">
          <div className="planning-lane-header">
            <strong>Sprints</strong>
            <span>{sprints.length}</span>
          </div>
          <div className="planning-items">
            {sprints.map((sprint) => {
              const sprintIssues = issues.filter((issue) => {
                const sprintId = issue.sprintId?._id || issue.sprintId;
                return sprintId === sprint._id;
              });
              const points = sprintIssues.reduce((sum, issue) => sum + (issue.storyPoints || 0), 0);

              return (
                <article className="sprint-item" key={sprint._id}>
                  <div>
                    <strong>{sprint.name}</strong>
                    <p>{sprint.goal || formatRange(sprint)}</p>
                  </div>
                  <div className="sprint-stats">
                    <span>{sprint.status}</span>
                    <span>{sprintIssues.length} issues</span>
                    <span>{points} pts</span>
                  </div>
                  <div className="sprint-actions">
                    {sprint.status === 'planned' && (
                      <button type="button" onClick={() => onStartSprint(sprint._id)}>Start</button>
                    )}
                    {sprint.status === 'active' && (
                      <button type="button" onClick={() => onCompleteSprint(sprint._id)}>Complete</button>
                    )}
                    <button type="button" onClick={() => onSelectSprint(sprint._id)}>View</button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default SprintPlanner;
