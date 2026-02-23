import { CellType, MapData } from '../types';

const B = CellType.Buildable;
const P = CellType.Path;
const X = CellType.Blocked;
const S = CellType.Spawn;
const G = CellType.Goal;

// S字型の道
const grid: CellType[][] = [
  [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
  [S, P, P, P, P, P, P, B, B, B, B, B, B, B, B, B],
  [B, B, B, B, B, B, P, B, B, X, X, B, B, B, B, B],
  [B, B, B, B, B, B, P, P, P, P, P, P, P, B, B, B],
  [B, B, B, B, B, B, B, B, B, B, B, B, P, B, B, B],
  [B, B, B, B, B, B, B, B, B, B, B, B, P, B, B, B],
  [B, B, B, P, P, P, P, P, P, P, P, P, P, B, B, B],
  [B, B, B, P, B, B, X, X, B, B, B, B, B, B, B, B],
  [B, B, B, P, P, P, P, P, P, P, P, P, P, P, P, G],
  [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
];

export const stage3: MapData = {
  id: 'stage3',
  name: '砂漠の谷',
  cols: 16,
  rows: 10,
  grid,
  spawnPoint: { col: 0, row: 1 },
  goalPoint: { col: 15, row: 8 },
  waypoints: [
    { x: 0.5, y: 1.5 },
    { x: 6.5, y: 1.5 },
    { x: 6.5, y: 3.5 },
    { x: 12.5, y: 3.5 },
    { x: 12.5, y: 6.5 },
    { x: 3.5, y: 6.5 },
    { x: 3.5, y: 8.5 },
    { x: 15.5, y: 8.5 },
  ],
};
