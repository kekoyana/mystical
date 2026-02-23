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
  emoji: string;
}

const TOWER_OPTIONS: TowerOption[] = [
  { type: 'archer', label: 'アーチャー', emoji: '🏹' },
  { type: 'cannon', label: 'キャノン', emoji: '💣' },
  { type: 'ice', label: 'アイス', emoji: '❄️' },
  { type: 'thunder', label: 'サンダー', emoji: '⚡' },
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
              ...(isSelected ? styles.selected : {}),
              opacity: affordable ? 1 : 0.4,
            }}
            onClick={() => onSelectTower(isSelected ? null : opt.type)}
            disabled={!affordable}
          >
            <span style={styles.emoji}>{opt.emoji}</span>
            <span style={styles.cost}>{stats.cost}G</span>
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
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  button: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '60px',
    minHeight: '52px',
    padding: '6px 12px',
    border: '2px solid #444',
    borderRadius: '8px',
    backgroundColor: '#2a2a4e',
    color: '#eee',
    cursor: 'pointer',
    fontFamily: 'monospace',
    fontSize: '12px',
    touchAction: 'manipulation',
  },
  selected: {
    borderColor: '#f39c12',
    backgroundColor: '#3a3a5e',
  },
  emoji: {
    fontSize: '22px',
  },
  cost: {
    fontSize: '11px',
    color: '#f39c12',
  },
  startButton: {
    backgroundColor: '#27ae60',
    borderColor: '#2ecc71',
    fontSize: '14px',
    fontWeight: 'bold',
  },
};
