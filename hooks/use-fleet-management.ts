"use client"

import { useState } from "react"
import type { Ship } from "@/types"
import { playerShips } from "@/data"

export function useFleetManagement() {
  const [selectedShip, setSelectedShip] = useState<Ship | null>(null)

  const getStatusColor = (status: Ship["status"]) => {
    switch (status) {
      case "docked":
        return "text-green-400 border-green-400"
      case "in-space":
        return "text-blue-400 border-blue-400"
      case "in-warp":
        return "text-purple-400 border-purple-400"
      case "damaged":
        return "text-red-400 border-red-400"
      default:
        return "text-gray-400 border-gray-400"
    }
  }

  const getHealthPercentage = (current: number, max: number) => {
    return Math.max(0, (current / max) * 100)
  }

  const getTotalCargoVolume = (ship: Ship) => {
    return ship.cargo.reduce((total, item) => total + item.volume, 0)
  }

  const selectShip = (ship: Ship) => {
    setSelectedShip(ship)
  }

  const clearSelection = () => {
    setSelectedShip(null)
  }

  return {
    ships: playerShips,
    selectedShip,
    selectShip,
    clearSelection,
    getStatusColor,
    getHealthPercentage,
    getTotalCargoVolume,
  }
}
