import { useState, FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProjects, useTasks } from '@/hooks/useFirestore';
import { Modal } from '@/components/Modal';
import {
  TASK_STATUSES,
  TASK_PRIORITIES,
  type Task,
  type TaskStatus,
  type TaskPriority,
} from '@/types';

export function Tasks() {
  const [searchParams] = useSearchParams();
  const projectFilter = searchParams.get('project') ?? undefined;
  const { projects } = useProjects();
  const { tasks, loading, addTask, updateTask, deleteTask } = useTasks(projectFilter);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [projectId, setProjectId] = useState(projectFilter ?? '');
  const [dueDate, setDueDate] = useState('');

  const openCreate = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setStatus('todo');
    setPriority('medium');
    setProjectId(projectFilter ?? projects[0]?.id ?? '');
    setDueDate('');
    setModalOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
    setPriority(task.priority);
    setProjectId(task.projectId);
    setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '');
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const data = {
      title,
      description,
      status,
      priority,
      projectId,
      dueDate: dueDate ? new Date(dueDate).getTime() : null,
    };

    if (editingTask) {
      await updateTask(editingTask.id, data);
    } else {
      await addTask(data);
    }
    setModalOpen(false);
  };

  const getProjectName = (id: string) => projects.find((p) => p.id === id)?.name ?? 'Sem projeto';
  const getPriorityColor = (p: TaskPriority) => TASK_PRIORITIES.find((tp) => tp.value === p)?.color ?? '#94a3b8';

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
          <h1 className="page-title">Tarefas</h1>
          <p className="page-subtitle">
            {projectFilter ? getProjectName(projectFilter) : 'Todas as tarefas'}
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>
          + Nova
        </button>
      </div>

      <div className="kanban">
        {TASK_STATUSES.map(({ value, label }) => {
          const columnTasks = tasks.filter((t) => t.status === value);
          return (
            <div key={value} className="kanban-column">
              <div className="kanban-column-header">
                <span>{label}</span>
                <span className="kanban-count">{columnTasks.length}</span>
              </div>
              {columnTasks.map((task) => (
                <div key={task.id} className="task-card" onClick={() => openEdit(task)}>
                  <div className="task-card-title">{task.title}</div>
                  <div className="task-card-meta">
                    <span
                      className="badge"
                      style={{ background: getPriorityColor(task.priority) + '33', color: getPriorityColor(task.priority) }}
                    >
                      {TASK_PRIORITIES.find((p) => p.value === task.priority)?.label}
                    </span>
                    {task.projectId && (
                      <span className="tag">{getProjectName(task.projectId)}</span>
                    )}
                    {task.dueDate && (
                      <span className="tag">
                        📅 {new Date(task.dueDate).toLocaleDateString('pt-PT')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTask ? 'Editar tarefa' : 'Nova tarefa'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="task-title">Título</label>
            <input id="task-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="task-desc">Descrição</label>
            <textarea id="task-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="task-project">Projeto</label>
            <select id="task-project" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="">Sem projeto</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="task-status">Estado</label>
            <select id="task-status" value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
              {TASK_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="task-priority">Prioridade</label>
            <select id="task-priority" value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
              {TASK_PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="task-due">Data limite</label>
            <input id="task-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div className="form-actions">
            {editingTask && (
              <button
                type="button"
                className="btn btn-danger btn-sm"
                style={{ marginRight: 'auto' }}
                onClick={() => {
                  if (confirm('Apagar esta tarefa?')) {
                    deleteTask(editingTask.id);
                    setModalOpen(false);
                  }
                }}
              >
                Apagar
              </button>
            )}
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editingTask ? 'Guardar' : 'Criar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
