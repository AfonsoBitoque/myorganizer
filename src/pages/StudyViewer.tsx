import { useCallback, useEffect, useRef, useState } from 'react';
import { DrawingToolbar } from '@/components/DrawingCanvas';
import { SummaryAnnotator } from '@/components/SummaryAnnotator';
import { MarkdownViewer } from '@/components/MarkdownViewer';
import { useStudyDrawing } from '@/hooks/useStudyDrawings';
import type { DrawStroke } from '@/types/drawing';
import { PEN_COLORS, PEN_WIDTHS } from '@/types/drawing';

function useDebouncedSave(fn: (strokes: DrawStroke[]) => void, delay: number) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const fnRef = useRef(fn);
  fnRef.current = fn;
  return useCallback(
    (strokes: DrawStroke[]) => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => fnRef.current(strokes), delay);
    },
    [delay],
  );
}

interface StudyViewerProps {
  path: string;
  content: string;
  branch: string;
  onBack: () => void;
}

export function StudyViewer({ path, content, branch, onBack }: StudyViewerProps) {
  const [drawMode, setDrawMode] = useState(false);
  const [penColor, setPenColor] = useState(PEN_COLORS[1]);
  const [penWidth, setPenWidth] = useState(PEN_WIDTHS[1]);
  const [isEraser, setIsEraser] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const { strokes: remoteStrokes, saveStrokes } = useStudyDrawing(path);
  const [strokes, setStrokes] = useState<DrawStroke[]>([]);

  useEffect(() => {
    setStrokes(remoteStrokes);
  }, [path, remoteStrokes]);

  const debouncedSave = useDebouncedSave((newStrokes) => {
    saveStrokes(newStrokes).then(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    });
  }, 1200);

  const handleStrokesChange = (newStrokes: DrawStroke[]) => {
    setStrokes(newStrokes);
    setSaveStatus('saving');
    debouncedSave(newStrokes);
  };

  const handleUndo = () => {
    if (strokes.length === 0) return;
    handleStrokesChange(strokes.slice(0, -1));
  };

  const handleClear = () => {
    if (strokes.length === 0 || !confirm('Apagar todo o desenho deste resumo?')) return;
    handleStrokesChange([]);
  };

  const fileName = path.split('/').pop() ?? path;

  return (
    <div className="page study-viewer-page">
      <div className="study-toolbar">
        <button type="button" className="btn btn-ghost btn-sm" onClick={onBack}>
          ← Voltar
        </button>
        <span className="study-file-name">{fileName}</span>
        <div className="study-mode-tabs">
          <button
            type="button"
            className={`study-mode-tab${!drawMode ? ' active' : ''}`}
            onClick={() => setDrawMode(false)}
          >
            Ler
          </button>
          <button
            type="button"
            className={`study-mode-tab${drawMode ? ' active' : ''}`}
            onClick={() => setDrawMode(true)}
          >
            ✏️ Caneta
          </button>
        </div>
        {drawMode && (
          <span className="apontamentos-save-status">
            {saveStatus === 'saving' && 'A guardar...'}
            {saveStatus === 'saved' && '✓'}
          </span>
        )}
        <a
          className="btn btn-ghost btn-sm"
          href={`https://github.com/AfonsoBitoque/EstudoMestrado/blob/${branch}/${path}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </div>

      {drawMode && (
        <DrawingToolbar
          color={penColor}
          width={penWidth}
          isEraser={isEraser}
          onColorChange={setPenColor}
          onWidthChange={setPenWidth}
          onEraserChange={setIsEraser}
          onUndo={handleUndo}
          onClear={handleClear}
        />
      )}

      {drawMode ? (
        <SummaryAnnotator
          content={content}
          filePath={path}
          branch={branch}
          strokes={strokes}
          onStrokesChange={handleStrokesChange}
          drawMode
          penColor={penColor}
          penWidth={penWidth}
          isEraser={isEraser}
        />
      ) : (
        <MarkdownViewer content={content} filePath={path} branch={branch} />
      )}
    </div>
  );
}
