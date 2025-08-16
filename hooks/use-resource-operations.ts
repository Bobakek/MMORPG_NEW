"use client"

import { useEffect, useState } from "react"
import { useStore } from "@/store"
import type {
  MiningTarget,
  ProcessingRecipe,
  ProcessingStation,
  StarSystem,
} from "@/types"

export interface MiningState {
  isActive: boolean
  target: MiningTarget | null
  progress: number
  yieldRate: number
  laserActive: boolean
}

export interface ProcessingState {
  isActive: boolean
  station: ProcessingStation | null
  selectedRecipe: ProcessingRecipe | null
  progress: number
}

export function useResourceOperations(_selectedSystem: StarSystem | null) {
  const addResource = useStore((s) => s.addResource)
  const [miningState, setMiningState] = useState<MiningState>({
    isActive: false,
    target: null,
    progress: 0,
    yieldRate: 1,
    laserActive: false,
  })
  const [minedResources, setMinedResources] = useState<{ type: string; amount: number }[]>([])

  const [processingState, setProcessingState] = useState<ProcessingState>({
    isActive: false,
    station: null,
    selectedRecipe: null,
    progress: 0,
  })
  const [processedResources, setProcessedResources] = useState<{ type: string; amount: number }[]>([])
  const [showProcessingInterface, setShowProcessingInterface] = useState(false)

  const startMining = (target: MiningTarget) => {
    if (miningState.isActive) return
    setMiningState({ isActive: true, target, progress: 0, yieldRate: 1, laserActive: true })
  }

  useEffect(() => {
    if (!miningState.isActive || !miningState.target) return

    const interval = setInterval(() => {
      setMiningState((prev) => {
        const progress = prev.progress + 10
        if (progress >= 100 && prev.target) {
          const resource = prev.target.resources[0]
          addResource(resource.type, resource.amount)
          setMinedResources((r) => [...r, { type: resource.type, amount: resource.amount }])
          return { isActive: false, target: null, progress: 0, yieldRate: 1, laserActive: false }
        }
        return { ...prev, progress }
      })
    }, 500)

    return () => clearInterval(interval)
  }, [miningState.isActive, miningState.target])

  const stopMining = () =>
    setMiningState({ isActive: false, target: null, progress: 0, yieldRate: 1, laserActive: false })

  const startProcessing = (recipe: ProcessingRecipe) => {
    if (processingState.isActive) return
    setProcessingState({ isActive: true, station: processingState.station, selectedRecipe: recipe, progress: 0 })
  }

  useEffect(() => {
    if (!processingState.isActive || !processingState.selectedRecipe) return

    const interval = setInterval(() => {
      setProcessingState((prev) => {
        const progress = prev.progress + 10
        if (progress >= 100 && prev.selectedRecipe) {
          prev.selectedRecipe.outputs.forEach((o) => {
            addResource(o.type, o.amount)
            setProcessedResources((r) => {
              const existing = r.find((res) => res.type === o.type)
              if (existing) {
                return r.map((res) => (res.type === o.type ? { ...res, amount: res.amount + o.amount } : res))
              }
              return [...r, { type: o.type, amount: o.amount }]
            })
          })
          return { isActive: false, station: prev.station, selectedRecipe: null, progress: 0 }
        }
        return { ...prev, progress }
      })
    }, 500)

    return () => clearInterval(interval)
  }, [processingState.isActive, processingState.selectedRecipe])

  const stopProcessing = () =>
    setProcessingState((prev) => ({ ...prev, isActive: false, selectedRecipe: null, progress: 0 }))

  const dockAtStation = (station: ProcessingStation) => {
    setProcessingState((prev) => ({ ...prev, station }))
    setShowProcessingInterface(true)
  }

  return {
    miningState,
    minedResources,
    startMining,
    stopMining,
    processingState,
    processedResources,
    startProcessing,
    stopProcessing,
    dockAtStation,
    showProcessingInterface,
    setShowProcessingInterface,
  }
}
