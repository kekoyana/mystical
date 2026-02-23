import { MapData } from '../types';
import { stage1 } from './stage1';
import { stage2 } from './stage2';
import { stage3 } from './stage3';
import { stage4 } from './stage4';
import { stage5 } from './stage5';
import { stage6 } from './stage6';

export const stages: MapData[] = [stage1, stage2, stage3, stage4, stage5, stage6];

export function getStage(id: string): MapData | undefined {
  return stages.find((s) => s.id === id);
}
