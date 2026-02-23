import { GameState, MapData, Projectile, WorldPosition } from '../types';
import { getTowerStats } from '../balance';
import { findTarget, findEnemiesInRadius } from './targeting';
import { createProjectile } from '../entities/projectile';

function distance(a: WorldPosition, b: WorldPosition): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Let towers fire at enemies. Creates projectiles.
 */
export function updateTowerFiring(state: GameState): void {
  for (const tower of state.towers) {
    const stats = getTowerStats(tower.type, tower.level);
    if (state.elapsedTime - tower.lastFireTime < stats.fireRate / 1000) continue;

    const target = findTarget(tower, state.enemies);
    if (!target) continue;

    tower.lastFireTime = state.elapsedTime;
    const from: WorldPosition = { x: tower.pos.col + 0.5, y: tower.pos.row + 0.5 };
    const proj = createProjectile(
      state.nextEntityId++,
      from,
      target.id,
      tower.id,
      tower.type,
      tower.level,
    );
    state.projectiles.push(proj);
  }
}

const HIT_THRESHOLD = 0.2;

/**
 * Move projectiles toward targets and handle hits.
 */
export function updateProjectiles(state: GameState, _map: MapData, dt: number): void {
  const toRemove: number[] = [];

  for (const proj of state.projectiles) {
    const target = state.enemies.find((e) => e.id === proj.targetId);
    if (!target || target.hp <= 0) {
      toRemove.push(proj.id);
      continue;
    }

    const dist = distance(proj.pos, target.pos);
    if (dist < HIT_THRESHOLD) {
      handleHit(proj, target, state);
      toRemove.push(proj.id);
    } else {
      const moveAmount = proj.speed * dt;
      const ratio = Math.min(moveAmount / dist, 1);
      proj.pos.x += (target.pos.x - proj.pos.x) * ratio;
      proj.pos.y += (target.pos.y - proj.pos.y) * ratio;
    }
  }

  state.projectiles = state.projectiles.filter((p) => !toRemove.includes(p.id));
}

function handleHit(proj: Projectile, target: import('../types').Enemy, state: GameState): void {
  const towerType = proj.towerType;
  const tower = state.towers.find((t) => t.id === proj.towerId);
  const stats = tower ? getTowerStats(tower.type, tower.level) : null;

  // Apply damage to primary target
  applyDamage(target, proj.damage, state);

  // AoE for cannon
  if (towerType === 'cannon' && stats?.aoeRadius) {
    const nearby = findEnemiesInRadius(target.pos, stats.aoeRadius, state.enemies);
    for (const e of nearby) {
      if (e.id !== target.id) {
        applyDamage(e, Math.floor(proj.damage * 0.5), state);
      }
    }
  }

  // Slow for ice
  if (towerType === 'ice' && stats?.slowDuration) {
    target.slowTimer = stats.slowDuration;
  }
}

function applyDamage(enemy: import('../types').Enemy, damage: number, state: GameState): void {
  enemy.hp -= damage;
  if (enemy.hp <= 0) {
    enemy.hp = 0;
    state.gold += enemy.reward;
    state.score += enemy.reward;
    state.killCount++;
  }
}
