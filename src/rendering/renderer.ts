import { GameState, MapData, CellType, Tower, Enemy, Projectile, TowerType, GridPosition } from '../game/types';
import { getTowerStats } from '../game/balance';

// === Colors ===

const COLORS = {
  fieldBg: '#4a7c59',
  path: '#c4a265',
  blocked: '#3a5a40',
  buildable: '#5a8f6a',
  buildableHover: '#6aaf7a',
  gridLine: 'rgba(0,0,0,0.15)',
  tower: {
    archer: '#8B4513',
    cannon: '#696969',
    ice: '#00BFFF',
    thunder: '#FFD700',
  } as Record<string, string>,
  enemy: {
    goblin: '#e74c3c',
    wolf: '#c0392b',
    golem: '#7f8c8d',
    darkMage: '#9b59b6',
    dragon: '#e67e22',
  } as Record<string, string>,
  projectile: '#ffec44',
  hpBar: '#2ecc71',
  hpBarBg: '#555',
  rangeCircle: 'rgba(255,255,255,0.12)',
  spawnPoint: '#27ae60',
  goalPoint: '#e74c3c',
};

export interface RenderContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  cellSize: number;
  offsetX: number;
  offsetY: number;
}

export function createRenderContext(canvas: HTMLCanvasElement): RenderContext | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  return { canvas, ctx, cellSize: 0, offsetX: 0, offsetY: 0 };
}

export function render(
  rc: RenderContext,
  state: GameState,
  map: MapData,
  selectedTower: TowerType | null,
  hoverCell: GridPosition | null,
  selectedPlacedTower: number | null,
): void {
  const { ctx, cellSize, offsetX, offsetY } = rc;
  const w = rc.canvas.width;
  const h = rc.canvas.height;

  // Clear
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, w, h);

  // Draw grid
  for (let row = 0; row < map.rows; row++) {
    for (let col = 0; col < map.cols; col++) {
      const cell = map.grid[row][col];
      const x = offsetX + col * cellSize;
      const y = offsetY + row * cellSize;

      switch (cell) {
        case CellType.Path:
          ctx.fillStyle = COLORS.path;
          break;
        case CellType.Buildable:
          if (hoverCell && hoverCell.col === col && hoverCell.row === row && selectedTower) {
            ctx.fillStyle = COLORS.buildableHover;
          } else {
            ctx.fillStyle = COLORS.buildable;
          }
          break;
        case CellType.Blocked:
          ctx.fillStyle = COLORS.blocked;
          break;
        case CellType.Spawn:
          ctx.fillStyle = COLORS.spawnPoint;
          break;
        case CellType.Goal:
          ctx.fillStyle = COLORS.goalPoint;
          break;
      }
      ctx.fillRect(x, y, cellSize, cellSize);

      // Grid lines
      ctx.strokeStyle = COLORS.gridLine;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, cellSize, cellSize);
    }
  }

  // Draw selected tower range
  if (selectedPlacedTower !== null) {
    const tower = state.towers.find((t) => t.id === selectedPlacedTower);
    if (tower) {
      drawRange(ctx, tower, cellSize, offsetX, offsetY);
    }
  }

  // Draw towers
  for (const tower of state.towers) {
    drawTower(ctx, tower, cellSize, offsetX, offsetY, tower.id === selectedPlacedTower);
  }

  // Draw enemies
  for (const enemy of state.enemies) {
    drawEnemy(ctx, enemy, cellSize, offsetX, offsetY);
  }

  // Draw projectiles
  for (const proj of state.projectiles) {
    drawProjectile(ctx, proj, cellSize, offsetX, offsetY);
  }

  // Draw hover preview
  if (hoverCell && selectedTower) {
    drawTowerPreview(ctx, selectedTower, hoverCell, cellSize, offsetX, offsetY);
  }
}

function drawRange(
  ctx: CanvasRenderingContext2D,
  tower: Tower,
  cellSize: number,
  ox: number,
  oy: number,
): void {
  const stats = getTowerStats(tower.type, tower.level);
  const cx = ox + (tower.pos.col + 0.5) * cellSize;
  const cy = oy + (tower.pos.row + 0.5) * cellSize;
  const r = stats.range * cellSize;
  ctx.fillStyle = COLORS.rangeCircle;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawTower(
  ctx: CanvasRenderingContext2D,
  tower: Tower,
  cellSize: number,
  ox: number,
  oy: number,
  selected: boolean,
): void {
  const x = ox + tower.pos.col * cellSize;
  const y = oy + tower.pos.row * cellSize;
  const cx = x + cellSize / 2;
  const cy = y + cellSize / 2;
  const r = cellSize * 0.35;

  ctx.fillStyle = COLORS.tower[tower.type] ?? '#888';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Level indicator
  if (tower.level > 0) {
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.floor(cellSize * 0.3)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${tower.level + 1}`, cx, cy);
  }

  // Selection highlight
  if (selected) {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 3, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawTowerPreview(
  ctx: CanvasRenderingContext2D,
  type: TowerType,
  pos: GridPosition,
  cellSize: number,
  ox: number,
  oy: number,
): void {
  const x = ox + pos.col * cellSize;
  const y = oy + pos.row * cellSize;
  const cx = x + cellSize / 2;
  const cy = y + cellSize / 2;
  const r = cellSize * 0.35;

  ctx.globalAlpha = 0.5;
  ctx.fillStyle = COLORS.tower[type] ?? '#888';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Range preview
  const stats = getTowerStats(type, 0);
  const rangeR = stats.range * cellSize;
  ctx.fillStyle = COLORS.rangeCircle;
  ctx.beginPath();
  ctx.arc(cx, cy, rangeR, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 1;
}

function drawEnemy(
  ctx: CanvasRenderingContext2D,
  enemy: Enemy,
  cellSize: number,
  ox: number,
  oy: number,
): void {
  const cx = ox + enemy.pos.x * cellSize;
  const cy = oy + enemy.pos.y * cellSize;
  const r = cellSize * 0.28;

  // Body
  ctx.fillStyle = COLORS.enemy[enemy.type] ?? '#e74c3c';

  if (enemy.type === 'golem' || enemy.type === 'dragon') {
    // Square for big enemies
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  } else {
    // Circle for others
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Slow indicator
  if (enemy.slowTimer > 0) {
    ctx.strokeStyle = '#00BFFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 2, 0, Math.PI * 2);
    ctx.stroke();
  }

  // HP bar
  const barW = cellSize * 0.6;
  const barH = 3;
  const barX = cx - barW / 2;
  const barY = cy - r - 6;
  const hpRatio = enemy.hp / enemy.maxHp;

  ctx.fillStyle = COLORS.hpBarBg;
  ctx.fillRect(barX, barY, barW, barH);
  ctx.fillStyle = hpRatio > 0.5 ? COLORS.hpBar : hpRatio > 0.25 ? '#f39c12' : '#e74c3c';
  ctx.fillRect(barX, barY, barW * hpRatio, barH);
}

function drawProjectile(
  ctx: CanvasRenderingContext2D,
  proj: Projectile,
  cellSize: number,
  ox: number,
  oy: number,
): void {
  const cx = ox + proj.pos.x * cellSize;
  const cy = oy + proj.pos.y * cellSize;
  const r = cellSize * 0.08;

  ctx.fillStyle = COLORS.projectile;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

// === Utility: screen position to grid position ===

export function screenToGrid(
  rc: RenderContext,
  screenX: number,
  screenY: number,
  map: MapData,
): GridPosition | null {
  const col = Math.floor((screenX - rc.offsetX) / rc.cellSize);
  const row = Math.floor((screenY - rc.offsetY) / rc.cellSize);
  if (col < 0 || col >= map.cols || row < 0 || row >= map.rows) return null;
  return { col, row };
}
