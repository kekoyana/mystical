import { GameState } from '../game/types';

interface Props {
  state: GameState;
}

export function HUD({ state }: Props) {
  return (
    <div style={styles.container}>
      <div style={styles.item}>
        <span style={styles.icon}>&#9829;</span>
        <span>{state.hp} / {state.maxHp}</span>
      </div>
      <div style={styles.item}>
        <span style={styles.icon}>&#11044;</span>
        <span>{state.gold}G</span>
      </div>
      <div style={styles.item}>
        <span style={styles.icon}>&#9876;</span>
        <span>Wave {state.currentWave} / {state.totalWaves}</span>
      </div>
      <div style={styles.item}>
        <span style={styles.icon}>&#9733;</span>
        <span>{state.score}</span>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    gap: '16px',
    padding: '8px 16px',
    backgroundColor: '#1a1a2e',
    color: '#eee',
    fontSize: '16px',
    fontFamily: 'monospace',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  icon: {
    fontSize: '18px',
    color: '#f39c12',
  },
};
