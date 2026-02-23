import { CellType, MapData } from '../types';

const B = CellType.Buildable;
const P = CellType.Path;
const X = CellType.Blocked;
const S = CellType.Spawn;
const G = CellType.Goal;

// 古城跡 — 複数の入口（上下からの挟撃）
const grid: CellType[][] = [
  [B, B, B, B, B, B, B, S, P, B, B, B, B, B, B, B],
  [B, B, B, B, B, B, B, B, P, B, B, B, B, B, B, B],
  [B, B, X, X, B, B, B, B, P, P, P, B, B, X, X, B],
  [B, B, X, X, B, B, B, B, B, B, P, B, B, X, X, B],
  [B, B, B, B, B, B, B, B, B, B, P, B, B, B, B, B],
  [B, B, B, B, B, B, B, B, B, B, P, P, P, P, P, G],
  [B, B, B, B, B, B, B, B, B, B, P, B, B, B, B, B],
  [B, B, X, X, B, B, B, B, P, P, P, B, B, X, X, B],
  [B, B, B, B, B, B, B, B, P, B, B, B, B, B, B, B],
  [B, B, B, B, B, B, B, S, P, B, B, B, B, B, B, B],
];

export const stage6: MapData = {
  id: 'stage6',
  name: '古城跡',
  cols: 16,
  rows: 10,
  grid,
  spawnPoint: { col: 7, row: 0 },
  goalPoint: { col: 15, row: 5 },
  // Top entrance path
  waypoints: [
    { x: 8.5, y: 0.5 },
    { x: 8.5, y: 2.5 },
    { x: 10.5, y: 2.5 },
    { x: 10.5, y: 5.5 },
    { x: 15.5, y: 5.5 },
  ],
};
