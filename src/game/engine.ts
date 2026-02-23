import { GameState, MapData, TowerType, GridPosition, CellType } from './types';
import { INITIAL_HP, INITIAL_GOLD, getTowerStats, SELL_REFUND_RATE } from './balance';
import { updateMovement } from './systems/movement';
import { updateTowerFiring, updateProjectiles } from './systems/combat';
import { processSpawnQueue, buildSpawnQueue, wavesByStage } from './systems/wave';
import { createTower } from './entities/tower';

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
  };
}

export function updateGame(state: GameState, map: MapData, dt: number): void {
  if (state.phase === 'won' || state.phase === 'lost') return;

  state.events = [];
  state.elapsedTime += dt;

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
    for (const other of state.enemies) {
      if (other.id === enemy.id || other.hp <= 0) continue;
      const dx = enemy.pos.x - other.pos.x;
      const dy = enemy.pos.y - other.pos.y;
      if (dx * dx + dy * dy <= 4) { // radius 2
        other.hp = Math.min(other.maxHp, other.hp + 2 * dt);
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
