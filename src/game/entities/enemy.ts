import { Enemy, EnemyType, MapData } from '../types';
import { getEnemyStats, WOLF_DODGE_CHANCE, GOLEM_ARMOR } from '../balance';

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
    baseSpeed: stats.speed,
    waypointIndex: 0,
    slowTimer: 0,
    reward: stats.reward,
    armor: type === 'golem' ? GOLEM_ARMOR : 0,
    dodgeChance: type === 'wolf' ? WOLF_DODGE_CHANCE : 0,
    shield: 0,
    maxShield: 0,
    shieldCooldown: 0,
    lastHitTowerTypes: [],
  };
}
