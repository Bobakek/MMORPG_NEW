"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Package, BarChart3 } from "lucide-react"

interface MarketItem {
  id: string
  name: string
  category: "minerals" | "modules" | "ships" | "fuel"
  buyPrice: number
  sellPrice: number
  volume: number
  change: number
  stock: number
}

const marketItems: MarketItem[] = [
  {
    id: "1",
    name: "Tritanium",
    category: "minerals",
    buyPrice: 4.25,
    sellPrice: 4.89,
    volume: 125000,
    change: 2.3,
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
    stock: 8,
  },
]

interface TradingHubProps {
  onBack: () => void
}

export function TradingHub({ onBack }: TradingHubProps) {
  const [selectedMarket, setSelectedMarket] = useState("Jita IV")
  const [selectedCategory, setSelectedCategory] = useState<"all" | MarketItem["category"]>("all")
  const [wallet] = useState(125000000) // 125M ISK
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null)

  const markets = [
    { name: "Jita IV", tax: 1.0, security: "high" },
    { name: "Amarr VIII", tax: 1.2, security: "high" },
    { name: "Dodixie IX", tax: 1.1, security: "high" },
    { name: "Rens VI", tax: 1.3, security: "low" },
  ]

  const filteredItems = marketItems.filter((item) => selectedCategory === "all" || item.category === selectedCategory)

  const formatISK = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M ISK`
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K ISK`
    }
    return `${amount.toFixed(2)} ISK`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-rose-400 bg-clip-text text-transparent">
              Trading Hub
            </h1>
            <p className="text-slate-300 mt-2">Buy, sell, and trade resources across the galaxy</p>
          </div>
          <Button
            onClick={onBack}
            variant="outline"
            className="border-amber-600/50 text-amber-400 hover:bg-amber-600/20 bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Main
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Market Selection */}
          <div className="space-y-4">
            <Card className="bg-slate-900/80 backdrop-blur-sm border-amber-600/30">
              <CardHeader>
                <CardTitle className="text-amber-400">Trading Markets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {markets.map((market) => (
                  <Button
                    key={market.name}
                    onClick={() => setSelectedMarket(market.name)}
                    variant={selectedMarket === market.name ? "default" : "outline"}
                    className={`w-full justify-between ${
                      selectedMarket === market.name
                        ? "bg-amber-600 hover:bg-amber-700"
                        : "border-amber-600/50 text-amber-400 hover:bg-amber-600/20"
                    }`}
                  >
                    <span>{market.name}</span>
                    <Badge
                      variant="outline"
                      className={`${
                        market.security === "high"
                          ? "text-green-400 border-green-400"
                          : "text-amber-400 border-amber-400"
                      }`}
                    >
                      {market.tax}% tax
                    </Badge>
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-slate-900/80 backdrop-blur-sm border-amber-600/30">
              <CardHeader>
                <CardTitle className="text-amber-400 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Wallet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{formatISK(wallet)}</div>
                <p className="text-slate-400 text-sm mt-1">Available Balance</p>
              </CardContent>
            </Card>
          </div>

          {/* Market Data */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="bg-slate-900/80 backdrop-blur-sm border-amber-600/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-amber-400">Market: {selectedMarket}</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => setSelectedCategory("all")}
                      variant={selectedCategory === "all" ? "default" : "outline"}
                      className={
                        selectedCategory === "all"
                          ? "bg-amber-600 hover:bg-amber-700"
                          : "border-amber-600/50 text-amber-400"
                      }
                    >
                      All
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setSelectedCategory("minerals")}
                      variant={selectedCategory === "minerals" ? "default" : "outline"}
                      className={
                        selectedCategory === "minerals"
                          ? "bg-amber-600 hover:bg-amber-700"
                          : "border-amber-600/50 text-amber-400"
                      }
                    >
                      Minerals
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setSelectedCategory("modules")}
                      variant={selectedCategory === "modules" ? "default" : "outline"}
                      className={
                        selectedCategory === "modules"
                          ? "bg-amber-600 hover:bg-amber-700"
                          : "border-amber-600/50 text-amber-400"
                      }
                    >
                      Modules
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setSelectedCategory("ships")}
                      variant={selectedCategory === "ships" ? "default" : "outline"}
                      className={
                        selectedCategory === "ships"
                          ? "bg-amber-600 hover:bg-amber-700"
                          : "border-amber-600/50 text-amber-400"
                      }
                    >
                      Ships
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`p-4 rounded-lg cursor-pointer transition-all ${
                        selectedItem?.id === item.id
                          ? "bg-amber-600/20 border border-amber-600/50"
                          : "bg-slate-800/50 hover:bg-slate-800/70"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Package className="w-5 h-5 text-amber-400" />
                          <div>
                            <h3 className="font-semibold text-white">{item.name}</h3>
                            <p className="text-sm text-slate-400 capitalize">{item.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="text-green-400 font-semibold">{formatISK(item.buyPrice)}</div>
                            <div className="text-xs text-slate-400">Buy</div>
                          </div>
                          <div className="text-right">
                            <div className="text-red-400 font-semibold">{formatISK(item.sellPrice)}</div>
                            <div className="text-xs text-slate-400">Sell</div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              {item.change > 0 ? (
                                <TrendingUp className="w-4 h-4 text-green-400" />
                              ) : (
                                <TrendingDown className="w-4 h-4 text-red-400" />
                              )}
                              <span
                                className={`text-sm font-semibold ${
                                  item.change > 0 ? "text-green-400" : "text-red-400"
                                }`}
                              >
                                {item.change > 0 ? "+" : ""}
                                {item.change}%
                              </span>
                            </div>
                            <div className="text-xs text-slate-400">24h</div>
                          </div>
                          <div className="text-right">
                            <div className="text-white">{item.stock.toLocaleString()}</div>
                            <div className="text-xs text-slate-400">Stock</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {selectedItem && (
              <Card className="bg-slate-900/80 backdrop-blur-sm border-amber-600/30">
                <CardHeader>
                  <CardTitle className="text-amber-400 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Quick Trade: {selectedItem.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="text-white font-semibold">Buy Orders</h4>
                      <div className="p-3 bg-green-900/20 rounded-lg border border-green-600/30">
                        <div className="text-green-400 text-xl font-bold">{formatISK(selectedItem.buyPrice)}</div>
                        <div className="text-sm text-slate-300">Best Buy Price</div>
                        <Button className="w-full mt-3 bg-green-600 hover:bg-green-700">Buy Now</Button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-white font-semibold">Sell Orders</h4>
                      <div className="p-3 bg-red-900/20 rounded-lg border border-red-600/30">
                        <div className="text-red-400 text-xl font-bold">{formatISK(selectedItem.sellPrice)}</div>
                        <div className="text-sm text-slate-300">Best Sell Price</div>
                        <Button className="w-full mt-3 bg-red-600 hover:bg-red-700">Sell Now</Button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-white font-semibold">{selectedItem.volume.toLocaleString()}</div>
                        <div className="text-xs text-slate-400">24h Volume</div>
                      </div>
                      <div>
                        <div className="text-white font-semibold">
                          {formatISK(selectedItem.sellPrice - selectedItem.buyPrice)}
                        </div>
                        <div className="text-xs text-slate-400">Spread</div>
                      </div>
                      <div>
                        <div className={`font-semibold ${selectedItem.change > 0 ? "text-green-400" : "text-red-400"}`}>
                          {selectedItem.change > 0 ? "+" : ""}
                          {selectedItem.change}%
                        </div>
                        <div className="text-xs text-slate-400">24h Change</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
