import { useRef, useEffect, useCallback, useState } from 'react';
import { GameState, MapData } from '../game/types';
import { createInitialState, updateGame } from '../game/engine';

export function useGameLoop(map: MapData) {
  const stateRef = useRef<GameState>(createInitialState(map));
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const [, setFrame] = useState(0);

  const tick = useCallback((timestamp: number) => {
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = timestamp;
    }
    const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1);
    lastTimeRef.current = timestamp;

    const s = stateRef.current;
    if (s.phase !== 'won' && s.phase !== 'lost') {
      updateGame(s, map, dt);
    }

    // Trigger React re-render
    setFrame((f) => f + 1);
    rafRef.current = requestAnimationFrame(tick);
  }, [map]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  const mutateState = useCallback((fn: (s: GameState) => void) => {
    fn(stateRef.current);
    setFrame((f) => f + 1);
  }, []);

  const reset = useCallback(() => {
    lastTimeRef.current = 0;
    stateRef.current = createInitialState(map);
    setFrame((f) => f + 1);
  }, [map]);

  return { state: stateRef.current, stateRef, mutateState, reset };
}
