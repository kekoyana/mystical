import { WaveData, GameState, MapData } from '../types';
import { createEnemy } from '../entities/enemy';

// Stage 1 wave data (10 waves - Easy)
const stage1Waves: WaveData[] = [
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

// Stage 2 wave data (10 waves - Easy)
const stage2Waves: WaveData[] = [
  { entries: [{ enemyType: 'goblin', count: 6, interval: 900 }], reward: 20 },
  { entries: [{ enemyType: 'wolf', count: 5, interval: 700 }], reward: 25 },
  { entries: [{ enemyType: 'goblin', count: 8, interval: 700 }, { enemyType: 'wolf', count: 4, interval: 600 }], reward: 30 },
  { entries: [{ enemyType: 'golem', count: 3, interval: 1800 }], reward: 30 },
  { entries: [{ enemyType: 'wolf', count: 10, interval: 500 }, { enemyType: 'goblin', count: 5, interval: 600 }], reward: 40 },
  { entries: [{ enemyType: 'darkMage', count: 2, interval: 2000 }, { enemyType: 'golem', count: 4, interval: 1500 }], reward: 40 },
  { entries: [{ enemyType: 'goblin', count: 12, interval: 400 }, { enemyType: 'wolf', count: 6, interval: 400 }], reward: 45 },
  { entries: [{ enemyType: 'golem', count: 5, interval: 1200 }, { enemyType: 'darkMage', count: 3, interval: 1500 }], reward: 50 },
  { entries: [{ enemyType: 'wolf', count: 15, interval: 350 }], reward: 50 },
  { entries: [{ enemyType: 'golem', count: 6, interval: 1000 }, { enemyType: 'darkMage', count: 2, interval: 1500 }, { enemyType: 'dragon', count: 1, interval: 0 }], reward: 100 },
];

// Stage 3 wave data (10 waves - Easy)
const stage3Waves: WaveData[] = [
  { entries: [{ enemyType: 'goblin', count: 8, interval: 800 }], reward: 20 },
  { entries: [{ enemyType: 'wolf', count: 6, interval: 600 }, { enemyType: 'goblin', count: 4, interval: 700 }], reward: 25 },
  { entries: [{ enemyType: 'golem', count: 3, interval: 1500 }, { enemyType: 'wolf', count: 5, interval: 500 }], reward: 35 },
  { entries: [{ enemyType: 'darkMage', count: 3, interval: 1500 }, { enemyType: 'goblin', count: 8, interval: 500 }], reward: 35 },
  { entries: [{ enemyType: 'wolf', count: 12, interval: 400 }, { enemyType: 'golem', count: 3, interval: 1200 }], reward: 40 },
  { entries: [{ enemyType: 'golem', count: 5, interval: 1000 }, { enemyType: 'darkMage', count: 3, interval: 1200 }], reward: 45 },
  { entries: [{ enemyType: 'goblin', count: 15, interval: 350 }, { enemyType: 'wolf', count: 8, interval: 350 }], reward: 45 },
  { entries: [{ enemyType: 'golem', count: 6, interval: 900 }, { enemyType: 'darkMage', count: 4, interval: 1000 }, { enemyType: 'wolf', count: 6, interval: 400 }], reward: 55 },
  { entries: [{ enemyType: 'wolf', count: 20, interval: 300 }, { enemyType: 'golem', count: 4, interval: 800 }], reward: 55 },
  { entries: [{ enemyType: 'golem', count: 8, interval: 800 }, { enemyType: 'darkMage', count: 3, interval: 1000 }, { enemyType: 'dragon', count: 2, interval: 3000 }], reward: 120 },
];

// Stage 4 wave data (15 waves - Normal)
const stage4Waves: WaveData[] = [
  { entries: [{ enemyType: 'goblin', count: 8, interval: 700 }], reward: 25 },
  { entries: [{ enemyType: 'wolf', count: 10, interval: 500 }], reward: 25 },
  { entries: [{ enemyType: 'golem', count: 4, interval: 1500 }, { enemyType: 'goblin', count: 6, interval: 600 }], reward: 30 },
  { entries: [{ enemyType: 'darkMage', count: 3, interval: 1200 }, { enemyType: 'wolf', count: 8, interval: 450 }], reward: 35 },
  { entries: [{ enemyType: 'goblin', count: 15, interval: 400 }], reward: 35 },
  { entries: [{ enemyType: 'golem', count: 6, interval: 1000 }, { enemyType: 'darkMage', count: 3, interval: 1000 }], reward: 40 },
  { entries: [{ enemyType: 'wolf', count: 15, interval: 350 }, { enemyType: 'golem', count: 3, interval: 1200 }], reward: 40 },
  { entries: [{ enemyType: 'darkMage', count: 5, interval: 1000 }, { enemyType: 'goblin', count: 10, interval: 400 }], reward: 45 },
  { entries: [{ enemyType: 'golem', count: 8, interval: 800 }], reward: 45 },
  { entries: [{ enemyType: 'wolf', count: 20, interval: 300 }, { enemyType: 'darkMage', count: 3, interval: 800 }], reward: 50 },
  { entries: [{ enemyType: 'golem', count: 8, interval: 700 }, { enemyType: 'wolf', count: 10, interval: 350 }], reward: 50 },
  { entries: [{ enemyType: 'darkMage', count: 5, interval: 800 }, { enemyType: 'golem', count: 6, interval: 700 }], reward: 55 },
  { entries: [{ enemyType: 'wolf', count: 25, interval: 250 }], reward: 55 },
  { entries: [{ enemyType: 'golem', count: 10, interval: 600 }, { enemyType: 'darkMage', count: 5, interval: 600 }], reward: 60 },
  { entries: [{ enemyType: 'golem', count: 8, interval: 500 }, { enemyType: 'darkMage', count: 4, interval: 600 }, { enemyType: 'dragon', count: 2, interval: 2000 }], reward: 150 },
];

// Stage 5 wave data (15 waves - Normal)
const stage5Waves: WaveData[] = [
  { entries: [{ enemyType: 'wolf', count: 10, interval: 500 }], reward: 25 },
  { entries: [{ enemyType: 'goblin', count: 10, interval: 600 }, { enemyType: 'wolf', count: 5, interval: 400 }], reward: 30 },
  { entries: [{ enemyType: 'golem', count: 5, interval: 1200 }], reward: 30 },
  { entries: [{ enemyType: 'wolf', count: 15, interval: 350 }, { enemyType: 'darkMage', count: 2, interval: 1500 }], reward: 35 },
  { entries: [{ enemyType: 'golem', count: 6, interval: 1000 }, { enemyType: 'goblin', count: 10, interval: 450 }], reward: 40 },
  { entries: [{ enemyType: 'darkMage', count: 4, interval: 1000 }, { enemyType: 'golem', count: 5, interval: 900 }], reward: 40 },
  { entries: [{ enemyType: 'wolf', count: 20, interval: 300 }], reward: 40 },
  { entries: [{ enemyType: 'golem', count: 8, interval: 700 }, { enemyType: 'darkMage', count: 4, interval: 800 }], reward: 50 },
  { entries: [{ enemyType: 'goblin', count: 20, interval: 300 }, { enemyType: 'wolf', count: 10, interval: 300 }], reward: 50 },
  { entries: [{ enemyType: 'golem', count: 10, interval: 600 }, { enemyType: 'darkMage', count: 5, interval: 700 }], reward: 55 },
  { entries: [{ enemyType: 'wolf', count: 25, interval: 250 }, { enemyType: 'golem', count: 5, interval: 800 }], reward: 55 },
  { entries: [{ enemyType: 'darkMage', count: 6, interval: 700 }, { enemyType: 'golem', count: 8, interval: 600 }], reward: 60 },
  { entries: [{ enemyType: 'wolf', count: 30, interval: 200 }], reward: 60 },
  { entries: [{ enemyType: 'golem', count: 12, interval: 500 }, { enemyType: 'darkMage', count: 6, interval: 500 }], reward: 65 },
  { entries: [{ enemyType: 'golem', count: 10, interval: 400 }, { enemyType: 'darkMage', count: 5, interval: 500 }, { enemyType: 'dragon', count: 3, interval: 2000 }], reward: 200 },
];

// Stage 6 wave data (15 waves - Normal)
const stage6Waves: WaveData[] = [
  { entries: [{ enemyType: 'goblin', count: 10, interval: 600 }, { enemyType: 'wolf', count: 5, interval: 500 }], reward: 30 },
  { entries: [{ enemyType: 'golem', count: 4, interval: 1200 }, { enemyType: 'wolf', count: 10, interval: 400 }], reward: 30 },
  { entries: [{ enemyType: 'darkMage', count: 3, interval: 1000 }, { enemyType: 'goblin', count: 12, interval: 400 }], reward: 35 },
  { entries: [{ enemyType: 'wolf', count: 20, interval: 300 }], reward: 35 },
  { entries: [{ enemyType: 'golem', count: 8, interval: 800 }, { enemyType: 'darkMage', count: 3, interval: 900 }], reward: 40 },
  { entries: [{ enemyType: 'goblin', count: 20, interval: 300 }, { enemyType: 'golem', count: 5, interval: 800 }], reward: 45 },
  { entries: [{ enemyType: 'darkMage', count: 5, interval: 800 }, { enemyType: 'wolf', count: 15, interval: 300 }], reward: 45 },
  { entries: [{ enemyType: 'golem', count: 10, interval: 600 }], reward: 50 },
  { entries: [{ enemyType: 'wolf', count: 25, interval: 250 }, { enemyType: 'darkMage', count: 4, interval: 700 }], reward: 50 },
  { entries: [{ enemyType: 'dragon', count: 1, interval: 0 }, { enemyType: 'golem', count: 8, interval: 600 }], reward: 55 },
  { entries: [{ enemyType: 'darkMage', count: 6, interval: 600 }, { enemyType: 'golem', count: 8, interval: 500 }], reward: 55 },
  { entries: [{ enemyType: 'wolf', count: 30, interval: 200 }, { enemyType: 'golem', count: 5, interval: 600 }], reward: 60 },
  { entries: [{ enemyType: 'golem', count: 12, interval: 450 }, { enemyType: 'darkMage', count: 6, interval: 500 }], reward: 65 },
  { entries: [{ enemyType: 'wolf', count: 20, interval: 200 }, { enemyType: 'golem', count: 10, interval: 400 }, { enemyType: 'darkMage', count: 5, interval: 500 }], reward: 70 },
  { entries: [{ enemyType: 'golem', count: 15, interval: 350 }, { enemyType: 'darkMage', count: 8, interval: 400 }, { enemyType: 'dragon', count: 3, interval: 1500 }], reward: 250 },
];

export const wavesByStage: Record<string, WaveData[]> = {
  stage1: stage1Waves,
  stage2: stage2Waves,
  stage3: stage3Waves,
  stage4: stage4Waves,
  stage5: stage5Waves,
  stage6: stage6Waves,
};

/**
 * Build the spawn queue for a wave.
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
