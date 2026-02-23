import { GameState, MapData, CellType, Tower, Enemy, Projectile, TowerType, GridPosition, Effect } from '../game/types';
import { getTowerStats } from '../game/balance';

// === Neo-Crystal Color Palette ===

const COLORS = {
  fieldBg: '#0d0d1a',
  path: '#1a1a3a',
  blocked: '#080812',
  buildable: '#111128',
  buildableHover: '#1a1a44',
  gridLine: 'rgba(0,240,255,0.06)',
  tower: {
    archer: '#00f0ff',
    cannon: '#ff4466',
    ice: '#aa44ff',
    thunder: '#ffaa00',
  } as Record<string, string>,
  enemy: {
    goblin: '#ff0066',
    wolf: '#ff3300',
    golem: '#8888aa',
    darkMage: '#cc00ff',
    dragon: '#ff8800',
  } as Record<string, string>,
  projectile: '#ffffff',
  hpBar: '#00ff88',
  hpBarBg: 'rgba(255,255,255,0.15)',
  rangeCircle: 'rgba(0,240,255,0.08)',
  spawnPoint: '#00ff88',
  goalPoint: '#ff0066',
  pathEdge: 'rgba(0,240,255,0.15)',
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
  const t = state.elapsedTime;

  ctx.fillStyle = '#0a0a1a';
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
          ctx.fillRect(x, y, cellSize, cellSize);
          ctx.strokeStyle = COLORS.pathEdge;
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
          break;
        case CellType.Buildable:
          if (hoverCell && hoverCell.col === col && hoverCell.row === row && selectedTower) {
            ctx.fillStyle = COLORS.buildableHover;
          } else {
            ctx.fillStyle = COLORS.buildable;
          }
          ctx.fillRect(x, y, cellSize, cellSize);
          ctx.strokeStyle = COLORS.gridLine;
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 5]);
          ctx.strokeRect(x, y, cellSize, cellSize);
          ctx.setLineDash([]);
          break;
        case CellType.Blocked:
          ctx.fillStyle = COLORS.blocked;
          ctx.fillRect(x, y, cellSize, cellSize);
          break;
        case CellType.Spawn: {
          ctx.fillStyle = COLORS.path;
          ctx.fillRect(x, y, cellSize, cellSize);
          const spawnAlpha = 0.3 + 0.25 * Math.sin(t * 3);
          ctx.fillStyle = `rgba(0,255,136,${spawnAlpha})`;
          ctx.fillRect(x, y, cellSize, cellSize);
          ctx.strokeStyle = COLORS.spawnPoint;
          ctx.lineWidth = 2;
          ctx.strokeRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
          break;
        }
        case CellType.Goal: {
          ctx.fillStyle = COLORS.path;
          ctx.fillRect(x, y, cellSize, cellSize);
          const goalAlpha = 0.3 + 0.25 * Math.sin(t * 3 + Math.PI);
          ctx.fillStyle = `rgba(255,0,102,${goalAlpha})`;
          ctx.fillRect(x, y, cellSize, cellSize);
          ctx.strokeStyle = COLORS.goalPoint;
          ctx.lineWidth = 2;
          ctx.strokeRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
          break;
        }
      }

      if (cell !== CellType.Path && cell !== CellType.Spawn && cell !== CellType.Goal && cell !== CellType.Buildable) {
        ctx.strokeStyle = COLORS.gridLine;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, cellSize, cellSize);
      }
    }
  }

  // Draw selected tower range
  if (selectedPlacedTower !== null) {
    const tower = state.towers.find((t) => t.id === selectedPlacedTower);
    if (tower) {
      drawRange(ctx, tower, cellSize, offsetX, offsetY, t);
    }
  }

  // Draw towers
  for (const tower of state.towers) {
    drawTower(ctx, tower, cellSize, offsetX, offsetY, tower.id === selectedPlacedTower, t);
  }

  // Draw enemies
  for (const enemy of state.enemies) {
    drawEnemy(ctx, enemy, cellSize, offsetX, offsetY, t);
  }

  // Draw projectiles
  for (const proj of state.projectiles) {
    drawProjectile(ctx, proj, cellSize, offsetX, offsetY);
  }

  // Draw effects
  for (const effect of state.effects) {
    drawEffect(ctx, effect, cellSize, offsetX, offsetY, t);
  }

  // Draw hover preview
  if (hoverCell && selectedTower) {
    drawTowerPreview(ctx, selectedTower, hoverCell, cellSize, offsetX, offsetY, t);
  }
}

function drawRange(
  ctx: CanvasRenderingContext2D,
  tower: Tower,
  cellSize: number,
  ox: number,
  oy: number,
  t: number,
): void {
  const stats = getTowerStats(tower.type, tower.level);
  const cx = ox + (tower.pos.col + 0.5) * cellSize;
  const cy = oy + (tower.pos.row + 0.5) * cellSize;
  const r = stats.range * cellSize;
  const color = COLORS.tower[tower.type] ?? '#00f0ff';

  ctx.fillStyle = `${color}11`;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = `${color}44`;
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 6]);
  ctx.lineDashOffset = -t * 20;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.lineDashOffset = 0;
}

// =============================================
//  TOWER DRAWING — Character-style figures
// =============================================

function drawTowerCharacter(
  ctx: CanvasRenderingContext2D,
  type: TowerType,
  cx: number,
  cy: number,
  s: number, // scale unit (cellSize)
  level: number,
  t: number,
): void {
  const color = COLORS.tower[type] ?? '#888';
  const glowR = 6 + level * 3;

  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = glowR;

  switch (type) {
    case 'archer':
      drawArcherChar(ctx, cx, cy, s, color, level, t);
      break;
    case 'cannon':
      drawCannonChar(ctx, cx, cy, s, color, level, t);
      break;
    case 'ice':
      drawIceMageChar(ctx, cx, cy, s, color, level, t);
      break;
    case 'thunder':
      drawThunderChar(ctx, cx, cy, s, color, level, t);
      break;
  }

  ctx.restore();
}

// --- Archer: hooded ranger with bow ---
function drawArcherChar(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, color: string, level: number, _t: number): void {
  const u = s * 0.025; // unit for proportional drawing

  // Cloak / body — trapezoid
  ctx.fillStyle = '#0a2233';
  ctx.beginPath();
  ctx.moveTo(cx - 6 * u, cy + 2 * u);
  ctx.lineTo(cx + 6 * u, cy + 2 * u);
  ctx.lineTo(cx + 8 * u, cy + 15 * u);
  ctx.lineTo(cx - 8 * u, cy + 15 * u);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Hood
  ctx.fillStyle = '#0a2233';
  ctx.beginPath();
  ctx.moveTo(cx - 8 * u, cy - 2 * u);
  ctx.lineTo(cx, cy - 12 * u);
  ctx.lineTo(cx + 8 * u, cy - 2 * u);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Face (small dark area under hood)
  ctx.fillStyle = '#112244';
  ctx.beginPath();
  ctx.arc(cx, cy - 2 * u, 5 * u, 0, Math.PI * 2);
  ctx.fill();

  // Glowing eyes
  ctx.fillStyle = color;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(cx - 2.5 * u, cy - 3 * u, 1.2 * u, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 2.5 * u, cy - 3 * u, 1.2 * u, 0, Math.PI * 2);
  ctx.fill();

  // Bow (arc on the right side)
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.arc(cx + 10 * u, cy, 10 * u, Math.PI * 0.65, Math.PI * 1.35);
  ctx.stroke();
  // Bowstring
  ctx.strokeStyle = `${color}88`;
  ctx.lineWidth = 0.8;
  const bowTopX = cx + 10 * u + Math.cos(Math.PI * 0.65) * 10 * u;
  const bowTopY = cy + Math.sin(Math.PI * 0.65) * 10 * u;
  const bowBotX = cx + 10 * u + Math.cos(Math.PI * 1.35) * 10 * u;
  const bowBotY = cy + Math.sin(Math.PI * 1.35) * 10 * u;
  ctx.beginPath();
  ctx.moveTo(bowTopX, bowTopY);
  ctx.lineTo(bowBotX, bowBotY);
  ctx.stroke();

  // Level stars
  if (level > 0) {
    drawLevelIndicator(ctx, cx, cy + 13 * u, level, color, u);
  }
}

// --- Cannon: armored mech with cannon barrel ---
function drawCannonChar(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, color: string, level: number, _t: number): void {
  const u = s * 0.025;

  // Legs
  ctx.fillStyle = '#1a1020';
  ctx.fillRect(cx - 6 * u, cy + 8 * u, 4 * u, 7 * u);
  ctx.fillRect(cx + 2 * u, cy + 8 * u, 4 * u, 7 * u);
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.8;
  ctx.strokeRect(cx - 6 * u, cy + 8 * u, 4 * u, 7 * u);
  ctx.strokeRect(cx + 2 * u, cy + 8 * u, 4 * u, 7 * u);

  // Body — heavy armor block
  ctx.fillStyle = '#1a1020';
  ctx.beginPath();
  ctx.moveTo(cx - 9 * u, cy - 2 * u);
  ctx.lineTo(cx + 9 * u, cy - 2 * u);
  ctx.lineTo(cx + 10 * u, cy + 10 * u);
  ctx.lineTo(cx - 10 * u, cy + 10 * u);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Armor chest plate glow line
  ctx.strokeStyle = `${color}66`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - 6 * u, cy + 1 * u);
  ctx.lineTo(cx + 6 * u, cy + 1 * u);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 5 * u, cy + 4 * u);
  ctx.lineTo(cx + 5 * u, cy + 4 * u);
  ctx.stroke();

  // Head — blocky helmet
  ctx.fillStyle = '#1a1020';
  ctx.fillRect(cx - 6 * u, cy - 11 * u, 12 * u, 10 * u);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2;
  ctx.strokeRect(cx - 6 * u, cy - 11 * u, 12 * u, 10 * u);

  // Visor (horizontal slit with glow)
  ctx.fillStyle = color;
  ctx.shadowBlur = 10;
  ctx.fillRect(cx - 5 * u, cy - 7 * u, 10 * u, 2.5 * u);

  // Cannon barrel (extending right from shoulder)
  ctx.shadowBlur = 6;
  ctx.fillStyle = '#1a1020';
  ctx.fillRect(cx + 8 * u, cy - 4 * u, 10 * u, 4 * u);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.strokeRect(cx + 8 * u, cy - 4 * u, 10 * u, 4 * u);
  // Barrel tip glow
  ctx.fillStyle = color;
  ctx.fillRect(cx + 17 * u, cy - 5 * u, 2 * u, 6 * u);

  if (level > 0) {
    drawLevelIndicator(ctx, cx, cy + 13 * u, level, color, u);
  }
}

// --- Ice Mage: floating crystal sorceress ---
function drawIceMageChar(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, color: string, level: number, t: number): void {
  const u = s * 0.025;
  const floatY = Math.sin(t * 2) * 2 * u; // gentle floating animation

  // Robe / body — flowing triangular shape
  ctx.fillStyle = '#120a22';
  ctx.beginPath();
  ctx.moveTo(cx - 5 * u, cy + floatY);
  ctx.lineTo(cx + 5 * u, cy + floatY);
  ctx.lineTo(cx + 10 * u, cy + 15 * u + floatY);
  ctx.lineTo(cx - 10 * u, cy + 15 * u + floatY);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Robe glow lines
  ctx.strokeStyle = `${color}44`;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(cx, cy + 2 * u + floatY);
  ctx.lineTo(cx - 3 * u, cy + 13 * u + floatY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy + 2 * u + floatY);
  ctx.lineTo(cx + 3 * u, cy + 13 * u + floatY);
  ctx.stroke();

  // Head — glowing orb
  ctx.fillStyle = '#120a22';
  ctx.beginPath();
  ctx.arc(cx, cy - 5 * u + floatY, 6 * u, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Eyes
  ctx.fillStyle = color;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(cx - 2.5 * u, cy - 5 * u + floatY, 1.2 * u, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 2.5 * u, cy - 5 * u + floatY, 1.2 * u, 0, Math.PI * 2);
  ctx.fill();

  // Orbiting crystal shards
  for (let i = 0; i < 3; i++) {
    const angle = t * 1.5 + (Math.PI * 2 * i) / 3;
    const orbitR = 12 * u;
    const ox = cx + Math.cos(angle) * orbitR;
    const oy = cy + 2 * u + floatY + Math.sin(angle) * orbitR * 0.4;
    ctx.fillStyle = color;
    ctx.shadowBlur = 10;
    // Small diamond shard
    ctx.beginPath();
    ctx.moveTo(ox, oy - 2.5 * u);
    ctx.lineTo(ox + 1.5 * u, oy);
    ctx.lineTo(ox, oy + 2.5 * u);
    ctx.lineTo(ox - 1.5 * u, oy);
    ctx.closePath();
    ctx.fill();
  }

  // Staff (left side)
  ctx.strokeStyle = `${color}aa`;
  ctx.lineWidth = 1.5;
  ctx.shadowBlur = 4;
  ctx.beginPath();
  ctx.moveTo(cx - 9 * u, cy - 10 * u + floatY);
  ctx.lineTo(cx - 7 * u, cy + 12 * u + floatY);
  ctx.stroke();
  // Staff tip crystal
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx - 9 * u, cy - 14 * u + floatY);
  ctx.lineTo(cx - 7 * u, cy - 10 * u + floatY);
  ctx.lineTo(cx - 11 * u, cy - 10 * u + floatY);
  ctx.closePath();
  ctx.fill();

  if (level > 0) {
    drawLevelIndicator(ctx, cx, cy + 13 * u + floatY, level, color, u);
  }
}

// --- Thunder: lightning warrior with electric aura ---
function drawThunderChar(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, color: string, level: number, t: number): void {
  const u = s * 0.025;

  // Legs
  ctx.fillStyle = '#1a1508';
  ctx.fillRect(cx - 5 * u, cy + 7 * u, 3.5 * u, 8 * u);
  ctx.fillRect(cx + 1.5 * u, cy + 7 * u, 3.5 * u, 8 * u);
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.8;
  ctx.strokeRect(cx - 5 * u, cy + 7 * u, 3.5 * u, 8 * u);
  ctx.strokeRect(cx + 1.5 * u, cy + 7 * u, 3.5 * u, 8 * u);

  // Body — athletic build
  ctx.fillStyle = '#1a1508';
  ctx.beginPath();
  ctx.moveTo(cx - 7 * u, cy - 2 * u);
  ctx.lineTo(cx + 7 * u, cy - 2 * u);
  ctx.lineTo(cx + 8 * u, cy + 9 * u);
  ctx.lineTo(cx - 8 * u, cy + 9 * u);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Lightning bolt emblem on chest
  ctx.fillStyle = color;
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.moveTo(cx - 1 * u, cy);
  ctx.lineTo(cx + 2 * u, cy);
  ctx.lineTo(cx, cy + 3 * u);
  ctx.lineTo(cx + 3 * u, cy + 3 * u);
  ctx.lineTo(cx - 1 * u, cy + 7 * u);
  ctx.lineTo(cx + 1 * u, cy + 4 * u);
  ctx.lineTo(cx - 2 * u, cy + 4 * u);
  ctx.closePath();
  ctx.fill();

  // Arms (outstretched, holding energy)
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.shadowBlur = 4;
  // Left arm
  ctx.beginPath();
  ctx.moveTo(cx - 7 * u, cy);
  ctx.lineTo(cx - 13 * u, cy - 4 * u);
  ctx.stroke();
  // Right arm
  ctx.beginPath();
  ctx.moveTo(cx + 7 * u, cy);
  ctx.lineTo(cx + 13 * u, cy - 4 * u);
  ctx.stroke();

  // Head
  ctx.fillStyle = '#1a1508';
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(cx, cy - 7 * u, 5.5 * u, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Spiky hair (electric)
  ctx.fillStyle = color;
  ctx.shadowBlur = 8;
  for (let i = 0; i < 5; i++) {
    const angle = -Math.PI * 0.8 + (Math.PI * 0.6 * i) / 4;
    const spikeLen = (4 + Math.sin(t * 6 + i * 2) * 1.5) * u;
    const baseX = cx + Math.cos(angle) * 5 * u;
    const baseY = cy - 7 * u + Math.sin(angle) * 5 * u;
    const tipX = cx + Math.cos(angle) * (5 * u + spikeLen);
    const tipY = cy - 7 * u + Math.sin(angle) * (5 * u + spikeLen);
    ctx.beginPath();
    ctx.moveTo(baseX - 1 * u, baseY);
    ctx.lineTo(tipX, tipY);
    ctx.lineTo(baseX + 1 * u, baseY);
    ctx.closePath();
    ctx.fill();
  }

  // Eyes
  ctx.fillStyle = color;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(cx - 2 * u, cy - 7 * u, 1.3 * u, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 2 * u, cy - 7 * u, 1.3 * u, 0, Math.PI * 2);
  ctx.fill();

  // Electric arcs from hands
  if (Math.sin(t * 8) > 0) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.shadowBlur = 10;
    // Left hand spark
    drawMiniLightning(ctx, cx - 13 * u, cy - 4 * u, cx - 16 * u, cy - 8 * u, t);
    // Right hand spark
    drawMiniLightning(ctx, cx + 13 * u, cy - 4 * u, cx + 16 * u, cy - 8 * u, t);
  }

  if (level > 0) {
    drawLevelIndicator(ctx, cx, cy + 13 * u, level, color, u);
  }
}

function drawMiniLightning(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, t: number): void {
  const mx = (x1 + x2) / 2 + Math.sin(t * 15) * 3;
  const my = (y1 + y2) / 2 + Math.cos(t * 12) * 3;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(mx, my);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawLevelIndicator(ctx: CanvasRenderingContext2D, cx: number, y: number, level: number, color: string, u: number): void {
  ctx.fillStyle = color;
  ctx.shadowBlur = 6;
  const totalW = level * 4 * u;
  const startX = cx - totalW / 2;
  for (let i = 0; i < level; i++) {
    const sx = startX + i * 4 * u + 2 * u;
    // Small star
    ctx.beginPath();
    ctx.moveTo(sx, y - 1.5 * u);
    ctx.lineTo(sx + 1 * u, y);
    ctx.lineTo(sx, y + 1.5 * u);
    ctx.lineTo(sx - 1 * u, y);
    ctx.closePath();
    ctx.fill();
  }
}

function drawTower(
  ctx: CanvasRenderingContext2D,
  tower: Tower,
  cellSize: number,
  ox: number,
  oy: number,
  selected: boolean,
  t: number,
): void {
  const x = ox + tower.pos.col * cellSize;
  const y = oy + tower.pos.row * cellSize;
  const cx = x + cellSize / 2;
  const cy = y + cellSize / 2;
  const color = COLORS.tower[tower.type] ?? '#888';

  drawTowerCharacter(ctx, tower.type, cx, cy, cellSize, tower.level, t);

  // Selection highlight — pulsing circle
  if (selected) {
    const pulseWidth = 1.5 + Math.sin(t * 4) * 1;
    ctx.save();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = pulseWidth;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(cx, cy + cellSize * 0.02, cellSize * 0.42, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function drawTowerPreview(
  ctx: CanvasRenderingContext2D,
  type: TowerType,
  pos: GridPosition,
  cellSize: number,
  ox: number,
  oy: number,
  t: number,
): void {
  const x = ox + pos.col * cellSize;
  const y = oy + pos.row * cellSize;
  const cx = x + cellSize / 2;
  const cy = y + cellSize / 2;
  const color = COLORS.tower[type] ?? '#888';

  ctx.globalAlpha = 0.45;
  drawTowerCharacter(ctx, type, cx, cy, cellSize, 0, t);
  ctx.globalAlpha = 1;

  // Range preview
  const stats = getTowerStats(type, 0);
  const rangeR = stats.range * cellSize;
  ctx.fillStyle = `${color}11`;
  ctx.beginPath();
  ctx.arc(cx, cy, rangeR, 0, Math.PI * 2);
  ctx.fill();
}

// =============================================
//  ENEMY DRAWING — Character-style creatures
// =============================================

function drawEnemy(
  ctx: CanvasRenderingContext2D,
  enemy: Enemy,
  cellSize: number,
  ox: number,
  oy: number,
  t: number,
): void {
  const cx = ox + enemy.pos.x * cellSize;
  const cy = oy + enemy.pos.y * cellSize;
  const s = cellSize; // scale reference
  const color = COLORS.enemy[enemy.type] ?? '#ff0066';

  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;

  switch (enemy.type) {
    case 'goblin':
      drawGoblinChar(ctx, cx, cy, s, color, t);
      break;
    case 'wolf':
      drawWolfChar(ctx, cx, cy, s, color, t);
      break;
    case 'golem':
      drawGolemChar(ctx, cx, cy, s, color, t);
      break;
    case 'darkMage':
      drawDarkMageChar(ctx, cx, cy, s, color, t);
      break;
    case 'dragon':
      drawDragonChar(ctx, cx, cy, s, color, t);
      break;
  }

  ctx.restore();

  // Slow indicator — purple crystal ring
  if (enemy.slowTimer > 0) {
    const r = cellSize * 0.3;
    ctx.save();
    ctx.strokeStyle = '#aa44ff';
    ctx.shadowColor = '#aa44ff';
    ctx.shadowBlur = 6;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI * 2 * i) / 4 + t * 2;
      const dx = cx + Math.cos(angle) * r;
      const dy = cy + Math.sin(angle) * r;
      ctx.fillStyle = '#aa44ff';
      ctx.beginPath();
      ctx.arc(dx, dy, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // HP bar
  const barW = cellSize * 0.55;
  const barH = 2.5;
  const barX = cx - barW / 2;
  const barY = cy - cellSize * 0.35;
  const hpRatio = enemy.hp / enemy.maxHp;

  ctx.fillStyle = COLORS.hpBarBg;
  ctx.fillRect(barX, barY, barW, barH);

  const hpColor = hpRatio > 0.5 ? COLORS.hpBar : hpRatio > 0.25 ? '#ffaa00' : '#ff0066';
  ctx.save();
  ctx.shadowColor = hpColor;
  ctx.shadowBlur = 4;
  ctx.fillStyle = hpColor;
  ctx.fillRect(barX, barY, barW * hpRatio, barH);
  ctx.restore();
}

// --- Goblin: small imp with pointy ears and hunched posture ---
function drawGoblinChar(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, color: string, t: number): void {
  const u = s * 0.02;
  const hop = Math.abs(Math.sin(t * 8)) * 1.5 * u; // hopping animation

  // Legs (short, bent)
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - 2.5 * u, cy + 5 * u - hop);
  ctx.lineTo(cx - 4 * u, cy + 9 * u);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 2.5 * u, cy + 5 * u - hop);
  ctx.lineTo(cx + 4 * u, cy + 9 * u);
  ctx.stroke();

  // Body — small hunched
  ctx.fillStyle = '#200a15';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 2 * u - hop, 5 * u, 4 * u, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Arms (thin, reaching forward)
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(cx - 5 * u, cy + 1 * u - hop);
  ctx.lineTo(cx - 8 * u, cy + 4 * u - hop);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 5 * u, cy + 1 * u - hop);
  ctx.lineTo(cx + 8 * u, cy + 4 * u - hop);
  ctx.stroke();

  // Head
  ctx.fillStyle = '#200a15';
  ctx.beginPath();
  ctx.arc(cx, cy - 4 * u - hop, 4 * u, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Pointy ears
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx - 4 * u, cy - 5 * u - hop);
  ctx.lineTo(cx - 8 * u, cy - 9 * u - hop);
  ctx.lineTo(cx - 3 * u, cy - 3 * u - hop);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 4 * u, cy - 5 * u - hop);
  ctx.lineTo(cx + 8 * u, cy - 9 * u - hop);
  ctx.lineTo(cx + 3 * u, cy - 3 * u - hop);
  ctx.closePath();
  ctx.fill();

  // Eyes — glowing malicious
  ctx.fillStyle = color;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(cx - 1.8 * u, cy - 4.5 * u - hop, 1 * u, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 1.8 * u, cy - 4.5 * u - hop, 1 * u, 0, Math.PI * 2);
  ctx.fill();

  // Mouth (jagged grin)
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(cx - 2 * u, cy - 2 * u - hop);
  ctx.lineTo(cx - 1 * u, cy - 1.5 * u - hop);
  ctx.lineTo(cx, cy - 2.2 * u - hop);
  ctx.lineTo(cx + 1 * u, cy - 1.5 * u - hop);
  ctx.lineTo(cx + 2 * u, cy - 2 * u - hop);
  ctx.stroke();
}

// --- Wolf: four-legged cyber beast ---
function drawWolfChar(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, color: string, t: number): void {
  const u = s * 0.02;
  const runCycle = t * 10;
  const legAnim = Math.sin(runCycle) * 2 * u;

  // Legs (4 legs, animated)
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  // Front left
  ctx.beginPath();
  ctx.moveTo(cx - 4 * u, cy + 3 * u);
  ctx.lineTo(cx - 5 * u, cy + 8 * u + legAnim);
  ctx.stroke();
  // Front right
  ctx.beginPath();
  ctx.moveTo(cx - 2 * u, cy + 3 * u);
  ctx.lineTo(cx - 3 * u, cy + 8 * u - legAnim);
  ctx.stroke();
  // Back left
  ctx.beginPath();
  ctx.moveTo(cx + 4 * u, cy + 3 * u);
  ctx.lineTo(cx + 3 * u, cy + 8 * u - legAnim);
  ctx.stroke();
  // Back right
  ctx.beginPath();
  ctx.moveTo(cx + 6 * u, cy + 3 * u);
  ctx.lineTo(cx + 5 * u, cy + 8 * u + legAnim);
  ctx.stroke();

  // Body — elongated ellipse
  ctx.fillStyle = '#1a0808';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 1 * u, 8 * u, 4 * u, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Tail
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx + 8 * u, cy);
  ctx.quadraticCurveTo(cx + 13 * u, cy - 4 * u + Math.sin(t * 5) * 2 * u, cx + 11 * u, cy - 6 * u);
  ctx.stroke();

  // Head — angular snout
  ctx.fillStyle = '#1a0808';
  ctx.beginPath();
  ctx.moveTo(cx - 10 * u, cy - 2 * u);
  ctx.lineTo(cx - 14 * u, cy);
  ctx.lineTo(cx - 10 * u, cy + 2 * u);
  ctx.lineTo(cx - 6 * u, cy + 1 * u);
  ctx.lineTo(cx - 5 * u, cy - 3 * u);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Ears
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx - 6 * u, cy - 3 * u);
  ctx.lineTo(cx - 8 * u, cy - 7 * u);
  ctx.lineTo(cx - 4 * u, cy - 3 * u);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx - 5 * u, cy - 3 * u);
  ctx.lineTo(cx - 6 * u, cy - 7 * u);
  ctx.lineTo(cx - 3 * u, cy - 2 * u);
  ctx.closePath();
  ctx.fill();

  // Eye — fierce glow
  ctx.fillStyle = color;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(cx - 8 * u, cy - 1.5 * u, 1.2 * u, 0, Math.PI * 2);
  ctx.fill();

  // Speed lines
  ctx.strokeStyle = `${color}44`;
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 3; i++) {
    const ly = cy - 2 * u + i * 2 * u;
    ctx.beginPath();
    ctx.moveTo(cx + 10 * u + i * 2 * u, ly);
    ctx.lineTo(cx + 14 * u + i * 2 * u, ly);
    ctx.stroke();
  }
}

// --- Golem: massive heavy humanoid ---
function drawGolemChar(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, color: string, t: number): void {
  const u = s * 0.02;
  const sway = Math.sin(t * 2) * 0.5 * u; // slow heavy sway

  // Legs — thick stumps
  ctx.fillStyle = '#141420';
  ctx.fillRect(cx - 6 * u, cy + 5 * u, 5 * u, 6 * u);
  ctx.fillRect(cx + 1 * u, cy + 5 * u, 5 * u, 6 * u);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.strokeRect(cx - 6 * u, cy + 5 * u, 5 * u, 6 * u);
  ctx.strokeRect(cx + 1 * u, cy + 5 * u, 5 * u, 6 * u);

  // Body — massive block
  ctx.fillStyle = '#141420';
  ctx.beginPath();
  ctx.moveTo(cx - 9 * u + sway, cy - 5 * u);
  ctx.lineTo(cx + 9 * u + sway, cy - 5 * u);
  ctx.lineTo(cx + 10 * u, cy + 7 * u);
  ctx.lineTo(cx - 10 * u, cy + 7 * u);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Armor lines
  ctx.strokeStyle = `${color}55`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - 7 * u, cy - 2 * u);
  ctx.lineTo(cx + 7 * u, cy - 2 * u);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 6 * u, cy + 2 * u);
  ctx.lineTo(cx + 6 * u, cy + 2 * u);
  ctx.stroke();

  // Arms — thick hanging
  ctx.fillStyle = '#141420';
  // Left arm
  ctx.fillRect(cx - 13 * u + sway, cy - 3 * u, 4.5 * u, 10 * u);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.strokeRect(cx - 13 * u + sway, cy - 3 * u, 4.5 * u, 10 * u);
  // Fist
  ctx.fillStyle = color;
  ctx.fillRect(cx - 13 * u + sway, cy + 6 * u, 4.5 * u, 3 * u);
  // Right arm
  ctx.fillStyle = '#141420';
  ctx.fillRect(cx + 8.5 * u + sway, cy - 3 * u, 4.5 * u, 10 * u);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.strokeRect(cx + 8.5 * u + sway, cy - 3 * u, 4.5 * u, 10 * u);
  // Fist
  ctx.fillStyle = color;
  ctx.fillRect(cx + 8.5 * u + sway, cy + 6 * u, 4.5 * u, 3 * u);

  // Head — small on big body
  ctx.fillStyle = '#141420';
  ctx.fillRect(cx - 4 * u + sway, cy - 11 * u, 8 * u, 7 * u);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(cx - 4 * u + sway, cy - 11 * u, 8 * u, 7 * u);

  // Single glowing eye (cyclops)
  ctx.fillStyle = color;
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(cx + sway, cy - 8 * u, 2 * u, 0, Math.PI * 2);
  ctx.fill();
}

// --- Dark Mage: floating hooded figure with orbiting runes ---
function drawDarkMageChar(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, color: string, t: number): void {
  const u = s * 0.02;
  const floatY = Math.sin(t * 2.5) * 1.5 * u;

  // Robe — flowing triangular shape
  ctx.fillStyle = '#150520';
  ctx.beginPath();
  ctx.moveTo(cx - 4 * u, cy + floatY);
  ctx.lineTo(cx + 4 * u, cy + floatY);
  ctx.lineTo(cx + 8 * u, cy + 11 * u + floatY);
  ctx.lineTo(cx - 8 * u, cy + 11 * u + floatY);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Robe inner glow
  ctx.strokeStyle = `${color}33`;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(cx, cy + 1 * u + floatY);
  ctx.lineTo(cx, cy + 9 * u + floatY);
  ctx.stroke();

  // Hood
  ctx.fillStyle = '#150520';
  ctx.beginPath();
  ctx.moveTo(cx - 6 * u, cy - 1 * u + floatY);
  ctx.lineTo(cx, cy - 10 * u + floatY);
  ctx.lineTo(cx + 6 * u, cy - 1 * u + floatY);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Face shadow
  ctx.fillStyle = '#0a0010';
  ctx.beginPath();
  ctx.arc(cx, cy - 3 * u + floatY, 3.5 * u, 0, Math.PI * 2);
  ctx.fill();

  // Glowing eyes
  ctx.fillStyle = color;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(cx - 1.5 * u, cy - 3.5 * u + floatY, 1 * u, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 1.5 * u, cy - 3.5 * u + floatY, 1 * u, 0, Math.PI * 2);
  ctx.fill();

  // Arms (outstretched)
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2;
  ctx.shadowBlur = 4;
  ctx.beginPath();
  ctx.moveTo(cx - 4 * u, cy + 1 * u + floatY);
  ctx.lineTo(cx - 10 * u, cy - 2 * u + floatY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 4 * u, cy + 1 * u + floatY);
  ctx.lineTo(cx + 10 * u, cy - 2 * u + floatY);
  ctx.stroke();

  // Orbiting rune circles
  for (let i = 0; i < 3; i++) {
    const angle = t * 1.8 + (Math.PI * 2 * i) / 3;
    const orbitR = 10 * u;
    const ox = cx + Math.cos(angle) * orbitR;
    const oy = cy + 2 * u + floatY + Math.sin(angle) * orbitR * 0.35;
    ctx.strokeStyle = color;
    ctx.shadowBlur = 8;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(ox, oy, 2 * u, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = `${color}44`;
    ctx.fill();
  }
}

// --- Dragon: winged serpentine beast ---
function drawDragonChar(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, color: string, t: number): void {
  const u = s * 0.02;
  const wingFlap = Math.sin(t * 4) * 3 * u;

  // Tail (behind body)
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx + 5 * u, cy + 3 * u);
  ctx.quadraticCurveTo(cx + 12 * u, cy + 2 * u + Math.sin(t * 3) * 2 * u, cx + 10 * u, cy - 3 * u);
  ctx.stroke();
  // Tail tip
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx + 10 * u, cy - 3 * u);
  ctx.lineTo(cx + 12 * u, cy - 5 * u);
  ctx.lineTo(cx + 8 * u, cy - 4 * u);
  ctx.closePath();
  ctx.fill();

  // Wings
  ctx.fillStyle = `${color}33`;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  // Left wing
  ctx.beginPath();
  ctx.moveTo(cx - 2 * u, cy - 2 * u);
  ctx.lineTo(cx - 12 * u, cy - 10 * u + wingFlap);
  ctx.lineTo(cx - 8 * u, cy - 3 * u + wingFlap * 0.3);
  ctx.lineTo(cx - 14 * u, cy - 5 * u + wingFlap * 0.7);
  ctx.lineTo(cx - 6 * u, cy);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Right wing
  ctx.beginPath();
  ctx.moveTo(cx + 2 * u, cy - 2 * u);
  ctx.lineTo(cx + 12 * u, cy - 10 * u + wingFlap);
  ctx.lineTo(cx + 8 * u, cy - 3 * u + wingFlap * 0.3);
  ctx.lineTo(cx + 14 * u, cy - 5 * u + wingFlap * 0.7);
  ctx.lineTo(cx + 6 * u, cy);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Body — thick oval
  ctx.fillStyle = '#1a1005';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 2 * u, 6 * u, 5 * u, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Legs
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - 3 * u, cy + 6 * u);
  ctx.lineTo(cx - 5 * u, cy + 10 * u);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 3 * u, cy + 6 * u);
  ctx.lineTo(cx + 5 * u, cy + 10 * u);
  ctx.stroke();
  // Claws
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - 6 * u, cy + 10 * u);
  ctx.lineTo(cx - 5 * u, cy + 10 * u);
  ctx.lineTo(cx - 4 * u, cy + 10 * u);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 4 * u, cy + 10 * u);
  ctx.lineTo(cx + 5 * u, cy + 10 * u);
  ctx.lineTo(cx + 6 * u, cy + 10 * u);
  ctx.stroke();

  // Head
  ctx.fillStyle = '#1a1005';
  ctx.beginPath();
  ctx.ellipse(cx, cy - 5 * u, 4 * u, 3.5 * u, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Horns
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx - 2 * u, cy - 7 * u);
  ctx.lineTo(cx - 5 * u, cy - 12 * u);
  ctx.lineTo(cx - 1 * u, cy - 8 * u);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 2 * u, cy - 7 * u);
  ctx.lineTo(cx + 5 * u, cy - 12 * u);
  ctx.lineTo(cx + 1 * u, cy - 8 * u);
  ctx.closePath();
  ctx.fill();

  // Snout
  ctx.fillStyle = '#1a1005';
  ctx.beginPath();
  ctx.ellipse(cx, cy - 3.5 * u, 2.5 * u, 1.5 * u, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.8;
  ctx.stroke();
  // Nostrils (small glowing dots)
  ctx.fillStyle = '#ff4400';
  ctx.shadowBlur = 4;
  ctx.shadowColor = '#ff4400';
  ctx.beginPath();
  ctx.arc(cx - 1 * u, cy - 3.5 * u, 0.6 * u, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 1 * u, cy - 3.5 * u, 0.6 * u, 0, Math.PI * 2);
  ctx.fill();

  // Eyes — fierce
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(cx - 2 * u, cy - 5.5 * u, 1.2 * u, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 2 * u, cy - 5.5 * u, 1.2 * u, 0, Math.PI * 2);
  ctx.fill();

  // Flame breath particles (intermittent)
  if (Math.sin(t * 5) > 0.2) {
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ff4400';
    for (let i = 0; i < 3; i++) {
      const fx = cx + (Math.sin(t * 10 + i * 3) * 3 - 1) * u;
      const fy = cy - 1.5 * u - i * 2 * u;
      const fr = (1.5 - i * 0.3) * u;
      ctx.fillStyle = i === 0 ? '#ff8800' : i === 1 ? '#ff4400' : '#ff220044';
      ctx.beginPath();
      ctx.arc(fx, fy, fr, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// =============================================
//  PROJECTILE DRAWING
// =============================================

function drawProjectile(
  ctx: CanvasRenderingContext2D,
  proj: Projectile,
  cellSize: number,
  ox: number,
  oy: number,
): void {
  const cx = ox + proj.pos.x * cellSize;
  const cy = oy + proj.pos.y * cellSize;

  ctx.save();

  switch (proj.towerType) {
    case 'archer': {
      const r = cellSize * 0.06;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'cannon': {
      const r = cellSize * 0.1;
      ctx.shadowColor = '#ff4466';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#ff4466';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffcccc';
      ctx.beginPath();
      ctx.arc(cx - r * 0.2, cy - r * 0.2, r * 0.3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'ice': {
      const r = cellSize * 0.07;
      ctx.shadowColor = '#aa44ff';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#aa44ff';
      ctx.beginPath();
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx + r, cy);
      ctx.lineTo(cx, cy + r);
      ctx.lineTo(cx - r, cy);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'thunder': {
      const r = cellSize * 0.07;
      ctx.shadowColor = '#ffaa00';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#ffaa00';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    default: {
      const r = cellSize * 0.06;
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

// =============================================
//  EFFECT DRAWING
// =============================================

function drawEffect(
  ctx: CanvasRenderingContext2D,
  effect: Effect,
  cellSize: number,
  ox: number,
  oy: number,
  t: number,
): void {
  const cx = ox + effect.pos.x * cellSize;
  const cy = oy + effect.pos.y * cellSize;
  const progress = 1 - effect.timer / effect.duration;

  switch (effect.type) {
    case 'explosion': {
      const maxR = (effect.radius ?? 1) * cellSize;
      const r = maxR * progress;

      ctx.save();
      ctx.globalAlpha = 1 - progress;

      ctx.strokeStyle = '#ff4466';
      ctx.shadowColor = '#ff4466';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 3 * (1 - progress);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.3 * (1 - progress), 0, Math.PI * 2);
      ctx.fill();

      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i) / 6;
        const px = cx + Math.cos(angle) * r * 0.8;
        const py = cy + Math.sin(angle) * r * 0.8;
        const shardR = cellSize * 0.06 * (1 - progress);
        ctx.fillStyle = '#ff8844';
        ctx.beginPath();
        ctx.moveTo(px, py - shardR);
        ctx.lineTo(px + shardR * 0.7, py + shardR * 0.5);
        ctx.lineTo(px - shardR * 0.7, py + shardR * 0.5);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
      break;
    }
    case 'freeze': {
      const r = cellSize * 0.5;
      ctx.save();
      ctx.globalAlpha = 1 - progress;

      ctx.strokeStyle = '#aa44ff';
      ctx.shadowColor = '#aa44ff';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r * (0.5 + progress * 0.5), 0, Math.PI * 2);
      ctx.stroke();

      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i) / 6 + progress * Math.PI * 0.5;
        const px = cx + Math.cos(angle) * r * progress;
        const py = cy + Math.sin(angle) * r * progress;
        const shardR = cellSize * 0.05;
        ctx.fillStyle = '#cc88ff';
        ctx.beginPath();
        ctx.moveTo(px, py - shardR);
        ctx.lineTo(px + shardR, py);
        ctx.lineTo(px, py + shardR);
        ctx.lineTo(px - shardR, py);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
      break;
    }
    case 'lightning': {
      ctx.save();
      ctx.globalAlpha = 1 - progress;
      ctx.strokeStyle = '#ffaa00';
      ctx.shadowColor = '#ffaa00';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 2 + (1 - progress) * 3;

      const r = cellSize * 0.5;
      const segments = 5;
      ctx.beginPath();
      ctx.moveTo(cx - r, cy - r * 0.5);
      for (let i = 1; i <= segments; i++) {
        const px = cx - r + (r * 2 * i) / segments;
        const jitter = Math.sin(t * 20 + i * 7) * r * 0.4;
        ctx.lineTo(px, cy + jitter);
      }
      ctx.stroke();

      ctx.globalAlpha = (1 - progress) * 0.5;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, cy - r);
      for (let i = 1; i <= segments; i++) {
        const py = cy - r + (r * 2 * i) / segments;
        const jitter = Math.cos(t * 15 + i * 5) * r * 0.3;
        ctx.lineTo(cx + jitter, py);
      }
      ctx.stroke();

      ctx.restore();
      break;
    }
    case 'death': {
      const r = cellSize * 0.35;
      ctx.save();
      ctx.globalAlpha = 1 - progress;

      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i) / 6;
        const dist = r * progress * 2;
        const px = cx + Math.cos(angle) * dist;
        const py = cy + Math.sin(angle) * dist;
        const shardR = cellSize * 0.06 * (1 - progress * 0.5);

        ctx.fillStyle = i % 2 === 0 ? '#00f0ff' : '#aa44ff';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 6;

        ctx.beginPath();
        const sides = 3 + (i % 3);
        for (let j = 0; j < sides; j++) {
          const sa = (Math.PI * 2 * j) / sides + angle;
          const sx = px + Math.cos(sa) * shardR;
          const sy = py + Math.sin(sa) * shardR;
          if (j === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
      break;
    }
    case 'damage': {
      const offsetY2 = -progress * cellSize * 0.5;
      ctx.save();
      ctx.globalAlpha = 1 - progress;
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 6;
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${Math.floor(cellSize * 0.3)}px 'Orbitron', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${effect.value ?? 0}`, cx, cy + offsetY2);
      ctx.restore();
      break;
    }
  }
}

// =============================================
//  UTILITY
// =============================================

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
