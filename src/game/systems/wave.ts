import { WaveData, GameState, MapData } from '../types';
import { createEnemy } from '../entities/enemy';

// Stage 1 wave data (10 waves)
export const stage1Waves: WaveData[] = [
  { entries: [{ enemyType: 'goblin', count: 5, interval: 1000 }], reward: 20 },
  { entries: [{ enemyType: 'goblin', count: 8, interval: 900 }], reward: 20 },
  { entries: [{ enemyType: 'goblin', count: 6, interval: 800 }, { enemyType: 'wolf', count: 3, interval: 700 }], reward: 30 },
  { entries: [{ enemyType: 'wolf', count: 8, interval: 600 }], reward: 30 },
  { entries: [{ enemyType: 'goblin', count: 10, interval: 700 }, { enemyType: 'golem', count: 2, interval: 2000 }], reward: 40 },
  { entries: [{ enemyType: 'golem', count: 4, interval: 1500 }, { enemyType: 'goblin', count: 5, interval: 800 }], reward: 40 },
  { entries: [{ enemyType: 'wolf', count: 12, interval: 500 }], reward: 40 },
  { entries: [{ enemyType: 'goblin', count: 8, interval: 600 }, { enemyType: 'golem', count: 3, interval: 1500 }, { enemyType: 'wolf', count: 5, interval: 500 }], reward: 50 },
  { entries: [{ enemyType: 'golem', count: 6, interval: 1200 }, { enemyType: 'wolf', count: 8, interval: 400 }], reward: 50 },
  { entries: [{ enemyType: 'goblin', count: 10, interval: 500 }, { enemyType: 'golem', count: 4, interval: 1000 }, { enemyType: 'dragon', count: 1, interval: 0 }], reward: 100 },
];

export const wavesByStage: Record<string, WaveData[]> = {
  stage1: stage1Waves,
};

/**
 * Build the spawn queue for a wave. All entries are flattened and scheduled.
 */
export function buildSpawnQueue(
  wave: WaveData,
  waveStartTime: number,
): { enemyType: import('../types').EnemyType; spawnAt: number }[] {
  const queue: { enemyType: import('../types').EnemyType; spawnAt: number }[] = [];
  let time = waveStartTime;

  for (const entry of wave.entries) {
    for (let i = 0; i < entry.count; i++) {
      queue.push({ enemyType: entry.enemyType, spawnAt: time });
      time += entry.interval / 1000;
    }
  }

  return queue;
}

/**
 * Process spawn queue: create enemies that are due.
 */
export function processSpawnQueue(state: GameState, map: MapData): void {
  const due = state.spawnQueue.filter((s) => state.elapsedTime >= s.spawnAt);
  for (const spawn of due) {
    const enemy = createEnemy(state.nextEntityId++, spawn.enemyType, map);
    state.enemies.push(enemy);
  }
  state.spawnQueue = state.spawnQueue.filter((s) => state.elapsedTime < s.spawnAt);
}
