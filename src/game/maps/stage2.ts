import { CellType, MapData } from '../types';

const B = CellType.Buildable;
const P = CellType.Path;
const X = CellType.Blocked;
const S = CellType.Spawn;
const G = CellType.Goal;

// L字型の道
const grid: CellType[][] = [
  [S, P, P, P, P, P, P, P, P, B, B, B, B, B, B, B],
  [B, B, B, B, B, B, B, B, P, B, B, B, B, B, B, B],
  [B, B, B, B, B, B, B, B, P, B, B, B, B, B, B, B],
  [B, X, X, B, B, B, B, B, P, B, B, B, B, X, X, B],
  [B, X, X, B, B, B, B, B, P, B, B, B, B, X, X, B],
  [B, B, B, B, B, B, B, B, P, B, B, B, B, B, B, B],
  [B, B, B, B, B, B, B, B, P, B, B, B, B, B, B, B],
  [B, B, B, B, B, B, B, B, P, P, P, P, P, P, P, P],
  [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, G],
  [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
];

export const stage2: MapData = {
  id: 'stage2',
  name: '森の小径',
  cols: 16,
  rows: 10,
  grid,
  spawnPoint: { col: 0, row: 0 },
  goalPoint: { col: 15, row: 8 },
  waypoints: [
    { x: 0.5, y: 0.5 },
    { x: 8.5, y: 0.5 },
    { x: 8.5, y: 7.5 },
    { x: 15.5, y: 7.5 },
    { x: 15.5, y: 8.5 },
  ],
};
