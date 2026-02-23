const RANKING_KEY = 'td-rankings';
const MAX_ENTRIES = 10;

export interface RankingEntry {
  stageId: string;
  score: number;
  killCount: number;
  remainingHp: number;
  wave: number;
  date: string; // ISO date string
}

export interface StageRankings {
  [stageId: string]: RankingEntry[];
}

export function loadRankings(): StageRankings {
  try {
    const data = localStorage.getItem(RANKING_KEY);
    if (data) return JSON.parse(data);
  } catch { /* ignore */ }
  return {};
}

function saveRankings(rankings: StageRankings): void {
  localStorage.setItem(RANKING_KEY, JSON.stringify(rankings));
}

/**
 * Add a score entry. Returns the rank (1-based), or 0 if not ranked.
 */
export function addScore(entry: RankingEntry): number {
  const rankings = loadRankings();
  const list = rankings[entry.stageId] ?? [];

  list.push(entry);
  list.sort((a, b) => b.score - a.score);

  if (list.length > MAX_ENTRIES) {
    list.length = MAX_ENTRIES;
  }

  rankings[entry.stageId] = list;
  saveRankings(rankings);

  const rank = list.findIndex(
    (e) => e.score === entry.score && e.date === entry.date,
  );
  return rank === -1 ? 0 : rank + 1;
}

export function getStageRankings(stageId: string): RankingEntry[] {
  const rankings = loadRankings();
  return rankings[stageId] ?? [];
}
