import { CellType, MapData } from '../types';

const B = CellType.Buildable;
const P = CellType.Path;
const X = CellType.Blocked;
const S = CellType.Spawn;
const G = CellType.Goal;

// 沼地 — 蛇行する長い道
const grid: CellType[][] = [
  [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
  [S, P, P, P, P, P, P, P, P, P, P, P, P, P, B, B],
  [B, B, B, B, B, B, B, B, B, B, B, B, B, P, B, B],
  [B, B, P, P, P, P, P, P, P, P, P, P, P, P, B, B],
  [B, B, P, B, B, X, B, B, X, B, B, B, B, B, B, B],
  [B, B, P, B, B, X, B, B, X, B, B, B, B, B, B, B],
  [B, B, P, P, P, P, P, P, P, P, P, P, P, P, B, B],
  [B, B, B, B, B, B, B, B, B, B, B, B, B, P, B, B],
  [B, B, P, P, P, P, P, P, P, P, P, P, P, P, B, B],
  [B, B, G, B, B, B, B, B, B, B, B, B, B, B, B, B],
];

export const stage5: MapData = {
  id: 'stage5',
  name: '沼地',
  cols: 16,
  rows: 10,
  grid,
  spawnPoint: { col: 0, row: 1 },
  goalPoint: { col: 2, row: 9 },
  waypoints: [
    { x: 0.5, y: 1.5 },
    { x: 13.5, y: 1.5 },
    { x: 13.5, y: 3.5 },
    { x: 2.5, y: 3.5 },
    { x: 2.5, y: 6.5 },
    { x: 13.5, y: 6.5 },
    { x: 13.5, y: 8.5 },
    { x: 2.5, y: 8.5 },
    { x: 2.5, y: 9.5 },
  ],
};
