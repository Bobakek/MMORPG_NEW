import type { ChatMessage, OnlinePlayer, Corporation } from "@/types"

export const chatMessages: ChatMessage[] = [
  {
    id: 1,
    channel: "global",
    player: "CommanderX",
    message: "Looking for mining fleet in Caldari space",
    time: "14:23",
  },
  { id: 2, channel: "local", player: "SpacePirate", message: "Anyone want to do some PvP?", time: "14:25" },
  { id: 3, channel: "corp", player: "CEO_Alpha", message: "Corp meeting tonight at 20:00 EVE time", time: "14:27" },
  { id: 4, channel: "global", player: "TraderBob", message: "Selling rare minerals, good prices!", time: "14:30" },
]

export const onlinePlayers: OnlinePlayer[] = [
  { id: 1, name: "CommanderX", status: "online", location: "Jita IV", corporation: "Deep Space Mining" },
  { id: 2, name: "SpacePirate", status: "in-combat", location: "Rancer", corporation: "Red Federation" },
  { id: 3, name: "TraderBob", status: "online", location: "Amarr VIII", corporation: "Trade Empire" },
  { id: 4, name: "CEO_Alpha", status: "online", location: "Dodixie IX", corporation: "Deep Space Mining" },
  { id: 5, name: "MinerJoe", status: "mining", location: "Hulmate V", corporation: "Deep Space Mining" },
]

export const corporations: Corporation[] = [
  {
    id: 1,
    name: "Deep Space Mining",
    members: 247,
    description: "Industrial corporation focused on mining and manufacturing",
    ceo: "CEO_Alpha",
    founded: "2024-01-15",
  },
  {
    id: 2,
    name: "Red Federation",
    members: 89,
    description: "PvP focused alliance, always ready for combat",
    ceo: "WarLord_Prime",
    founded: "2024-02-03",
  },
  {
    id: 3,
    name: "Trade Empire",
    members: 156,
    description: "Economic powerhouse controlling major trade routes",
    ceo: "MegaTrader",
    founded: "2024-01-08",
  },
]

export interface FriendRequest {
  id: number
  name: string
}

export interface FriendStatus {
  id: number
  name: string
}

export const friendRequests: FriendRequest[] = [
  { id: 6, name: "GalaxyRanger" },
]

export const friendsList: FriendStatus[] = [
  { id: 7, name: "StarGazer" },
]

export const blockedUsersList: FriendStatus[] = [
  { id: 8, name: "PirateKing" },
]
