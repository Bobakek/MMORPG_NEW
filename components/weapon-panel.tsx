"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { BattleShip } from "@/types"

interface WeaponPanelProps {
  ship: BattleShip | undefined
  onAttack: (weaponIndex: number) => void
}

export function WeaponPanel({ ship, onAttack }: WeaponPanelProps) {
  if (!ship) return null

  return (
    <Card className="bg-slate-900/80 backdrop-blur-sm border-pink-600/30">
      <CardHeader>
        <CardTitle className="text-white">{ship.name} Weapons</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {ship.weapons.map((weapon, index) => (
          <Button
            key={index}
            onClick={() => onAttack(index)}
            disabled={weapon.currentCooldown > 0}
            className="w-full"
          >
            {weapon.name} (
            {weapon.currentCooldown > 0
              ? `${(weapon.currentCooldown / 1000).toFixed(1)}s`
              : "Ready"}
            )
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}

