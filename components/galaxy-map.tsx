"use client"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { StarMap } from "./star-map"
import { SolarSystemView, type OrbitPlanet } from "./solar-system-view"
import { MiningInterface } from "./mining-interface"
import { ProcessingWindow } from "./processing-window"
import { useGalaxyMap } from "@/hooks/use-galaxy-map"
import { useResourceOperations } from "@/hooks/use-resource-operations"
import type { MiningTarget, ProcessingRecipe } from "@/types"

interface GalaxyMapProps {
  onBack: () => void
}

const systemPlanets: OrbitPlanet[] = [
  {
    id: "mercury",
    name: "Mercury",
    position: [0, 0, 0],
    size: 0.5,
    color: "#b1b1b1",
    distance: 16,
    speed: 2.37,
    inclination: 0.02,
    rotationSpeed: 0.02,
  },
  {
    id: "venus",
    name: "Venus",
    position: [0, 0, 0],
    size: 0.9,
    color: "#e5c555",
    distance: 22,
    speed: 1.75,
    inclination: 0.01,
    rotationSpeed: 0.015,
  },
  {
    id: "earth",
    name: "Earth",
    position: [0, 0, 0],
    size: 1,
    color: "#2a6fdd",
    distance: 28,
    speed: 1.5,
    inclination: 0.03,
    rotationSpeed: 0.03,
  },
  {
    id: "mars",
    name: "Mars",
    position: [0, 0, 0],
    size: 0.8,
    color: "#b55442",
    distance: 34,
    speed: 1.2,
    inclination: 0.05,
    rotationSpeed: 0.025,
  },
]

export default function GalaxyMap({ onBack }: GalaxyMapProps) {
  const {
    starSystems,
    selectedSystem,
    playerLocation,
    destination,
    traveling,
    travelProgress,
    selectSystem,
    initiateTravel,
    getSecurityColor,
  } = useGalaxyMap()
  const {
    miningState,
    minedResources,
    startMining,
    stopMining,
    processingState,
    processedResources,
    startProcessing,
    stopProcessing,
    showProcessingInterface,
    setShowProcessingInterface,
  } = useResourceOperations(selectedSystem)

  const handleStartMining = () => {
    if (!selectedSystem) return
    const target: MiningTarget = {
      id: "asteroid-1",
      name: "Asteroid",
      position: [0, 0, 0],
      resources: [{ type: "Ore", amount: 100, rarity: "common" }],
      health: 100,
      maxHealth: 100,
    }
    startMining(target)
  }

  const handleStartProcessing = () => {
    const recipe: ProcessingRecipe = {
      id: "ore-refining",
      name: "Ore Refining",
      inputs: [{ type: "Ore", amount: 50 }],
      outputs: [{ type: "Metal", amount: 25 }],
      processingTime: 5000,
      energyCost: 10,
    }
    startProcessing(recipe)
  }

  const handlePlanetSelect = (_planet: OrbitPlanet) => {}

  return (
    <div className="space-y-4">
      {selectedSystem?.id === playerLocation ? (
        <SolarSystemView planets={systemPlanets} onPlanetSelect={handlePlanetSelect} />
      ) : (
        <StarMap
          starSystems={starSystems}
          playerLocation={playerLocation}
          destination={destination}
          selectedSystem={selectedSystem}
          traveling={traveling}
          selectSystem={selectSystem}
          getSecurityColor={getSecurityColor}
        />
      )}

      {traveling && (
        <div className="space-y-2">
          <Progress value={travelProgress} />
        </div>
      )}

      <div className="flex gap-4">
        <Button onClick={onBack}>Back</Button>
        <Button
          onClick={() => selectedSystem && initiateTravel(selectedSystem)}
          disabled={!selectedSystem || traveling}
        >
          Travel
        </Button>
        <Button
          onClick={handleStartMining}
          disabled={!selectedSystem || miningState.isActive || traveling}
        >
          Start Mining
        </Button>
        <Button
          onClick={handleStartProcessing}
          disabled={processingState.isActive || traveling}
        >
          Start Processing
        </Button>
      </div>

      <MiningInterface
        miningState={miningState}
        minedResources={minedResources}
        processedResources={processedResources}
        onStopMining={stopMining}
      />

      <ProcessingWindow
        processingState={processingState}
        onStartProcessing={startProcessing}
        onStopProcessing={stopProcessing}
        show={showProcessingInterface}
        onClose={() => setShowProcessingInterface(false)}
      />
    </div>
  )
}

export { GalaxyMap }
