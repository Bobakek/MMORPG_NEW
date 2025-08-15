"use client"

import type { StarSystem } from "@/types"

interface StarMapProps {
  starSystems: StarSystem[]
  playerLocation: string
  selectedSystem: StarSystem | null
  traveling: boolean
  travelPath: string[]
  selectSystem: (system: StarSystem) => void
  getSecurityColor: (sec: StarSystem["security"]) => string
}

export function StarMap({
  starSystems,
  playerLocation,
  selectedSystem,
  traveling,
  travelPath,
  selectSystem,
  getSecurityColor,
}: StarMapProps) {
  return (
    <svg width={800} height={600} className="bg-black rounded-lg">
      {starSystems.map((system) =>
        system.connected.map((connectionId) => {
          const target = starSystems.find((s) => s.id === connectionId)
          if (!target) return null
          return (
            <line
              key={`${system.id}-${connectionId}`}
              x1={system.x}
              y1={system.y}
              x2={target.x}
              y2={target.y}
              stroke="rgba(59,130,246,0.3)"
              strokeWidth={1}
            />
          )
        }),
      )}

      {starSystems.map((system) => (
        <g key={system.id}>
          <circle
            cx={system.x}
            cy={system.y}
            r={system.id === playerLocation ? 12 : 8}
            fill={
              system.id === playerLocation
                ? "#10b981"
                : getSecurityColor(system.security)
            }
            stroke={system.id === selectedSystem?.id ? "#fbbf24" : "transparent"}
            strokeWidth={3}
            className="cursor-pointer hover:opacity-80"
            onClick={() => !traveling && selectSystem(system)}
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

      {traveling && travelPath.length > 1 &&
        travelPath.map((id, i) => {
          if (i === travelPath.length - 1) return null
          const from = starSystems.find((s) => s.id === id)
          const to = starSystems.find((s) => s.id === travelPath[i + 1])
          if (!from || !to) return null
          return (
            <line
              key={`${from.id}-${to.id}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="#10b981"
              strokeWidth={3}
              strokeDasharray="5,5"
              opacity={0.8}
            />
          )
        })}
    </svg>
  )
}
