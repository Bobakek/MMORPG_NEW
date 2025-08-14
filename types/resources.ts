export interface Planet {
  id: string;
  name: string;
  position: [number, number, number];
  size: number;
  color: string;
  type?: string;
}

export interface MiningTarget {
  id: string;
  name: string;
  position: [number, number, number];
  resources: { type: string; amount: number; rarity: "common" | "rare" | "epic" }[];
  health: number;
  maxHealth: number;
}

export interface ProcessingRecipe {
  id: string;
  name: string;
  inputs: { type: string; amount: number }[];
  outputs: { type: string; amount: number }[];
  processingTime: number;
  energyCost: number;
}

export interface ProcessingStation {
  id: string;
  name: string;
  position: [number, number, number];
  type: "refinery" | "factory";
  level: number;
  capacity: number;
  recipes: ProcessingRecipe[];
}
