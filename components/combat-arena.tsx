"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Activity, Crosshair, Target, Sword, Users, Shield, Crown, Star } from "lucide-react"
import type { BattleShip, BattleLog, ShipModule } from "@/types"

type FormationType = "line" | "wedge" | "circle" | "scattered"
type RaidType = "patrol" | "convoy" | "base" | "boss"

interface Formation {
  type: FormationType
  name: string
  description: string
  bonuses: {
    attack?: number
    defense?: number
    speed?: number
  }
  positions: Array<{ x: number; y: number }>
}

interface RaidWave {
  id: string
  name: string
  enemies: BattleShip[]
  rewards: {
    credits: number
    experience: number
    loot: string[]
  }
  isBoss?: boolean
}

interface RaidMission {
  id: string
  name: string
  type: RaidType
  difficulty: "Easy" | "Medium" | "Hard" | "Elite"
  description: string
  waves: RaidWave[]
  totalRewards: {
    credits: number
    experience: number
    loot: string[]
  }
}

const raidMissions: RaidMission[] = [
  {
    id: "patrol1",
    name: "Pirate Patrol",
    type: "patrol",
    difficulty: "Easy",
    description: "Clear out a small pirate patrol threatening trade routes",
    waves: [
      {
        id: "wave1",
        name: "Scout Ships",
        enemies: [
          {
            id: "pirate1",
            name: "Raider Scout",
            type: "Frigate",
            hull: 2200,
            maxHull: 2200,
            shield: 800,
            maxShield: 800,
            x: 450,
            y: 160,
            rotation: 180,
            isPlayer: false,
            isTargeted: false,
            weapons: [{ name: "Light Cannon", damage: 180, range: 10000, cooldown: 2000, currentCooldown: 0 }],
            modules: [],
            damageModifiers: {
              weaponEfficiency: 0.8,
              shieldRegenRate: 0.7,
              enginePower: 1.1,
              sensorRange: 0.9,
              armorResistance: 0.6,
            },
          },
          {
            id: "pirate2",
            name: "Raider Scout",
            type: "Frigate",
            hull: 2200,
            maxHull: 2200,
            shield: 800,
            maxShield: 800,
            x: 480,
            y: 240,
            rotation: 180,
            isPlayer: false,
            isTargeted: false,
            weapons: [{ name: "Light Cannon", damage: 180, range: 10000, cooldown: 2000, currentCooldown: 0 }],
            modules: [],
            damageModifiers: {
              weaponEfficiency: 0.8,
              shieldRegenRate: 0.7,
              enginePower: 1.1,
              sensorRange: 0.9,
              armorResistance: 0.6,
            },
          },
        ],
        rewards: {
          credits: 5000,
          experience: 250,
          loot: ["Scrap Metal", "Basic Components"],
        },
      },
    ],
    totalRewards: {
      credits: 5000,
      experience: 250,
      loot: ["Scrap Metal", "Basic Components"],
    },
  },
  {
    id: "convoy1",
    name: "Convoy Assault",
    type: "convoy",
    difficulty: "Medium",
    description: "Intercept and destroy an enemy supply convoy",
    waves: [
      {
        id: "wave1",
        name: "Escort Ships",
        enemies: [
          {
            id: "escort1",
            name: "Convoy Escort",
            type: "Destroyer",
            hull: 4500,
            maxHull: 4500,
            shield: 1500,
            maxShield: 1500,
            x: 420,
            y: 180,
            rotation: 180,
            isPlayer: false,
            isTargeted: false,
            weapons: [{ name: "Pulse Laser", damage: 320, range: 12000, cooldown: 2500, currentCooldown: 0 }],
            modules: [],
            damageModifiers: {
              weaponEfficiency: 0.9,
              shieldRegenRate: 0.8,
              enginePower: 0.9,
              sensorRange: 1.0,
              armorResistance: 0.8,
            },
          },
          {
            id: "transport1",
            name: "Supply Transport",
            type: "Transport",
            hull: 6000,
            maxHull: 6000,
            shield: 1000,
            maxShield: 1000,
            x: 480,
            y: 220,
            rotation: 180,
            isPlayer: false,
            isTargeted: false,
            weapons: [{ name: "Defense Turret", damage: 150, range: 8000, cooldown: 3000, currentCooldown: 0 }],
            modules: [],
            damageModifiers: {
              weaponEfficiency: 0.6,
              shieldRegenRate: 0.5,
              enginePower: 0.7,
              sensorRange: 0.8,
              armorResistance: 1.2,
            },
          },
        ],
        rewards: {
          credits: 12000,
          experience: 600,
          loot: ["Advanced Components", "Rare Minerals"],
        },
      },
    ],
    totalRewards: {
      credits: 12000,
      experience: 600,
      loot: ["Advanced Components", "Rare Minerals"],
    },
  },
  {
    id: "boss1",
    name: "Dreadnought Assault",
    type: "boss",
    difficulty: "Elite",
    description: "Face the legendary pirate dreadnought 'Void Reaper'",
    waves: [
      {
        id: "wave1",
        name: "Support Fleet",
        enemies: [
          {
            id: "support1",
            name: "Elite Guardian",
            type: "Cruiser",
            hull: 7000,
            maxHull: 7000,
            shield: 2500,
            maxShield: 2500,
            x: 400,
            y: 160,
            rotation: 180,
            isPlayer: false,
            isTargeted: false,
            weapons: [{ name: "Heavy Plasma", damage: 450, range: 15000, cooldown: 3000, currentCooldown: 0 }],
            modules: [],
            damageModifiers: {
              weaponEfficiency: 1.1,
              shieldRegenRate: 1.0,
              enginePower: 0.9,
              sensorRange: 1.1,
              armorResistance: 1.0,
            },
          },
          {
            id: "support2",
            name: "Elite Guardian",
            type: "Cruiser",
            hull: 7000,
            maxHull: 7000,
            shield: 2500,
            maxShield: 2500,
            x: 520,
            y: 280,
            rotation: 180,
            isPlayer: false,
            isTargeted: false,
            weapons: [{ name: "Heavy Plasma", damage: 450, range: 15000, cooldown: 3000, currentCooldown: 0 }],
            modules: [],
            damageModifiers: {
              weaponEfficiency: 1.1,
              shieldRegenRate: 1.0,
              enginePower: 0.9,
              sensorRange: 1.1,
              armorResistance: 1.0,
            },
          },
        ],
        rewards: {
          credits: 8000,
          experience: 400,
          loot: ["Elite Components"],
        },
      },
      {
        id: "wave2",
        name: "Void Reaper",
        enemies: [
          {
            id: "boss1",
            name: "Void Reaper",
            type: "Dreadnought",
            hull: 25000,
            maxHull: 25000,
            shield: 8000,
            maxShield: 8000,
            x: 460,
            y: 220,
            rotation: 180,
            isPlayer: false,
            isTargeted: false,
            weapons: [
              { name: "Devastator Cannon", damage: 800, range: 20000, cooldown: 4000, currentCooldown: 0 },
              { name: "Missile Barrage", damage: 600, range: 18000, cooldown: 6000, currentCooldown: 0 },
            ],
            modules: [],
            damageModifiers: {
              weaponEfficiency: 1.3,
              shieldRegenRate: 1.2,
              enginePower: 0.8,
              sensorRange: 1.2,
              armorResistance: 1.5,
            },
          },
        ],
        rewards: {
          credits: 50000,
          experience: 2500,
          loot: ["Legendary Module", "Void Crystal", "Boss Trophy"],
        },
        isBoss: true,
      },
    ],
    totalRewards: {
      credits: 58000,
      experience: 2900,
      loot: ["Elite Components", "Legendary Module", "Void Crystal", "Boss Trophy"],
    },
  },
]

const formations: Record<FormationType, Formation> = {
  line: {
    type: "line",
    name: "Line Formation",
    description: "Ships form a battle line for maximum firepower",
    bonuses: { attack: 15 },
    positions: [
      { x: 120, y: 180 },
      { x: 120, y: 220 },
      { x: 120, y: 260 },
    ],
  },
  wedge: {
    type: "wedge",
    name: "Wedge Formation",
    description: "Concentrated assault formation",
    bonuses: { attack: 10, speed: 10 },
    positions: [
      { x: 100, y: 200 },
      { x: 130, y: 180 },
      { x: 130, y: 220 },
    ],
  },
  circle: {
    type: "circle",
    name: "Defensive Circle",
    description: "Mutual protection formation",
    bonuses: { defense: 20 },
    positions: [
      { x: 120, y: 180 },
      { x: 140, y: 200 },
      { x: 120, y: 220 },
    ],
  },
  scattered: {
    type: "scattered",
    name: "Scattered Formation",
    description: "Spread out to avoid area damage",
    bonuses: { defense: 10, speed: 15 },
    positions: [
      { x: 100, y: 160 },
      { x: 140, y: 200 },
      { x: 110, y: 240 },
    ],
  },
}

const battleShips: BattleShip[] = [
  {
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
    modules: [
      {
        id: "weapon1",
        name: "Primary Weapons",
        type: "weapon",
        health: 100,
        maxHealth: 100,
        efficiency: 100,
        status: "operational",
        criticalThreshold: 25,
      },
      {
        id: "shield1",
        name: "Shield Generator",
        type: "shield",
        health: 100,
        maxHealth: 100,
        efficiency: 100,
        status: "operational",
        criticalThreshold: 30,
      },
      {
        id: "engine1",
        name: "Main Engine",
        type: "engine",
        health: 100,
        maxHealth: 100,
        efficiency: 100,
        status: "operational",
        criticalThreshold: 20,
      },
      {
        id: "sensor1",
        name: "Sensor Array",
        type: "sensor",
        health: 100,
        maxHealth: 100,
        efficiency: 100,
        status: "operational",
        criticalThreshold: 40,
      },
      {
        id: "armor1",
        name: "Armor Plating",
        type: "armor",
        health: 100,
        maxHealth: 100,
        efficiency: 100,
        status: "operational",
        criticalThreshold: 15,
      },
    ],
    damageModifiers: {
      weaponEfficiency: 1.0,
      shieldRegenRate: 1.0,
      enginePower: 1.0,
      sensorRange: 1.0,
      armorResistance: 1.0,
    },
  },
  {
    id: "player2",
    name: "USS Valiant",
    type: "Destroyer",
    hull: 6200,
    maxHull: 6200,
    shield: 1800,
    maxShield: 1800,
    x: 150,
    y: 240,
    rotation: 0,
    isPlayer: true,
    isTargeted: false,
    weapons: [{ name: "Plasma Cannon", damage: 380, range: 12000, cooldown: 2500, currentCooldown: 0 }],
    modules: [
      {
        id: "weapon2",
        name: "Primary Weapons",
        type: "weapon",
        health: 100,
        maxHealth: 100,
        efficiency: 100,
        status: "operational",
        criticalThreshold: 25,
      },
      {
        id: "shield2",
        name: "Shield Generator",
        type: "shield",
        health: 100,
        maxHealth: 100,
        efficiency: 100,
        status: "operational",
        criticalThreshold: 30,
      },
      {
        id: "engine2",
        name: "Main Engine",
        type: "engine",
        health: 100,
        maxHealth: 100,
        efficiency: 100,
        status: "operational",
        criticalThreshold: 20,
      },
      {
        id: "sensor2",
        name: "Sensor Array",
        type: "sensor",
        health: 100,
        maxHealth: 100,
        efficiency: 100,
        status: "operational",
        criticalThreshold: 40,
      },
      {
        id: "armor2",
        name: "Armor Plating",
        type: "armor",
        health: 100,
        maxHealth: 100,
        efficiency: 100,
        status: "operational",
        criticalThreshold: 15,
      },
    ],
    damageModifiers: {
      weaponEfficiency: 1.0,
      shieldRegenRate: 1.0,
      enginePower: 1.0,
      sensorRange: 1.0,
      armorResistance: 1.0,
    },
  },
  {
    id: "player3",
    name: "USS Guardian",
    type: "Frigate",
    hull: 4100,
    maxHull: 4100,
    shield: 1200,
    maxShield: 1200,
    x: 150,
    y: 280,
    rotation: 0,
    isPlayer: true,
    isTargeted: false,
    weapons: [{ name: "Light Railgun", damage: 280, range: 18000, cooldown: 2000, currentCooldown: 0 }],
    modules: [
      {
        id: "weapon3",
        name: "Primary Weapons",
        type: "weapon",
        health: 100,
        maxHealth: 100,
        efficiency: 100,
        status: "operational",
        criticalThreshold: 25,
      },
      {
        id: "shield3",
        name: "Shield Generator",
        type: "shield",
        health: 100,
        maxHealth: 100,
        efficiency: 100,
        status: "operational",
        criticalThreshold: 30,
      },
      {
        id: "engine3",
        name: "Main Engine",
        type: "engine",
        health: 100,
        maxHealth: 100,
        efficiency: 100,
        status: "operational",
        criticalThreshold: 20,
      },
      {
        id: "sensor3",
        name: "Sensor Array",
        type: "sensor",
        health: 100,
        maxHealth: 100,
        efficiency: 100,
        status: "operational",
        criticalThreshold: 40,
      },
      {
        id: "armor3",
        name: "Armor Plating",
        type: "armor",
        health: 100,
        maxHealth: 100,
        efficiency: 100,
        status: "operational",
        criticalThreshold: 15,
      },
    ],
    damageModifiers: {
      weaponEfficiency: 1.0,
      shieldRegenRate: 1.0,
      enginePower: 1.0,
      sensorRange: 1.0,
      armorResistance: 1.0,
    },
  },
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
    modules: [
      {
        id: "enemy_weapon1",
        name: "Primary Weapons",
        type: "weapon",
        health: 85,
        maxHealth: 100,
        efficiency: 85,
        status: "damaged",
        criticalThreshold: 25,
      },
      {
        id: "enemy_shield1",
        name: "Shield Generator",
        type: "shield",
        health: 60,
        maxHealth: 100,
        efficiency: 60,
        status: "damaged",
        criticalThreshold: 30,
      },
      {
        id: "enemy_engine1",
        name: "Main Engine",
        type: "engine",
        health: 90,
        maxHealth: 100,
        efficiency: 90,
        status: "operational",
        criticalThreshold: 20,
      },
      {
        id: "enemy_sensor1",
        name: "Sensor Array",
        type: "sensor",
        health: 70,
        maxHealth: 100,
        efficiency: 70,
        status: "damaged",
        criticalThreshold: 40,
      },
      {
        id: "enemy_armor1",
        name: "Armor Plating",
        type: "armor",
        health: 45,
        maxHealth: 100,
        efficiency: 45,
        status: "damaged",
        criticalThreshold: 15,
      },
    ],
    damageModifiers: {
      weaponEfficiency: 0.85,
      shieldRegenRate: 0.6,
      enginePower: 0.9,
      sensorRange: 0.7,
      armorResistance: 0.45,
    },
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
    modules: [
      {
        id: "enemy_weapon2",
        name: "Primary Weapons",
        type: "weapon",
        health: 75,
        maxHealth: 100,
        efficiency: 75,
        status: "damaged",
        criticalThreshold: 25,
      },
      {
        id: "enemy_shield2",
        name: "Shield Generator",
        type: "shield",
        health: 40,
        maxHealth: 100,
        efficiency: 40,
        status: "damaged",
        criticalThreshold: 30,
      },
      {
        id: "enemy_engine2",
        name: "Main Engine",
        type: "engine",
        health: 95,
        maxHealth: 100,
        efficiency: 95,
        status: "operational",
        criticalThreshold: 20,
      },
      {
        id: "enemy_sensor2",
        name: "Sensor Array",
        type: "sensor",
        health: 80,
        maxHealth: 100,
        efficiency: 80,
        status: "operational",
        criticalThreshold: 40,
      },
      {
        id: "enemy_armor2",
        name: "Armor Plating",
        type: "armor",
        health: 30,
        maxHealth: 100,
        efficiency: 30,
        status: "damaged",
        criticalThreshold: 15,
      },
    ],
    damageModifiers: {
      weaponEfficiency: 0.75,
      shieldRegenRate: 0.4,
      enginePower: 0.95,
      sensorRange: 0.8,
      armorResistance: 0.3,
    },
  },
]

interface CombatArenaProps {
  onBack: () => void
}

export function CombatArena({ onBack }: CombatArenaProps) {
  const [ships, setShips] = useState<BattleShip[]>([])
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null)
  const [selectedShipForModules, setSelectedShipForModules] = useState<string | null>(null)
  const [battleLog, setBattleLog] = useState<BattleLog[]>([
    { id: "1", timestamp: Date.now(), message: "Select a PvE raid mission to begin!", type: "info" },
  ])
  const [isInCombat, setIsInCombat] = useState(false)
  const [combatTimer, setCombatTimer] = useState(0)
  const [currentFormation, setCurrentFormation] = useState<FormationType>("line")
  const [isFormationActive, setIsFormationActive] = useState(false)
  const [selectedRaid, setSelectedRaid] = useState<RaidMission | null>(null)
  const [currentWaveIndex, setCurrentWaveIndex] = useState(0)
  const [isRaidActive, setIsRaidActive] = useState(false)
  const [raidRewards, setRaidRewards] = useState<{ credits: number; experience: number; loot: string[] }>({
    credits: 0,
    experience: 0,
    loot: [],
  })

  const [autoAttack, setAutoAttack] = useState(false)
  const [autoAttackTarget, setAutoAttackTarget] = useState<string | null>(null)

  const playerShips = ships.filter((ship) => ship.isPlayer && ship.hull > 0)
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

  const startRaidMission = (raid: RaidMission) => {
    setSelectedRaid(raid)
    setCurrentWaveIndex(0)
    setIsRaidActive(true)
    setIsInCombat(true)
    setRaidRewards({ credits: 0, experience: 0, loot: [] })

    // Initialize player ships
    const playerFleet: BattleShip[] = [
      {
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
        modules: [],
        damageModifiers: {
          weaponEfficiency: 1.0,
          shieldRegenRate: 1.0,
          enginePower: 1.0,
          sensorRange: 1.0,
          armorResistance: 1.0,
        },
      },
      {
        id: "player2",
        name: "USS Valiant",
        type: "Destroyer",
        hull: 6200,
        maxHull: 6200,
        shield: 1800,
        maxShield: 1800,
        x: 150,
        y: 240,
        rotation: 0,
        isPlayer: true,
        isTargeted: false,
        weapons: [{ name: "Plasma Cannon", damage: 380, range: 12000, cooldown: 2500, currentCooldown: 0 }],
        modules: [],
        damageModifiers: {
          weaponEfficiency: 1.0,
          shieldRegenRate: 1.0,
          enginePower: 1.0,
          sensorRange: 1.0,
          armorResistance: 1.0,
        },
      },
    ]

    // Start first wave
    const firstWave = raid.waves[0]
    setShips([...playerFleet, ...firstWave.enemies])
    addBattleLog(`${raid.name} initiated! Wave 1: ${firstWave.name}`, "info")
  }

  const checkWaveCompletion = () => {
    if (!selectedRaid || !isRaidActive) return

    const currentWave = selectedRaid.waves[currentWaveIndex]
    const waveEnemiesAlive = ships.filter(
      (ship) => !ship.isPlayer && ship.hull > 0 && currentWave.enemies.some((e) => e.id === ship.id),
    )

    if (waveEnemiesAlive.length === 0) {
      // Wave completed
      const waveRewards = currentWave.rewards
      setRaidRewards((prev) => ({
        credits: prev.credits + waveRewards.credits,
        experience: prev.experience + waveRewards.experience,
        loot: [...prev.loot, ...waveRewards.loot],
      }))

      addBattleLog(`Wave completed! Rewards: ${waveRewards.credits} credits, ${waveRewards.experience} XP`, "info")

      if (currentWaveIndex < selectedRaid.waves.length - 1) {
        // Start next wave
        setTimeout(() => {
          const nextWaveIndex = currentWaveIndex + 1
          const nextWave = selectedRaid.waves[nextWaveIndex]
          setCurrentWaveIndex(nextWaveIndex)
          setShips((prev) => [...prev.filter((ship) => ship.isPlayer), ...nextWave.enemies])
          addBattleLog(`Wave ${nextWaveIndex + 1}: ${nextWave.name}${nextWave.isBoss ? " (BOSS)" : ""}`, "info")
        }, 2000)
      } else {
        // Raid completed
        setTimeout(() => {
          setIsRaidActive(false)
          setIsInCombat(false)
          addBattleLog(`${selectedRaid.name} completed! Total rewards collected.`, "info")
        }, 2000)
      }
    }
  }

  useEffect(() => {
    checkWaveCompletion()
  }, [ships, selectedRaid, currentWaveIndex, isRaidActive])

  const applyFormation = (formationType: FormationType) => {
    const formation = formations[formationType]
    const playerShipsList = ships.filter((ship) => ship.isPlayer)

    setShips((prev) =>
      prev.map((ship) => {
        if (ship.isPlayer) {
          const index = playerShipsList.findIndex((p) => p.id === ship.id)
          if (index < formation.positions.length) {
            return {
              ...ship,
              x: formation.positions[index].x,
              y: formation.positions[index].y,
            }
          }
        }
        return ship
      }),
    )

    setCurrentFormation(formationType)
    setIsFormationActive(true)
    addBattleLog(
      `Fleet formed ${formation.name}! Bonuses: ${Object.entries(formation.bonuses)
        .map(([key, value]) => `${key} +${value}%`)
        .join(", ")}`,
      "info",
    )
  }

  const calculateFormationBonus = (baseValue: number, bonusType: keyof Formation["bonuses"]) => {
    if (!isFormationActive) return baseValue
    const bonus = formations[currentFormation].bonuses[bonusType] || 0
    return Math.floor(baseValue * (1 + bonus / 100))
  }

  const calculateDistance = (ship1: BattleShip, ship2: BattleShip) => {
    return Math.sqrt(Math.pow(ship2.x - ship1.x, 2) + Math.pow(ship2.y - ship1.y, 2))
  }

  const damageRandomModule = (ship: BattleShip, damage: number) => {
    const operationalModules = ship.modules.filter((m) => m.status !== "destroyed")
    if (operationalModules.length === 0) return ship

    const randomModule = operationalModules[Math.floor(Math.random() * operationalModules.length)]
    const moduleDamage = Math.floor(damage * 0.3) // 30% от урона идет в модули

    const newHealth = Math.max(0, randomModule.health - moduleDamage)
    const newEfficiency = Math.max(0, (newHealth / randomModule.maxHealth) * 100)

    let newStatus = randomModule.status
    if (newHealth === 0) {
      newStatus = "destroyed"
    } else if (newHealth <= randomModule.criticalThreshold) {
      newStatus = "damaged"
    } else {
      newStatus = "operational"
    }

    const updatedModules = ship.modules.map((m) =>
      m.id === randomModule.id ? { ...m, health: newHealth, efficiency: newEfficiency, status: newStatus } : m,
    )

    // Обновляем модификаторы урона на основе состояния модулей
    const damageModifiers = calculateDamageModifiers(updatedModules)

    if (moduleDamage > 0) {
      addBattleLog(`${ship.name}'s ${randomModule.name} damaged! (${Math.round(newEfficiency)}% efficiency)`, "damage")
    }

    return {
      ...ship,
      modules: updatedModules,
      damageModifiers,
    }
  }

  const calculateDamageModifiers = (modules: ShipModule[]) => {
    const weaponModule = modules.find((m) => m.type === "weapon")
    const shieldModule = modules.find((m) => m.type === "shield")
    const engineModule = modules.find((m) => m.type === "engine")
    const sensorModule = modules.find((m) => m.type === "sensor")
    const armorModule = modules.find((m) => m.type === "armor")

    return {
      weaponEfficiency: weaponModule ? weaponModule.efficiency / 100 : 1.0,
      shieldRegenRate: shieldModule ? shieldModule.efficiency / 100 : 1.0,
      enginePower: engineModule ? engineModule.efficiency / 100 : 1.0,
      sensorRange: sensorModule ? sensorModule.efficiency / 100 : 1.0,
      armorResistance: armorModule ? armorModule.efficiency / 100 : 1.0,
    }
  }

  const handleAttack = (weaponIndex: number, attackingShipId: string) => {
    const attackingShip = ships.find((ship) => ship.id === attackingShipId)
    if (!attackingShip || !selectedTarget) return

    const target = ships.find((ship) => ship.id === selectedTarget)
    if (!target || target.hull <= 0) return

    const weapon = attackingShip.weapons[weaponIndex]
    if (weapon.currentCooldown > 0) return

    const distance = calculateDistance(attackingShip, target)
    const maxRange = 400

    if (distance > maxRange) {
      addBattleLog(`Target out of range for ${weapon.name}`, "miss")
      return
    }

    const hitChance = Math.random()
    if (hitChance < 0.85) {
      const baseDamage = calculateFormationBonus(weapon.damage, "attack")
      const finalDamage =
        Math.floor(baseDamage * attackingShip.damageModifiers.weaponEfficiency) + Math.floor(Math.random() * 100) - 50

      setShips((prev) =>
        prev.map((ship) => {
          if (ship.id === selectedTarget) {
            let newShield = ship.shield
            let newHull = ship.hull
            let remainingDamage = finalDamage

            remainingDamage = Math.floor(remainingDamage * (2 - ship.damageModifiers.armorResistance))

            if (newShield > 0) {
              if (remainingDamage >= newShield) {
                remainingDamage -= newShield
                newHull = Math.max(0, newHull - remainingDamage)
                newShield = 0
              } else {
                newShield -= remainingDamage
                remainingDamage = 0
              }
            } else {
              newHull = Math.max(0, newHull - remainingDamage)
            }

            if (newHull <= 0) {
              addBattleLog(`${ship.name} destroyed!`, "destroy")
            } else {
              addBattleLog(`${weapon.name} hits ${ship.name} for ${finalDamage} damage`, "damage")
            }

            return { ...ship, shield: newShield, hull: newHull }
          }
          return ship
        }),
      )

      setShips((prev) =>
        prev.map((ship) => {
          if (ship.id === attackingShipId) {
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

      if (autoAttack && autoAttackTarget) {
        const target = ships.find((ship) => ship.id === autoAttackTarget && ship.hull > 0)
        if (target) {
          // Найти первый доступный корабль игрока с готовым оружием
          const availablePlayerShip = ships.find(
            (ship) => ship.isPlayer && ship.hull > 0 && ship.weapons.some((weapon) => weapon.currentCooldown <= 0),
          )

          if (availablePlayerShip) {
            const readyWeaponIndex = availablePlayerShip.weapons.findIndex((weapon) => weapon.currentCooldown <= 0)
            if (readyWeaponIndex !== -1) {
              handleAttack(readyWeaponIndex, availablePlayerShip.id)
            }
          }
        } else {
          // Если цель уничтожена, найти новую цель
          const newTarget = ships.find((ship) => !ship.isPlayer && ship.hull > 0)
          if (newTarget) {
            setAutoAttackTarget(newTarget.id)
            setSelectedTarget(newTarget.id)
          } else {
            setAutoAttack(false)
            setAutoAttackTarget(null)
          }
        }
      }
    }, 100)

    return () => clearInterval(interval)
  }, [autoAttack, autoAttackTarget, ships, selectedTarget])

  const toggleAutoAttack = () => {
    if (!autoAttack && selectedTarget) {
      setAutoAttack(true)
      setAutoAttackTarget(selectedTarget)
    } else {
      setAutoAttack(false)
      setAutoAttackTarget(null)
    }
  }

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

  useEffect(() => {
    if (isInCombat) {
      const interval = setInterval(() => {
        setCombatTimer((prev) => prev + 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isInCombat])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getHealthPercentage = (current: number, max: number) => {
    return Math.max(0, (current / max) * 100)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-400 border-green-400"
      case "Medium":
        return "text-yellow-400 border-yellow-400"
      case "Hard":
        return "text-orange-400 border-orange-400"
      case "Elite":
        return "text-red-400 border-red-400"
      default:
        return "text-slate-400 border-slate-400"
    }
  }

  const getRaidTypeIcon = (type: RaidType) => {
    switch (type) {
      case "patrol":
        return <Target className="w-4 h-4" />
      case "convoy":
        return <Activity className="w-4 h-4" />
      case "base":
        return <Shield className="w-4 h-4" />
      case "boss":
        return <Crown className="w-4 h-4" />
      default:
        return <Star className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-black relative">
      <div className="absolute inset-0">
        {[...Array(300)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <header className="relative z-10 border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Command
            </Button>
            <Sword className="w-8 h-8 text-pink-600" />
            <h1 className="text-2xl font-bold text-white">Combat Arena</h1>
          </div>
          <div className="flex items-center space-x-4">
            {isRaidActive && selectedRaid && (
              <>
                <Badge variant="outline" className="text-purple-600 border-purple-600">
                  {getRaidTypeIcon(selectedRaid.type)}
                  <span className="ml-1">{selectedRaid.name}</span>
                </Badge>
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  Wave {currentWaveIndex + 1}/{selectedRaid.waves.length}
                </Badge>
              </>
            )}
            {isFormationActive && (
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                <Users className="w-3 h-3 mr-1" />
                {formations[currentFormation].name}
              </Badge>
            )}
            {isInCombat && (
              <Badge variant="outline" className="text-amber-600 border-amber-600">
                {formatTime(combatTimer)}
              </Badge>
            )}
          </div>
        </div>
      </header>

      <div className="relative z-10 flex h-[calc(100vh-80px)]">
        {/* Battle Field */}
        <div className="flex-1 p-4">
          <Card className="h-full bg-slate-900/80 backdrop-blur-sm border-pink-600/30">
            <CardContent className="p-4 h-full">
              {!isRaidActive ? (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-white mb-4">Select PvE Raid Mission</h2>
                  <div className="grid grid-cols-1 gap-4">
                    {raidMissions.map((raid) => (
                      <Card
                        key={raid.id}
                        className="bg-slate-800/50 border-slate-600 hover:border-purple-600/50 cursor-pointer transition-all"
                        onClick={() => startRaidMission(raid)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {getRaidTypeIcon(raid.type)}
                              <h3 className="text-lg font-semibold text-white">{raid.name}</h3>
                            </div>
                            <Badge variant="outline" className={getDifficultyColor(raid.difficulty)}>
                              {raid.difficulty}
                            </Badge>
                          </div>
                          <p className="text-slate-300 text-sm mb-3">{raid.description}</p>
                          <div className="flex items-center justify-between text-xs">
                            <div className="text-slate-400">
                              {raid.waves.length} Wave{raid.waves.length > 1 ? "s" : ""}
                              {raid.waves.some((w) => w.isBoss) && " • Boss Fight"}
                            </div>
                            <div className="text-green-400">
                              {raid.totalRewards.credits} Credits • {raid.totalRewards.experience} XP
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full overflow-hidden rounded-lg bg-gradient-to-br from-slate-950/80 to-slate-900/80 border border-slate-700">
                  <svg viewBox="0 0 600 400" className="w-full h-full">
                    <defs>
                      <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                        <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(148, 163, 184, 0.1)" strokeWidth="1" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />

                    {isFormationActive && (
                      <g>
                        {formations[currentFormation].positions.map((pos, index) => (
                          <circle
                            key={index}
                            cx={pos.x}
                            cy={pos.y}
                            r="35"
                            fill="none"
                            stroke="rgba(59, 130, 246, 0.3)"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                          />
                        ))}
                        <text x="50" y="30" fill="rgba(59, 130, 246, 0.8)" fontSize="12" className="font-semibold">
                          Formation: {formations[currentFormation].name}
                        </text>
                      </g>
                    )}

                    {ships.map((ship) => (
                      <g key={ship.id}>
                        {ship.isTargeted && (
                          <circle
                            cx={ship.x}
                            cy={ship.y}
                            r="25"
                            fill="none"
                            stroke="#ec4899"
                            strokeWidth="2"
                            strokeDasharray="4,4"
                            className="animate-spin"
                            style={{ animationDuration: "2s" }}
                          />
                        )}

                        {selectedRaid &&
                          selectedRaid.waves[currentWaveIndex]?.isBoss &&
                          selectedRaid.waves[currentWaveIndex].enemies.some((e) => e.id === ship.id) && (
                            <circle cx={ship.x} cy={ship.y - 35} r="8" fill="#fbbf24" className="animate-pulse">
                              <title>Boss</title>
                            </circle>
                          )}

                        <rect
                          x={ship.x - 15}
                          y={ship.y - 8}
                          width="30"
                          height="16"
                          rx="3"
                          fill={ship.isPlayer ? "#3b82f6" : "#ef4444"}
                          stroke={ship.hull <= 0 ? "#6b7280" : ship.isPlayer ? "#60a5fa" : "#f87171"}
                          strokeWidth="2"
                          className="cursor-pointer"
                          onClick={() => !ship.isPlayer && handleTargetSelect(ship.id)}
                          transform={`rotate(${ship.rotation} ${ship.x} ${ship.y})`}
                        />

                        <text
                          x={ship.x}
                          y={ship.y - 20}
                          textAnchor="middle"
                          fill="white"
                          fontSize="10"
                          className="pointer-events-none font-semibold"
                        >
                          {ship.name}
                        </text>

                        <rect x={ship.x - 15} y={ship.y + 15} width="30" height="3" fill="#1f2937" rx="1" />
                        <rect
                          x={ship.x - 15}
                          y={ship.y + 15}
                          width={30 * (getHealthPercentage(ship.hull, ship.maxHull) / 100)}
                          height="3"
                          fill="#10b981"
                          rx="1"
                        />

                        <rect x={ship.x - 15} y={ship.y + 20} width="30" height="2" fill="#1f2937" rx="1" />
                        <rect
                          x={ship.x - 15}
                          y={ship.y + 20}
                          width={30 * (getHealthPercentage(ship.shield, ship.maxShield) / 100)}
                          height="2"
                          fill="#3b82f6"
                          rx="1"
                        />
                      </g>
                    ))}
                  </svg>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Combat Interface */}
        <div className="w-80 p-4 space-y-4">
          {isRaidActive && (
            <>
              <Card className="bg-slate-900/80 backdrop-blur-sm border-purple-600/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Star className="w-5 h-5 mr-2 text-purple-600" />
                    Raid Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedRaid && (
                    <>
                      <div className="text-sm">
                        <div className="text-purple-400 font-semibold">{selectedRaid.name}</div>
                        <div className="text-slate-400">
                          Wave {currentWaveIndex + 1} of {selectedRaid.waves.length}
                        </div>
                        <div className="text-slate-400">{selectedRaid.waves[currentWaveIndex]?.name}</div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs text-slate-300">Current Rewards:</div>
                        <div className="text-xs space-y-1">
                          <div className="text-green-400">{raidRewards.credits} Credits</div>
                          <div className="text-blue-400">{raidRewards.experience} Experience</div>
                          {raidRewards.loot.length > 0 && (
                            <div className="text-yellow-400">Loot: {raidRewards.loot.join(", ")}</div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-slate-900/80 backdrop-blur-sm border-blue-600/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Users className="w-5 h-5 mr-2 text-blue-600" />
                    Fleet Formation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(formations).map(([key, formation]) => (
                      <Button
                        key={key}
                        onClick={() => applyFormation(key as FormationType)}
                        variant={currentFormation === key && isFormationActive ? "default" : "outline"}
                        size="sm"
                        className={`text-xs ${
                          currentFormation === key && isFormationActive
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "border-blue-600/50 text-blue-400 hover:bg-blue-600/20"
                        }`}
                      >
                        {formation.name.split(" ")[0]}
                      </Button>
                    ))}
                  </div>
                  {isFormationActive && (
                    <div className="text-xs text-slate-300 bg-slate-800/50 p-2 rounded">
                      <div className="font-semibold text-blue-400">{formations[currentFormation].name}</div>
                      <div className="text-slate-400">{formations[currentFormation].description}</div>
                      <div className="mt-1">
                        Bonuses:{" "}
                        {Object.entries(formations[currentFormation].bonuses)
                          .map(([key, value]) => (
                            <span key={key} className="text-green-400">
                              {key} +{value}%
                            </span>
                          ))
                          .reduce((prev, curr, index) => (index === 0 ? [curr] : [...prev, ", ", curr]), [])}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {selectedTarget && (
                <Card className="bg-slate-900/80 backdrop-blur-sm border-pink-600/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Target className="w-5 h-5 mr-2 text-pink-600" />
                      Target Lock
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const target = ships.find((ship) => ship.id === selectedTarget)
                      return target ? (
                        <div className="space-y-3">
                          <div>
                            <h3 className="text-lg font-bold text-white">{target.name}</h3>
                            <p className="text-slate-300 text-sm">{target.type}</p>
                            {selectedRaid &&
                              selectedRaid.waves[currentWaveIndex]?.isBoss &&
                              selectedRaid.waves[currentWaveIndex].enemies.some((e) => e.id === target.id) && (
                                <Badge variant="outline" className="text-yellow-400 border-yellow-400 mt-1">
                                  <Crown className="w-3 h-3 mr-1" />
                                  BOSS
                                </Badge>
                              )}
                          </div>

                          <div className="space-y-2">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-slate-300 text-sm">Hull</span>
                                <span className="text-white text-sm">
                                  {Math.round(getHealthPercentage(target.hull, target.maxHull))}%
                                </span>
                              </div>
                              <div className="w-full bg-slate-700 rounded-full h-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${getHealthPercentage(target.hull, target.maxHull)}%` }}
                                />
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-slate-300 text-sm">Shield</span>
                                <span className="text-white text-sm">
                                  {Math.round(getHealthPercentage(target.shield, target.maxShield))}%
                                </span>
                              </div>
                              <div className="w-full bg-slate-700 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${getHealthPercentage(target.shield, target.maxShield)}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="text-xs text-slate-400">
                            Distance: {Math.round(calculateDistance(playerShips[0], target))}m
                          </div>
                        </div>
                      ) : null
                    })()}
                  </CardContent>
                </Card>
              )}

              <Card className="bg-slate-900/80 backdrop-blur-sm border-pink-600/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Crosshair className="w-5 h-5 mr-2 text-pink-600" />
                    Fleet Weapons
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={toggleAutoAttack}
                    disabled={!selectedTarget}
                    className={`w-full ${
                      autoAttack
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-amber-600 hover:bg-amber-700 text-white"
                    }`}
                  >
                    {autoAttack ? "Stop Auto Attack" : "Auto Attack"}
                    {autoAttack && <span className="ml-2 animate-pulse">●</span>}
                  </Button>

                  {playerShips.map((ship) => (
                    <div key={ship.id} className="space-y-2">
                      <div className="text-sm font-semibold text-blue-400">{ship.name}</div>
                      <div className="space-y-1">
                        {ship.weapons.map((weapon, index) => (
                          <Button
                            key={index}
                            onClick={() => handleAttack(index, ship.id)}
                            disabled={weapon.currentCooldown > 0 || !selectedTarget || autoAttack}
                            size="sm"
                            className={`w-full justify-between text-xs ${
                              weapon.currentCooldown > 0 || autoAttack
                                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                                : "bg-pink-600 hover:bg-pink-700 text-white"
                            }`}
                          >
                            <span>{weapon.name}</span>
                            <span>
                              {weapon.currentCooldown > 0
                                ? `${Math.ceil(weapon.currentCooldown / 1000)}s`
                                : `${calculateFormationBonus(weapon.damage, "attack")} DMG`}
                            </span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}

          <Card className="bg-slate-900/80 backdrop-blur-sm border-pink-600/30 flex-1">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="w-5 h-5 mr-2 text-pink-600" />
                Battle Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {battleLog.map((log) => (
                  <div
                    key={log.id}
                    className={`text-xs p-2 rounded ${
                      log.type === "damage"
                        ? "text-red-400 bg-red-900/20"
                        : log.type === "miss"
                          ? "text-yellow-400 bg-yellow-900/20"
                          : log.type === "destroy"
                            ? "text-purple-400 bg-purple-900/20"
                            : "text-slate-300 bg-slate-800/20"
                    }`}
                  >
                    {log.message}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CombatArena
