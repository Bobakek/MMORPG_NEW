"use client"

import { useState, useEffect } from "react"

export interface Inventory {
  [key: string]: number
}

export function useInventory() {
  const [inventory, setInventory] = useState<Inventory>({})

  useEffect(() => {
    const stored = localStorage.getItem("inventory")
    if (stored) {
      try {
        setInventory(JSON.parse(stored))
      } catch {
        // ignore malformed data
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("inventory", JSON.stringify(inventory))
  }, [inventory])

  const addResource = (type: string, amount: number) => {
    if (amount <= 0) return
    setInventory((prev) => ({ ...prev, [type]: (prev[type] || 0) + amount }))
  }

  const removeResource = (type: string, amount: number) => {
    if (amount <= 0) return
    setInventory((prev) => {
      const current = prev[type] || 0
      const next = Math.max(0, current - amount)
      if (next === 0) {
        const { [type]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [type]: next }
    })
  }

  const getQuantity = (type: string) => inventory[type] || 0

  return { inventory, addResource, removeResource, getQuantity }
}

