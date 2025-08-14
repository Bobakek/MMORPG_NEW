"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { ProcessingRecipe } from "@/types"
import type { ProcessingState } from "@/hooks/use-resource-operations"

interface ProcessingWindowProps {
  processingState: ProcessingState
  onStartProcessing: (recipe: ProcessingRecipe) => void
  onStopProcessing: () => void
  show: boolean
  onClose: () => void
}

export function ProcessingWindow({
  processingState,
  onStartProcessing,
  onStopProcessing,
  show,
  onClose,
}: ProcessingWindowProps) {
  if (!show || !processingState.station) return null

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
      <Card className="bg-slate-900 border-blue-600/50 p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="text-blue-400 flex items-center justify-between">
            {processingState.station.name}
            <Button onClick={onClose} variant="outline" size="sm">
              ✕
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {processingState.station.recipes.map((recipe) => (
              <div key={recipe.id} className="p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-white font-medium">{recipe.name}</h5>
                  <Button
                    onClick={() => onStartProcessing(recipe)}
                    disabled={processingState.isActive}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Process
                  </Button>
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  Time: {recipe.processingTime / 1000}s | Energy: {recipe.energyCost}
                </div>
              </div>
            ))}
          </div>
          {processingState.isActive && processingState.selectedRecipe && (
            <div className="space-y-2 mt-4">
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-100"
                  style={{ width: `${processingState.progress}%` }}
                />
              </div>
              <div className="text-sm text-slate-300">
                Progress: {Math.round(processingState.progress)}%
              </div>
              <Button
                onClick={onStopProcessing}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Stop Processing
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
