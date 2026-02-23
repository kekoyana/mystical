import { Projectile, TowerType, WorldPosition } from '../types';
import { getTowerStats } from '../balance';

export function createProjectile(
  id: number,
  from: WorldPosition,
  targetId: number,
  towerId: number,
  towerType: TowerType,
  towerLevel: number,
): Projectile {
  const stats = getTowerStats(towerType, towerLevel);
  return {
    id,
    pos: { x: from.x, y: from.y },
    targetId,
    speed: stats.projectileSpeed,
    damage: stats.damage,
    towerId,
    towerType,
  };
}
