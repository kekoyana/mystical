import { useState } from 'react';
import { MapData } from '../../game/types';
import { stages } from '../../game/maps';
import { wavesByStage } from '../../game/systems/wave';
import { getStageRankings, RankingEntry } from '../../game/ranking';

interface Props {
  clearedStages: Set<string>;
  onSelectStage: (map: MapData) => void;
  onBack: () => void;
}

export function StageSelectScreen({ clearedStages, onSelectStage, onBack }: Props) {
  const [rankingStage, setRankingStage] = useState<string | null>(null);

  const rankingEntries = rankingStage ? getStageRankings(rankingStage) : [];
  const rankingStageName = rankingStage
    ? stages.find((s) => s.id === rankingStage)?.name ?? ''
    : '';

  return (
    <div style={styles.root}>
      {rankingStage ? (
        // Ranking view
        <div style={styles.rankingPanel}>
          <h2 style={styles.title}>{rankingStageName} - ランキング</h2>
          {rankingEntries.length === 0 ? (
            <div style={styles.noData}>記録なし</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>#</th>
                  <th style={styles.th}>スコア</th>
                  <th style={styles.th}>撃破</th>
                  <th style={styles.th}>HP</th>
                  <th style={styles.th}>日付</th>
                </tr>
              </thead>
              <tbody>
                {rankingEntries.map((entry: RankingEntry, i: number) => (
                  <tr key={i}>
                    <td style={styles.td}>{i + 1}</td>
                    <td style={{ ...styles.td, color: '#ffaa00', textShadow: '0 0 6px rgba(255,170,0,0.4)' }}>{entry.score}</td>
                    <td style={styles.td}>{entry.killCount}</td>
                    <td style={{ ...styles.td, color: '#00ff88' }}>{entry.remainingHp}</td>
                    <td style={{ ...styles.td, fontSize: '10px', color: '#667799' }}>
                      {entry.date.slice(0, 10)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <button style={styles.backBtn} onClick={() => setRankingStage(null)}>
            戻る
          </button>
        </div>
      ) : (
        // Stage select view
        <>
          <h2 style={styles.title}>ステージ選択</h2>
          <div style={styles.grid}>
            {stages.map((stage, i) => {
              const cleared = clearedStages.has(stage.id);
              const waves = wavesByStage[stage.id]?.length ?? 0;
              const difficulty = i < 3 ? 'Easy' : 'Normal';
              const diffColor = i < 3 ? '#00ff88' : '#ffaa00';
              const topScore = getStageRankings(stage.id)[0]?.score;
              return (
                <div key={stage.id} style={styles.cardWrapper}>
                  <button
                    style={{
                      ...styles.card,
                      borderColor: cleared ? '#00ff88' : 'rgba(0,240,255,0.2)',
                      boxShadow: cleared ? '0 0 12px rgba(0,255,136,0.15)' : 'none',
                    }}
                    onClick={() => onSelectStage(stage)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = cleared ? '#00ff88' : '#00f0ff';
                      e.currentTarget.style.boxShadow = `0 0 15px ${cleared ? 'rgba(0,255,136,0.25)' : 'rgba(0,240,255,0.2)'}`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = cleared ? '#00ff88' : 'rgba(0,240,255,0.2)';
                      e.currentTarget.style.boxShadow = cleared ? '0 0 12px rgba(0,255,136,0.15)' : 'none';
                    }}
                  >
                    <div style={styles.stageNum}>Stage {i + 1}</div>
                    <div style={styles.stageName}>{stage.name}</div>
                    <div style={styles.stageInfo}>
                      <span style={{ color: diffColor, textShadow: `0 0 6px ${diffColor}44` }}>{difficulty}</span> / {waves} waves
                    </div>
                    {topScore !== undefined && (
                      <div style={styles.topScore}>Best: {topScore}</div>
                    )}
                    {cleared && <div style={styles.clearBadge}>CLEAR</div>}
                  </button>
                  <button
                    style={styles.rankBtn}
                    onClick={() => setRankingStage(stage.id)}
                  >
                    ランキング
                  </button>
                </div>
              );
            })}
          </div>
          <button style={styles.backBtn} onClick={onBack}>
            戻る
          </button>
        </>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100dvh',
    backgroundColor: '#0a0a1a',
    color: '#e0e8ff',
    fontFamily: "'Orbitron', 'Courier New', monospace",
    padding: '16px',
    overflow: 'auto',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#00f0ff',
    marginBottom: '24px',
    textShadow: '0 0 15px rgba(0,240,255,0.4)',
    letterSpacing: '3px',
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    justifyContent: 'center',
    maxWidth: '600px',
  },
  cardWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  card: {
    width: '160px',
    padding: '16px 12px',
    border: '1px solid rgba(0,240,255,0.2)',
    borderRadius: '10px',
    backgroundColor: '#0d1020',
    color: '#e0e8ff',
    cursor: 'pointer',
    fontFamily: "'Orbitron', 'Courier New', monospace",
    textAlign: 'center',
    position: 'relative',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  stageNum: {
    fontSize: '10px',
    color: '#667799',
    marginBottom: '2px',
    letterSpacing: '1px',
  },
  stageName: {
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '6px',
    color: '#e0e8ff',
  },
  stageInfo: {
    fontSize: '10px',
    color: '#667799',
  },
  topScore: {
    fontSize: '10px',
    color: '#ffaa00',
    marginTop: '4px',
    textShadow: '0 0 4px rgba(255,170,0,0.3)',
  },
  clearBadge: {
    position: 'absolute',
    top: '6px',
    right: '6px',
    fontSize: '8px',
    fontWeight: 'bold',
    color: '#00ff88',
    backgroundColor: 'rgba(0,255,136,0.1)',
    padding: '2px 5px',
    borderRadius: '4px',
    border: '1px solid rgba(0,255,136,0.3)',
    textShadow: '0 0 4px rgba(0,255,136,0.5)',
  },
  rankBtn: {
    padding: '4px',
    fontSize: '9px',
    fontFamily: "'Orbitron', 'Courier New', monospace",
    border: '1px solid rgba(0,240,255,0.15)',
    borderRadius: '6px',
    backgroundColor: 'transparent',
    color: '#667799',
    cursor: 'pointer',
    letterSpacing: '1px',
  },
  backBtn: {
    marginTop: '24px',
    padding: '10px 24px',
    fontSize: '13px',
    fontFamily: "'Orbitron', 'Courier New', monospace",
    border: '1px solid rgba(0,240,255,0.3)',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    color: '#00f0ff',
    cursor: 'pointer',
    letterSpacing: '1px',
  },
  // Ranking panel
  rankingPanel: {
    textAlign: 'center',
    maxWidth: '400px',
    width: '100%',
  },
  noData: {
    color: '#334466',
    fontSize: '14px',
    padding: '32px 0',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '16px',
  },
  th: {
    padding: '6px 8px',
    fontSize: '10px',
    color: '#667799',
    borderBottom: '1px solid rgba(0,240,255,0.15)',
    textAlign: 'center',
    letterSpacing: '1px',
  },
  td: {
    padding: '6px 8px',
    fontSize: '12px',
    textAlign: 'center',
    borderBottom: '1px solid rgba(0,240,255,0.08)',
    color: '#99aabb',
  },
};
