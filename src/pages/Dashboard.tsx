import { Link } from 'react-router-dom';
import { useProjects, useTasks, useNotes } from '@/hooks/useFirestore';
import { useAuth } from '@/context/AuthContext';

export function Dashboard() {
  const { user, logout } = useAuth();
  const { projects, loading: projectsLoading } = useProjects();
  const { tasks, loading: tasksLoading } = useTasks();
  const { notes, loading: notesLoading } = useNotes();

  const loading = projectsLoading || tasksLoading || notesLoading;
  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const doneTasks = tasks.filter((t) => t.status === 'done');
  const pinnedNotes = notes.filter((n) => n.pinned).slice(0, 3);

  if (loading) {
    return (
      <div className="page loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Olá 👋</h1>
          <p className="page-subtitle">{user?.email}</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={logout}>
          Sair
        </button>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{projects.length}</div>
          <div className="stat-label">Projetos</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{todoTasks.length + inProgressTasks.length}</div>
          <div className="stat-label">Tarefas ativas</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{doneTasks.length}</div>
          <div className="stat-label">Concluídas</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{notes.length}</div>
          <div className="stat-label">Notas</div>
        </div>
      </div>

      {inProgressTasks.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>
            Em progresso
          </h2>
          <div className="card-grid">
            {inProgressTasks.slice(0, 3).map((task) => (
              <Link key={task.id} to="/tasks" className="task-card">
                <div className="task-card-title">{task.title}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {pinnedNotes.length > 0 && (
        <section>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>
            Notas fixadas
          </h2>
          <div className="card-grid">
            {pinnedNotes.map((note) => (
              <Link key={note.id} to="/notes" className="note-card pinned">
                <div className="note-title">📌 {note.title}</div>
                <div className="note-preview">{note.content}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {projects.length === 0 && tasks.length === 0 && notes.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🚀</div>
          <p>Começa por criar um projeto ou uma nota!</p>
        </div>
      )}
    </div>
  );
}
