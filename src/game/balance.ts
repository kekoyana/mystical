import { TowerStats, EnemyStats } from './types';

// === Game Defaults ===

export const INITIAL_HP = 20;
export const INITIAL_GOLD = 100;
export const SELL_REFUND_RATE = 0.7;
export const EARLY_WAVE_BONUS_GOLD = 10;

// === Grid ===

export const GRID_COLS = 16;
export const GRID_ROWS = 10;

// === Tower Stats (indexed by level 0-2) ===

export const TOWER_STATS: Record<string, TowerStats[]> = {
  archer: [
    { damage: 10, range: 3, fireRate: 600, cost: 50, upgradeCost: 30, projectileSpeed: 8 },
    { damage: 18, range: 3.5, fireRate: 500, cost: 50, upgradeCost: 40, projectileSpeed: 9 },
    { damage: 30, range: 4, fireRate: 400, cost: 50, upgradeCost: 0, projectileSpeed: 10 },
  ],
  cannon: [
    { damage: 30, range: 2.5, fireRate: 1500, cost: 100, upgradeCost: 60, projectileSpeed: 5, aoeRadius: 1 },
    { damage: 50, range: 3, fireRate: 1300, cost: 100, upgradeCost: 80, projectileSpeed: 5.5, aoeRadius: 1.2 },
    { damage: 80, range: 3.5, fireRate: 1100, cost: 100, upgradeCost: 0, projectileSpeed: 6, aoeRadius: 1.5 },
  ],
  ice: [
    { damage: 5, range: 3, fireRate: 1000, cost: 75, upgradeCost: 45, projectileSpeed: 6, slowDuration: 2000 },
    { damage: 10, range: 3.5, fireRate: 900, cost: 75, upgradeCost: 60, projectileSpeed: 6.5, slowDuration: 3000 },
    { damage: 15, range: 4, fireRate: 800, cost: 75, upgradeCost: 0, projectileSpeed: 7, slowDuration: 4000 },
  ],
  thunder: [
    { damage: 20, range: 4, fireRate: 1200, cost: 125, upgradeCost: 75, projectileSpeed: 12, chainCount: 2 },
    { damage: 35, range: 4.5, fireRate: 1000, cost: 125, upgradeCost: 100, projectileSpeed: 14, chainCount: 3 },
    { damage: 50, range: 5, fireRate: 900, cost: 125, upgradeCost: 0, projectileSpeed: 16, chainCount: 4 },
  ],
};

// === Enemy Stats ===

export const ENEMY_STATS: Record<string, EnemyStats> = {
  goblin: { hp: 30, speed: 1.5, reward: 10 },
  wolf: { hp: 20, speed: 2.5, reward: 15 },
  golem: { hp: 120, speed: 0.8, reward: 25 },
  darkMage: { hp: 50, speed: 1.2, reward: 20 },
  dragon: { hp: 500, speed: 0.6, reward: 100 },
};

export function getTowerStats(type: string, level: number): TowerStats {
  return TOWER_STATS[type][level];
}

export function getEnemyStats(type: string): EnemyStats {
  return ENEMY_STATS[type];
}
