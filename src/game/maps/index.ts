import { MapData } from '../types';
import { stage1 } from './stage1';

export const stages: MapData[] = [stage1];

export function getStage(id: string): MapData | undefined {
  return stages.find((s) => s.id === id);
}
