import { GameState } from '../game/types';

interface Props {
  state: GameState;
  mapName: string;
  muted: boolean;
  onBack: () => void;
  onToggleSpeed: () => void;
  onToggleMute: () => void;
}

export function HUD({ state, mapName, muted, onBack, onToggleSpeed, onToggleMute }: Props) {
  return (
    <div style={styles.container}>
      <button style={styles.smallBtn} onClick={onBack}>
        ←
      </button>
      <div style={styles.mapName}>{mapName}</div>
      <div style={styles.stats}>
        <span style={styles.item}>
          <span style={{ color: '#00ff88', textShadow: '0 0 6px rgba(0,255,136,0.5)' }}>&#9829;</span> {state.hp}/{state.maxHp}
        </span>
        <span style={styles.item}>
          <span style={{ color: '#ffaa00', textShadow: '0 0 6px rgba(255,170,0,0.5)' }}>&#9679;</span> {state.gold}G
        </span>
        <span style={styles.item}>
          <span style={{ color: '#00f0ff', textShadow: '0 0 6px rgba(0,240,255,0.5)' }}>&#9876;</span> {state.currentWave}/{state.totalWaves}
        </span>
      </div>
      <button style={styles.smallBtn} onClick={onToggleMute}>
        {muted ? '🔇' : '🔊'}
      </button>
      <button style={styles.speedBtn} onClick={onToggleSpeed}>
        {state.speed}x
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 10px',
    backgroundColor: 'rgba(10,15,30,0.85)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    color: '#e0e8ff',
    fontSize: '14px',
    fontFamily: "'Orbitron', 'Courier New', monospace",
    borderBottom: '1px solid rgba(0,240,255,0.3)',
  },
  smallBtn: {
    padding: '4px 8px',
    fontSize: '14px',
    fontFamily: "'Orbitron', 'Courier New', monospace",
    border: '1px solid rgba(0,240,255,0.3)',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    color: '#00f0ff',
    cursor: 'pointer',
    flexShrink: 0,
    lineHeight: 1,
  },
  mapName: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#00f0ff',
    flexShrink: 0,
    textShadow: '0 0 8px rgba(0,240,255,0.4)',
  },
  stats: {
    display: 'flex',
    gap: '10px',
    flex: 1,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    whiteSpace: 'nowrap',
    fontSize: '13px',
  },
  speedBtn: {
    padding: '4px 10px',
    fontSize: '13px',
    fontFamily: "'Orbitron', 'Courier New', monospace",
    fontWeight: 'bold',
    border: '1px solid rgba(0,240,255,0.3)',
    borderRadius: '4px',
    backgroundColor: 'rgba(0,240,255,0.08)',
    color: '#00f0ff',
    cursor: 'pointer',
    flexShrink: 0,
  },
};
