"use client"

import { useState } from "react"
import type { MarketItem } from "@/data/trading"
import { marketItems, markets } from "@/data"
import { useInventory } from "@/hooks/use-inventory"

export function useTradingHub() {
  const [selectedMarket, setSelectedMarket] = useState("Jita IV")
  const [selectedCategory, setSelectedCategory] = useState<"all" | MarketItem["category"]>("all")
  const [wallet] = useState(125000000) // 125M ISK
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null)
  const { addResource, getQuantity, removeResource } = useInventory()

  const filteredItems = marketItems.filter((item) => selectedCategory === "all" || item.category === selectedCategory)

  const formatISK = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M ISK`
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K ISK`
    }
    return `${amount.toFixed(2)} ISK`
  }

  const selectMarket = (marketName: string) => {
    setSelectedMarket(marketName)
  }

  const selectCategory = (category: "all" | MarketItem["category"]) => {
    setSelectedCategory(category)
  }

  const selectItem = (item: MarketItem) => {
    setSelectedItem(item)
  }

  const clearItemSelection = () => {
    setSelectedItem(null)
  }

  const buyItem = (item: MarketItem, quantity = 1) => {
    const totalCost = item.buyPrice * quantity
    if (totalCost <= wallet) {
      addResource(item.name, quantity)
      console.log(`Buying ${quantity}x ${item.name} for ${formatISK(totalCost)}`)
    } else {
      console.log("Insufficient funds")
    }
  }

  const sellItem = (item: MarketItem, quantity = 1) => {
    const owned = getQuantity(item.name)
    if (owned >= quantity) {
      const totalValue = item.sellPrice * quantity
      removeResource(item.name, quantity)
      console.log(`Selling ${quantity}x ${item.name} for ${formatISK(totalValue)}`)
    } else {
      console.log("Insufficient quantity")
    }
  }

  return {
    markets,
    marketItems: filteredItems,
    selectedMarket,
    selectedCategory,
    selectedItem,
    wallet,
    formatISK,
    selectMarket,
    selectCategory,
    selectItem,
    clearItemSelection,
    buyItem,
    sellItem,
  }
}
