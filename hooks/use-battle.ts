"use client"

import { useState, useEffect } from "react"
import type { BattleShip, BattleLog } from "@/types"

interface Mission {
  id: string
  name: string
  enemies: BattleShip[]
}

const playerTemplate: BattleShip = {
  id: "player1",
  name: "USS Endeavor",
  type: "Cruiser",
  hull: 8500,
  maxHull: 8500,
  shield: 2400,
  maxShield: 2400,
  x: 150,
  y: 200,
  rotation: 0,
  isPlayer: true,
  isTargeted: false,
  weapons: [
    { name: "Heavy Pulse Laser", damage: 420, range: 15000, cooldown: 3000, currentCooldown: 0 },
    { name: "Missile Launcher", damage: 680, range: 25000, cooldown: 5000, currentCooldown: 0 },
  ],
}

const missions: Mission[] = [
  {
    id: "skirmish",
    name: "Pirate Skirmish",
    enemies: [
      {
        id: "enemy1",
        name: "Crimson Raider",
        type: "Destroyer",
        hull: 4200,
        maxHull: 6500,
        shield: 1800,
        maxShield: 2100,
        x: 450,
        y: 180,
        rotation: 180,
        isPlayer: false,
        isTargeted: false,
        weapons: [{ name: "Plasma Cannon", damage: 380, range: 12000, cooldown: 2500, currentCooldown: 0 }],
      },
      {
        id: "enemy2",
        name: "Shadow Strike",
        type: "Frigate",
        hull: 2800,
        maxHull: 3200,
        shield: 900,
        maxShield: 1400,
        x: 500,
        y: 280,
        rotation: 135,
        isPlayer: false,
        isTargeted: false,
        weapons: [{ name: "Light Railgun", damage: 280, range: 18000, cooldown: 2000, currentCooldown: 0 }],
      },
    ],
  },
  {
    id: "convoy",
    name: "Convoy Ambush",
    enemies: [
      {
        id: "enemy3",
        name: "Escort Frigate",
        type: "Frigate",
        hull: 3000,
        maxHull: 3000,
        shield: 1000,
        maxShield: 1000,
        x: 470,
        y: 200,
        rotation: 180,
        isPlayer: false,
        isTargeted: false,
        weapons: [{ name: "Light Cannon", damage: 220, range: 10000, cooldown: 2000, currentCooldown: 0 }],
      },
    ],
  },
]

export function useBattle() {
  const [currentMission, setCurrentMission] = useState<Mission>(missions[0])
  const [ships, setShips] = useState<BattleShip[]>([playerTemplate, ...missions[0].enemies])
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null)
  const [battleLog, setBattleLog] = useState<BattleLog[]>([
    { id: "1", timestamp: Date.now(), message: "Mission initialized.", type: "info" },
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

  const performEnemyTurn = () => {
    if (!playerShip) return

    enemyShips.forEach((enemy) => {
      const weapon = enemy.weapons[0]
      if (!weapon || weapon.currentCooldown > 0) return

      const distance = calculateDistance(enemy, playerShip)
      const maxRange = 400

      if (distance > maxRange) {
        addBattleLog(`${enemy.name}'s ${weapon.name} out of range`, "miss")
        setShips((prev) =>
          prev.map((ship) => {
            if (ship.id === enemy.id) {
              const newWeapons = [...ship.weapons]
              newWeapons[0] = { ...weapon, currentCooldown: weapon.cooldown }
              return { ...ship, weapons: newWeapons }
            }
            return ship
          }),
        )
        return
      }

      const hitChance = Math.random()
      if (hitChance < 0.85) {
        let damage = weapon.damage + Math.floor(Math.random() * 100) - 50

        let newShield = playerShip.shield
        let newHull = playerShip.hull

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

        const playerDestroyed = newHull <= 0

        setShips((prev) =>
          prev.map((ship) => {
            if (ship.id === enemy.id) {
              const newWeapons = [...ship.weapons]
              newWeapons[0] = { ...weapon, currentCooldown: weapon.cooldown }
              return { ...ship, weapons: newWeapons }
            }
            if (ship.isPlayer) {
              return { ...ship, shield: newShield, hull: newHull }
            }
            return ship
          }),
        )

        if (playerDestroyed) {
          addBattleLog(`${playerShip.name} destroyed!`, "destroy")
        } else {
          addBattleLog(`${enemy.name} hits ${playerShip.name} for ${weapon.damage} damage`, "damage")
        }
      } else {
        addBattleLog(`${enemy.name}'s ${weapon.name} misses ${playerShip.name}`, "miss")
        setShips((prev) =>
          prev.map((ship) => {
            if (ship.id === enemy.id) {
              const newWeapons = [...ship.weapons]
              newWeapons[0] = { ...weapon, currentCooldown: weapon.cooldown }
              return { ...ship, weapons: newWeapons }
            }
            return ship
          }),
        )
      }
    })
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
          const newWeapons = ship.weapons.map((weapon) => ({
            ...weapon,
            currentCooldown: Math.max(0, weapon.currentCooldown - 100),
          }))
          return { ...ship, weapons: newWeapons }
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

  useEffect(() => {
    if (isInCombat) {
      const interval = setInterval(() => {
        performEnemyTurn()
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isInCombat, enemyShips, playerShip])

  const startMission = (missionId: string) => {
    const mission = missions.find((m) => m.id === missionId)
    if (!mission) return
    setShips([playerTemplate, ...mission.enemies])
    setSelectedTarget(null)
    setBattleLog([
      { id: Date.now().toString(), timestamp: Date.now(), message: `Mission ${mission.name} started`, type: "info" },
    ])
    setCurrentMission(mission)
    setIsInCombat(true)
    setCombatTimer(0)
  }

  return {
    ships,
    selectedTarget,
    battleLog,
    isInCombat,
    combatTimer,
    playerShip,
    enemyShips,
    missions,
    currentMission,
    handleAttack,
    handleTargetSelect,
    startMission,
    getHealthPercentage,
    formatTime,
    calculateDistance,
  }
}

