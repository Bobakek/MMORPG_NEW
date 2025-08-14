export interface ChatMessage {
  id: number
  channel: "global" | "local" | "corp"
  player: string
  message: string
  time: string
}

export interface OnlinePlayer {
  id: number
  name: string
  status: "online" | "in-combat" | "mining"
  location: string
  corporation: string
}

export interface Corporation {
  id: number
  name: string
  members: number
  description: string
  ceo: string
  founded: string
}
