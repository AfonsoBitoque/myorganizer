import { useCallback, useEffect, useRef, useState, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RichTextEditor } from '@/components/RichTextEditor';
import { DrawingToolbar } from '@/components/DrawingCanvas';
import { HtmlAnnotator } from '@/components/HtmlAnnotator';
import { Modal } from '@/components/Modal';
import { useCadeiras, useAulas } from '@/hooks/useApontamentos';
import { PROJECT_COLORS } from '@/types';
import type { DrawStroke } from '@/types/drawing';
import { PEN_COLORS, PEN_WIDTHS } from '@/types/drawing';

function useDebouncedSave<T>(fn: (value: T) => void, delay: number) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  return useCallback(
    (value: T) => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => fnRef.current(value), delay);
    },
    [delay],
  );
}

export function Apontamentos() {
  const navigate = useNavigate();
  const { cadeiraId, aulaId } = useParams();
  const { cadeiras, loading: cadeirasLoading, addCadeira, deleteCadeira } = useCadeiras();
  const { aulas, loading: aulasLoading, addAula, updateAula, deleteAula } = useAulas(cadeiraId);

  const [cadeiraModal, setCadeiraModal] = useState(false);
  const [aulaModal, setAulaModal] = useState(false);
  const [cadeiraName, setCadeiraName] = useState('');
  const [cadeiraDesc, setCadeiraDesc] = useState('');
  const [cadeiraColor, setCadeiraColor] = useState(PROJECT_COLORS[0]);
  const [aulaTitle, setAulaTitle] = useState('');
  const [aulaDate, setAulaDate] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [editorTab, setEditorTab] = useState<'texto' | 'caneta'>('texto');
  const [penColor, setPenColor] = useState(PEN_COLORS[1]);
  const [penWidth, setPenWidth] = useState(PEN_WIDTHS[1]);
  const [isEraser, setIsEraser] = useState(false);
  const [localDrawing, setLocalDrawing] = useState<DrawStroke[]>([]);

  const cadeira = cadeiras.find((c) => c.id === cadeiraId);
  const aula = aulas.find((a) => a.id === aulaId);

  const debouncedSaveContent = useDebouncedSave((content: string) => {
    if (!aulaId) return;
    updateAula(aulaId, { content }).then(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    });
  }, 1200);

  const debouncedSaveDrawing = useDebouncedSave((drawing: DrawStroke[]) => {
    if (!aulaId) return;
    updateAula(aulaId, { drawing }).then(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    });
  }, 1200);

  useEffect(() => {
    setSaveStatus('idle');
    setEditorTab('texto');
  }, [aulaId]);

  useEffect(() => {
    setLocalDrawing(aula?.drawing ?? []);
  }, [aula?.id, aula?.drawing]);

  const handleCreateCadeira = async (e: FormEvent) => {
    e.preventDefault();
    await addCadeira({ name: cadeiraName, description: cadeiraDesc, color: cadeiraColor });
    setCadeiraName('');
    setCadeiraDesc('');
    setCadeiraColor(PROJECT_COLORS[0]);
    setCadeiraModal(false);
  };

  const handleCreateAula = async (e: FormEvent) => {
    e.preventDefault();
    if (!cadeiraId) return;
    const nextNumber = aulas.length > 0 ? Math.max(...aulas.map((a) => a.number)) + 1 : 1;
    const newId = await addAula({
      cadeiraId,
      title: aulaTitle || `Aula ${nextNumber}`,
      number: nextNumber,
      date: aulaDate ? new Date(aulaDate).getTime() : null,
      content: '<p></p>',
      drawing: [],
    });
    setAulaTitle('');
    setAulaDate('');
    setAulaModal(false);
    if (newId) navigate(`/apontamentos/${cadeiraId}/${newId}`);
  };

  if (aulaId && cadeiraId) {
    if (aulasLoading) {
      return (
        <div className="page loading">
          <div className="spinner" />
        </div>
      );
    }

    if (!aula) {
      return (
        <div className="page">
          <p>Aula não encontrada.</p>
          <button className="btn btn-ghost" onClick={() => navigate(`/apontamentos/${cadeiraId}`)}>
            Voltar
          </button>
        </div>
      );
    }

    return (
      <div className="page apontamentos-editor-page">
        <div className="apontamentos-editor-header">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate(`/apontamentos/${cadeiraId}`)}
          >
            ← {cadeira?.name ?? 'Cadeira'}
          </button>
          <div className="apontamentos-editor-title-wrap">
            <input
              className="apontamentos-title-input"
              value={aula.title}
              onChange={(e) => updateAula(aula.id, { title: e.target.value })}
              placeholder="Título da aula"
            />
            <span className="apontamentos-save-status">
              {saveStatus === 'saving' && 'A guardar...'}
              {saveStatus === 'saved' && '✓ Guardado'}
            </span>
          </div>
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => {
              if (confirm('Apagar esta aula e todos os apontamentos?')) {
                deleteAula(aula.id);
                navigate(`/apontamentos/${cadeiraId}`);
              }
            }}
          >
            🗑️
          </button>
        </div>

        <div className="apontamentos-tabs">
          <button
            type="button"
            className={`apontamentos-tab${editorTab === 'texto' ? ' active' : ''}`}
            onClick={() => setEditorTab('texto')}
          >
            Texto
          </button>
          <button
            type="button"
            className={`apontamentos-tab${editorTab === 'caneta' ? ' active' : ''}`}
            onClick={() => setEditorTab('caneta')}
          >
            ✏️ Caneta
          </button>
        </div>

        {editorTab === 'caneta' && (
          <DrawingToolbar
            color={penColor}
            width={penWidth}
            isEraser={isEraser}
            onColorChange={setPenColor}
            onWidthChange={setPenWidth}
            onEraserChange={setIsEraser}
            onUndo={() => {
              const next = localDrawing.slice(0, -1);
              setLocalDrawing(next);
              setSaveStatus('saving');
              debouncedSaveDrawing(next);
            }}
            onClear={() => {
              if (localDrawing.length === 0 || !confirm('Apagar todo o desenho?')) return;
              setLocalDrawing([]);
              setSaveStatus('saving');
              debouncedSaveDrawing([]);
            }}
          />
        )}

        {editorTab === 'texto' ? (
          <RichTextEditor
            key={aula.id}
            content={aula.content || '<p></p>'}
            onChange={(html) => {
              setSaveStatus('saving');
              debouncedSaveContent(html);
            }}
          />
        ) : (
          <HtmlAnnotator
            html={aula.content || '<p></p>'}
            strokes={localDrawing}
            onStrokesChange={(strokes) => {
              setLocalDrawing(strokes);
              setSaveStatus('saving');
              debouncedSaveDrawing(strokes);
            }}
            penColor={penColor}
            penWidth={penWidth}
            isEraser={isEraser}
          />
        )}
      </div>
    );
  }

  if (cadeiraId) {
    if (cadeirasLoading || aulasLoading) {
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
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/apontamentos')}>
              ← Cadeiras
            </button>
            <h1 className="page-title" style={{ marginTop: 8 }}>
              {cadeira?.name ?? 'Cadeira'}
            </h1>
            {cadeira?.description && (
              <p className="page-subtitle">{cadeira.description}</p>
            )}
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setAulaModal(true)}>
            + Aula
          </button>
        </div>

        {aulas.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✏️</div>
            <p>Cria a primeira aula desta cadeira</p>
          </div>
        ) : (
          <ul className="study-file-list">
            {aulas.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  className="study-file-item"
                  onClick={() => navigate(`/apontamentos/${cadeiraId}/${a.id}`)}
                >
                  <span className="study-file-icon">✏️</span>
                  <span className="study-file-name">
                    {a.number}. {a.title}
                  </span>
                  <span className="study-file-meta">
                    {a.date
                      ? new Date(a.date).toLocaleDateString('pt-PT')
                      : new Date(a.updatedAt).toLocaleDateString('pt-PT')}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <Modal open={aulaModal} onClose={() => setAulaModal(false)} title="Nova aula">
          <form onSubmit={handleCreateAula}>
            <div className="form-group">
              <label htmlFor="aula-title">Título</label>
              <input
                id="aula-title"
                value={aulaTitle}
                onChange={(e) => setAulaTitle(e.target.value)}
                placeholder={`Aula ${aulas.length + 1}`}
              />
            </div>
            <div className="form-group">
              <label htmlFor="aula-date">Data (opcional)</label>
              <input
                id="aula-date"
                type="date"
                value={aulaDate}
                onChange={(e) => setAulaDate(e.target.value)}
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setAulaModal(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Criar e abrir
              </button>
            </div>
          </form>
        </Modal>
      </div>
    );
  }

  if (cadeirasLoading) {
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
          <h1 className="page-title">Apontamentos</h1>
          <p className="page-subtitle">Por cadeira e por aula</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setCadeiraModal(true)}>
          + Cadeira
        </button>
      </div>

      {cadeiras.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📖</div>
          <p>Adiciona a tua primeira cadeira</p>
        </div>
      ) : (
        <div className="card-grid">
          {cadeiras.map((c) => (
            <div
              key={c.id}
              className="project-card"
              onClick={() => navigate(`/apontamentos/${c.id}`)}
            >
              <div className="project-dot" style={{ background: c.color }} />
              <div className="project-info" style={{ flex: 1 }}>
                <h3>{c.name}</h3>
                {c.description && <p>{c.description}</p>}
              </div>
              <button
                className="btn btn-ghost btn-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Apagar esta cadeira? (as aulas mantêm-se no Firebase)')) {
                    deleteCadeira(c.id);
                  }
                }}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={cadeiraModal} onClose={() => setCadeiraModal(false)} title="Nova cadeira">
        <form onSubmit={handleCreateCadeira}>
          <div className="form-group">
            <label htmlFor="cad-name">Nome da cadeira</label>
            <input
              id="cad-name"
              value={cadeiraName}
              onChange={(e) => setCadeiraName(e.target.value)}
              required
              placeholder="Ex: Algoritmos, Redes..."
            />
          </div>
          <div className="form-group">
            <label htmlFor="cad-desc">Descrição</label>
            <input
              id="cad-desc"
              value={cadeiraDesc}
              onChange={(e) => setCadeiraDesc(e.target.value)}
              placeholder="Opcional"
            />
          </div>
          <div className="form-group">
            <label>Cor</label>
            <div className="color-picker">
              {PROJECT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`color-option${cadeiraColor === color ? ' selected' : ''}`}
                  style={{ background: color }}
                  onClick={() => setCadeiraColor(color)}
                />
              ))}
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setCadeiraModal(false)}>
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
