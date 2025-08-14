"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { BattleShip } from "@/types"

interface TargetPanelProps {
  enemyShips: BattleShip[]
  selectedTarget: string | null
  onSelect: (id: string) => void
}

export function TargetPanel({ enemyShips, selectedTarget, onSelect }: TargetPanelProps) {
  return (
    <Card className="bg-slate-900/80 backdrop-blur-sm border-pink-600/30">
      <CardHeader>
        <CardTitle className="text-white">Targets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {enemyShips.map((ship) => (
          <Button
            key={ship.id}
            variant={selectedTarget === ship.id ? "default" : "secondary"}
            className="w-full justify-between"
            onClick={() => onSelect(ship.id)}
          >
            <span>{ship.name}</span>
            <span className="text-sm">{Math.round((ship.hull / ship.maxHull) * 100)}%</span>
          </Button>
        ))}
        {enemyShips.length === 0 && (
          <p className="text-slate-400 text-sm">No enemies detected.</p>
        )}
      </CardContent>
    </Card>
  )
}

