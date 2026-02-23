import { useEffect, useRef, useState } from 'react';
import { GameState } from '../game/types';
import { addScore } from '../game/ranking';

interface Props {
  state: GameState;
  stageId: string;
  onRetry: () => void;
  onBack: () => void;
}

export function ResultScreen({ state, stageId, onRetry, onBack }: Props) {
  const won = state.phase === 'won';
  const [rank, setRank] = useState<number>(0);
  const registeredRef = useRef(false);

  useEffect(() => {
    if (registeredRef.current) return;
    registeredRef.current = true;

    const r = addScore({
      stageId,
      score: state.score,
      killCount: state.killCount,
      remainingHp: state.hp,
      wave: state.currentWave,
      date: new Date().toISOString(),
    });
    setRank(r);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const resultColor = won ? '#00ff88' : '#ff0066';

  return (
    <div style={styles.overlay}>
      <style>{glowKeyframes}</style>
      <div style={{
        ...styles.panel,
        borderColor: `${resultColor}44`,
        boxShadow: `0 0 30px ${resultColor}22`,
      }}>
        <div style={{
          ...styles.title,
          color: resultColor,
          textShadow: `0 0 20px ${resultColor}88, 0 0 40px ${resultColor}44`,
          animation: 'resultGlow 2s ease-in-out infinite',
        }}>
          {won ? 'STAGE CLEAR!' : 'GAME OVER'}
        </div>
        <div style={styles.stats}>
          <div>撃破数: <span style={{ color: '#00f0ff' }}>{state.killCount}</span></div>
          <div>スコア: <span style={{ color: '#ffaa00', fontWeight: 'bold', textShadow: '0 0 8px rgba(255,170,0,0.5)' }}>{state.score}</span></div>
          <div>残りHP: <span style={{ color: '#00ff88' }}>{state.hp}</span> / {state.maxHp}</div>
          <div>到達ウェーブ: <span style={{ color: '#00f0ff' }}>{state.currentWave}</span> / {state.totalWaves}</div>
        </div>
        {rank > 0 && (
          <div style={styles.rankBadge}>
            {rank <= 3 ? ['1st', '2nd', '3rd'][rank - 1] : `#${rank}`}
            {rank <= 3 ? ` ランクイン!` : ` 位`}
          </div>
        )}
        <div style={styles.buttons}>
          <button
            style={styles.retryBtn}
            onClick={onRetry}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 15px rgba(0,240,255,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            リトライ
          </button>
          <button
            style={styles.backBtn}
            onClick={onBack}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0,240,255,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0,240,255,0.2)';
            }}
          >
            ステージ選択
          </button>
        </div>
      </div>
    </div>
  );
}

const glowKeyframes = `
  @keyframes resultGlow {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.85; }
  }
`;

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(5,5,15,0.8)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    zIndex: 20,
  },
  panel: {
    backgroundColor: 'rgba(10,15,30,0.92)',
    border: '1px solid rgba(0,240,255,0.2)',
    borderRadius: '14px',
    padding: '24px 32px',
    color: '#e0e8ff',
    fontFamily: "'Orbitron', 'Courier New', monospace",
    textAlign: 'center',
    minWidth: '240px',
  },
  title: {
    fontSize: '26px',
    fontWeight: 'bold',
    marginBottom: '16px',
    letterSpacing: '3px',
  },
  stats: {
    fontSize: '13px',
    lineHeight: '1.8',
    marginBottom: '12px',
    color: '#99aabb',
  },
  rankBadge: {
    fontSize: '15px',
    fontWeight: 'bold',
    color: '#ffaa00',
    marginBottom: '16px',
    padding: '6px 12px',
    backgroundColor: 'rgba(255,170,0,0.08)',
    borderRadius: '8px',
    border: '1px solid rgba(255,170,0,0.2)',
    textShadow: '0 0 10px rgba(255,170,0,0.5)',
  },
  buttons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  retryBtn: {
    padding: '12px 24px',
    fontSize: '13px',
    fontWeight: 'bold',
    fontFamily: "'Orbitron', 'Courier New', monospace",
    border: '1px solid #00f0ff',
    borderRadius: '8px',
    backgroundColor: 'rgba(0,240,255,0.1)',
    color: '#00f0ff',
    cursor: 'pointer',
    transition: 'box-shadow 0.2s',
    letterSpacing: '1px',
  },
  backBtn: {
    padding: '12px 24px',
    fontSize: '13px',
    fontWeight: 'bold',
    fontFamily: "'Orbitron', 'Courier New', monospace",
    border: '1px solid rgba(0,240,255,0.2)',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    color: '#667799',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
    letterSpacing: '1px',
  },
};
