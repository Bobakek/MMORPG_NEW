"use client"

import { useState, useEffect, useReducer } from "react"
import type { BattleShip, BattleLog } from "@/types"
import { useStore } from "@/store"

interface Mission {
  id: string
  name: string
  description: string
  reward: number
  difficulty: "easy" | "medium" | "hard"
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
    description: "Clear out a small pirate scouting party.",
    reward: 500,
    difficulty: "easy",
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
    description: "Escort a convoy under heavy attack.",
    reward: 800,
    difficulty: "medium",
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
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null)
  const [isInCombat, setIsInCombat] = useState(true)

  const addExperience = useStore((s) => s.addExperience)

  const createLog = (message: string, type: BattleLog["type"]): BattleLog => ({
    id: Date.now().toString(),
    timestamp: Date.now(),
    message,
    type,
  })

  const calculateDistance = (ship1: BattleShip, ship2: BattleShip) => {
    return Math.sqrt(Math.pow(ship2.x - ship1.x, 2) + Math.pow(ship2.y - ship1.y, 2))
  }

  interface BattleState {
    ships: BattleShip[]
    battleLog: BattleLog[]
    combatTimer: number // milliseconds
    enemyTurnTimer: number
  }

  type BattleAction =
    | { type: "SET_MISSION"; ships: BattleShip[]; message: string }
    | { type: "ADD_LOG"; log: BattleLog }
    | { type: "SELECT_TARGET"; shipId: string }
    | { type: "PLAYER_ATTACK"; weaponIndex: number; targetId: string; addExperience: (exp: number) => void }
    | { type: "TICK"; delta: number }

  const initialState: BattleState = {
    ships: [playerTemplate, ...missions[0].enemies],
    battleLog: [createLog("Mission initialized.", "info")],
    combatTimer: 0,
    enemyTurnTimer: 0,
  }

  const battleReducer = (state: BattleState, action: BattleAction): BattleState => {
    switch (action.type) {
      case "SET_MISSION":
        return {
          ships: action.ships,
          battleLog: [createLog(action.message, "info")],
          combatTimer: 0,
          enemyTurnTimer: 0,
        }
      case "ADD_LOG":
        return {
          ...state,
          battleLog: [action.log, ...state.battleLog.slice(0, 9)],
        }
      case "SELECT_TARGET":
        return {
          ...state,
          ships: state.ships.map((ship) => ({
            ...ship,
            isTargeted: ship.id === action.shipId && !ship.isPlayer,
          })),
        }
      case "PLAYER_ATTACK": {
        const { weaponIndex, targetId, addExperience } = action
        const ships = state.ships.map((s) => ({
          ...s,
          weapons: s.weapons.map((w) => ({ ...w })),
        }))
        const player = ships.find((s) => s.isPlayer)
        const target = ships.find((s) => s.id === targetId)
        if (!player || !target || target.hull <= 0) return state
        const weapon = player.weapons[weaponIndex]
        if (!weapon || weapon.currentCooldown > 0) return state
        const distance = calculateDistance(player, target)
        const maxRange = 400
        if (distance > maxRange) {
          return {
            ...state,
            battleLog: [
              createLog(`Target out of range for ${weapon.name}`, "miss"),
              ...state.battleLog.slice(0, 9),
            ],
          }
        }
        const hitChance = Math.random()
        if (hitChance < 0.85) {
          let damage = weapon.damage + Math.floor(Math.random() * 100) - 50
          let newShield = target.shield
          let newHull = target.hull
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
          const targetDestroyed = newHull <= 0
          player.weapons[weaponIndex].currentCooldown = weapon.cooldown
          const updatedShips = ships.map((s) => {
            if (s.id === targetId) return { ...s, shield: newShield, hull: newHull }
            if (s.isPlayer) return player
            return s
          })
          const log = targetDestroyed
            ? createLog(`${target.name} destroyed!`, "destroy")
            : createLog(`${weapon.name} hits ${target.name} for ${weapon.damage} damage`, "damage")
          if (targetDestroyed) addExperience(100)
          return {
            ...state,
            ships: updatedShips,
            battleLog: [log, ...state.battleLog.slice(0, 9)],
          }
        }
        player.weapons[weaponIndex].currentCooldown = weapon.cooldown
        return {
          ...state,
          ships,
          battleLog: [
            createLog(`${weapon.name} misses ${target.name}`, "miss"),
            ...state.battleLog.slice(0, 9),
          ],
        }
      }
      case "TICK": {
        const delta = action.delta
        let ships = state.ships.map((s) => ({
          ...s,
          weapons: s.weapons.map((w) => ({
            ...w,
            currentCooldown: Math.max(0, w.currentCooldown - delta),
          })),
        }))
        let enemyTurnTimer = state.enemyTurnTimer + delta
        let battleLog = state.battleLog
        while (enemyTurnTimer >= 1000) {
          const result = performEnemyTurn(ships)
          ships = result.ships
          if (result.logs.length > 0) {
            battleLog = [...result.logs, ...battleLog].slice(0, 10)
          }
          enemyTurnTimer -= 1000
        }
        return {
          ships,
          battleLog,
          combatTimer: state.combatTimer + delta,
          enemyTurnTimer,
        }
      }
      default:
        return state
    }
  }

  const performEnemyTurn = (ships: BattleShip[]) => {
    const logs: BattleLog[] = []
    const updatedShips = ships.map((s) => ({
      ...s,
      weapons: s.weapons.map((w) => ({ ...w })),
    }))
    const playerIndex = updatedShips.findIndex((s) => s.isPlayer)
    const player = updatedShips[playerIndex]
    if (!player) return { ships: updatedShips, logs }

    updatedShips.forEach((enemy, index) => {
      if (enemy.isPlayer || enemy.hull <= 0) return
      const weapon = enemy.weapons[0]
      if (!weapon || weapon.currentCooldown > 0) return
      const distance = calculateDistance(enemy, player)
      const maxRange = 400
      enemy.weapons[0].currentCooldown = weapon.cooldown
      if (distance > maxRange) {
        logs.push(createLog(`${enemy.name}'s ${weapon.name} out of range`, "miss"))
        return
      }
      const hitChance = Math.random()
      if (hitChance < 0.85) {
        let damage = weapon.damage + Math.floor(Math.random() * 100) - 50
        let newShield = player.shield
        let newHull = player.hull
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
        updatedShips[playerIndex] = { ...player, shield: newShield, hull: newHull }
        logs.push(
          newHull <= 0
            ? createLog(`${player.name} destroyed!`, "destroy")
            : createLog(`${enemy.name} hits ${player.name} for ${weapon.damage} damage`, "damage"),
        )
      } else {
        logs.push(createLog(`${enemy.name}'s ${weapon.name} misses ${player.name}`, "miss"))
      }
    })

    return { ships: updatedShips, logs }
  }

  const [state, dispatch] = useReducer(battleReducer, initialState)

  const ships = state.ships
  const battleLog = state.battleLog
  const combatTimer = state.combatTimer

  const playerShip = ships.find((ship) => ship.isPlayer)
  const enemyShips = ships.filter((ship) => !ship.isPlayer && ship.hull > 0)

  const handleAttack = (weaponIndex: number) => {
    if (!selectedTarget) return
    dispatch({ type: "PLAYER_ATTACK", weaponIndex, targetId: selectedTarget, addExperience })
  }

  const handleTargetSelect = (shipId: string) => {
    dispatch({ type: "SELECT_TARGET", shipId })
    setSelectedTarget(shipId)
  }

  useEffect(() => {
    if (!isInCombat) return
    let frameId: number
    let last = performance.now()
    const loop = (time: number) => {
      const delta = time - last
      last = time
      dispatch({ type: "TICK", delta })
      frameId = requestAnimationFrame(loop)
    }
    frameId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameId)
  }, [isInCombat])

  useEffect(() => {
    if (isInCombat && enemyShips.length === 0) {
      dispatch({ type: "ADD_LOG", log: createLog(`Mission ${currentMission.name} completed`, "info") })
      setIsInCombat(false)
      addExperience(currentMission.reward)
    }
  }, [enemyShips, isInCombat, currentMission, addExperience])

  const startMission = (missionId: string) => {
    const mission = missions.find((m) => m.id === missionId)
    if (!mission) return
    dispatch({
      type: "SET_MISSION",
      ships: [playerTemplate, ...mission.enemies],
      message: `Mission ${mission.name} started`,
    })
    setSelectedTarget(null)
    setCurrentMission(mission)
    setIsInCombat(true)
  }

  const getHealthPercentage = (current: number, max: number) => {
    return Math.max(0, (current / max) * 100)
  }

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
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

