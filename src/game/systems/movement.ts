import { Enemy, WorldPosition } from '../types';

function distance(a: WorldPosition, b: WorldPosition): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
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
