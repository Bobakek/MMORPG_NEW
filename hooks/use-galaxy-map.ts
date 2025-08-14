"use client"

import { useState } from "react"
import type { StarSystem } from "@/types"
import { starSystems } from "@/data"

export function useGalaxyMap() {
  const [selectedSystem, setSelectedSystem] = useState<StarSystem | null>(null)
  const [playerLocation] = useState("1") // Sol system

  const getSecurityColor = (security: StarSystem["security"]) => {
    switch (security) {
      case "high":
        return "#10b981" // green
      case "low":
        return "#f59e0b" // amber
      case "null":
        return "#ef4444" // red
      default:
        return "#6b7280" // gray
    }
  }

  const selectSystem = (system: StarSystem) => {
    setSelectedSystem(system)
  }

  const clearSelection = () => {
    setSelectedSystem(null)
  }

  return {
    starSystems,
    selectedSystem,
    playerLocation,
    selectSystem,
    clearSelection,
    getSecurityColor,
  }
}
