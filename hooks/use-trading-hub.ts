"use client"

import { useEffect, useState } from "react"
import type { MarketItem } from "@/data/trading"
import { marketItems, markets, categoryConfig } from "@/data"
import { useInventory } from "@/hooks/use-inventory"

export function useTradingHub() {
  const [selectedMarket, setSelectedMarket] = useState("Jita IV")
  const [selectedCategory, setSelectedCategory] = useState<"all" | MarketItem["category"]>("all")
  const [wallet] = useState(125000000) // 125M ISK
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null)
  const [items, setItems] = useState<MarketItem[]>(marketItems)
  const [orders, setOrders] = useState<LimitOrder[]>([])
  const { addResource, getQuantity, removeResource } = useInventory()

  const filteredItems = items.filter((item) => selectedCategory === "all" || item.category === selectedCategory)

  useEffect(() => {
    const interval = setInterval(() => {
      setItems((prev) => {
        const updated = prev.map((item) => {
          const config = categoryConfig[item.category]
          const change = parseFloat(
            (
              Math.random() * (config.priceChange[1] - config.priceChange[0]) +
              config.priceChange[0]
            ).toFixed(2)
          )
          const buyPrice = parseFloat((item.buyPrice * (1 + change / 100)).toFixed(2))
          const sellPrice = parseFloat((item.sellPrice * (1 + change / 100)).toFixed(2))
          const volume = Math.max(
            0,
            Math.round(
              config.baseVolume + (Math.random() - 0.5) * config.baseVolume * 0.1
            )
          )
          const history = [...item.history, change].slice(-10)
          return { ...item, buyPrice, sellPrice, volume, change, history }
        })

        // process limit orders
        setOrders((prevOrders) => {
          const remaining: LimitOrder[] = []
          prevOrders.forEach((order) => {
            const item = updated.find((i) => i.id === order.itemId)
            if (!item) return
            if (order.type === "buy" && item.sellPrice <= order.price) {
              buyItem(item, order.quantity)
            } else if (order.type === "sell" && item.buyPrice >= order.price) {
              sellItem(item, order.quantity)
            } else {
              remaining.push(order)
            }
          })
          return remaining
        })

        return updated
      })
    }, 5000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  interface LimitOrder {
    id: string
    itemId: string
    type: "buy" | "sell"
    price: number
    quantity: number
  }

  const placeOrder = (order: Omit<LimitOrder, "id">) => {
    setOrders((prev) => [...prev, { id: Math.random().toString(36).slice(2), ...order }])
  }

  const cancelOrder = (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id))
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
    orders,
    placeOrder,
    cancelOrder,
  }
}
