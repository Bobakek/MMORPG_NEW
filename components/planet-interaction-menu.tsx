"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { OrbitPlanet } from "./solar-system-view"

interface PlanetInteractionMenuProps {
  planet: OrbitPlanet
  onClose: () => void
  onExplore?: () => void
  onTrade?: () => void
  onMine?: () => void
}

export function PlanetInteractionMenu({
  planet,
  onClose,
  onExplore,
  onTrade,
  onMine,
}: PlanetInteractionMenuProps) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50">
      <Card className="bg-slate-900 border-blue-600/50 p-6 max-w-sm w-full mx-4">
        <CardHeader>
          <CardTitle className="text-blue-400 flex items-center justify-between">
            {planet.name}
            <Button onClick={onClose} variant="outline" size="sm">
              Close
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button className="w-full" onClick={onExplore}>
            Explore
          </Button>
          <Button className="w-full" onClick={onTrade}>
            Trade
          </Button>
          <Button className="w-full" onClick={onMine}>
            Mine
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default PlanetInteractionMenu
