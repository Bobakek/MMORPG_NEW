export interface StarSystem {
  id: string
  name: string
  x: number
  y: number
  security: "high" | "low" | "null"
  faction: string
  resources: string[]
  population: number
  connected: string[]
}
