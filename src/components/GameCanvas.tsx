import { useRef, useEffect, useCallback } from 'react';
import { GameState, MapData, TowerType, GridPosition } from '../game/types';
import {
  RenderContext,
  createRenderContext,
  render,
  screenToGrid,
} from '../rendering/renderer';

interface Props {
  state: GameState;
  map: MapData;
  selectedTower: TowerType | null;
  selectedPlacedTower: number | null;
  onCellClick: (pos: GridPosition) => void;
  onCellHover: (pos: GridPosition | null) => void;
}

export function GameCanvas({
  state,
  map,
  selectedTower,
  selectedPlacedTower,
  onCellClick,
  onCellHover,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rcRef = useRef<RenderContext | null>(null);
  const hoverRef = useRef<GridPosition | null>(null);

  const updateSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const w = parent.clientWidth;
    const h = parent.clientHeight;
    canvas.width = w;
    canvas.height = h;

    if (rcRef.current) {
      const cs = Math.floor(Math.min(w / map.cols, h / map.rows));
      rcRef.current.cellSize = cs;
      rcRef.current.offsetX = Math.floor((w - cs * map.cols) / 2);
      rcRef.current.offsetY = Math.floor((h - cs * map.rows) / 2);
    }
  }, [map]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rc = createRenderContext(canvas);
    if (!rc) return;
    rcRef.current = rc;
    updateSize();

    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [updateSize]);

  // Render every frame
  useEffect(() => {
    const rc = rcRef.current;
    if (!rc) return;
    render(rc, state, map, selectedTower, hoverRef.current, selectedPlacedTower);
  });

  const getGridPos = useCallback(
    (clientX: number, clientY: number): GridPosition | null => {
      const canvas = canvasRef.current;
      const rc = rcRef.current;
      if (!canvas || !rc) return null;
      const rect = canvas.getBoundingClientRect();
      return screenToGrid(rc, clientX - rect.left, clientY - rect.top, map);
    },
    [map],
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const pos = getGridPos(e.clientX, e.clientY);
      if (pos) onCellClick(pos);
    },
    [getGridPos, onCellClick],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const pos = getGridPos(e.clientX, e.clientY);
      hoverRef.current = pos;
      onCellHover(pos);
    },
    [getGridPos, onCellHover],
  );

  const handleMouseLeave = useCallback(() => {
    hoverRef.current = null;
    onCellHover(null);
  }, [onCellHover]);

  const handleTouch = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (!touch) return;
      const pos = getGridPos(touch.clientX, touch.clientY);
      if (pos) onCellClick(pos);
    },
    [getGridPos, onCellClick],
  );

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouch}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  );
}
