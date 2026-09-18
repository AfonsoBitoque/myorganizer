import { useCallback, useEffect, useRef, useState } from 'react';
import { DrawingCanvas } from '@/components/DrawingCanvas';
import type { DrawStroke } from '@/types/drawing';

interface HtmlAnnotatorProps {
  html: string;
  strokes: DrawStroke[];
  onStrokesChange: (strokes: DrawStroke[]) => void;
  penColor: string;
  penWidth: number;
  isEraser: boolean;
}

export function HtmlAnnotator({
  html,
  strokes,
  onStrokesChange,
  penColor,
  penWidth,
  isEraser,
}: HtmlAnnotatorProps) {
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
  }, [html, measure]);

  return (
    <div className="summary-annotate draw-active">
      <div className="summary-annotate-scroll">
        <div className="summary-annotate-inner" ref={innerRef}>
          <div className="html-resumo-body" dangerouslySetInnerHTML={{ __html: html || '<p></p>' }} />
          <div className="summary-canvas-overlay" style={{ height: overlayHeight }}>
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
        </div>
      </div>
    </div>
  );
}
