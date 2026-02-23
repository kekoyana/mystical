import { useState, useCallback } from 'react';
import { TowerType, GridPosition, CellType } from './game/types';
import { startWave, placeTower, upgradeTower, sellTower, canPlaceTower } from './game/engine';
import { stage1 } from './game/maps/stage1';
import { useGameLoop } from './hooks/useGameLoop';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { TowerMenu } from './components/TowerMenu';
import { TowerInfo } from './components/TowerInfo';
import { ResultScreen } from './components/ResultScreen';

const map = stage1;

function App() {
  const { state, mutateState, reset } = useGameLoop(map);
  const [selectedTower, setSelectedTower] = useState<TowerType | null>(null);
  const [selectedPlacedTower, setSelectedPlacedTower] = useState<number | null>(null);
  const [, setHoverCell] = useState<GridPosition | null>(null);

  const handleCellClick = useCallback(
    (pos: GridPosition) => {
      // If placing a new tower
      if (selectedTower) {
        if (canPlaceTower(state, map, pos, selectedTower)) {
          mutateState((s) => {
            placeTower(s, map, pos, selectedTower);
          });
        }
        return;
      }

      // Check if clicking on an existing tower
      const cell = map.grid[pos.row][pos.col];
      if (cell === CellType.Buildable) {
        const tower = state.towers.find(
          (t) => t.pos.col === pos.col && t.pos.row === pos.row,
        );
        if (tower) {
          setSelectedPlacedTower(tower.id);
          return;
        }
      }

      // Deselect
      setSelectedPlacedTower(null);
    },
    [selectedTower, state, mutateState],
  );

  const handleStartWave = useCallback(() => {
    mutateState((s) => {
      startWave(s, map);
    });
  }, [mutateState]);

  const handleUpgrade = useCallback(() => {
    if (selectedPlacedTower === null) return;
    mutateState((s) => {
      upgradeTower(s, selectedPlacedTower);
    });
  }, [selectedPlacedTower, mutateState]);

  const handleSell = useCallback(() => {
    if (selectedPlacedTower === null) return;
    mutateState((s) => {
      sellTower(s, selectedPlacedTower);
    });
    setSelectedPlacedTower(null);
  }, [selectedPlacedTower, mutateState]);

  const handleRetry = useCallback(() => {
    reset();
    setSelectedTower(null);
    setSelectedPlacedTower(null);
  }, [reset]);

  const handleSelectTower = useCallback((type: TowerType | null) => {
    setSelectedTower(type);
    setSelectedPlacedTower(null);
  }, []);

  const selectedTowerEntity =
    selectedPlacedTower !== null
      ? state.towers.find((t) => t.id === selectedPlacedTower) ?? null
      : null;

  const canStart = state.phase === 'preparing';
  const isFinished = state.phase === 'won' || state.phase === 'lost';

  return (
    <div style={styles.root}>
      <HUD state={state} />
      <div style={styles.canvasContainer}>
        <GameCanvas
          state={state}
          map={map}
          selectedTower={selectedTower}
          selectedPlacedTower={selectedPlacedTower}
          onCellClick={handleCellClick}
          onCellHover={setHoverCell}
        />
        {selectedTowerEntity && (
          <TowerInfo
            tower={selectedTowerEntity}
            state={state}
            onUpgrade={handleUpgrade}
            onSell={handleSell}
            onClose={() => setSelectedPlacedTower(null)}
          />
        )}
        {isFinished && <ResultScreen state={state} onRetry={handleRetry} />}
      </div>
      <TowerMenu
        state={state}
        selectedTower={selectedTower}
        onSelectTower={handleSelectTower}
        onStartWave={handleStartWave}
        canStartWave={canStart}
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100dvh',
    width: '100vw',
    overflow: 'hidden',
    backgroundColor: '#1a1a2e',
  },
  canvasContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
};

export default App;
