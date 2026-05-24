import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assignIssueSprint, createIssue, listIssues, transitionIssue } from '../../api/issuesApi';
import { createProject, listProjects } from '../../api/projectsApi';
import { completeSprint, createSprint, listSprints, startSprint } from '../../api/sprintsApi';
import { listWorkflowStates, listWorkflowTransitions } from '../../api/workflowsApi';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import IssueBoard from './IssueBoard';
import IssueComposer from './IssueComposer';
import IssueDetailPanel from './IssueDetailPanel';
import ProjectSidebar from './ProjectSidebar';
import SprintPlanner from './SprintPlanner';

function Workspace({ user, token, onLogout }) {
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const {
    selectedProjectId,
    draggedIssueId,
    selectedIssueId,
    selectedSprintId,
    setSelectedProjectId,
    setDraggedIssueId,
    setSelectedIssueId,
    setSelectedSprintId,
  } = useWorkspaceStore();

  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: () => listProjects(token),
    enabled: Boolean(token),
  });

  const statesQuery = useQuery({
    queryKey: ['workflowStates'],
    queryFn: () => listWorkflowStates(token),
    enabled: Boolean(token),
  });

  const transitionsQuery = useQuery({
    queryKey: ['workflowTransitions'],
    queryFn: () => listWorkflowTransitions(token),
    enabled: Boolean(token),
  });

  const issuesQuery = useQuery({
    queryKey: ['issues', selectedProjectId],
    queryFn: () => listIssues(token, selectedProjectId),
    enabled: Boolean(token && selectedProjectId),
  });

  const sprintsQuery = useQuery({
    queryKey: ['sprints', selectedProjectId],
    queryFn: () => listSprints(token, selectedProjectId),
    enabled: Boolean(token && selectedProjectId),
  });

  const projects = useMemo(() => projectsQuery.data || [], [projectsQuery.data]);
  const states = useMemo(() => statesQuery.data || [], [statesQuery.data]);
  const transitions = useMemo(() => transitionsQuery.data || [], [transitionsQuery.data]);
  const issues = useMemo(() => issuesQuery.data || [], [issuesQuery.data]);
  const sprints = useMemo(() => sprintsQuery.data || [], [sprintsQuery.data]);
  const selectedProject = projects.find((project) => project._id === selectedProjectId);
  const selectedIssue = issues.find((issue) => issue._id === selectedIssueId);
  const filteredIssues = useMemo(() => {
    if (selectedSprintId === 'backlog') {
      return issues.filter((issue) => !issue.sprintId);
    }

    if (selectedSprintId !== 'all') {
      return issues.filter((issue) => {
        const sprintId = issue.sprintId?._id || issue.sprintId;
        return sprintId === selectedSprintId;
      });
    }

    return issues;
  }, [issues, selectedSprintId]);
  const isLoading = projectsQuery.isLoading || statesQuery.isLoading || transitionsQuery.isLoading || issuesQuery.isFetching || sprintsQuery.isFetching;
  const queryError = projectsQuery.error || statesQuery.error || transitionsQuery.error || issuesQuery.error || sprintsQuery.error;
  const visibleError = error || queryError?.message;

  useEffect(() => {
    if (!selectedProjectId && projects[0]?._id) {
      setSelectedProjectId(projects[0]._id);
    }
  }, [projects, selectedProjectId, setSelectedProjectId]);

  const createProjectMutation = useMutation({
    mutationFn: (payload) => createProject(token, payload),
    onSuccess: (project) => {
      setError('');
      queryClient.setQueryData(['projects'], (current = []) => [...current, project]);
      setSelectedProjectId(project._id);
    },
    onError: (err) => setError(err.message),
  });

  const createIssueMutation = useMutation({
    mutationFn: (payload) => createIssue(token, payload),
    onSuccess: (issue) => {
      setError('');
      queryClient.setQueryData(['issues', selectedProjectId], (current = []) => [...current, issue]);
    },
    onError: (err) => setError(err.message),
  });

  const transitionIssueMutation = useMutation({
    mutationFn: ({ issueId, targetStateId }) => transitionIssue(token, issueId, targetStateId),
    onSuccess: (updatedIssue) => {
      setError('');
      updateIssueCache(updatedIssue);
    },
    onError: (err) => setError(err.message),
  });

  const createSprintMutation = useMutation({
    mutationFn: (payload) => createSprint(token, payload),
    onSuccess: (sprint) => {
      setError('');
      queryClient.setQueryData(['sprints', selectedProjectId], (current = []) => [sprint, ...current]);
      setSelectedSprintId(sprint._id);
    },
    onError: (err) => setError(err.message),
  });

  const assignIssueSprintMutation = useMutation({
    mutationFn: ({ issueId, sprintId }) => assignIssueSprint(token, issueId, sprintId),
    onSuccess: (updatedIssue) => {
      setError('');
      updateIssueCache(updatedIssue);
    },
    onError: (err) => setError(err.message),
  });

  const startSprintMutation = useMutation({
    mutationFn: (sprintId) => startSprint(token, sprintId),
    onSuccess: () => {
      setError('');
      queryClient.invalidateQueries({ queryKey: ['sprints', selectedProjectId] });
    },
    onError: (err) => setError(err.message),
  });

  const completeSprintMutation = useMutation({
    mutationFn: (sprintId) => completeSprint(token, sprintId),
    onSuccess: () => {
      setError('');
      queryClient.invalidateQueries({ queryKey: ['sprints', selectedProjectId] });
    },
    onError: (err) => setError(err.message),
  });

  const handleCreateProject = (payload, validationError) => {
    if (validationError) {
      setError(validationError);
      return;
    }
    createProjectMutation.mutate(payload);
  };

  const handleCreateIssue = (payload, validationError) => {
    if (validationError) {
      setError(validationError);
      return;
    }
    createIssueMutation.mutate(payload);
  };

  const updateIssueCache = (updatedIssue) => {
    queryClient.setQueryData(['issues', selectedProjectId], (current = []) => (
      current.map((issue) => (issue._id === updatedIssue._id ? updatedIssue : issue))
    ));
  };

  return (
    <main className="app-shell">
      <ProjectSidebar
        user={user}
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
        onCreateProject={handleCreateProject}
        onLogout={onLogout}
      />

      <section className="workspace">
        <header className="workspace-header">
          <div>
            <p className="eyebrow">{selectedProject?.key || 'No project'}</p>
            <h2>{selectedProject?.name || 'Create a project to start'}</h2>
          </div>
          <div className="status-pill">{issues.length} issues</div>
        </header>

        {visibleError && <div className="error-banner">{visibleError}</div>}
        {isLoading && <div className="muted">Loading workspace...</div>}

        <IssueComposer
          selectedProjectId={selectedProjectId}
          onCreateIssue={handleCreateIssue}
        />

        <SprintPlanner
          projectId={selectedProjectId}
          sprints={sprints}
          issues={issues}
          selectedSprintId={selectedSprintId}
          onSelectSprint={setSelectedSprintId}
          onCreateSprint={(payload) => createSprintMutation.mutate(payload)}
          onAssignIssueSprint={(issueId, sprintId) => assignIssueSprintMutation.mutate({ issueId, sprintId })}
          onStartSprint={(sprintId) => startSprintMutation.mutate(sprintId)}
          onCompleteSprint={(sprintId) => completeSprintMutation.mutate(sprintId)}
          onError={setError}
        />

        <IssueBoard
          states={states}
          transitions={transitions}
          issues={filteredIssues}
          draggedIssueId={draggedIssueId}
          onDragStart={setDraggedIssueId}
          onDragEnd={() => setDraggedIssueId(null)}
          onInvalidTransition={setError}
          onSelectIssue={setSelectedIssueId}
          onTransitionIssue={(issueId, targetStateId) => {
            transitionIssueMutation.mutate({ issueId, targetStateId });
          }}
        />
      </section>

      <IssueDetailPanel
        token={token}
        issue={selectedIssue}
        states={states}
        onClose={() => setSelectedIssueId(null)}
        onIssueUpdated={updateIssueCache}
        onError={setError}
      />
    </main>
  );
}

export default Workspace;
