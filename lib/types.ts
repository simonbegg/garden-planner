// Plant type definitions
export interface Plant {
  id: string;
  name: string;
  variety: string;
  type: 'vegetable' | 'fruit' | 'herb' | 'flower' | 'tree';
  color: string;
  spacing: number;
  plantingTime: string;
  harvestTime: string;
  plantingDate?: string;
  careInstructions: string[];
  growthStage?: number; // 0-100
}

export interface GridCell {
  plantId: string | null;
  plantedDate: string | null;
}

export interface GardenLayout {
  id: string;
  name: string;
  rows: number;
  columns: number;
  grid: GridCell[][];
}
