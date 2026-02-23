import { Enemy, WorldPosition } from '../types';
import { DRAGON_AURA_SPEED_BOOST, DRAGON_AURA_RADIUS } from '../balance';

function distance(a: WorldPosition, b: WorldPosition): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Apply dragon aura speed boost to nearby enemies.
 */
function applyDragonAura(enemies: Enemy[]): void {
  const dragons = enemies.filter((e) => e.type === 'dragon' && e.hp > 0);
  // Reset all to base speed first
  for (const enemy of enemies) {
    enemy.speed = enemy.baseSpeed;
  }
  // Then boost from each dragon
  for (const dragon of dragons) {
    for (const enemy of enemies) {
      if (enemy.id === dragon.id || enemy.hp <= 0) continue;
      if (distance(dragon.pos, enemy.pos) <= DRAGON_AURA_RADIUS) {
        enemy.speed = enemy.baseSpeed * (1 + DRAGON_AURA_SPEED_BOOST);
      }
    }
  }
}

/**
 * Move enemies along waypoints.
 * Returns ids of enemies that reached the goal.
 */
export function updateMovement(
  enemies: Enemy[],
  waypoints: WorldPosition[],
  dt: number,
): number[] {
  const reachedGoal: number[] = [];

  // Apply dragon aura before movement
  applyDragonAura(enemies);

  for (const enemy of enemies) {
    if (enemy.waypointIndex >= waypoints.length - 1) {
      reachedGoal.push(enemy.id);
      continue;
    }

    const speedMultiplier = enemy.slowTimer > 0 ? 0.4 : 1;
    const moveDistance = enemy.speed * speedMultiplier * dt;

    let remaining = moveDistance;
    while (remaining > 0 && enemy.waypointIndex < waypoints.length - 1) {
      const target = waypoints[enemy.waypointIndex + 1];
      const dist = distance(enemy.pos, target);

      if (dist <= remaining) {
        enemy.pos.x = target.x;
        enemy.pos.y = target.y;
        enemy.waypointIndex++;
        remaining -= dist;

        if (enemy.waypointIndex >= waypoints.length - 1) {
          reachedGoal.push(enemy.id);
          break;
        }
      } else {
        const ratio = remaining / dist;
        enemy.pos.x += (target.x - enemy.pos.x) * ratio;
        enemy.pos.y += (target.y - enemy.pos.y) * ratio;
        remaining = 0;
      }
    }

    if (enemy.slowTimer > 0) {
      enemy.slowTimer = Math.max(0, enemy.slowTimer - dt * 1000);
    }
  }

  return reachedGoal;
}
