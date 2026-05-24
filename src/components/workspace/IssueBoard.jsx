import { useMemo } from 'react';

function IssueBoard({
  states,
  transitions,
  issues,
  draggedIssueId,
  onDragStart,
  onDragEnd,
  onTransitionIssue,
  onInvalidTransition,
  onSelectIssue,
}) {
  const transitionsByRoute = useMemo(() => {
    const routes = new Set();
    transitions.forEach((transition) => {
      const fromId = transition.fromStateId?._id || transition.fromStateId;
      const toId = transition.toStateId?._id || transition.toStateId;
      routes.add(`${fromId}:${toId}`);
    });
    return routes;
  }, [transitions]);

  const issuesByState = useMemo(() => {
    return states.reduce((groups, state) => {
      groups[state._id] = issues.filter((issue) => {
        const statusId = issue.statusId?._id || issue.statusId;
        return statusId === state._id;
      });
      return groups;
    }, {});
  }, [issues, states]);

  const dropIssue = (targetState) => {
    const issue = issues.find((item) => item._id === draggedIssueId);
    const fromStateId = issue?.statusId?._id || issue?.statusId;

    if (!issue || fromStateId === targetState._id) {
      onDragEnd();
      return;
    }

    if (!transitionsByRoute.has(`${fromStateId}:${targetState._id}`)) {
      onInvalidTransition(`That move is not allowed by the workflow: ${issue.issueKey} to ${targetState.name}.`);
      onDragEnd();
      return;
    }

    onTransitionIssue(issue._id, targetState._id);
    onDragEnd();
  };

  return (
    <div className="board" aria-label="Workflow board">
      {states.map((state) => (
        <section
          className="board-column"
          key={state._id}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => dropIssue(state)}
        >
          <div className="column-header">
            <span className="state-dot" style={{ backgroundColor: state.color }} />
            <h3>{state.name}</h3>
            <strong>{issuesByState[state._id]?.length || 0}</strong>
          </div>

          <div className="issue-stack">
            {(issuesByState[state._id] || []).map((issue) => (
              <article
                className="issue-card"
                key={issue._id}
                draggable
                onDragStart={() => onDragStart(issue._id)}
                onDragEnd={onDragEnd}
                onClick={() => onSelectIssue(issue._id)}
              >
                <div className="issue-meta">
                  <span>{issue.issueKey}</span>
                  <span>{issue.type}</span>
                </div>
                <h4>{issue.title}</h4>
                <div className="issue-footer">
                  <span>{issue.priority}</span>
                  <span>{issue.storyPoints || 0} pts</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default IssueBoard;
