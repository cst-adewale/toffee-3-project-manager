import { useState } from 'react';
import { createProjectSchema } from '../../schemas/projectSchemas';

function ProjectSidebar({
  user,
  projects,
  selectedProjectId,
  onSelectProject,
  onCreateProject,
  onLogout,
}) {
  const [projectForm, setProjectForm] = useState({ name: '', key: '' });

  const submitProject = (event) => {
    event.preventDefault();
    const parsed = createProjectSchema.safeParse(projectForm);
    if (!parsed.success) {
      onCreateProject(null, parsed.error.issues[0]?.message || 'Invalid project.');
      return;
    }

    onCreateProject(parsed.data);
    setProjectForm({ name: '', key: '' });
  };

  return (
    <aside className="sidebar">
      <div>
        <p className="eyebrow">Toffee</p>
        <h1>Workspace</h1>
        <p className="muted">Signed in as {user.name}</p>
      </div>

      <form className="panel-form" onSubmit={submitProject}>
        <label>
          Project name
          <input
            value={projectForm.name}
            onChange={(event) => setProjectForm({ ...projectForm, name: event.target.value })}
            placeholder="Mobile App"
            required
          />
        </label>
        <label>
          Key
          <input
            value={projectForm.key}
            onChange={(event) => setProjectForm({ ...projectForm, key: event.target.value.toUpperCase() })}
            placeholder="MOB"
            maxLength="8"
            required
          />
        </label>
        <button type="submit">Create Project</button>
      </form>

      <div className="project-list">
        {projects.map((project) => (
          <button
            key={project._id}
            className={project._id === selectedProjectId ? 'active' : ''}
            onClick={() => onSelectProject(project._id)}
            type="button"
          >
            <span>{project.key}</span>
            {project.name}
          </button>
        ))}
      </div>

      <button className="sign-out" onClick={onLogout} type="button">Sign Out</button>
    </aside>
  );
}

export default ProjectSidebar;
