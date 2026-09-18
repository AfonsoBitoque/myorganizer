import { useCallback, useEffect, useRef, useState } from 'react';
import { MarkdownViewer } from '@/components/MarkdownViewer';
import { DrawingCanvas } from '@/components/DrawingCanvas';
import type { DrawStroke } from '@/types/drawing';

interface SummaryAnnotatorProps {
  content: string;
  filePath: string;
  branch?: string;
  strokes: DrawStroke[];
  onStrokesChange: (strokes: DrawStroke[]) => void;
  drawMode: boolean;
  penColor: string;
  penWidth: number;
  isEraser: boolean;
}

export function SummaryAnnotator({
  content,
  filePath,
  branch = 'main',
  strokes,
  onStrokesChange,
  drawMode,
  penColor,
  penWidth,
  isEraser,
}: SummaryAnnotatorProps) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [overlayHeight, setOverlayHeight] = useState(600);

  const measure = useCallback(() => {
    if (innerRef.current) {
      setOverlayHeight(Math.max(600, innerRef.current.scrollHeight));
    }
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (innerRef.current) ro.observe(innerRef.current);
    return () => ro.disconnect();
  }, [content, measure]);

  return (
    <div className={`summary-annotate${drawMode ? ' draw-active' : ''}`}>
      <div className="summary-annotate-scroll">
        <div className="summary-annotate-inner" ref={innerRef}>
          <MarkdownViewer content={content} filePath={filePath} branch={branch} />
          {drawMode && (
            <div
              className="summary-canvas-overlay"
              style={{ height: overlayHeight }}
            >
              <DrawingCanvas
                strokes={strokes}
                onChange={onStrokesChange}
                height={overlayHeight}
                showToolbar={false}
                color={penColor}
                width={penWidth}
                isEraser={isEraser}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
