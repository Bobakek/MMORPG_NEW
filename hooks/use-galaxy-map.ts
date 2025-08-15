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
  const [travelPath, setTravelPath] = useState<string[]>([])

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

  const findPath = (startId: string, goalId: string) => {
    const getSystem = (id: string) => starSystems.find((s) => s.id === id)!
    const start = getSystem(startId)
    const goal = getSystem(goalId)

    const openSet = new Set<string>([start.id])
    const cameFrom = new Map<string, string>()
    const gScore = new Map<string, number>()
    const fScore = new Map<string, number>()

    for (const system of starSystems) {
      gScore.set(system.id, Infinity)
      fScore.set(system.id, Infinity)
    }
    gScore.set(start.id, 0)
    fScore.set(start.id, Math.hypot(start.x - goal.x, start.y - goal.y))

    while (openSet.size > 0) {
      let current: string | null = null
      let currentF = Infinity
      for (const id of openSet) {
        const f = fScore.get(id) ?? Infinity
        if (f < currentF) {
          currentF = f
          current = id
        }
      }

      if (!current) break
      if (current === goal.id) {
        const totalPath = [current]
        while (cameFrom.has(current)) {
          current = cameFrom.get(current)!
          totalPath.unshift(current)
        }
        return totalPath
      }

      openSet.delete(current)
      const currentSystem = getSystem(current)
      for (const neighborId of currentSystem.connected) {
        const neighbor = getSystem(neighborId)
        const tentativeG =
          (gScore.get(current) ?? Infinity) +
          Math.hypot(neighbor.x - currentSystem.x, neighbor.y - currentSystem.y)
        if (tentativeG < (gScore.get(neighborId) ?? Infinity)) {
          cameFrom.set(neighborId, current)
          gScore.set(neighborId, tentativeG)
          fScore.set(
            neighborId,
            tentativeG +
              Math.hypot(neighbor.x - goal.x, neighbor.y - goal.y),
          )
          openSet.add(neighborId)
        }
      }
    }

    return []
  }

  const initiateTravel = (system: StarSystem) => {
    if (traveling || system.id === playerLocation) return
    const path = findPath(playerLocation, system.id)
    if (path.length < 2) return

    let totalDistance = 0
    for (let i = 0; i < path.length - 1; i++) {
      const from = starSystems.find((s) => s.id === path[i])!
      const to = starSystems.find((s) => s.id === path[i + 1])!
      totalDistance += Math.hypot(to.x - from.x, to.y - from.y)
    }
    const fuelCost = totalDistance / 100
    if (fuel < fuelCost) return

    setDestination(system.id)
    setTraveling(true)
    setTravelProgress(0)
    setTravelPath(path)

    const travelTime = totalDistance * 10
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
        setTravelPath([])
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
    travelPath,
    selectSystem,
    initiateTravel,
    clearSelection,
    getSecurityColor,
  }
}
