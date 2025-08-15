export interface MarketItem {
  id: string
  name: string
  category: "minerals" | "modules" | "ships" | "fuel"
  buyPrice: number
  sellPrice: number
  volume: number
  change: number
  history: number[]
  stock: number
}

export interface Market {
  name: string
  tax: number
  security: "high" | "low"
}

export const marketItems: MarketItem[] = [
  {
    id: "1",
    name: "Tritanium",
    category: "minerals",
    buyPrice: 4.25,
    sellPrice: 4.89,
    volume: 125000,
    change: 2.3,
    history: [2.3],
    stock: 890000,
  },
  {
    id: "2",
    name: "Pyerite",
    category: "minerals",
    buyPrice: 8.15,
    sellPrice: 9.42,
    volume: 89000,
    change: -1.8,
    history: [-1.8],
    stock: 456000,
  },
  {
    id: "3",
    name: "Heavy Pulse Laser II",
    category: "modules",
    buyPrice: 2850000,
    sellPrice: 3200000,
    volume: 45,
    change: 5.7,
    history: [5.7],
    stock: 23,
  },
  {
    id: "4",
    name: "Antimatter Charge L",
    category: "fuel",
    buyPrice: 125.5,
    sellPrice: 142.8,
    volume: 15600,
    change: 0.8,
    history: [0.8],
    stock: 78000,
  },
  {
    id: "5",
    name: "Rifter",
    category: "ships",
    buyPrice: 850000,
    sellPrice: 950000,
    volume: 12,
    change: -3.2,
    history: [-3.2],
    stock: 8,
  },
]

export const categoryConfig: Record<
  MarketItem["category"],
  { priceChange: [number, number]; baseVolume: number }
> = {
  minerals: { priceChange: [-3, 3], baseVolume: 100000 },
  modules: { priceChange: [-8, 8], baseVolume: 200 },
  ships: { priceChange: [-5, 5], baseVolume: 20 },
  fuel: { priceChange: [-6, 6], baseVolume: 15000 },
}

export const markets: Market[] = [
  { name: "Jita IV", tax: 1.0, security: "high" },
  { name: "Amarr VIII", tax: 1.2, security: "high" },
  { name: "Dodixie IX", tax: 1.1, security: "high" },
  { name: "Rens VI", tax: 1.3, security: "low" },
]
