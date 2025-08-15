"use client"

import type { StarSystem } from "@/types"

interface StarMapProps {
  starSystems: StarSystem[]
  playerLocation: string
  destination: string | null
  selectedSystem: StarSystem | null
  traveling: boolean
  selectSystem: (system: StarSystem) => void
  getSecurityColor: (sec: StarSystem["security"]) => string
}

export function StarMap({
  starSystems,
  playerLocation,
  destination,
  selectedSystem,
  traveling,
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

      {traveling && destination && selectedSystem && (
        <line
          x1={starSystems.find((s) => s.id === playerLocation)?.x || 0}
          y1={starSystems.find((s) => s.id === playerLocation)?.y || 0}
          x2={starSystems.find((s) => s.id === destination)?.x || 0}
          y2={starSystems.find((s) => s.id === destination)?.y || 0}
          stroke="#10b981"
          strokeWidth={3}
          strokeDasharray="5,5"
          opacity={0.8}
        />
      )}
    </svg>
  )
}
