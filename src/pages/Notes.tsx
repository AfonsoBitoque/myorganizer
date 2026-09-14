import { useState, FormEvent } from 'react';
import { useNotes } from '@/hooks/useFirestore';
import { Modal } from '@/components/Modal';
import type { Note } from '@/types';

export function Notes() {
  const { notes, loading, addNote, updateNote, deleteNote } = useNotes();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [pinned, setPinned] = useState(false);

  const filtered = notes.filter((n) => {
    const q = search.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.updatedAt - a.updatedAt;
  });

  const openCreate = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setTags('');
    setPinned(false);
    setModalOpen(true);
  };

  const openEdit = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags.join(', '));
    setPinned(note.pinned);
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const tagList = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingNote) {
      await updateNote(editingNote.id, { title, content, tags: tagList, pinned });
    } else {
      await addNote({ title, content, tags: tagList, pinned });
    }
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
          <h1 className="page-title">Notas</h1>
          <p className="page-subtitle">Ideias, apontamentos, referências...</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>
          + Nova
        </button>
      </div>

      <div className="search-bar">
        <input
          type="search"
          placeholder="Pesquisar notas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {sorted.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <p>{search ? 'Nenhuma nota encontrada' : 'Cria a tua primeira nota'}</p>
        </div>
      ) : (
        <div className="card-grid">
          {sorted.map((note) => (
            <div
              key={note.id}
              className={`note-card${note.pinned ? ' pinned' : ''}`}
              onClick={() => openEdit(note)}
            >
              <div className="note-title">
                {note.pinned && '📌 '}{note.title}
              </div>
              <div className="note-preview">{note.content}</div>
              {note.tags.length > 0 && (
                <div className="note-tags">
                  {note.tags.map((tag) => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingNote ? 'Editar nota' : 'Nova nota'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="note-title">Título</label>
            <input id="note-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="note-content">Conteúdo</label>
            <textarea
              id="note-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
            />
          </div>
          <div className="form-group">
            <label htmlFor="note-tags">Tags (separadas por vírgula)</label>
            <input
              id="note-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Ex: dissertação, artigo, UC1"
            />
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
              />
              Fixar no início
            </label>
          </div>
          <div className="form-actions">
            {editingNote && (
              <button
                type="button"
                className="btn btn-danger btn-sm"
                style={{ marginRight: 'auto' }}
                onClick={() => {
                  if (confirm('Apagar esta nota?')) {
                    deleteNote(editingNote.id);
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
              {editingNote ? 'Guardar' : 'Criar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
