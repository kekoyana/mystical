import { Tower, Enemy, WorldPosition } from '../types';
import { getTowerStats } from '../balance';

function towerWorldPos(tower: Tower): WorldPosition {
  return { x: tower.pos.col + 0.5, y: tower.pos.row + 0.5 };
}

function distance(a: WorldPosition, b: WorldPosition): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Find the best target enemy for a tower.
 * Strategy: target the enemy closest to the goal (highest waypointIndex, then furthest along).
 * rangeMult: multiplier for tower range (e.g. PHANTOM modifier reduces range).
 */
export function findTarget(tower: Tower, enemies: Enemy[], rangeMult: number = 1): Enemy | null {
  const stats = getTowerStats(tower.type, tower.level);
  const tPos = towerWorldPos(tower);
  const effectiveRange = stats.range * rangeMult;

  let best: Enemy | null = null;
  let bestProgress = -1;

  for (const enemy of enemies) {
    if (enemy.hp <= 0) continue;
    const dist = distance(tPos, enemy.pos);
    if (dist > effectiveRange) continue;

    const progress = enemy.waypointIndex + (1 - dist / effectiveRange);
    if (progress > bestProgress) {
      bestProgress = progress;
      best = enemy;
    }
  }

  return best;
}

/**
 * Find enemies within a radius of a position (for AoE).
 */
export function findEnemiesInRadius(
  pos: WorldPosition,
  radius: number,
  enemies: Enemy[],
): Enemy[] {
  return enemies.filter((e) => {
    if (e.hp <= 0) return false;
    return distance(pos, e.pos) <= radius;
  });
}
