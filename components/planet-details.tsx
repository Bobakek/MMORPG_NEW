"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { OrbitPlanet } from "./solar-system-view"

interface PlanetDetailsProps {
  planet: OrbitPlanet | null
  onClose: () => void
}

export function PlanetDetails({ planet, onClose }: PlanetDetailsProps) {
  if (!planet) return null

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
      <Card className="bg-slate-900 border-blue-600/50 p-6 max-w-md w-full mx-4">
        <CardHeader>
          <CardTitle className="text-blue-400 flex items-center justify-between">
            {planet.name}
            <Button onClick={onClose} variant="outline" size="sm">
              Close
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-slate-300">
          <div>ID: {planet.id}</div>
          <div>Size: {planet.size}</div>
          {planet.type && <div>Type: {planet.type}</div>}
          <div>Distance from sun: {planet.distance}</div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PlanetDetails
