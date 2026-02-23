// === Grid & Map ===

export enum CellType {
  Path = 'path',
  Buildable = 'buildable',
  Blocked = 'blocked',
  Spawn = 'spawn',
  Goal = 'goal',
}

export interface GridPosition {
  col: number;
  row: number;
}

export interface WorldPosition {
  x: number;
  y: number;
}

export interface MapData {
  id: string;
  name: string;
  cols: number;
  rows: number;
  grid: CellType[][];
  waypoints: WorldPosition[];
  spawnPoint: GridPosition;
  goalPoint: GridPosition;
}

// === Entities ===

export type TowerType = 'archer' | 'cannon' | 'ice' | 'thunder';
export type EnemyType = 'goblin' | 'wolf' | 'golem' | 'darkMage' | 'dragon';

export interface Tower {
  id: number;
  type: TowerType;
  pos: GridPosition;
  level: number;
  lastFireTime: number;
  totalInvested: number;
}

export interface Enemy {
  id: number;
  type: EnemyType;
  hp: number;
  maxHp: number;
  pos: WorldPosition;
  speed: number;
  waypointIndex: number;
  slowTimer: number;
  reward: number;
}

export interface Projectile {
  id: number;
  pos: WorldPosition;
  targetId: number;
  speed: number;
  damage: number;
  towerId: number;
  towerType: TowerType;
}

// === Effects ===

export type EffectType = 'explosion' | 'freeze' | 'lightning' | 'death' | 'damage';

export interface Effect {
  id: number;
  type: EffectType;
  pos: WorldPosition;
  timer: number;    // remaining time in seconds
  duration: number;  // total duration
  value?: number;    // damage number for 'damage' type
  radius?: number;   // for explosion
}

// === Wave ===

export interface WaveEntry {
  enemyType: EnemyType;
  count: number;
  interval: number; // ms between spawns
}

export interface WaveData {
  entries: WaveEntry[];
  reward: number; // bonus gold for clearing
}

// === Game State ===

export type GamePhase = 'preparing' | 'waving' | 'won' | 'lost';

export type GameEvent =
  | { type: 'shoot'; towerType: TowerType }
  | { type: 'enemyDeath' }
  | { type: 'hitBase' };

export interface GameState {
  phase: GamePhase;
  hp: number;
  maxHp: number;
  gold: number;
  currentWave: number;
  totalWaves: number;
  enemies: Enemy[];
  towers: Tower[];
  projectiles: Projectile[];
  effects: Effect[];
  nextEntityId: number;
  spawnQueue: { enemyType: EnemyType; spawnAt: number }[];
  elapsedTime: number;
  score: number;
  killCount: number;
  speed: number; // 1 or 2
  events: GameEvent[];
}

// === Tower Stats (per level) ===

export interface TowerStats {
  damage: number;
  range: number;       // in grid units
  fireRate: number;    // ms between shots
  cost: number;
  upgradeCost: number; // 0 if max level
  projectileSpeed: number;
  aoeRadius?: number;  // for cannon
  slowDuration?: number; // for ice, in ms
  chainCount?: number; // for thunder
}

// === Enemy Stats ===

export interface EnemyStats {
  hp: number;
  speed: number;  // grid units per second
  reward: number;
}
