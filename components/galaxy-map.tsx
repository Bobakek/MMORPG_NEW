"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import type { StarSystem } from "@/types"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Text, Sphere, Box } from "@react-three/drei"
import * as THREE from "three"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Corporation {
  id: string
  name: string
  color: string
  reputation: number
  territories: string[]
  strength: number
  diplomacy: {
    [corpId: string]: "allied" | "neutral" | "hostile"
  }
}

interface TerritorialWar {
  id: string
  attackerCorp: string
  defenderCorp: string
  targetSystem: string
  startTime: number
  duration: number
  attackerStrength: number
  defenderStrength: number
  status: "preparing" | "active" | "completed"
  winner?: string
}

interface ExplorationTarget {
  id: string
  name: string
  type: "planet" | "asteroid" | "anomaly" | "station"
  scanTime: number
  rewards: {
    resources?: string[]
    experience?: number
    credits?: number
  }
  discovered: boolean
}

interface ExplorationData {
  [systemId: string]: ExplorationTarget[]
}

interface PlanetEvent {
  id: string
  type: "encounter" | "discovery" | "trade" | "diplomacy" | "danger"
  title: string
  description: string
  choices: EventChoice[]
  rarity: "common" | "rare" | "legendary"
}

interface EventChoice {
  id: string
  text: string
  outcome: {
    credits?: number
    resources?: string[]
    experience?: number
    reputation?: { faction: string; change: number }
    risk?: number // 0-100, chance of negative outcome
  }
}

interface MiningTarget {
  id: string
  name: string
  position: [number, number, number]
  resources: { type: string; amount: number; rarity: "common" | "rare" | "epic" }[]
  health: number
  maxHealth: number
}

interface MiningState {
  isActive: boolean
  target: MiningTarget | null
  progress: number
  yieldRate: number
  laserActive: boolean
}

interface ProcessingStation {
  id: string
  name: string
  position: [number, number, number]
  type: "refinery" | "factory" | "shipyard"
  level: number
  capacity: number
  recipes: ProcessingRecipe[]
}

interface ProcessingRecipe {
  id: string
  name: string
  inputs: { type: string; amount: number }[]
  outputs: { type: string; amount: number }[]
  processingTime: number
  energyCost: number
}

interface ProcessingState {
  isActive: boolean
  station: ProcessingStation | null
  selectedRecipe: ProcessingRecipe | null
  progress: number
  queue: ProcessingJob[]
}

interface ProcessingJob {
  id: string
  recipe: ProcessingRecipe
  startTime: number
  endTime: number
  status: "queued" | "processing" | "completed"
}

const planetEvents: PlanetEvent[] = [
  {
    id: "trader-encounter",
    type: "encounter",
    title: "Mysterious Trader",
    description: "A lone trader ship approaches your vessel. The captain offers to trade rare materials for credits.",
    rarity: "common",
    choices: [
      {
        id: "trade",
        text: "Accept the trade (5000 credits)",
        outcome: { credits: -5000, resources: ["Rare Metals", "Quantum Ore"], experience: 50 },
      },
      {
        id: "decline",
        text: "Politely decline",
        outcome: { experience: 10 },
      },
    ],
  },
  {
    id: "pirate-ambush",
    type: "danger",
    title: "Pirate Ambush!",
    description: "Pirates emerge from behind the planet! They demand tribute or threaten to attack.",
    rarity: "common",
    choices: [
      {
        id: "pay",
        text: "Pay tribute (3000 credits)",
        outcome: { credits: -3000, experience: 20 },
      },
      {
        id: "fight",
        text: "Prepare for battle!",
        outcome: { experience: 100, risk: 60 },
      },
      {
        id: "negotiate",
        text: "Try to negotiate",
        outcome: { credits: -1500, experience: 75, risk: 30 },
      },
    ],
  },
  {
    id: "ancient-artifact",
    type: "discovery",
    title: "Ancient Artifact",
    description:
      "Your sensors detect an ancient alien artifact buried on the planet's surface. It pulses with unknown energy.",
    rarity: "rare",
    choices: [
      {
        id: "excavate",
        text: "Excavate the artifact",
        outcome: { resources: ["Ancient Tech"], experience: 200, credits: 10000, risk: 25 },
      },
      {
        id: "scan",
        text: "Scan from orbit",
        outcome: { experience: 100, credits: 2000 },
      },
      {
        id: "leave",
        text: "Leave it undisturbed",
        outcome: { experience: 50 },
      },
    ],
  },
  {
    id: "diplomatic-mission",
    type: "diplomacy",
    title: "Diplomatic Envoy",
    description: "A diplomatic vessel from a local faction requests a meeting. They seek to improve relations.",
    rarity: "common",
    choices: [
      {
        id: "accept",
        text: "Accept the meeting",
        outcome: { reputation: { faction: "Federation", change: 25 }, experience: 150, credits: 2500 },
      },
      {
        id: "decline",
        text: "Decline politely",
        outcome: { experience: 25 },
      },
    ],
  },
  {
    id: "research-opportunity",
    type: "discovery",
    title: "Scientific Discovery",
    description: "Your ship's sensors have detected unusual readings. A research opportunity presents itself.",
    rarity: "rare",
    choices: [
      {
        id: "research",
        text: "Conduct research",
        outcome: { experience: 300, credits: 5000, resources: ["Research Data"] },
      },
      {
        id: "quick-scan",
        text: "Quick scan only",
        outcome: { experience: 100, credits: 1000 },
      },
    ],
  },
  {
    id: "distress-signal",
    type: "encounter",
    title: "Distress Signal",
    description: "You receive a distress signal from a damaged civilian vessel near the planet.",
    rarity: "common",
    choices: [
      {
        id: "rescue",
        text: "Attempt rescue",
        outcome: { experience: 200, credits: 3000, reputation: { faction: "Civilians", change: 50 } },
      },
      {
        id: "supplies",
        text: "Send supplies only",
        outcome: { credits: -500, experience: 100, reputation: { faction: "Civilians", change: 25 } },
      },
      {
        id: "ignore",
        text: "Ignore the signal",
        outcome: { reputation: { faction: "Civilians", change: -10 } },
      },
    ],
  },
  {
    id: "quantum-anomaly",
    type: "discovery",
    title: "Quantum Anomaly",
    description: "A rare quantum anomaly has formed near the planet. It could be dangerous, but also valuable.",
    rarity: "legendary",
    choices: [
      {
        id: "investigate",
        text: "Investigate closely",
        outcome: { resources: ["Quantum Matter"], experience: 500, credits: 25000, risk: 40 },
      },
      {
        id: "observe",
        text: "Observe from distance",
        outcome: { experience: 200, credits: 5000 },
      },
      {
        id: "retreat",
        text: "Retreat to safe distance",
        outcome: { experience: 50 },
      },
    ],
  },
]

const corporations: Corporation[] = [
  {
    id: "federation",
    name: "United Federation",
    color: "#3b82f6",
    reputation: 85,
    territories: ["1", "2", "8"],
    strength: 1200,
    diplomacy: {
      rebels: "hostile",
      pirates: "hostile",
      traders: "allied",
      independent: "neutral",
      unknown: "neutral",
      outcasts: "hostile",
    },
  },
  {
    id: "rebels",
    name: "Rebel Alliance",
    color: "#ef4444",
    reputation: 45,
    territories: ["4"],
    strength: 800,
    diplomacy: {
      federation: "hostile",
      pirates: "neutral",
      traders: "neutral",
      independent: "allied",
      unknown: "neutral",
      outcasts: "allied",
    },
  },
  {
    id: "pirates",
    name: "Crimson Syndicate",
    color: "#dc2626",
    reputation: 15,
    territories: ["5"],
    strength: 600,
    diplomacy: {
      federation: "hostile",
      rebels: "neutral",
      pirates: "allied",
      traders: "hostile",
      independent: "hostile",
      unknown: "allied",
      outcasts: "allied",
    },
  },
  {
    id: "traders",
    name: "Merchant Guild",
    color: "#f59e0b",
    reputation: 70,
    territories: ["9"],
    strength: 400,
    diplomacy: {
      federation: "allied",
      rebels: "neutral",
      pirates: "hostile",
      independent: "allied",
      unknown: "neutral",
      outcasts: "neutral",
    },
  },
  {
    id: "independent",
    name: "Free Systems",
    color: "#10b981",
    reputation: 60,
    territories: ["3"],
    strength: 500,
    diplomacy: {
      federation: "neutral",
      rebels: "allied",
      pirates: "hostile",
      traders: "allied",
      independent: "neutral",
      unknown: "neutral",
      outcasts: "neutral",
    },
  },
  {
    id: "unknown",
    name: "Shadow Collective",
    color: "#8b5cf6",
    reputation: 25,
    territories: ["6"],
    strength: 700,
    diplomacy: {
      federation: "neutral",
      rebels: "neutral",
      pirates: "allied",
      traders: "neutral",
      independent: "neutral",
      unknown: "neutral",
      outcasts: "allied",
    },
  },
  {
    id: "outcasts",
    name: "Void Runners",
    color: "#f97316",
    reputation: 30,
    territories: ["7"],
    strength: 350,
    diplomacy: {
      federation: "hostile",
      rebels: "allied",
      pirates: "allied",
      traders: "neutral",
      independent: "neutral",
      unknown: "allied",
    },
  },
]

const explorationData: ExplorationData = {
  "1": [
    {
      id: "sol-1",
      name: "Earth",
      type: "planet",
      scanTime: 5,
      rewards: { resources: ["Water", "Minerals"], experience: 100 },
      discovered: false,
    },
    {
      id: "sol-2",
      name: "Mars",
      type: "planet",
      scanTime: 7,
      rewards: { resources: ["Iron", "Rare Metals"], experience: 150 },
      discovered: false,
    },
    {
      id: "sol-3",
      name: "Asteroid Belt",
      type: "asteroid",
      scanTime: 10,
      rewards: { resources: ["Platinum", "Crystals"], credits: 5000 },
      discovered: false,
    },
    {
      id: "sol-4",
      name: "Jupiter Station",
      type: "station",
      scanTime: 3,
      rewards: { credits: 2000, experience: 50 },
      discovered: false,
    },
  ],
  "2": [
    {
      id: "ac-1",
      name: "Proxima b",
      type: "planet",
      scanTime: 8,
      rewards: { resources: ["Exotic Matter"], experience: 200 },
      discovered: false,
    },
    {
      id: "ac-2",
      name: "Energy Anomaly",
      type: "anomaly",
      scanTime: 15,
      rewards: { resources: ["Dark Energy"], experience: 300, credits: 10000 },
      discovered: false,
    },
  ],
  "3": [
    {
      id: "vega-1",
      name: "Crystal World",
      type: "planet",
      scanTime: 12,
      rewards: { resources: ["Rare Crystals", "Gas"], experience: 250 },
      discovered: false,
    },
    {
      id: "vega-2",
      name: "Pirate Hideout",
      type: "station",
      scanTime: 6,
      rewards: { credits: 8000, experience: 180 },
      discovered: false,
    },
  ],
  "4": [
    {
      id: "sir-1",
      name: "Dark Matter Cloud",
      type: "anomaly",
      scanTime: 20,
      rewards: { resources: ["Dark Matter"], experience: 400, credits: 15000 },
      discovered: false,
    },
  ],
  "5": [
    {
      id: "rig-1",
      name: "Exotic Planet",
      type: "planet",
      scanTime: 18,
      rewards: { resources: ["Exotic Matter", "Quantum Ore"], experience: 500 },
      discovered: false,
    },
  ],
  "6": [
    {
      id: "bet-1",
      name: "Antimatter Facility",
      type: "station",
      scanTime: 25,
      rewards: { resources: ["Antimatter"], experience: 600, credits: 25000 },
      discovered: false,
    },
  ],
  "7": [
    {
      id: "prox-1",
      name: "Quantum Anomaly",
      type: "anomaly",
      scanTime: 30,
      rewards: { resources: ["Quantum Ore"], experience: 800, credits: 50000 },
      discovered: false,
    },
  ],
  "8": [
    {
      id: "arc-1",
      name: "Gas Giant Alpha",
      type: "planet",
      scanTime: 10,
      rewards: { resources: ["Hydrogen", "Helium"], experience: 200 },
      discovered: false,
    },
    {
      id: "arc-2",
      name: "Research Station",
      type: "station",
      scanTime: 5,
      rewards: { credits: 3000, experience: 100 },
      discovered: false,
    },
  ],
  "9": [
    {
      id: "cap-1",
      name: "Trader Outpost",
      type: "station",
      scanTime: 4,
      rewards: { credits: 4000, experience: 120 },
      discovered: false,
    },
    {
      id: "cap-2",
      name: "Gas Nebula",
      type: "anomaly",
      scanTime: 14,
      rewards: { resources: ["Rare Gases"], experience: 280 },
      discovered: false,
    },
  ],
}

const systemObjects = {
  "1": [
    // Sol System
    {
      id: "sol-1",
      name: "Mercury",
      type: "planet",
      x: 150,
      y: 225,
      size: 8,
      color: "#8C7853",
      info: "Rocky planet closest to the sun",
    },
    {
      id: "sol-2",
      name: "Venus",
      type: "planet",
      x: 180,
      y: 225,
      size: 12,
      color: "#FFC649",
      info: "Hot volcanic world",
    },
    {
      id: "sol-3",
      name: "Earth",
      type: "planet",
      x: 220,
      y: 225,
      size: 14,
      color: "#6B93D6",
      info: "Homeworld of humanity",
    },
    { id: "sol-4", name: "Mars", type: "planet", x: 260, y: 225, size: 10, color: "#CD5C5C", info: "The red planet" },
    {
      id: "sol-5",
      name: "Jupiter",
      type: "planet",
      x: 320,
      y: 225,
      size: 28,
      color: "#D8CA9D",
      info: "Gas giant with many moons",
    },
    {
      id: "sol-6",
      name: "Saturn",
      type: "planet",
      x: 380,
      y: 225,
      size: 24,
      color: "#FAD5A5",
      info: "Ringed gas giant",
    },
    {
      id: "sol-7",
      name: "Asteroid Belt",
      type: "asteroid",
      x: 290,
      y: 200,
      size: 6,
      color: "#A0A0A0",
      info: "Rich mining opportunities",
    },
    {
      id: "sol-8",
      name: "Earth Station",
      type: "station",
      x: 235,
      y: 210,
      size: 8,
      color: "#00FF00",
      info: "Major trading hub",
    },
  ],
  "2": [
    // Alpha Centauri
    {
      id: "ac-1",
      name: "Proxima b",
      type: "planet",
      x: 200,
      y: 225,
      size: 12,
      color: "#8B4513",
      info: "Potentially habitable world",
    },
    {
      id: "ac-2",
      name: "Alpha Centauri A",
      type: "star",
      x: 300,
      y: 225,
      size: 20,
      color: "#FFD700",
      info: "Primary star",
    },
    {
      id: "ac-3",
      name: "Mining Station Alpha",
      type: "station",
      x: 250,
      y: 180,
      size: 10,
      color: "#FF6600",
      info: "Rare metal extraction",
    },
    {
      id: "ac-4",
      name: "Asteroid Field",
      type: "asteroid",
      x: 350,
      y: 200,
      size: 8,
      color: "#696969",
      info: "Dense asteroid cluster",
    },
  ],
  "3": [
    // Vega
    {
      id: "vega-1",
      name: "Vega Prime",
      type: "planet",
      x: 250,
      y: 225,
      size: 16,
      color: "#4169E1",
      info: "Gas-rich world",
    },
    {
      id: "vega-2",
      name: "Crystal Moon",
      type: "planet",
      x: 270,
      y: 210,
      size: 6,
      color: "#DA70D6",
      info: "Crystalline formations",
    },
    {
      id: "vega-3",
      name: "Pirate Outpost",
      type: "station",
      x: 300,
      y: 250,
      size: 8,
      color: "#DC143C",
      info: "Lawless trading post",
    },
    {
      id: "vega-4",
      name: "Gas Clouds",
      type: "nebula",
      x: 200,
      y: 180,
      size: 25,
      color: "#9370DB",
      info: "Exotic gas harvesting",
    },
  ],
}

const processingRecipes: ProcessingRecipe[] = [
  {
    id: "iron-ingots",
    name: "Iron Ingots",
    inputs: [{ type: "Iron Ore", amount: 10 }],
    outputs: [{ type: "Iron Ingots", amount: 5 }],
    processingTime: 30000, // 30 seconds
    energyCost: 100,
  },
  {
    id: "steel-plates",
    name: "Steel Plates",
    inputs: [
      { type: "Iron Ingots", amount: 5 },
      { type: "Carbon", amount: 2 },
    ],
    outputs: [{ type: "Steel Plates", amount: 3 }],
    processingTime: 45000,
    energyCost: 150,
  },
  {
    id: "advanced-alloys",
    name: "Advanced Alloys",
    inputs: [
      { type: "Rare Metals", amount: 3 },
      { type: "Crystals", amount: 1 },
    ],
    outputs: [{ type: "Advanced Alloys", amount: 2 }],
    processingTime: 60000,
    energyCost: 200,
  },
  {
    id: "ship-components",
    name: "Ship Components",
    inputs: [
      { type: "Steel Plates", amount: 5 },
      { type: "Advanced Alloys", amount: 2 },
    ],
    outputs: [{ type: "Ship Components", amount: 1 }],
    processingTime: 90000,
    energyCost: 300,
  },
]

interface GalaxyMapProps {
  onBack: () => void
}

function Asteroid({
  position,
  size,
  resources,
  health,
  maxHealth,
  name,
  onStartMining,
  isMining,
}: {
  position: [number, number, number]
  size: number
  resources: { type: string; amount: number; rarity: "common" | "rare" | "epic" }[]
  health: number
  maxHealth: number
  name: string
  onStartMining?: () => void
  isMining?: boolean
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.002
      meshRef.current.rotation.y += 0.003
      meshRef.current.rotation.z += 0.001
    }
  })

  const handlePointerDown = (event: any) => {
    if (event.button === 2 && onStartMining) {
      event.stopPropagation()
      onStartMining()
    }
  }

  const scaledSize = size * 2
  const healthPercentage = health / maxHealth

  return (
    <group position={position}>
      {/* Основной астероид */}
      <mesh
        ref={meshRef}
        onPointerDown={handlePointerDown}
        onContextMenu={(e) => {
          if (e && e.preventDefault) {
            e.preventDefault()
          }
        }}
      >
        <dodecahedronGeometry args={[scaledSize]} />
        <meshStandardMaterial color={healthPercentage > 0.5 ? "#8B7355" : "#6B5B47"} roughness={0.9} metalness={0.3} />
      </mesh>

      {/* Индикатор здоровья астероида */}
      {health < maxHealth && (
        <mesh position={[0, scaledSize + 0.5, 0]}>
          <planeGeometry args={[2, 0.2]} />
          <meshBasicMaterial color="#333" transparent opacity={0.8} />
        </mesh>
      )}
      {health < maxHealth && (
        <mesh position={[-1 + healthPercentage, scaledSize + 0.5, 0.01]}>
          <planeGeometry args={[2 * healthPercentage, 0.15]} />
          <meshBasicMaterial color={healthPercentage > 0.3 ? "#4CAF50" : "#F44336"} />
        </mesh>
      )}

      {/* Эффект майнинга */}
      {isMining && (
        <>
          {/* Частицы от майнинга */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[scaledSize * 1.2]} />
            <meshBasicMaterial color="#FFD700" transparent opacity={0.1} />
          </mesh>

          {/* Искры */}
          {[...Array(8)].map((_, i) => (
            <mesh
              key={i}
              position={[Math.cos((i * Math.PI * 2) / 8) * scaledSize, Math.sin((i * Math.PI * 2) / 8) * scaledSize, 0]}
            >
              <sphereGeometry args={[0.05]} />
              <meshBasicMaterial color="#FF6B35" />
            </mesh>
          ))}
        </>
      )}

      {/* Название астероида */}
      <Text position={[0, -scaledSize - 0.8, 0]} fontSize={0.15} color="white" anchorX="center" anchorY="middle">
        {name}
      </Text>

      {/* Информация о ресурсах */}
      <Text position={[0, -scaledSize - 1.1, 0]} fontSize={0.1} color="#FFD700" anchorX="center" anchorY="middle">
        {resources.map((r) => r.type).join(", ")}
      </Text>
    </group>
  )
}

function ProcessingStation({
  position,
  name,
  type,
  level,
  onDock,
  isProcessing,
}: {
  position: [number, number, number]
  name: string
  type: "refinery" | "factory" | "shipyard"
  level: number
  onDock?: () => void
  isProcessing?: boolean
}) {
  const meshRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002
      // Пульсация при обработке
      if (isProcessing) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.05
        meshRef.current.scale.setScalar(scale)
      }
    }
  })

  const handlePointerDown = (event: any) => {
    if (event.button === 2 && onDock) {
      event.stopPropagation()
      onDock()
    }
  }

  const getStationColor = () => {
    switch (type) {
      case "refinery":
        return "#FF6B35"
      case "factory":
        return "#4ECDC4"
      case "shipyard":
        return "#45B7D1"
      default:
        return "#888888"
    }
  }

  const stationSize = 1.5 + level * 0.3

  return (
    <group ref={meshRef} position={position}>
      {/* Основная структура станции */}
      <Box
        args={[stationSize, stationSize * 0.6, stationSize]}
        onPointerDown={handlePointerDown}
        onContextMenu={(e) => {
          if (e && e.preventDefault) {
            e.preventDefault()
          }
        }}
      >
        <meshStandardMaterial color={getStationColor()} metalness={0.8} roughness={0.2} />
      </Box>

      {/* Вращающиеся секции */}
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <torusGeometry args={[stationSize * 0.8, stationSize * 0.1, 8, 16]} />
        <meshStandardMaterial color={getStationColor()} metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Антенны и детали */}
      {[...Array(4)].map((_, i) => (
        <Box
          key={i}
          args={[0.1, stationSize * 0.8, 0.1]}
          position={[
            Math.cos((i * Math.PI) / 2) * stationSize * 0.7,
            0,
            Math.sin((i * Math.PI) / 2) * stationSize * 0.7,
          ]}
        >
          <meshStandardMaterial color="#CCCCCC" metalness={0.7} roughness={0.3} />
        </Box>
      ))}

      {/* Световые индикаторы */}
      <Sphere args={[0.1]} position={[0, stationSize * 0.4, 0]}>
        <meshStandardMaterial
          color={isProcessing ? "#00FF00" : "#0088FF"}
          emissive={isProcessing ? "#00AA00" : "#004488"}
          emissiveIntensity={0.8}
        />
      </Sphere>

      {/* Эффекты обработки */}
      {isProcessing && (
        <>
          {/* Энергетические разряды */}
          {[...Array(6)].map((_, i) => (
            <mesh
              key={i}
              position={[
                Math.cos((i * Math.PI * 2) / 6) * stationSize * 0.6,
                Math.sin((i * Math.PI * 2) / 6) * stationSize * 0.3,
                Math.cos((i * Math.PI * 2) / 6 + Math.PI / 3) * stationSize * 0.6,
              ]}
            >
              <sphereGeometry args={[0.05]} />
              <meshBasicMaterial color="#FFD700" />
            </mesh>
          ))}
        </>
      )}

      {/* Название станции */}
      <Text position={[0, -stationSize - 0.8, 0]} fontSize={0.2} color="white" anchorX="center" anchorY="middle">
        {name}
      </Text>

      {/* Тип и уровень */}
      <Text position={[0, -stationSize - 1.1, 0]} fontSize={0.12} color="#FFD700" anchorX="center" anchorY="middle">
        {type.toUpperCase()} LV.{level}
      </Text>
    </group>
  )
}

function MiningLaser({
  shipPosition,
  targetPosition,
  active,
}: {
  shipPosition: [number, number, number]
  targetPosition: [number, number, number]
  active: boolean
}) {
  if (!active) return null

  const points = [new THREE.Vector3(...shipPosition), new THREE.Vector3(...targetPosition)]

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#FF4444" linewidth={3} />
    </line>
  )
}

function FollowCamera({
  shipPosition,
  shipRotation,
  cameraOffset,
  zoomLevel,
}: {
  shipPosition: { x: number; y: number; z: number }
  shipRotation: { x: number; y: number; z: number }
  cameraOffset: { x: number; y: number }
  zoomLevel: number
}) {
  const { camera } = useThree()
  const targetPosition = useRef({ x: 0, y: 0, z: 0 })
  const targetLookAt = useRef({ x: 0, y: 0, z: 0 })

  useFrame((state, delta) => {
    const distance = 8 * zoomLevel
    const height = 3 * zoomLevel
    const lerpFactor = Math.min(delta * 8, 1)

    const radY = ((shipRotation.y + cameraOffset.x) * Math.PI) / 180
    const radX = ((shipRotation.x + cameraOffset.y) * Math.PI) / 180

    // Целевая позиция камеры с учетом смещения
    targetPosition.current.x = shipPosition.x - Math.sin(radY) * distance * Math.cos(radX)
    targetPosition.current.y = shipPosition.y + height + Math.sin(radX) * distance
    targetPosition.current.z = shipPosition.z - Math.cos(radY) * distance * Math.cos(radX)

    camera.position.lerp(targetPosition.current, lerpFactor)

    targetLookAt.current.x = shipPosition.x
    targetLookAt.current.y = shipPosition.y
    targetLookAt.current.z = shipPosition.z

    const shake = Math.sin(state.clock.elapsedTime * 3) * 0.02
    camera.lookAt(targetLookAt.current.x + shake, targetLookAt.current.y, targetLookAt.current.z)
  })

  return null
}

function SpaceShip({
  rotation,
  thrusterActive,
}: {
  rotation: [number, number, number]
  thrusterActive: boolean
}) {
  const meshRef = useRef<THREE.Group>(null)
  const thrusterRef1 = useRef<THREE.Mesh>(null)
  const thrusterRef2 = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Плавная интерполяция поворота корабля
      const targetRotation = new THREE.Euler(...rotation)
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRotation.x, delta * 5)
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotation.y, delta * 5)
      meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, targetRotation.z, delta * 5)

      // Плавное покачивание корабля
      meshRef.current.rotation.z += Math.sin(state.clock.elapsedTime * 2) * 0.005
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.02
    }

    // Анимация реактивных струй
    if (thrusterRef1.current && thrusterRef2.current) {
      const thrusterIntensity = thrusterActive ? 1 : 0
      const flickerEffect = 0.8 + Math.sin(state.clock.elapsedTime * 20) * 0.2

      thrusterRef1.current.scale.y = THREE.MathUtils.lerp(
        thrusterRef1.current.scale.y,
        thrusterIntensity * flickerEffect,
        delta * 10,
      )
      thrusterRef2.current.scale.y = THREE.MathUtils.lerp(
        thrusterRef2.current.scale.y,
        thrusterIntensity * flickerEffect,
        delta * 10,
      )
    }
  })

  return (
    <group ref={meshRef}>
      {/* Основной корпус корабля */}
      <Box args={[0.3, 1.2, 0.2]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.1} envMapIntensity={1.5} />
      </Box>

      {/* Носовая часть */}
      <Box args={[0.15, 0.4, 0.15]} position={[0, 0.8, 0]}>
        <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.05} envMapIntensity={2} />
      </Box>

      {/* Кокпит с улучшенным свечением */}
      <Sphere args={[0.12]} position={[0, 0.4, 0.1]}>
        <meshStandardMaterial color="#06b6d4" emissive="#0891b2" emissiveIntensity={0.5} transparent opacity={0.9} />
      </Sphere>

      {/* Крылья */}
      <Box args={[1.0, 0.1, 0.05]} position={[0, -0.2, 0]}>
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} envMapIntensity={1.2} />
      </Box>

      {/* Двигатели */}
      <Box args={[0.08, 0.3, 0.08]} position={[-0.2, -0.8, 0]}>
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
      </Box>
      <Box args={[0.08, 0.3, 0.08]} position={[0.2, -0.8, 0]}>
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
      </Box>

      {/* Улучшенные реактивные струи */}
      <Box ref={thrusterRef1} args={[0.06, 0.8, 0.06]} position={[-0.2, -1.4, 0]}>
        <meshStandardMaterial color="#ff6b35" emissive="#ff6b35" emissiveIntensity={1.2} transparent opacity={0.9} />
      </Box>
      <Box ref={thrusterRef2} args={[0.06, 0.8, 0.06]} position={[0.2, -1.4, 0]}>
        <meshStandardMaterial color="#ff6b35" emissive="#ff6b35" emissiveIntensity={1.2} transparent opacity={0.9} />
      </Box>

      {/* Навигационные огни */}
      <Sphere args={[0.03]} position={[-0.5, -0.2, 0]}>
        <meshStandardMaterial
          color="#ef4444"
          emissive="#ef4444"
          emissiveIntensity={0.7 + Math.sin(Date.now() * 0.01) * 0.3}
        />
      </Sphere>
      <Sphere args={[0.03]} position={[0.5, -0.2, 0]}>
        <meshStandardMaterial
          color="#22c55e"
          emissive="#22c55e"
          emissiveIntensity={0.7 + Math.sin(Date.now() * 0.01 + Math.PI) * 0.3}
        />
      </Sphere>
    </group>
  )
}

function EnhancedStarField() {
  const starsRef = useRef<THREE.Points>(null)

  useFrame((state) => {
    if (starsRef.current) {
      starsRef.current.rotation.y += 0.0002
      starsRef.current.rotation.x += 0.0001
    }
  })

  const starPositions = useMemo(() => {
    const positions = new Float32Array(15000 * 3) // 15000 звезд
    for (let i = 0; i < 15000; i++) {
      // Создаем сферическое распределение звезд
      const radius = 200 + Math.random() * 300
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)
    }
    return positions
  }, [])

  const starColors = useMemo(() => {
    const colors = new Float32Array(15000 * 3)
    const starTypes = [
      [1, 1, 1], // Белые
      [1, 0.8, 0.6], // Желтые
      [0.8, 0.8, 1], // Голубые
      [1, 0.6, 0.4], // Оранжевые
      [1, 0.4, 0.4], // Красные
    ]

    for (let i = 0; i < 15000; i++) {
      const colorType = starTypes[Math.floor(Math.random() * starTypes.length)]
      colors[i * 3] = colorType[0]
      colors[i * 3 + 1] = colorType[1]
      colors[i * 3 + 2] = colorType[2]
    }
    return colors
  }, [])

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={15000} array={starPositions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={15000} array={starColors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.5} vertexColors sizeAttenuation={false} />
    </points>
  )
}

function Planet({
  position,
  size,
  color,
  name,
  onRightClick,
}: {
  position: [number, number, number]
  size: number
  color: string
  name: string
  onRightClick?: () => void
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005
    }
  })

  const handlePointerDown = (event: any) => {
    if (event.button === 2 && onRightClick) {
      // Правый клик
      event.stopPropagation()
      onRightClick()
    }
  }

  const scaledSize = size * 3

  return (
    <group position={position}>
      <Sphere
        ref={meshRef}
        args={[scaledSize]}
        onPointerDown={handlePointerDown}
        onContextMenu={(e) => {
          if (e && e.preventDefault) {
            e.preventDefault()
          }
        }}
      >
        <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />
      </Sphere>

      {/* Атмосфера */}
      <Sphere args={[scaledSize * 1.1]}>
        <meshStandardMaterial color={color} transparent opacity={0.2} roughness={1} />
      </Sphere>

      {/* Орбитальное кольцо для визуального эффекта */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[scaledSize * 1.3, scaledSize * 1.35, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} side={2} />
      </mesh>

      {/* Название планеты */}
      <Text position={[0, -scaledSize - 0.5, 0]} fontSize={0.2} color="white" anchorX="center" anchorY="middle">
        {name}
      </Text>
    </group>
  )
}

function CentralStar() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01
      // Пульсация звезды
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1
      meshRef.current.scale.setScalar(scale)
    }
  })

  return (
    <Sphere ref={meshRef} args={[2]} position={[0, 0, 0]}>
      <meshStandardMaterial color="#ffd700" emissive="#ff8c00" emissiveIntensity={1.5} />
    </Sphere>
  )
}

function MiningLaserComponent({
  shipPosition,
  targetPosition,
  active,
}: {
  shipPosition: [number, number, number]
  targetPosition: [number, number, number]
  active: boolean
}) {
  if (!active) return null

  const points = [new THREE.Vector3(...shipPosition), new THREE.Vector3(...targetPosition)]

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#FF4444" linewidth={3} />
    </line>
  )
}

export default function GalaxyMap({ onBack }: GalaxyMapProps) {
  const [selectedSystem, setSelectedSystem] = useState<StarSystem | null>(null)
  const [playerLocation, setPlayerLocation] = useState("1") // Sol system
  const [destination, setDestination] = useState<string | null>(null)
  const [showDestinationSet, setShowDestinationSet] = useState(false)
  const [traveling, setTraveling] = useState(false)
  const [travelProgress, setTravelProgress] = useState(0)
  const [travelTime, setTravelTime] = useState(0)

  const [showExploration, setShowExploration] = useState(false)
  const [explorationTargets, setExplorationTargets] = useState<ExplorationData>(explorationData)
  const [scanning, setScanning] = useState(false)
  const [scanTarget, setScanTarget] = useState<ExplorationTarget | null>(null)
  const [scanProgress, setScanProgress] = useState(0)
  const [playerStats, setPlayerStats] = useState({
    experience: 0,
    credits: 10000,
    discoveredTargets: 0,
  })

  const [showTerritorialWars, setShowTerritorialWars] = useState(false)
  const [playerCorporation, setPlayerCorporation] = useState("federation")
  const [activeWars, setActiveWars] = useState<TerritorialWar[]>([])
  const [corporationData, setCorporationData] = useState<Corporation[]>(corporations)

  const [showSystemView, setShowSystemView] = useState(false)
  const [selectedSystemObject, setSelectedSystemObject] = useState<any>(null)

  const [currentEvent, setCurrentEvent] = useState<PlanetEvent | null>(null)
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [eventOutcome, setEventOutcome] = useState<string | null>(null)

  const [show3DMode, setShow3DMode] = useState(false)
  const [shipPosition, setShipPosition] = useState({ x: 0, y: 0, z: 15 })
  const [shipRotation, setShipRotation] = useState({ x: 0, y: 0, z: 0 })
  const [thrusterActive, setThrusterActive] = useState(false)
  const [shipVelocity, setShipVelocity] = useState({ x: 0, y: 0, z: 0 })

  const [approachingPlanet, setApproachingPlanet] = useState<string | null>(null)

  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 })
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isLeftMouseDown, setIsLeftMouseDown] = useState(false)
  const [isRightMouseDown, setIsRightMouseDown] = useState(false)
  const lastMousePosition = useRef({ x: 0, y: 0 })

  const [targetPlanet, setTargetPlanet] = useState<{ name: string; position: [number, number, number] } | null>(null)
  const [isApproaching, setIsApproaching] = useState(false)

  const [miningState, setMiningState] = useState<MiningState>({
    isActive: false,
    target: null,
    progress: 0,
    yieldRate: 1.0,
    laserActive: false,
  })

  const [minedResources, setMinedResources] = useState<{ type: string; amount: number }[]>([])
  const [miningTargets, setMiningTargets] = useState<MiningTarget[]>([])

  const [processingStations, setProcessingStations] = useState<ProcessingStation[]>([])
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isActive: false,
    station: null,
    selectedRecipe: null,
    progress: 0,
    queue: [],
  })
  const [showProcessingInterface, setShowProcessingInterface] = useState(false)
  const [processedResources, setProcessedResources] = useState<{ type: string; amount: number }[]>([])

  const starSystems: StarSystem[] = [
    {
      id: "1",
      name: "Sol",
      x: 300,
      y: 200,
      connections: ["2", "3"],
      security: "High",
      faction: "Federation",
      resources: ["Water", "Minerals"],
      planets: [
        { id: "earth", name: "Earth", position: [8, 0, 3] as [number, number, number], size: 0.8, color: "#3b82f6" },
        { id: "mars", name: "Mars", position: [-6, 2, -8] as [number, number, number], size: 0.6, color: "#ef4444" },
        {
          id: "jupiter",
          name: "Jupiter",
          position: [12, -4, 10] as [number, number, number],
          size: 1.5,
          color: "#f59e0b",
        },
      ],
    },
    {
      id: "2",
      name: "Alpha Centauri",
      x: 200,
      y: 250,
      connections: ["1", "4"],
      security: "Medium",
      faction: "Independent",
      resources: ["Exotic Matter"],
      planets: [
        {
          id: "proxima-b",
          name: "Proxima b",
          position: [5, 3, -7] as [number, number, number],
          size: 0.7,
          color: "#8b5cf6",
        },
        {
          id: "proxima-c",
          name: "Proxima c",
          position: [-9, -2, 4] as [number, number, number],
          size: 0.5,
          color: "#06b6d4",
        },
      ],
    },
    {
      id: "3",
      name: "Vega",
      x: 400,
      y: 150,
      connections: ["1", "5"],
      security: "Low",
      faction: "Traders",
      resources: ["Rare Metals"],
      planets: [
        {
          id: "vega-prime",
          name: "Vega Prime",
          position: [-7, 5, -3] as [number, number, number],
          size: 1.0,
          color: "#10b981",
        },
        {
          id: "vega-minor",
          name: "Vega Minor",
          position: [11, -3, 8] as [number, number, number],
          size: 0.4,
          color: "#f97316",
        },
      ],
    },
    {
      id: "4",
      name: "Sirius",
      x: 100,
      y: 100,
      connections: ["2", "6"],
      security: "High",
      faction: "Rebels",
      resources: ["Dark Matter"],
    },
    {
      id: "5",
      name: "Rigel",
      x: 500,
      y: 300,
      connections: ["3", "7"],
      security: "Medium",
      faction: "Pirates",
      resources: ["Quantum Ore"],
    },
    {
      id: "6",
      name: "Betelgeuse",
      x: 250,
      y: 50,
      connections: ["4", "8"],
      security: "Low",
      faction: "Unknown",
      resources: ["Antimatter"],
    },
    {
      id: "7",
      name: "Proxima Centauri",
      x: 450,
      y: 250,
      connections: ["5", "9"],
      security: "High",
      faction: "Outcasts",
      resources: ["Gas"],
    },
    {
      id: "8",
      name: "Arcturus",
      x: 150,
      y: 350,
      connections: ["6"],
      security: "Medium",
      faction: "Federation",
      resources: ["Hydrogen"],
    },
    {
      id: "9",
      name: "Capella",
      x: 550,
      y: 100,
      connections: ["7"],
      security: "Low",
      faction: "Independent",
      resources: ["Rare Gases"],
    },
  ]

  useEffect(() => {
    if (selectedSystem && show3DMode) {
      const asteroids: MiningTarget[] =
        selectedSystem.planets
          ?.filter((p: any) => p.type === "asteroid")
          .map((asteroid: any, index: number) => ({
            id: `asteroid-${index}`,
            name: asteroid.name,
            position: asteroid.position,
            resources: [
              { type: "Iron Ore", amount: Math.floor(Math.random() * 1000) + 500, rarity: "common" as const },
              { type: "Rare Metals", amount: Math.floor(Math.random() * 200) + 100, rarity: "rare" as const },
              { type: "Crystals", amount: Math.floor(Math.random() * 50) + 25, rarity: "epic" as const },
            ],
            health: 1000,
            maxHealth: 1000,
          })) || []

      setMiningTargets(asteroids)

      const stations: ProcessingStation[] = [
        {
          id: "refinery-1",
          name: "Orbital Refinery",
          position: [15, 8, -12],
          type: "refinery",
          level: 2,
          capacity: 1000,
          recipes: processingRecipes.filter((r) => r.id === "iron-ingots" || r.id === "advanced-alloys"),
        },
        {
          id: "factory-1",
          name: "Manufacturing Hub",
          position: [-18, -5, 10],
          type: "factory",
          level: 3,
          capacity: 1500,
          recipes: processingRecipes.filter((r) => r.id === "steel-plates" || r.id === "ship-components"),
        },
      ]

      setProcessingStations(stations)
    }
  }, [selectedSystem, show3DMode])

  const startMining = (target: MiningTarget) => {
    if (miningState.isActive) return

    setMiningState({
      isActive: true,
      target,
      progress: 0,
      yieldRate: 1.0,
      laserActive: true,
    })
  }

  useEffect(() => {
    if (!miningState.isActive || !miningState.target) return

    const miningInterval = setInterval(() => {
      setMiningState((prev) => {
        if (!prev.target) return prev

        const newProgress = prev.progress + 2
        const damage = 10

        // Обновляем здоровье астероида
        setMiningTargets((targets) =>
          targets.map((t) => (t.id === prev.target?.id ? { ...t, health: Math.max(0, t.health - damage) } : t)),
        )

        // Добываем ресурсы
        if (newProgress >= 100) {
          const target = prev.target
          const minedAmount = Math.floor(Math.random() * 10) + 5
          const resourceType = target.resources[Math.floor(Math.random() * target.resources.length)]

          setMinedResources((prev) => {
            const existing = prev.find((r) => r.type === resourceType.type)
            if (existing) {
              return prev.map((r) => (r.type === resourceType.type ? { ...r, amount: r.amount + minedAmount } : r))
            }
            return [...prev, { type: resourceType.type, amount: minedAmount }]
          })

          return {
            isActive: false,
            target: null,
            progress: 0,
            yieldRate: 1.0,
            laserActive: false,
          }
        }

        return { ...prev, progress: newProgress }
      })
    }, 100)

    return () => clearInterval(miningInterval)
  }, [miningState.isActive, miningState.target])

  const stopMining = () => {
    setMiningState({
      isActive: false,
      target: null,
      progress: 0,
      yieldRate: 1.0,
      laserActive: false,
    })
  }

  const dockAtStation = (station: ProcessingStation) => {
    setProcessingState((prev) => ({ ...prev, station }))
    setShowProcessingInterface(true)
  }

  const startProcessing = (recipe: ProcessingRecipe) => {
    if (processingState.isActive) return

    // Проверяем наличие ресурсов
    const hasResources = recipe.inputs.every((input) => {
      const available = minedResources.find((r) => r.type === input.type)
      return available && available.amount >= input.amount
    })

    if (!hasResources) {
      alert("Insufficient resources!")
      return
    }

    // Списываем ресурсы
    setMinedResources((prev) =>
      prev.map((resource) => {
        const input = recipe.inputs.find((i) => i.type === resource.type)
        if (input) {
          return { ...resource, amount: resource.amount - input.amount }
        }
        return resource
      }),
    )

    setProcessingState((prev) => ({
      ...prev,
      isActive: true,
      selectedRecipe: recipe,
      progress: 0,
    }))
  }

  useEffect(() => {
    if (!processingState.isActive || !processingState.selectedRecipe) return

    const processingInterval = setInterval(() => {
      setProcessingState((prev) => {
        if (!prev.selectedRecipe) return prev

        const newProgress = prev.progress + 100 / (prev.selectedRecipe.processingTime / 100)

        if (newProgress >= 100) {
          // Добавляем готовые ресурсы
          prev.selectedRecipe.outputs.forEach((output) => {
            setProcessedResources((prevProcessed) => {
              const existing = prevProcessed.find((r) => r.type === output.type)
              if (existing) {
                return prevProcessed.map((r) =>
                  r.type === output.type ? { ...r, amount: r.amount + output.amount } : r,
                )
              }
              return [...prevProcessed, { type: output.type, amount: output.amount }]
            })
          })

          return {
            ...prev,
            isActive: false,
            selectedRecipe: null,
            progress: 0,
          }
        }

        return { ...prev, progress: newProgress }
      })
    }, 100)

    return () => clearInterval(processingInterval)
  }, [processingState.isActive, processingState.selectedRecipe])

  const stopProcessing = () => {
    setProcessingState((prev) => ({
      ...prev,
      isActive: false,
      selectedRecipe: null,
      progress: 0,
    }))
  }

  useEffect(() => {
    if (!show3DMode) return

    let animationId: number

    const updateMovement = () => {
      setShipVelocity((prev) => ({
        x: prev.x * 0.98, // Более плавное сопротивление
        y: prev.y * 0.98,
        z: prev.z * 0.98,
      }))

      setShipPosition((prev) => ({
        x: prev.x + shipVelocity.x * 0.016, // Нормализованная скорость для 60fps
        y: prev.y + shipVelocity.y * 0.016,
        z: prev.z + shipVelocity.z * 0.016,
      }))

      animationId = requestAnimationFrame(updateMovement)
    }

    animationId = requestAnimationFrame(updateMovement)
    return () => cancelAnimationFrame(animationId)
  }, [show3DMode, shipVelocity])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const thrustPower = 1.5 // Уменьшил для более плавного управления

      switch (e.key.toLowerCase()) {
        case "w":
        case "arrowup":
          setThrusterActive(true)
          setShipVelocity((prev) => {
            const newVelX = prev.x + Math.sin((shipRotation.y * Math.PI) / 180) * thrustPower
            const newVelZ = prev.z + Math.cos((shipRotation.y * Math.PI) / 180) * thrustPower
            // Ограничиваем максимальную скорость
            const maxSpeed = 15
            const currentSpeed = Math.sqrt(newVelX * newVelX + newVelZ * newVelZ)
            if (currentSpeed > maxSpeed) {
              const factor = maxSpeed / currentSpeed
              return {
                ...prev,
                x: newVelX * factor,
                z: newVelZ * factor,
              }
            }
            return {
              ...prev,
              x: newVelX,
              z: newVelZ,
            }
          })
          break
        case "s":
        case "arrowdown":
          setShipVelocity((prev) => ({
            ...prev,
            x: prev.x - Math.sin((shipRotation.y * Math.PI) / 180) * thrustPower * 0.7,
            z: prev.z - Math.cos((shipRotation.y * Math.PI) / 180) * thrustPower * 0.7,
          }))
          break
        case "q":
          setShipRotation((prev) => ({ ...prev, x: Math.max(prev.x - 0.8, -15) }))
          break
        case "e":
          setShipRotation((prev) => ({ ...prev, x: Math.min(prev.x + 0.8, 15) }))
          break
      }
    },
    [shipRotation],
  )

  useEffect(() => {
    if (!show3DMode) return

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "w" || e.key === "ArrowUp") {
        setThrusterActive(false)
      }
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        setIsLeftMouseDown(true)
        lastMousePosition.current = { x: e.clientX, y: e.clientY }
        e.preventDefault()
      } else if (e.button === 2) {
        setIsRightMouseDown(true)
        lastMousePosition.current = { x: e.clientX, y: e.clientY }
        e.preventDefault()
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        setIsLeftMouseDown(false)
      } else if (e.button === 2) {
        setIsRightMouseDown(false)
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (isLeftMouseDown) {
        const deltaX = e.clientX - lastMousePosition.current.x
        const deltaY = e.clientY - lastMousePosition.current.y

        setCameraOffset((prev) => ({
          x: Math.max(-30, Math.min(30, prev.x + deltaX * 0.1)),
          y: Math.max(-20, Math.min(20, prev.y - deltaY * 0.1)),
        }))

        lastMousePosition.current = { x: e.clientX, y: e.clientY }
      } else if (isRightMouseDown) {
        const deltaX = e.clientX - lastMousePosition.current.x
        const deltaY = e.clientY - lastMousePosition.current.y

        setShipRotation((prev) => ({
          x: Math.max(-15, Math.min(15, prev.x - deltaY * 0.1)),
          y: prev.y - deltaX * 0.2,
          z: prev.z,
        }))

        lastMousePosition.current = { x: e.clientX, y: e.clientY }
      }
    }

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const zoomDelta = e.deltaY > 0 ? 0.1 : -0.1
      setZoomLevel((prev) => Math.max(0.5, Math.min(3, prev + zoomDelta)))
    }

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    window.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("mouseup", handleMouseUp)
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("contextmenu", handleContextMenu)
    window.addEventListener("wheel", handleWheel, { passive: false })

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      window.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("mouseup", handleMouseUp)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("contextmenu", handleContextMenu)
      window.removeEventListener("wheel", handleWheel)
    }
  }, [show3DMode, isLeftMouseDown, isRightMouseDown, handleKeyDown])

  const handleApproachPlanet = (planetName: string) => {
    const planet = selectedSystem?.planets?.find((p) => p.name === planetName)
    if (planet) {
      setTargetPlanet({ name: planetName, position: planet.position })
      setIsApproaching(true)
      setApproachingPlanet(planetName)

      const startPos = { ...shipPosition }
      const targetPos = {
        x: planet.position[0] * 0.8, // приближаемся к орбите планеты
        y: planet.position[1] * 0.8,
        z: planet.position[2] * 0.8,
      }

      const duration = 4000 // увеличиваю до 4 секунд для более плавного движения
      const startTime = Date.now()

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)

        const easeProgress =
          progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2

        const newPosition = {
          x: startPos.x + (targetPos.x - startPos.x) * easeProgress,
          y: startPos.y + (targetPos.y - startPos.y) * easeProgress,
          z: startPos.z + (targetPos.z - startPos.z) * easeProgress,
        }

        setShipPosition(newPosition)

        const velocityFactor = 0.1
        setShipVelocity({
          x: (targetPos.x - newPosition.x) * velocityFactor,
          y: (targetPos.y - newPosition.y) * velocityFactor,
          z: (targetPos.z - newPosition.z) * velocityFactor,
        })

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setIsApproaching(false)
          setApproachingPlanet(null)
          setTargetPlanet(null)
          setShipVelocity({ x: 0, y: 0, z: 0 })
        }
      }

      animate()
    }
  }

  const Scene3DContent = () => (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 0]} intensity={2} color="#FFF8DC" />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      <FollowCamera
        shipPosition={shipPosition}
        shipRotation={shipRotation}
        cameraOffset={cameraOffset}
        zoomLevel={zoomLevel}
      />

      <EnhancedStarField />

      {/* Космическая туманность для атмосферы */}
      <mesh>
        <sphereGeometry args={[150, 32, 32]} />
        <meshBasicMaterial color="#1a0033" transparent opacity={0.1} side={2} />
      </mesh>

      {/* Центральная звезда */}
      <CentralStar />

      {/* Планеты */}
      {selectedSystem?.planets
        ?.filter((p: any) => p.type !== "asteroid")
        .map((planet: any) => (
          <Planet
            key={planet.id}
            position={planet.position}
            size={planet.size}
            color={planet.color}
            name={planet.name}
            onRightClick={() => handleApproachPlanet(planet.name)}
          />
        ))}

      {/* Астероиды для майнинга */}
      {miningTargets.map((asteroid) => (
        <Asteroid
          key={asteroid.id}
          position={asteroid.position}
          size={2}
          resources={asteroid.resources}
          health={asteroid.health}
          maxHealth={asteroid.maxHealth}
          name={asteroid.name}
          onStartMining={() => startMining(asteroid)}
          isMining={miningState.target?.id === asteroid.id}
        />
      ))}

      {processingStations.map((station) => (
        <ProcessingStation
          key={station.id}
          position={station.position}
          name={station.name}
          type={station.type}
          level={station.level}
          onDock={() => dockAtStation(station)}
          isProcessing={processingState.station?.id === station.id && processingState.isActive}
        />
      ))}

      {/* Майнинговый лазер */}
      {miningState.laserActive && miningState.target && (
        <MiningLaserComponent
          shipPosition={[shipPosition.x, shipPosition.y, shipPosition.z]}
          targetPosition={miningState.target.position}
          active={miningState.laserActive}
        />
      )}

      {/* Корабль игрока всегда в центре */}
      <SpaceShip
        rotation={[
          (shipRotation.x * Math.PI) / 180,
          (shipRotation.y * Math.PI) / 180,
          (shipRotation.z * Math.PI) / 180,
        ]}
        thrusterActive={thrusterActive}
      />
    </>
  )

  const [show3DView, setShow3DView] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-black text-white">
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button onClick={onBack} variant="outline">
              ← Back
            </Button>
            <h3 className="text-lg font-semibold text-white">Galaxy Map</h3>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowExploration(!showExploration)}
              variant={showExploration ? "default" : "outline"}
            >
              Exploration
            </Button>
            <Button
              onClick={() => setShowTerritorialWars(!showTerritorialWars)}
              variant={showTerritorialWars ? "default" : "outline"}
            >
              Territorial Wars
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-gray-900/50 border-amber-500/30">
              <CardContent className="p-6">
                <div className="relative">
                  <svg
                    viewBox="0 0 600 400"
                    className="w-full h-[400px] bg-gradient-to-b from-purple-900/20 to-black rounded-lg"
                  >
                    {/* Star field background */}
                    {Array.from({ length: 100 }).map((_, i) => (
                      <circle
                        key={i}
                        cx={Math.random() * 600}
                        cy={Math.random() * 400}
                        r={Math.random() * 1.5}
                        fill="white"
                        opacity={Math.random() * 0.8 + 0.2}
                      />
                    ))}

                    {/* System connections */}
                    {starSystems.map((system) =>
                      system.connections.map((connectionId) => {
                        const connectedSystem = starSystems.find((s) => s.id === connectionId)
                        if (!connectedSystem) return null
                        return (
                          <line
                            key={`${system.id}-${connectionId}`}
                            x1={system.x}
                            y1={system.y}
                            x2={connectedSystem.x}
                            y2={connectedSystem.y}
                            stroke="rgba(59, 130, 246, 0.3)"
                            strokeWidth="1"
                          />
                        )
                      }),
                    )}

                    {/* Star systems */}
                    {starSystems.map((system) => (
                      <g key={system.id}>
                        <circle
                          cx={system.x}
                          cy={system.y}
                          r={system.id === playerLocation ? 12 : 8}
                          fill={
                            system.id === playerLocation
                              ? "#10b981"
                              : system.id === destination
                                ? "#f59e0b"
                                : system.security === "High"
                                  ? "#22c55e"
                                  : system.security === "Low"
                                    ? "#f59e0b"
                                    : "#ef4444"
                          }
                          stroke={system.id === selectedSystem?.id ? "#fbbf24" : "transparent"}
                          strokeWidth="3"
                          className="cursor-pointer hover:opacity-80"
                          onClick={() => setSelectedSystem(system)}
                        />
                        <text
                          x={system.x}
                          y={system.y - 15}
                          textAnchor="middle"
                          className="fill-white text-xs font-medium pointer-events-none"
                        >
                          {system.name}
                        </text>
                      </g>
                    ))}

                    {/* Travel route */}
                    {traveling && destination && selectedSystem && (
                      <line
                        x1={starSystems.find((s) => s.id === playerLocation)?.x || 0}
                        y1={starSystems.find((s) => s.id === playerLocation)?.y || 0}
                        x2={starSystems.find((s) => s.id === destination)?.x || 0}
                        y2={starSystems.find((s) => s.id === destination)?.y || 0}
                        stroke="#10b981"
                        strokeWidth="3"
                        strokeDasharray="5,5"
                        opacity="0.8"
                      />
                    )}
                  </svg>

                  {/* Travel progress overlay */}
                  {traveling && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                      <div className="bg-gray-900 p-6 rounded-lg border border-amber-500/30 text-center">
                        <div className="text-white mb-4">
                          Traveling to {starSystems.find((s) => s.id === destination)?.name}
                        </div>
                        <div className="w-64 bg-gray-700 rounded-full h-2 mb-2">
                          <div
                            className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${travelProgress}%` }}
                          />
                        </div>
                        <div className="text-sm text-gray-400">{Math.round(travelProgress)}% Complete</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System info panel */}
          <div className="space-y-4">
            {selectedSystem && (
              <Card className="bg-gray-900/50 border-amber-500/30">
                <CardHeader>
                  <CardTitle className="text-white">{selectedSystem.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">Security</div>
                      <div
                        className={`font-medium ${
                          selectedSystem.security === "High"
                            ? "text-green-400"
                            : selectedSystem.security === "Low"
                              ? "text-yellow-400"
                              : "text-red-400"
                        }`}
                      >
                        {selectedSystem.security}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">Faction</div>
                      <div className="text-white font-medium">{selectedSystem.faction}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Resources</div>
                      <div className="text-white font-medium">{selectedSystem.resources.join(", ")}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {selectedSystem.id !== playerLocation && (
                      <>
                        {!destination && (
                          <Button
                            onClick={() => {
                              setDestination(selectedSystem.id)
                              setShowDestinationSet(true)
                              setTimeout(() => setShowDestinationSet(false), 2000)
                            }}
                            className="w-full"
                          >
                            Set Destination
                          </Button>
                        )}

                        {destination === selectedSystem.id && !traveling && (
                          <Button
                            onClick={() => {
                              const distance = Math.sqrt(
                                Math.pow(
                                  selectedSystem.x - (starSystems.find((s) => s.id === playerLocation)?.x || 0),
                                  2,
                                ) +
                                  Math.pow(
                                    selectedSystem.y - (starSystems.find((s) => s.id === playerLocation)?.y || 0),
                                    2,
                                  ),
                              )
                              const baseTime = Math.max(3000, distance * 20)
                              const securityMultiplier = selectedSystem.security === "Null" ? 1.5 : 1
                              const totalTime = baseTime * securityMultiplier

                              setTraveling(true)
                              setTravelTime(totalTime)
                              setTravelProgress(0)

                              const interval = setInterval(() => {
                                setTravelProgress((prev) => {
                                  if (prev >= 100) {
                                    clearInterval(interval)
                                    setTraveling(false)
                                    setPlayerLocation(selectedSystem.id)
                                    setDestination(null)
                                    return 100
                                  }
                                  return prev + 100 / (totalTime / 100)
                                })
                              }, 100)
                            }}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            Travel Now
                          </Button>
                        )}
                      </>
                    )}

                    {selectedSystem.id === playerLocation && (
                      <>
                        <Button onClick={() => setShowSystemView(true)} className="w-full">
                          Enter System
                        </Button>
                        <Button
                          onClick={() => setShow3DMode(true)}
                          className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                          3D Flight Mode
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Player status */}
            <Card className="bg-gray-900/50 border-amber-500/30">
              <CardHeader>
                <CardTitle className="text-white text-sm">Player Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Location:</span>
                  <span className="text-white">{starSystems.find((s) => s.id === playerLocation)?.name}</span>
                </div>
                {destination && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Destination:</span>
                    <span className="text-amber-400">{starSystems.find((s) => s.id === destination)?.name}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Credits:</span>
                  <span className="text-white">{playerStats.credits.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Experience:</span>
                  <span className="text-white">{playerStats.experience}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* System view modal */}
        {showSystemView && selectedSystem && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded-lg border border-amber-500/30 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">{selectedSystem.name} System</h3>
                <Button onClick={() => setShowSystemView(false)} variant="outline" size="sm">
                  ✕
                </Button>
              </div>
              {/* System view content would go here */}
            </div>
          </div>
        )}

        {/* Event dialog */}
        {showEventDialog && currentEvent && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded-lg border border-amber-500/30 max-w-2xl w-full mx-4">
              <h3 className="text-xl font-bold text-white mb-4">{currentEvent.title}</h3>
              <p className="text-gray-300 mb-6">{currentEvent.description}</p>

              {!eventOutcome ? (
                <div className="space-y-3">
                  {currentEvent.choices.map((choice, index) => (
                    <Button
                      key={index}
                      onClick={() => setEventOutcome(choice.text)}
                      className="w-full text-left justify-start"
                      variant="outline"
                    >
                      {choice.text}
                    </Button>
                  ))}
                </div>
              ) : (
                <div>
                  <p className="text-gray-300 mb-4">{eventOutcome}</p>
                  <Button
                    onClick={() => {
                      setShowEventDialog(false)
                      setCurrentEvent(null)
                      setEventOutcome(null)
                    }}
                    className="w-full"
                  >
                    Continue
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notifications */}
        {showDestinationSet && (
          <div className="fixed top-4 right-4 bg-green-600 text-white p-3 rounded-lg border border-green-500">
            Destination set! Click "Travel Now" to begin journey.
          </div>
        )}
      </div>

      {show3DView && (
        <div className="relative h-screen">
          <Canvas camera={{ position: [0, 5, 10], fov: 75 }}>
            <Scene3DContent />
          </Canvas>

          <div className="absolute top-4 left-4 space-y-4">
            <Card className="bg-slate-900/80 backdrop-blur-sm border-amber-600/30 p-4">
              <h3 className="text-amber-400 font-semibold mb-2">Ship Status</h3>
              <div className="space-y-1 text-sm">
                <div>
                  Position: {Math.round(shipPosition.x)}, {Math.round(shipPosition.y)}, {Math.round(shipPosition.z)}
                </div>
                <div>
                  Speed:{" "}
                  {Math.round(Math.sqrt(shipVelocity.x ** 2 + shipVelocity.y ** 2 + shipVelocity.z ** 2) * 10) / 10}
                </div>
                <div>Heading: {Math.round(shipRotation.y)}°</div>
              </div>
            </Card>

            {/* Майнинговый интерфейс */}
            {miningState.isActive && miningState.target && (
              <Card className="bg-slate-900/80 backdrop-blur-sm border-red-600/30 p-4">
                <h3 className="text-red-400 font-semibold mb-2">Mining: {miningState.target.name}</h3>
                <div className="space-y-2">
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full transition-all duration-100"
                      style={{ width: `${miningState.progress}%` }}
                    />
                  </div>
                  <div className="text-sm text-slate-300">Progress: {Math.round(miningState.progress)}%</div>
                  <div className="text-sm text-slate-300">
                    Target Health: {miningState.target.health}/{miningState.target.maxHealth}
                  </div>
                  <Button onClick={stopMining} size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                    Stop Mining
                  </Button>
                </div>
              </Card>
            )}

            {processingState.isActive && processingState.selectedRecipe && (
              <Card className="bg-slate-900/80 backdrop-blur-sm border-blue-600/30 p-4">
                <h3 className="text-blue-400 font-semibold mb-2">Processing: {processingState.selectedRecipe.name}</h3>
                <div className="space-y-2">
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-100"
                      style={{ width: `${processingState.progress}%` }}
                    />
                  </div>
                  <div className="text-sm text-slate-300">Progress: {Math.round(processingState.progress)}%</div>
                  <div className="text-sm text-slate-300">Station: {processingState.station?.name}</div>
                  <Button onClick={stopProcessing} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    Stop Processing
                  </Button>
                </div>
              </Card>
            )}

            {/* Добытые ресурсы */}
            {minedResources.length > 0 && (
              <Card className="bg-slate-900/80 backdrop-blur-sm border-green-600/30 p-4">
                <h3 className="text-green-400 font-semibold mb-2">Raw Materials</h3>
                <div className="space-y-1 text-sm max-h-32 overflow-y-auto">
                  {minedResources.map((resource, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{resource.type}:</span>
                      <span className="text-green-400">{resource.amount}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {processedResources.length > 0 && (
              <Card className="bg-slate-900/80 backdrop-blur-sm border-purple-600/30 p-4">
                <h3 className="text-purple-400 font-semibold mb-2">Processed Materials</h3>
                <div className="space-y-1 text-sm max-h-32 overflow-y-auto">
                  {processedResources.map((resource, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{resource.type}:</span>
                      <span className="text-purple-400">{resource.amount}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Инструкции по управлению */}
          <div className="absolute bottom-4 right-4">
            <Card className="bg-slate-900/80 backdrop-blur-sm border-amber-600/30 p-4">
              <h3 className="text-amber-400 font-semibold mb-2">Controls</h3>
              <div className="space-y-1 text-xs text-slate-300">
                <div>W - Move Forward</div>
                <div>Right Click + Drag - Turn Ship</div>
                <div>Left Click + Drag - Look Around</div>
                <div>Mouse Wheel - Zoom</div>
                <div>Right Click Asteroid - Start Mining</div>
                <div>Right Click Station - Dock & Process</div>
              </div>
            </Card>
          </div>

          {showProcessingInterface && processingState.station && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Card className="bg-slate-900 border-blue-600/50 p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle className="text-blue-400 flex items-center justify-between">
                    {processingState.station.name}
                    <Button onClick={() => setShowProcessingInterface(false)} variant="outline" size="sm">
                      ✕
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-slate-400">Type</div>
                      <div className="text-white font-medium">{processingState.station.type.toUpperCase()}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Level</div>
                      <div className="text-white font-medium">{processingState.station.level}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-3">Available Recipes</h4>
                    <div className="space-y-3">
                      {processingState.station.recipes.map((recipe) => (
                        <div key={recipe.id} className="p-3 bg-slate-800/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-white font-medium">{recipe.name}</h5>
                            <Button
                              onClick={() => startProcessing(recipe)}
                              disabled={processingState.isActive}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Process
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-slate-400 mb-1">Inputs:</div>
                              {recipe.inputs.map((input, i) => (
                                <div key={i} className="text-slate-300">
                                  {input.amount}x {input.type}
                                </div>
                              ))}
                            </div>
                            <div>
                              <div className="text-slate-400 mb-1">Outputs:</div>
                              {recipe.outputs.map((output, i) => (
                                <div key={i} className="text-green-400">
                                  {output.amount}x {output.type}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="text-xs text-slate-400 mt-2">
                            Time: {recipe.processingTime / 1000}s | Energy: {recipe.energyCost}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export { GalaxyMap }
