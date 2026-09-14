import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '@/hooks/useFirestore';
import { Modal } from '@/components/Modal';
import { PROJECT_COLORS } from '@/types';

export function Projects() {
  const { projects, loading, addProject, deleteProject } = useProjects();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PROJECT_COLORS[0]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await addProject({ name, description, color });
    setName('');
    setDescription('');
    setColor(PROJECT_COLORS[0]);
    setModalOpen(false);
  };

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
          <h1 className="page-title">Projetos</h1>
          <p className="page-subtitle">UCs, trabalhos, investigação...</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>
          + Novo
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📁</div>
          <p>Cria o teu primeiro projeto</p>
        </div>
      ) : (
        <div className="card-grid">
          {projects.map((project) => (
            <div key={project.id} className="project-card" onClick={() => navigate(`/tasks?project=${project.id}`)}>
              <div className="project-dot" style={{ background: project.color }} />
              <div className="project-info" style={{ flex: 1 }}>
                <h3>{project.name}</h3>
                {project.description && <p>{project.description}</p>}
              </div>
              <button
                className="btn btn-ghost btn-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Apagar este projeto?')) deleteProject(project.id);
                }}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Novo projeto">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="proj-name">Nome</label>
            <input
              id="proj-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ex: Dissertação, UC X..."
            />
          </div>
          <div className="form-group">
            <label htmlFor="proj-desc">Descrição</label>
            <input
              id="proj-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Opcional"
            />
          </div>
          <div className="form-group">
            <label>Cor</label>
            <div className="color-picker">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`color-option${color === c ? ' selected' : ''}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Criar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
