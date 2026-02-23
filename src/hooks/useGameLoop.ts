import { useRef, useEffect, useCallback, useState } from 'react';
import { GameState, MapData } from '../game/types';
import { createInitialState, updateGame } from '../game/engine';
import { playShootSound, playEnemyDeathSound, playHitBaseSound } from '../audio/soundEngine';

// Throttle SE to avoid audio overload
let lastShootTime = 0;
let lastDeathTime = 0;
const SHOOT_THROTTLE = 80; // ms
const DEATH_THROTTLE = 50;

function processEvents(events: GameState['events']): void {
  const now = performance.now();

  for (const ev of events) {
    switch (ev.type) {
      case 'shoot':
        if (now - lastShootTime > SHOOT_THROTTLE) {
          playShootSound(ev.towerType);
          lastShootTime = now;
        }
        break;
      case 'enemyDeath':
        if (now - lastDeathTime > DEATH_THROTTLE) {
          playEnemyDeathSound();
          lastDeathTime = now;
        }
        break;
      case 'hitBase':
        playHitBaseSound();
        break;
    }
  }
}

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
      updateGame(s, map, dt * s.speed);
      processEvents(s.events);
    }

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
