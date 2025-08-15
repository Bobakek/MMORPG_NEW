"use client"

import { useState } from "react"
import type { StarSystem } from "@/types"
import { starSystems } from "@/data"

export function useGalaxyMap() {
  const [selectedSystem, setSelectedSystem] = useState<StarSystem | null>(null)
  const [playerLocation, setPlayerLocation] = useState("1") // Sol system
  const [destination, setDestination] = useState<string | null>(null)
  const [traveling, setTraveling] = useState(false)
  const [travelProgress, setTravelProgress] = useState(0)
  const [fuel, setFuel] = useState(100)

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

  const initiateTravel = (system: StarSystem) => {
    if (traveling || system.id === playerLocation) return
    const current = starSystems.find((s) => s.id === playerLocation)
    if (!current) return

    const distance = Math.hypot(system.x - current.x, system.y - current.y)
    const fuelCost = distance / 100
    if (fuel < fuelCost) return

    setDestination(system.id)
    setTraveling(true)
    setTravelProgress(0)

    const travelTime = distance * 10
    const start = Date.now()

    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      const progress = Math.min((elapsed / travelTime) * 100, 100)
      setTravelProgress(progress)
      if (progress >= 100) {
        clearInterval(interval)
        setTraveling(false)
        setDestination(null)
        setPlayerLocation(system.id)
        setFuel((f) => Math.max(f - fuelCost, 0))
      }
    }, 100)
  }

  const clearSelection = () => {
    setSelectedSystem(null)
  }

  return {
    starSystems,
    selectedSystem,
    playerLocation,
    destination,
    traveling,
    travelProgress,
    fuel,
    selectSystem,
    initiateTravel,
    clearSelection,
    getSecurityColor,
  }
}
