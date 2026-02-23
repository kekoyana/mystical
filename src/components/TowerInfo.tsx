import { Tower, GameState } from '../game/types';
import { getTowerStats, SELL_REFUND_RATE } from '../game/balance';

interface Props {
  tower: Tower;
  state: GameState;
  onUpgrade: () => void;
  onSell: () => void;
  onClose: () => void;
}

const TOWER_NAMES: Record<string, string> = {
  archer: 'アーチャー',
  cannon: 'キャノン',
  ice: 'アイス',
  thunder: 'サンダー',
};

const TOWER_COLORS: Record<string, string> = {
  archer: '#00f0ff',
  cannon: '#ff4466',
  ice: '#aa44ff',
  thunder: '#ffaa00',
};

export function TowerInfo({ tower, state, onUpgrade, onSell, onClose }: Props) {
  const stats = getTowerStats(tower.type, tower.level);
  const maxLevel = stats.upgradeCost === 0;
  const canAffordUpgrade = !maxLevel && state.gold >= stats.upgradeCost;
  const sellValue = Math.floor(tower.totalInvested * SELL_REFUND_RATE);
  const towerColor = TOWER_COLORS[tower.type] ?? '#00f0ff';

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div
        style={{
          ...styles.panel,
          borderColor: `${towerColor}66`,
          boxShadow: `0 0 20px ${towerColor}22`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ ...styles.title, color: towerColor, textShadow: `0 0 10px ${towerColor}66` }}>
          {TOWER_NAMES[tower.type]} Lv.{tower.level + 1}
        </div>
        <div style={styles.statsRow}>攻撃力: {stats.damage}</div>
        <div style={styles.statsRow}>射程: {stats.range}</div>
        <div style={styles.statsRow}>攻撃速度: {(stats.fireRate / 1000).toFixed(1)}s</div>
        <div style={styles.buttons}>
          {!maxLevel && (
            <button
              style={{ ...styles.btn, ...styles.upgradeBtn, opacity: canAffordUpgrade ? 1 : 0.4 }}
              onClick={onUpgrade}
              disabled={!canAffordUpgrade}
            >
              強化 ({stats.upgradeCost}G)
            </button>
          )}
          {maxLevel && <div style={styles.maxLevel}>MAX</div>}
          <button style={{ ...styles.btn, ...styles.sellBtn }} onClick={onSell}>
            売却 (+{sellValue}G)
          </button>
        </div>
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
    zIndex: 10,
  },
  panel: {
    backgroundColor: 'rgba(10,15,30,0.92)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(0,240,255,0.3)',
    borderRadius: '12px',
    padding: '16px 20px',
    color: '#e0e8ff',
    fontFamily: "'Orbitron', 'Courier New', monospace",
    minWidth: '180px',
  },
  title: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '8px',
    textAlign: 'center',
  },
  statsRow: {
    fontSize: '12px',
    marginBottom: '4px',
    color: '#99aabb',
  },
  buttons: {
    display: 'flex',
    gap: '8px',
    marginTop: '12px',
  },
  btn: {
    flex: 1,
    padding: '8px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontFamily: "'Orbitron', 'Courier New', monospace",
    fontWeight: 'bold',
    fontSize: '11px',
    color: '#fff',
  },
  upgradeBtn: {
    backgroundColor: 'rgba(0,240,255,0.2)',
    border: '1px solid #00f0ff',
    color: '#00f0ff',
    textShadow: '0 0 6px rgba(0,240,255,0.4)',
  },
  sellBtn: {
    backgroundColor: 'rgba(255,68,102,0.2)',
    border: '1px solid #ff4466',
    color: '#ff4466',
    textShadow: '0 0 6px rgba(255,68,102,0.4)',
  },
  maxLevel: {
    flex: 1,
    padding: '8px',
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#ffaa00',
    textShadow: '0 0 8px rgba(255,170,0,0.5)',
  },
};
