import { GameState, MapData, Projectile, WorldPosition, Enemy, TowerType, ComboType } from '../types';
import {
  getTowerStats,
  CRIT_CHANCE_BASE,
  CRIT_CHANCE_ARCHER,
  CRIT_MULTIPLIER,
  COMBO_SHATTER_BONUS,
  COMBO_FROZEN_BLAST_BONUS,
  COMBO_CROSS_FIRE_BONUS,
  KILL_STREAK_TIMEOUT,
  KILL_STREAK_THRESHOLDS,
  PHANTOM_RANGE_MULT,
} from '../balance';
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
  const rangeMult = state.waveModifier === 'PHANTOM' ? PHANTOM_RANGE_MULT : 1;

  for (const tower of state.towers) {
    const stats = getTowerStats(tower.type, tower.level);
    if (state.elapsedTime - tower.lastFireTime < stats.fireRate / 1000) continue;

    const target = findTarget(tower, state.enemies, rangeMult);
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
    state.events.push({ type: 'shoot', towerType: tower.type });
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

/**
 * Calculate combo bonus based on recent tower type hits on an enemy.
 */
function calculateComboBonus(
  enemy: Enemy,
  currentTowerType: TowerType,
  state: GameState,
): { bonus: number; comboType: ComboType | null } {
  const types = enemy.lastHitTowerTypes;
  let bonus = 0;
  let comboType: ComboType | null = null;

  // Check for combos: current hit + any recent hit
  const hasIce = types.includes('ice') || currentTowerType === 'ice';
  const hasThunder = types.includes('thunder') || currentTowerType === 'thunder';
  const hasCannon = types.includes('cannon') || currentTowerType === 'cannon';
  const hasArcher = types.includes('archer') || currentTowerType === 'archer';

  // Ice + Thunder = Shatter (+30%)
  if (hasIce && hasThunder && (currentTowerType === 'ice' || currentTowerType === 'thunder')) {
    bonus = COMBO_SHATTER_BONUS;
    comboType = 'shatter';
  }
  // Ice + Cannon = Frozen Blast (+50%) — highest priority if both match
  if (hasIce && hasCannon && (currentTowerType === 'ice' || currentTowerType === 'cannon')) {
    if (COMBO_FROZEN_BLAST_BONUS > bonus) {
      bonus = COMBO_FROZEN_BLAST_BONUS;
      comboType = 'frozenBlast';
    }
  }
  // Archer + Thunder = Cross Fire (+20%)
  if (hasArcher && hasThunder && (currentTowerType === 'archer' || currentTowerType === 'thunder')) {
    if (COMBO_CROSS_FIRE_BONUS > bonus && comboType === null) {
      bonus = COMBO_CROSS_FIRE_BONUS;
      comboType = 'crossFire';
    }
  }

  // Emit event if combo triggered
  if (comboType && state) {
    state.events.push({ type: 'combo', comboType });
  }

  return { bonus, comboType };
}

function handleHit(proj: Projectile, target: Enemy, state: GameState): void {
  const towerType = proj.towerType;
  const tower = state.towers.find((t) => t.id === proj.towerId);
  const stats = tower ? getTowerStats(tower.type, tower.level) : null;

  // --- Dodge check (wolf) ---
  if (target.dodgeChance > 0 && Math.random() < target.dodgeChance) {
    state.events.push({ type: 'dodge' });
    state.effects.push({
      id: state.nextEntityId++,
      type: 'dodge',
      pos: { x: target.pos.x, y: target.pos.y - 0.3 },
      timer: 0.6,
      duration: 0.6,
      label: 'MISS',
    });
    return; // attack fully dodged
  }

  // --- Critical hit check ---
  const critChance = towerType === 'archer' ? CRIT_CHANCE_ARCHER : CRIT_CHANCE_BASE;
  const isCrit = Math.random() < critChance;
  const critMult = isCrit ? CRIT_MULTIPLIER : 1;

  // --- Combo bonus ---
  const { bonus: comboBonus, comboType } = calculateComboBonus(target, towerType, state);

  // Calculate final damage
  let damage = Math.floor(proj.damage * critMult * (1 + comboBonus));

  // Apply damage to primary target
  applyDamage(target, damage, state);

  // Crit effect
  if (isCrit) {
    state.events.push({ type: 'crit' });
    state.effects.push({
      id: state.nextEntityId++,
      type: 'critDamage',
      pos: { x: target.pos.x, y: target.pos.y - 0.5 },
      timer: 0.8,
      duration: 0.8,
      value: damage,
      label: 'CRIT!',
    });
  }

  // Combo effect
  if (comboType) {
    const comboLabels: Record<ComboType, string> = {
      shatter: 'SHATTER!',
      frozenBlast: 'FROZEN BLAST!',
      crossFire: 'CROSS FIRE!',
    };
    state.effects.push({
      id: state.nextEntityId++,
      type: 'combo',
      pos: { x: target.pos.x, y: target.pos.y - 0.7 },
      timer: 1.0,
      duration: 1.0,
      label: comboLabels[comboType],
    });
  }

  // Damage number effect (only if no crit, to avoid double)
  if (!isCrit) {
    state.effects.push({
      id: state.nextEntityId++,
      type: 'damage',
      pos: { x: target.pos.x, y: target.pos.y - 0.3 },
      timer: 0.6,
      duration: 0.6,
      value: damage,
    });
  }

  // Track tower type for combo system (keep last 3)
  target.lastHitTowerTypes.push(towerType);
  if (target.lastHitTowerTypes.length > 3) {
    target.lastHitTowerTypes.shift();
  }

  // AoE for cannon
  if (towerType === 'cannon' && stats?.aoeRadius) {
    state.effects.push({
      id: state.nextEntityId++,
      type: 'explosion',
      pos: { x: target.pos.x, y: target.pos.y },
      timer: 0.3,
      duration: 0.3,
      radius: stats.aoeRadius,
    });
    const nearby = findEnemiesInRadius(target.pos, stats.aoeRadius, state.enemies);
    for (const e of nearby) {
      if (e.id !== target.id) {
        applyDamage(e, Math.floor(damage * 0.5), state);
      }
    }
  }

  // Slow for ice
  if (towerType === 'ice' && stats?.slowDuration) {
    target.slowTimer = stats.slowDuration;
    state.effects.push({
      id: state.nextEntityId++,
      type: 'freeze',
      pos: { x: target.pos.x, y: target.pos.y },
      timer: 0.4,
      duration: 0.4,
    });
  }

  // Chain for thunder
  if (towerType === 'thunder' && stats?.chainCount) {
    let chainTarget = target;
    const hit = new Set<number>([target.id]);
    for (let i = 0; i < stats.chainCount; i++) {
      const nearby = findEnemiesInRadius(chainTarget.pos, 1.5, state.enemies)
        .filter((e) => !hit.has(e.id));
      if (nearby.length === 0) break;
      const prev = chainTarget;
      chainTarget = nearby[0];
      hit.add(chainTarget.id);
      applyDamage(chainTarget, Math.floor(damage * 0.6), state);
      // Lightning arc effect between chain targets
      state.effects.push({
        id: state.nextEntityId++,
        type: 'lightning',
        pos: { x: (prev.pos.x + chainTarget.pos.x) / 2, y: (prev.pos.y + chainTarget.pos.y) / 2 },
        timer: 0.2,
        duration: 0.2,
      });
    }
  }
}

function applyDamage(enemy: Enemy, damage: number, state: GameState): void {
  const wasDead = enemy.hp <= 0;
  let effectiveDamage = damage;

  // Shield absorbs first
  if (enemy.shield > 0) {
    const absorbed = Math.min(enemy.shield, effectiveDamage);
    enemy.shield -= absorbed;
    effectiveDamage -= absorbed;
    if (absorbed > 0) {
      state.effects.push({
        id: state.nextEntityId++,
        type: 'shieldHit',
        pos: { x: enemy.pos.x, y: enemy.pos.y },
        timer: 0.3,
        duration: 0.3,
      });
    }
  }

  // Armor reduces remaining damage (min 1)
  if (enemy.armor > 0 && effectiveDamage > 0) {
    effectiveDamage = Math.max(1, effectiveDamage - enemy.armor);
  }

  enemy.hp -= effectiveDamage;
  if (enemy.hp <= 0 && !wasDead) {
    enemy.hp = 0;

    // Kill streak gold multiplier
    const goldMultiplier = state.killStreak.multiplier;
    const baseReward = enemy.reward;
    const reward = Math.floor(baseReward * goldMultiplier);
    state.gold += reward;
    state.score += reward;
    state.killCount++;

    // Update kill streak
    state.killStreak.count++;
    state.killStreak.timer = KILL_STREAK_TIMEOUT;
    // Recalculate multiplier
    let newMult = 1;
    for (const threshold of KILL_STREAK_THRESHOLDS) {
      if (state.killStreak.count >= threshold.kills) {
        newMult = threshold.multiplier;
        break;
      }
    }
    if (newMult > state.killStreak.multiplier) {
      state.events.push({ type: 'killStreak', count: state.killStreak.count });
    }
    state.killStreak.multiplier = newMult;

    state.events.push({ type: 'enemyDeath' });
  }
}
