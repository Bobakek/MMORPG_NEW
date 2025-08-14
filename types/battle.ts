export interface BattleShip {
  id: string
  name: string
  type: string
  hull: number
  maxHull: number
  shield: number
  maxShield: number
  x: number
  y: number
  rotation: number
  isPlayer: boolean
  isTargeted: boolean
  weapons: Array<{
    name: string
    damage: number
    range: number
    cooldown: number
    currentCooldown: number
  }>
}

export interface BattleLog {
  id: string
  timestamp: number
  message: string
  type: "damage" | "miss" | "destroy" | "info"
}
