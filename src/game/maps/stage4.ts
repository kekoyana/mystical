import { CellType, MapData } from '../types';

const B = CellType.Buildable;
const P = CellType.Path;
const X = CellType.Blocked;
const S = CellType.Spawn;
const G = CellType.Goal;

// 山岳峠 — 分岐あり（2つの入口が合流）
const grid: CellType[][] = [
  [S, P, P, P, P, B, B, B, B, B, B, B, B, B, B, B],
  [B, B, B, B, P, B, B, X, X, B, B, B, B, B, B, B],
  [B, B, B, B, P, P, P, P, P, P, P, B, B, B, B, B],
  [B, B, B, B, B, B, B, B, B, B, P, B, B, B, B, B],
  [B, B, B, B, B, B, B, B, B, B, P, P, P, P, P, G],
  [B, B, B, B, B, B, B, B, B, B, P, B, B, B, B, B],
  [B, B, B, B, B, B, B, B, B, B, P, B, B, B, B, B],
  [B, B, B, B, P, P, P, P, P, P, P, B, B, B, B, B],
  [B, B, B, B, P, B, B, X, X, B, B, B, B, B, B, B],
  [S, P, P, P, P, B, B, B, B, B, B, B, B, B, B, B],
];

export const stage4: MapData = {
  id: 'stage4',
  name: '山岳峠',
  cols: 16,
  rows: 10,
  grid,
  spawnPoint: { col: 0, row: 0 },
  goalPoint: { col: 15, row: 4 },
  // Top path
  waypoints: [
    { x: 0.5, y: 0.5 },
    { x: 4.5, y: 0.5 },
    { x: 4.5, y: 2.5 },
    { x: 10.5, y: 2.5 },
    { x: 10.5, y: 4.5 },
    { x: 15.5, y: 4.5 },
  ],
};
