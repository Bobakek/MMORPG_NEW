"use client"

import { useState, useEffect } from "react"
import type { BattleShip, BattleLog } from "@/types"
import { battleShips } from "@/data"

export function useBattle() {
  const [ships, setShips] = useState<BattleShip[]>(battleShips)
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null)
  const [battleLog, setBattleLog] = useState<BattleLog[]>([
    { id: "1", timestamp: Date.now(), message: "Combat initiated. Prepare for battle!", type: "info" },
  ])
  const [isInCombat, setIsInCombat] = useState(true)
  const [combatTimer, setCombatTimer] = useState(0)

  const playerShip = ships.find((ship) => ship.isPlayer)
  const enemyShips = ships.filter((ship) => !ship.isPlayer && ship.hull > 0)

  const addBattleLog = (message: string, type: BattleLog["type"]) => {
    const newLog: BattleLog = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      message,
      type,
    }
    setBattleLog((prev) => [newLog, ...prev.slice(0, 9)])
  }

  const calculateDistance = (ship1: BattleShip, ship2: BattleShip) => {
    return Math.sqrt(Math.pow(ship2.x - ship1.x, 2) + Math.pow(ship2.y - ship1.y, 2))
  }

  const handleAttack = (weaponIndex: number) => {
    if (!playerShip || !selectedTarget) return

    const target = ships.find((ship) => ship.id === selectedTarget)
    if (!target || target.hull <= 0) return

    const weapon = playerShip.weapons[weaponIndex]
    if (weapon.currentCooldown > 0) return

    const distance = calculateDistance(playerShip, target)
    const maxRange = 400

    if (distance > maxRange) {
      addBattleLog(`Target out of range for ${weapon.name}`, "miss")
      return
    }

    const hitChance = Math.random()
    if (hitChance < 0.85) {
      let damage = weapon.damage + Math.floor(Math.random() * 100) - 50

      setShips((prev) =>
        prev.map((ship) => {
          if (ship.id === selectedTarget) {
            let newShield = ship.shield
            let newHull = ship.hull

            if (newShield > 0) {
              if (damage >= newShield) {
                damage -= newShield
                newHull = Math.max(0, newHull - damage)
                newShield = 0
              } else {
                newShield -= damage
                damage = 0
              }
            } else {
              newHull = Math.max(0, newHull - damage)
            }

            if (newHull <= 0) {
              addBattleLog(`${ship.name} destroyed!`, "destroy")
            } else {
              addBattleLog(`${weapon.name} hits ${ship.name} for ${weapon.damage} damage`, "damage")
            }

            return { ...ship, shield: newShield, hull: newHull }
          }
          return ship
        }),
      )

      setShips((prev) =>
        prev.map((ship) => {
          if (ship.isPlayer) {
            const newWeapons = [...ship.weapons]
            newWeapons[weaponIndex] = { ...weapon, currentCooldown: weapon.cooldown }
            return { ...ship, weapons: newWeapons }
          }
          return ship
        }),
      )
    } else {
      addBattleLog(`${weapon.name} misses ${target.name}`, "miss")
    }
  }

  const handleTargetSelect = (shipId: string) => {
    setShips((prev) =>
      prev.map((ship) => ({
        ...ship,
        isTargeted: ship.id === shipId && !ship.isPlayer,
      })),
    )
    setSelectedTarget(shipId)
  }

  const getHealthPercentage = (current: number, max: number) => {
    return Math.max(0, (current / max) * 100)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Weapon cooldown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setShips((prev) =>
        prev.map((ship) => {
          if (ship.isPlayer) {
            const newWeapons = ship.weapons.map((weapon) => ({
              ...weapon,
              currentCooldown: Math.max(0, weapon.currentCooldown - 100),
            }))
            return { ...ship, weapons: newWeapons }
          }
          return ship
        }),
      )
    }, 100)

    return () => clearInterval(interval)
  }, [])

  // Combat timer
  useEffect(() => {
    if (isInCombat) {
      const interval = setInterval(() => {
        setCombatTimer((prev) => prev + 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isInCombat])

  return {
    ships,
    selectedTarget,
    battleLog,
    isInCombat,
    combatTimer,
    playerShip,
    enemyShips,
    handleAttack,
    handleTargetSelect,
    getHealthPercentage,
    formatTime,
    calculateDistance,
  }
}
