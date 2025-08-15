import type { Planet } from "@/types/resources"
import { cn } from "@/lib/utils"
import { Button } from "./button"

interface PlanetListProps {
  planets: Planet[]
  onSelect: (planet: Planet) => void
  className?: string
}

export function PlanetList({ planets, onSelect, className }: PlanetListProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {planets.map((planet) => (
        <Button
          key={planet.id}
          variant="secondary"
          className="w-full"
          onClick={() => onSelect(planet)}
        >
          {planet.name}
        </Button>
      ))}
    </div>
  )
}

export default PlanetList
