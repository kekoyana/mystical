import { CellType, MapData } from '../types';

const B = CellType.Buildable;
const P = CellType.Path;
const X = CellType.Blocked;
const S = CellType.Spawn;
const G = CellType.Goal;

const grid: CellType[][] = [
  [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
  [B, B, B, X, X, X, X, X, X, X, B, B, B, B, B, B],
  [S, P, P, P, B, B, B, B, B, P, B, B, B, B, B, B],
  [B, B, B, P, B, B, B, B, B, P, B, B, B, B, B, B],
  [B, B, B, P, B, B, B, B, B, P, B, B, B, B, B, B],
  [B, B, B, P, P, P, P, P, P, P, B, B, B, B, B, B],
  [B, B, B, B, B, B, B, B, B, P, B, B, B, B, B, B],
  [B, B, B, B, B, B, B, B, B, P, P, P, P, P, P, G],
  [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
  [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
];

export const stage1: MapData = {
  id: 'stage1',
  name: '草原の道',
  cols: 16,
  rows: 10,
  grid,
  spawnPoint: { col: 0, row: 2 },
  goalPoint: { col: 15, row: 7 },
  waypoints: [
    { x: 0.5, y: 2.5 },
    { x: 3.5, y: 2.5 },
    { x: 3.5, y: 5.5 },
    { x: 9.5, y: 5.5 },
    { x: 9.5, y: 7.5 },
    { x: 15.5, y: 7.5 },
  ],
};
