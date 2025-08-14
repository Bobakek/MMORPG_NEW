"use client"

import { Button } from "@/components/ui/button"
import { StarMap } from "./star-map"
import { MiningInterface } from "./mining-interface"
import { ProcessingWindow } from "./processing-window"
import { useGalaxyMap } from "@/hooks/use-galaxy-map"
import { useResourceOperations } from "@/hooks/use-resource-operations"
import type { MiningTarget, ProcessingRecipe } from "@/types"

interface GalaxyMapProps {
  onBack: () => void
}

export default function GalaxyMap({ onBack }: GalaxyMapProps) {
  const { starSystems, selectedSystem, playerLocation, selectSystem, getSecurityColor } =
    useGalaxyMap()
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

  return (
    <div className="space-y-4">
      <StarMap
        starSystems={starSystems}
        playerLocation={playerLocation}
        destination={null}
        selectedSystem={selectedSystem}
        traveling={false}
        selectSystem={selectSystem}
        getSecurityColor={getSecurityColor}
      />

      <div className="flex gap-4">
        <Button onClick={onBack}>Back</Button>
        <Button onClick={handleStartMining} disabled={!selectedSystem || miningState.isActive}>
          Start Mining
        </Button>
        <Button onClick={handleStartProcessing} disabled={processingState.isActive}>
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
