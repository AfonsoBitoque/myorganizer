import { useCallback, useEffect, useRef, useState } from 'react';
import type { DrawPoint, DrawStroke } from '@/types/drawing';
import { PEN_COLORS, PEN_WIDTHS } from '@/types/drawing';

interface DrawingCanvasProps {
  strokes: DrawStroke[];
  onChange: (strokes: DrawStroke[]) => void;
  height?: number;
  showToolbar?: boolean;
  color?: string;
  width?: number;
  isEraser?: boolean;
  onColorChange?: (c: string) => void;
  onWidthChange?: (w: number) => void;
  onEraserChange?: (e: boolean) => void;
  onUndo?: () => void;
  onClear?: () => void;
}

function drawStroke(ctx: CanvasRenderingContext2D, stroke: DrawStroke, w: number, h: number) {
  if (stroke.points.length < 2) return;
  ctx.beginPath();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = stroke.width;
  if (stroke.eraser) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
  } else {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = stroke.color;
  }
  const first = stroke.points[0];
  ctx.moveTo(first.nx * w, first.ny * h);
  for (let i = 1; i < stroke.points.length; i++) {
    const p = stroke.points[i];
    ctx.lineTo(p.nx * w, p.ny * h);
  }
  ctx.stroke();
  ctx.globalCompositeOperation = 'source-over';
}

function repaint(ctx: CanvasRenderingContext2D, strokes: DrawStroke[], w: number, h: number) {
  ctx.clearRect(0, 0, w, h);
  for (const stroke of strokes) {
    drawStroke(ctx, stroke, w, h);
  }
}

export function DrawingToolbar({
  color,
  width,
  isEraser,
  onColorChange,
  onWidthChange,
  onEraserChange,
  onUndo,
  onClear,
}: {
  color: string;
  width: number;
  isEraser: boolean;
  onColorChange: (c: string) => void;
  onWidthChange: (w: number) => void;
  onEraserChange: (e: boolean) => void;
  onUndo: () => void;
  onClear: () => void;
}) {
  return (
    <div className="drawing-toolbar">
      <div className="drawing-colors">
        {PEN_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            className={`drawing-color-btn${!isEraser && color === c ? ' active' : ''}`}
            style={{ background: c }}
            onClick={() => {
              onEraserChange(false);
              onColorChange(c);
            }}
            title="Cor"
          />
        ))}
      </div>
      <div className="drawing-tools-row">
        {PEN_WIDTHS.map((w) => (
          <button
            key={w}
            type="button"
            className={`drawing-width-btn${width === w && !isEraser ? ' active' : ''}`}
            onClick={() => {
              onEraserChange(false);
              onWidthChange(w);
            }}
          >
            <span style={{ width: w * 2, height: w * 2 }} className="drawing-width-dot" />
          </button>
        ))}
        <button
          type="button"
          className={`drawing-tool-btn${isEraser ? ' active' : ''}`}
          onClick={() => onEraserChange(true)}
          title="Borracha"
        >
          ⌫
        </button>
        <button type="button" className="drawing-tool-btn" onClick={onUndo} title="Desfazer">
          ↩
        </button>
        <button type="button" className="drawing-tool-btn" onClick={onClear} title="Limpar">
          🗑
        </button>
      </div>
    </div>
  );
}

export function DrawingCanvas({
  strokes,
  onChange,
  height = 480,
  showToolbar = true,
  color: colorProp,
  width: widthProp,
  isEraser: isEraserProp,
  onColorChange,
  onWidthChange,
  onEraserChange,
  onUndo: onUndoProp,
  onClear: onClearProp,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [colorLocal, setColorLocal] = useState(PEN_COLORS[1]);
  const [widthLocal, setWidthLocal] = useState(PEN_WIDTHS[1]);
  const [isEraserLocal, setIsEraserLocal] = useState(false);
  const color = colorProp ?? colorLocal;
  const width = widthProp ?? widthLocal;
  const isEraser = isEraserProp ?? isEraserLocal;
  const [drawing, setDrawing] = useState(false);
  const currentStroke = useRef<DrawStroke | null>(null);
  const strokesRef = useRef(strokes);
  strokesRef.current = strokes;

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      repaint(ctx, strokesRef.current, rect.width, height);
    }
  }, [height]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = container.getBoundingClientRect();
    repaint(ctx, strokes, rect.width, height);
  }, [strokes, height]);

  const getPoint = (clientX: number, clientY: number): DrawPoint | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return null;
    return { nx: x / rect.width, ny: y / rect.height };
  };

  const startDraw = (clientX: number, clientY: number) => {
    const point = getPoint(clientX, clientY);
    if (!point) return;
    currentStroke.current = {
      color: isEraser ? '#000' : color,
      width: isEraser ? width * 3 : width,
      points: [point],
      eraser: isEraser,
    };
    setDrawing(true);
  };

  const moveDraw = (clientX: number, clientY: number) => {
    if (!drawing || !currentStroke.current) return;
    const point = getPoint(clientX, clientY);
    if (!point) return;
    currentStroke.current.points.push(point);
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !container) return;
    const rect = container.getBoundingClientRect();
    repaint(ctx, strokesRef.current, rect.width, height);
    drawStroke(ctx, currentStroke.current, rect.width, height);
  };

  const endDraw = () => {
    if (currentStroke.current && currentStroke.current.points.length > 1) {
      onChange([...strokesRef.current, currentStroke.current]);
    }
    currentStroke.current = null;
    setDrawing(false);
  };

  const setColor = (c: string) => (onColorChange ?? setColorLocal)(c);
  const setWidth = (w: number) => (onWidthChange ?? setWidthLocal)(w);
  const setIsEraser = (e: boolean) => (onEraserChange ?? setIsEraserLocal)(e);

  const undo = () => {
    if (onUndoProp) {
      onUndoProp();
      return;
    }
    if (strokes.length === 0) return;
    onChange(strokes.slice(0, -1));
  };

  const clearAll = () => {
    if (onClearProp) {
      onClearProp();
      return;
    }
    if (strokes.length === 0 || !confirm('Apagar todo o desenho?')) return;
    onChange([]);
  };

  return (
    <div className="drawing-canvas-wrap">
      {showToolbar && (
        <DrawingToolbar
          color={color}
          width={width}
          isEraser={isEraser}
          onColorChange={setColor}
          onWidthChange={setWidth}
          onEraserChange={setIsEraser}
          onUndo={undo}
          onClear={clearAll}
        />
      )}
      <div
        ref={containerRef}
        className="drawing-canvas-container"
        style={{ height }}
      >
        <canvas
          ref={canvasRef}
          className="drawing-canvas"
          onPointerDown={(e) => {
            e.preventDefault();
            canvasRef.current?.setPointerCapture(e.pointerId);
            startDraw(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => moveDraw(e.clientX, e.clientY)}
          onPointerUp={endDraw}
          onPointerLeave={endDraw}
          onPointerCancel={endDraw}
        />
      </div>
    </div>
  );
}
