import { GameState, MapData, TowerType, GridPosition, CellType, WorldPosition } from './types';
import {
  INITIAL_HP, INITIAL_GOLD, getTowerStats, SELL_REFUND_RATE,
  MYSTICAL_STRIKE_COOLDOWN, MYSTICAL_STRIKE_DAMAGE, MYSTICAL_STRIKE_RADIUS,
  DARK_MAGE_SHIELD_AMOUNT, DARK_MAGE_SHIELD_COOLDOWN, DARK_MAGE_SHIELD_RADIUS,
  KILL_STREAK_THRESHOLDS,
} from './balance';
import { updateMovement } from './systems/movement';
import { updateTowerFiring, updateProjectiles } from './systems/combat';
import { processSpawnQueue, buildSpawnQueue, wavesByStage, rollWaveModifier } from './systems/wave';
import { createTower } from './entities/tower';
import { findEnemiesInRadius } from './systems/targeting';

export function createInitialState(map: MapData): GameState {
  const waves = wavesByStage[map.id] ?? [];
  return {
    phase: 'preparing',
    hp: INITIAL_HP,
    maxHp: INITIAL_HP,
    gold: INITIAL_GOLD,
    currentWave: 0,
    totalWaves: waves.length,
    enemies: [],
    towers: [],
    projectiles: [],
    effects: [],
    nextEntityId: 1,
    spawnQueue: [],
    elapsedTime: 0,
    score: 0,
    killCount: 0,
    speed: 1,
    events: [],
    mysticalStrike: {
      cooldown: 0,
      maxCooldown: MYSTICAL_STRIKE_COOLDOWN,
    },
    killStreak: {
      count: 0,
      timer: 0,
      multiplier: 1,
    },
    waveModifier: null,
  };
}

export function updateGame(state: GameState, map: MapData, dt: number): void {
  if (state.phase === 'won' || state.phase === 'lost') return;

  state.events = [];
  state.elapsedTime += dt;

  // Mystical Strike cooldown
  if (state.mysticalStrike.cooldown > 0) {
    state.mysticalStrike.cooldown = Math.max(0, state.mysticalStrike.cooldown - dt);
  }

  // Kill streak timer decay
  if (state.killStreak.timer > 0) {
    state.killStreak.timer -= dt;
    if (state.killStreak.timer <= 0) {
      state.killStreak.count = 0;
      state.killStreak.timer = 0;
      state.killStreak.multiplier = 1;
    }
  }

  // Spawn enemies from queue
  if (state.phase === 'waving') {
    processSpawnQueue(state, map);
  }

  // Move enemies
  const reachedGoal = updateMovement(state.enemies, map.waypoints, dt);

  // Enemies reaching goal reduce HP
  for (const _id of reachedGoal) {
    state.hp -= 1;
    state.events.push({ type: 'hitBase' });
  }
  state.enemies = state.enemies.filter((e) => !reachedGoal.includes(e.id));

  // Remove dead enemies
  state.enemies = state.enemies.filter((e) => e.hp > 0);

  // Dark mage healing (heal nearby allies 2 HP/s)
  for (const enemy of state.enemies) {
    if (enemy.type !== 'darkMage' || enemy.hp <= 0) continue;

    // Healing
    for (const other of state.enemies) {
      if (other.id === enemy.id || other.hp <= 0) continue;
      const dx = enemy.pos.x - other.pos.x;
      const dy = enemy.pos.y - other.pos.y;
      if (dx * dx + dy * dy <= 4) { // radius 2
        other.hp = Math.min(other.maxHp, other.hp + 2 * dt);
      }
    }

    // Shield grant ability
    enemy.shieldCooldown -= dt;
    if (enemy.shieldCooldown <= 0) {
      enemy.shieldCooldown = DARK_MAGE_SHIELD_COOLDOWN;
      const nearby = findEnemiesInRadius(enemy.pos, DARK_MAGE_SHIELD_RADIUS, state.enemies);
      for (const other of nearby) {
        if (other.id === enemy.id) continue;
        if (other.shield < DARK_MAGE_SHIELD_AMOUNT) {
          other.shield = DARK_MAGE_SHIELD_AMOUNT;
          other.maxShield = DARK_MAGE_SHIELD_AMOUNT;
        }
      }
    }
  }

  // Tower firing
  updateTowerFiring(state);

  // Projectile movement & hits
  updateProjectiles(state, map, dt);

  // Death effects for killed enemies
  for (const enemy of state.enemies) {
    if (enemy.hp <= 0) {
      state.effects.push({
        id: state.nextEntityId++,
        type: 'death',
        pos: { x: enemy.pos.x, y: enemy.pos.y },
        timer: 0.3,
        duration: 0.3,
      });
    }
  }

  // Remove dead enemies (killed by projectiles this frame)
  state.enemies = state.enemies.filter((e) => e.hp > 0);

  // Update effects
  for (const eff of state.effects) {
    eff.timer -= dt;
  }
  state.effects = state.effects.filter((e) => e.timer > 0);

  // Check game over
  if (state.hp <= 0) {
    state.hp = 0;
    state.phase = 'lost';
    return;
  }

  // Check wave complete
  if (state.phase === 'waving' && state.spawnQueue.length === 0 && state.enemies.length === 0) {
    const waves = wavesByStage[map.id] ?? [];
    state.gold += waves[state.currentWave - 1]?.reward ?? 0;

    if (state.currentWave >= state.totalWaves) {
      state.phase = 'won';
    } else {
      state.phase = 'preparing';
    }
  }
}

export function startWave(state: GameState, map: MapData): void {
  if (state.phase !== 'preparing') return;
  const waves = wavesByStage[map.id] ?? [];
  if (state.currentWave >= waves.length) return;

  const wave = waves[state.currentWave];
  state.currentWave++;
  state.phase = 'waving';
  state.spawnQueue = buildSpawnQueue(wave, state.elapsedTime);

  // Roll wave modifier (wave 3+, 0-indexed currentWave is already incremented)
  state.waveModifier = rollWaveModifier(state.currentWave);
  if (state.waveModifier) {
    state.events.push({ type: 'waveModifier', modifier: state.waveModifier });

    // RUSH: compress spawn timings by 40%
    if (state.waveModifier === 'RUSH') {
      const baseTime = state.spawnQueue.length > 0 ? state.spawnQueue[0].spawnAt : state.elapsedTime;
      for (const spawn of state.spawnQueue) {
        spawn.spawnAt = baseTime + (spawn.spawnAt - baseTime) * 0.6;
      }
    }
  }
}

export function activateMysticalStrike(
  state: GameState,
  worldPos: WorldPosition,
): boolean {
  if (state.phase !== 'waving') return false;
  if (state.mysticalStrike.cooldown > 0) return false;

  state.mysticalStrike.cooldown = state.mysticalStrike.maxCooldown;

  // Find enemies in radius
  const targets = findEnemiesInRadius(worldPos, MYSTICAL_STRIKE_RADIUS, state.enemies);
  for (const enemy of targets) {
    const wasDead = enemy.hp <= 0;

    // Armor still applies
    let damage = MYSTICAL_STRIKE_DAMAGE;
    if (enemy.shield > 0) {
      const absorbed = Math.min(enemy.shield, damage);
      enemy.shield -= absorbed;
      damage -= absorbed;
    }
    if (enemy.armor > 0 && damage > 0) {
      damage = Math.max(1, damage - enemy.armor);
    }

    enemy.hp -= damage;
    if (enemy.hp <= 0 && !wasDead) {
      enemy.hp = 0;
      state.gold += enemy.reward;
      state.score += enemy.reward;
      state.killCount++;

      // Kill streak
      state.killStreak.count++;
      state.killStreak.timer = 2;
      let newMult = 1;
      for (const threshold of KILL_STREAK_THRESHOLDS) {
        if (state.killStreak.count >= threshold.kills) {
          newMult = threshold.multiplier;
          break;
        }
      }
      state.killStreak.multiplier = newMult;

      state.events.push({ type: 'enemyDeath' });
    }
  }

  // Visual effect
  state.effects.push({
    id: state.nextEntityId++,
    type: 'mysticalStrike',
    pos: { ...worldPos },
    timer: 0.8,
    duration: 0.8,
    radius: MYSTICAL_STRIKE_RADIUS,
    value: MYSTICAL_STRIKE_DAMAGE,
  });

  state.events.push({ type: 'mysticalStrike' });
  return true;
}

export function canPlaceTower(
  state: GameState,
  map: MapData,
  pos: GridPosition,
  type: TowerType,
): boolean {
  // Check bounds
  if (pos.row < 0 || pos.row >= map.rows || pos.col < 0 || pos.col >= map.cols) return false;

  // Check cell is buildable
  if (map.grid[pos.row][pos.col] !== CellType.Buildable) return false;

  // Check no existing tower
  if (state.towers.some((t) => t.pos.col === pos.col && t.pos.row === pos.row)) return false;

  // Check gold
  const stats = getTowerStats(type, 0);
  if (state.gold < stats.cost) return false;

  return true;
}

export function placeTower(
  state: GameState,
  map: MapData,
  pos: GridPosition,
  type: TowerType,
): boolean {
  if (!canPlaceTower(state, map, pos, type)) return false;

  const stats = getTowerStats(type, 0);
  state.gold -= stats.cost;

  const tower = createTower(state.nextEntityId++, type, pos);
  state.towers.push(tower);
  return true;
}

export function sellTower(state: GameState, towerId: number): boolean {
  const idx = state.towers.findIndex((t) => t.id === towerId);
  if (idx === -1) return false;

  const tower = state.towers[idx];
  state.gold += Math.floor(tower.totalInvested * SELL_REFUND_RATE);
  state.towers.splice(idx, 1);
  return true;
}

export function upgradeTower(state: GameState, towerId: number): boolean {
  const tower = state.towers.find((t) => t.id === towerId);
  if (!tower) return false;

  const stats = getTowerStats(tower.type, tower.level);
  if (stats.upgradeCost === 0) return false; // max level
  if (state.gold < stats.upgradeCost) return false;

  state.gold -= stats.upgradeCost;
  tower.totalInvested += stats.upgradeCost;
  tower.level++;
  return true;
}
