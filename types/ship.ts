export interface Ship {
  id: string
  name: string
  type: "frigate" | "destroyer" | "cruiser" | "battlecruiser" | "battleship" | "dreadnought"
  hull: number
  maxHull: number
  shield: number
  maxShield: number
  armor: number
  maxArmor: number
  capacitor: number
  maxCapacitor: number
  location: string
  status: "docked" | "in-space" | "in-warp" | "damaged"
  modules: ShipModule[]
  cargo: CargoItem[]
  maxCargo: number
}

export interface ShipModule {
  id: string
  name: string
  type: "weapon" | "defense" | "propulsion" | "utility"
  slot: "high" | "mid" | "low" | "rig"
  status: "online" | "offline" | "damaged"
  stats: Record<string, number>
}

export interface CargoItem {
  id: string
  name: string
  quantity: number
  volume: number
}
