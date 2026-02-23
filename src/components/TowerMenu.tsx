import { TowerType, GameState } from '../game/types';
import { getTowerStats } from '../game/balance';

interface Props {
  state: GameState;
  selectedTower: TowerType | null;
  onSelectTower: (type: TowerType | null) => void;
  onStartWave: () => void;
  canStartWave: boolean;
}

interface TowerOption {
  type: TowerType;
  label: string;
  symbol: string;
  color: string;
}

const TOWER_OPTIONS: TowerOption[] = [
  { type: 'archer', label: 'アーチャー', symbol: '◇', color: '#00f0ff' },
  { type: 'cannon', label: 'キャノン', symbol: '⬡', color: '#ff4466' },
  { type: 'ice', label: 'アイス', symbol: '✦', color: '#aa44ff' },
  { type: 'thunder', label: 'サンダー', symbol: '⚡', color: '#ffaa00' },
];

export function TowerMenu({
  state,
  selectedTower,
  onSelectTower,
  onStartWave,
  canStartWave,
}: Props) {
  return (
    <div style={styles.container}>
      {TOWER_OPTIONS.map((opt) => {
        const stats = getTowerStats(opt.type, 0);
        const affordable = state.gold >= stats.cost;
        const isSelected = selectedTower === opt.type;

        return (
          <button
            key={opt.type}
            style={{
              ...styles.button,
              borderColor: isSelected ? opt.color : 'rgba(255,255,255,0.15)',
              boxShadow: isSelected ? `0 0 12px ${opt.color}66, inset 0 0 8px ${opt.color}22` : 'none',
              opacity: affordable ? 1 : 0.4,
            }}
            onClick={() => onSelectTower(isSelected ? null : opt.type)}
            disabled={!affordable}
          >
            <span style={{ ...styles.symbol, color: opt.color, textShadow: `0 0 8px ${opt.color}88` }}>
              {opt.symbol}
            </span>
            <span style={{ ...styles.cost, color: opt.color }}>{stats.cost}G</span>
          </button>
        );
      })}
      <button
        style={{
          ...styles.button,
          ...styles.startButton,
          opacity: canStartWave ? 1 : 0.4,
        }}
        onClick={onStartWave}
        disabled={!canStartWave}
      >
        ▶ 開始
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: 'rgba(10,15,30,0.85)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    justifyContent: 'center',
    flexWrap: 'wrap',
    borderTop: '1px solid rgba(0,240,255,0.15)',
  },
  button: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '60px',
    minHeight: '52px',
    padding: '6px 12px',
    border: '2px solid rgba(255,255,255,0.15)',
    borderRadius: '8px',
    backgroundColor: 'rgba(10,15,30,0.6)',
    color: '#e0e8ff',
    cursor: 'pointer',
    fontFamily: "'Orbitron', 'Courier New', monospace",
    fontSize: '12px',
    touchAction: 'manipulation',
    transition: 'box-shadow 0.2s, border-color 0.2s',
  },
  symbol: {
    fontSize: '22px',
    lineHeight: 1,
  },
  cost: {
    fontSize: '11px',
  },
  startButton: {
    backgroundColor: 'rgba(0,255,136,0.1)',
    borderColor: '#00ff88',
    color: '#00ff88',
    fontSize: '14px',
    fontWeight: 'bold',
    textShadow: '0 0 8px rgba(0,255,136,0.5)',
  },
};
