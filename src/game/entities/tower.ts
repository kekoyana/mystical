import { Tower, TowerType, GridPosition } from '../types';
import { getTowerStats } from '../balance';

export function createTower(
  id: number,
  type: TowerType,
  pos: GridPosition,
): Tower {
  const stats = getTowerStats(type, 0);
  return {
    id,
    type,
    pos,
    level: 0,
    lastFireTime: 0,
    totalInvested: stats.cost,
  };
}
