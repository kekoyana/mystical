import { Enemy, EnemyType, MapData } from '../types';
import { getEnemyStats } from '../balance';

export function createEnemy(
  id: number,
  type: EnemyType,
  map: MapData,
): Enemy {
  const stats = getEnemyStats(type);
  const spawn = map.waypoints[0];
  return {
    id,
    type,
    hp: stats.hp,
    maxHp: stats.hp,
    pos: { x: spawn.x, y: spawn.y },
    speed: stats.speed,
    waypointIndex: 0,
    slowTimer: 0,
    reward: stats.reward,
  };
}
