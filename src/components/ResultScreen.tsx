import { GameState } from '../game/types';

interface Props {
  state: GameState;
  onRetry: () => void;
}

export function ResultScreen({ state, onRetry }: Props) {
  const won = state.phase === 'won';

  return (
    <div style={styles.overlay}>
      <div style={styles.panel}>
        <div style={{ ...styles.title, color: won ? '#2ecc71' : '#e74c3c' }}>
          {won ? 'STAGE CLEAR!' : 'GAME OVER'}
        </div>
        <div style={styles.stats}>
          <div>撃破数: {state.killCount}</div>
          <div>スコア: {state.score}</div>
          <div>残りHP: {state.hp} / {state.maxHp}</div>
          <div>到達ウェーブ: {state.currentWave} / {state.totalWaves}</div>
        </div>
        <button style={styles.retryBtn} onClick={onRetry}>
          リトライ
        </button>
      </div>
    </div>
  );
}

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
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 20,
  },
  panel: {
    backgroundColor: '#1a1a2e',
    border: '2px solid #444',
    borderRadius: '16px',
    padding: '24px 32px',
    color: '#eee',
    fontFamily: 'monospace',
    textAlign: 'center',
    minWidth: '240px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '16px',
  },
  stats: {
    fontSize: '14px',
    lineHeight: '1.8',
    marginBottom: '20px',
  },
  retryBtn: {
    padding: '12px 32px',
    fontSize: '16px',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#2980b9',
    color: '#fff',
    cursor: 'pointer',
  },
};
