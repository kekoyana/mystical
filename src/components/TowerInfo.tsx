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

export function TowerInfo({ tower, state, onUpgrade, onSell, onClose }: Props) {
  const stats = getTowerStats(tower.type, tower.level);
  const maxLevel = stats.upgradeCost === 0;
  const canAffordUpgrade = !maxLevel && state.gold >= stats.upgradeCost;
  const sellValue = Math.floor(tower.totalInvested * SELL_REFUND_RATE);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div style={styles.title}>
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
    backgroundColor: '#1a1a2eee',
    border: '2px solid #444',
    borderRadius: '12px',
    padding: '16px 20px',
    color: '#eee',
    fontFamily: 'monospace',
    minWidth: '180px',
  },
  title: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '8px',
    textAlign: 'center',
  },
  statsRow: {
    fontSize: '13px',
    marginBottom: '4px',
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
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: '12px',
    color: '#fff',
  },
  upgradeBtn: {
    backgroundColor: '#2980b9',
  },
  sellBtn: {
    backgroundColor: '#c0392b',
  },
  maxLevel: {
    flex: 1,
    padding: '8px',
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#f39c12',
  },
};
