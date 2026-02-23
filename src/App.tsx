import { useState, useCallback, useEffect, useRef } from 'react';
import { TowerType, GridPosition, CellType, MapData } from './game/types';
import { startWave, placeTower, upgradeTower, sellTower, canPlaceTower } from './game/engine';
import { stages } from './game/maps';
import { useGameLoop } from './hooks/useGameLoop';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { TowerMenu } from './components/TowerMenu';
import { TowerInfo } from './components/TowerInfo';
import { ResultScreen } from './components/ResultScreen';
import { TitleScreen } from './components/screens/TitleScreen';
import { StageSelectScreen } from './components/screens/StageSelectScreen';
import {
  startBGM, stopBGM, toggleMute, isMuted,
  playPlaceSound, playSellSound, playUpgradeSound,
  playWaveStartSound, playWinSound, playLoseSound,
} from './audio/soundEngine';

type Screen = 'title' | 'stageSelect' | 'game';

const SAVE_KEY = 'td-cleared-stages';

function loadClearedStages(): Set<string> {
  try {
    const data = localStorage.getItem(SAVE_KEY);
    if (data) return new Set(JSON.parse(data));
  } catch { /* ignore */ }
  return new Set();
}

function saveClearedStages(s: Set<string>): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify([...s]));
}

function App() {
  const [screen, setScreen] = useState<Screen>('title');
  const [currentMap, setCurrentMap] = useState<MapData>(stages[0]);
  const [clearedStages, setClearedStages] = useState<Set<string>>(loadClearedStages);

  return (
    <>
      {screen === 'title' && (
        <TitleScreen onStart={() => setScreen('stageSelect')} />
      )}
      {screen === 'stageSelect' && (
        <StageSelectScreen
          clearedStages={clearedStages}
          onSelectStage={(map) => {
            setCurrentMap(map);
            setScreen('game');
          }}
          onBack={() => setScreen('title')}
        />
      )}
      {screen === 'game' && (
        <GameScreen
          key={currentMap.id}
          map={currentMap}
          onClear={(stageId) => {
            const next = new Set(clearedStages);
            next.add(stageId);
            setClearedStages(next);
            saveClearedStages(next);
          }}
          onBack={() => {
            stopBGM();
            setScreen('stageSelect');
          }}
        />
      )}
    </>
  );
}

interface GameScreenProps {
  map: MapData;
  onClear: (stageId: string) => void;
  onBack: () => void;
}

function GameScreen({ map, onClear, onBack }: GameScreenProps) {
  const { state, mutateState, reset } = useGameLoop(map);
  const [selectedTower, setSelectedTower] = useState<TowerType | null>(null);
  const [selectedPlacedTower, setSelectedPlacedTower] = useState<number | null>(null);
  const [, setHoverCell] = useState<GridPosition | null>(null);
  const prevPhaseRef = useRef(state.phase);

  // Start BGM on mount
  useEffect(() => {
    startBGM();
    return () => stopBGM();
  }, []);

  // Sound effects on phase change
  useEffect(() => {
    if (prevPhaseRef.current !== state.phase) {
      if (state.phase === 'won') {
        stopBGM();
        playWinSound();
        onClear(map.id);
      } else if (state.phase === 'lost') {
        stopBGM();
        playLoseSound();
      }
      prevPhaseRef.current = state.phase;
    }
  }, [state.phase, map.id, onClear]);

  const handleCellClick = useCallback(
    (pos: GridPosition) => {
      if (selectedTower) {
        if (canPlaceTower(state, map, pos, selectedTower)) {
          mutateState((s) => {
            placeTower(s, map, pos, selectedTower);
          });
          playPlaceSound();
        }
        return;
      }

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
      setSelectedPlacedTower(null);
    },
    [selectedTower, state, mutateState, map],
  );

  const handleStartWave = useCallback(() => {
    mutateState((s) => startWave(s, map));
    playWaveStartSound();
  }, [mutateState, map]);

  const handleUpgrade = useCallback(() => {
    if (selectedPlacedTower === null) return;
    const ok = upgradeTower(state, selectedPlacedTower);
    if (ok) {
      mutateState(() => {}); // trigger re-render (already mutated)
      playUpgradeSound();
    }
  }, [selectedPlacedTower, state, mutateState]);

  const handleSell = useCallback(() => {
    if (selectedPlacedTower === null) return;
    mutateState((s) => sellTower(s, selectedPlacedTower));
    setSelectedPlacedTower(null);
    playSellSound();
  }, [selectedPlacedTower, mutateState]);

  const handleRetry = useCallback(() => {
    reset();
    setSelectedTower(null);
    setSelectedPlacedTower(null);
    startBGM();
  }, [reset]);

  const handleSelectTower = useCallback((type: TowerType | null) => {
    setSelectedTower(type);
    setSelectedPlacedTower(null);
  }, []);

  const handleToggleSpeed = useCallback(() => {
    mutateState((s) => {
      s.speed = s.speed === 1 ? 2 : 1;
    });
  }, [mutateState]);

  const handleToggleMute = useCallback(() => {
    toggleMute();
    // Force re-render
    mutateState(() => {});
  }, [mutateState]);

  const selectedTowerEntity =
    selectedPlacedTower !== null
      ? state.towers.find((t) => t.id === selectedPlacedTower) ?? null
      : null;

  const canStart = state.phase === 'preparing';
  const isFinished = state.phase === 'won' || state.phase === 'lost';

  return (
    <div style={styles.root}>
      <HUD
        state={state}
        mapName={map.name}
        onBack={onBack}
        onToggleSpeed={handleToggleSpeed}
        onToggleMute={handleToggleMute}
        muted={isMuted()}
      />
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
        {isFinished && (
          <ResultScreen
            state={state}
            stageId={map.id}
            onRetry={handleRetry}
            onBack={onBack}
          />
        )}
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
