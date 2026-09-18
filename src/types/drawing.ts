export interface DrawPoint {
  nx: number;
  ny: number;
}

export interface DrawStroke {
  color: string;
  width: number;
  points: DrawPoint[];
  eraser?: boolean;
}

export const PEN_COLORS = [
  '#f1f5f9',
  '#6366f1',
  '#ef4444',
  '#22c55e',
  '#f59e0b',
  '#ec4899',
  '#06b6d4',
];

export const PEN_WIDTHS = [2, 4, 8];
