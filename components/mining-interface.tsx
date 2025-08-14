"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { MiningState } from "@/hooks/use-resource-operations"

interface MiningInterfaceProps {
  miningState: MiningState
  minedResources: { type: string; amount: number }[]
  processedResources: { type: string; amount: number }[]
  onStopMining: () => void
}

export function MiningInterface({
  miningState,
  minedResources,
  processedResources,
  onStopMining,
}: MiningInterfaceProps) {
  return (
    <div className="space-y-4">
      {miningState.isActive && miningState.target && (
        <Card className="bg-slate-900/80 backdrop-blur-sm border-red-600/30 p-4">
          <CardHeader className="p-0 mb-2">
            <CardTitle className="text-red-400 font-semibold">
              Mining: {miningState.target.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-2">
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all duration-100"
                style={{ width: `${miningState.progress}%` }}
              />
            </div>
            <div className="text-sm text-slate-300">
              Progress: {Math.round(miningState.progress)}%
            </div>
            <Button
              onClick={onStopMining}
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Stop Mining
            </Button>
          </CardContent>
        </Card>
      )}

      {minedResources.length > 0 && (
        <Card className="bg-slate-900/80 backdrop-blur-sm border-green-600/30 p-4">
          <CardHeader className="p-0 mb-2">
            <CardTitle className="text-green-400 font-semibold">
              Raw Materials
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-1 text-sm max-h-32 overflow-y-auto">
            {minedResources.map((resource, index) => (
              <div key={index} className="flex justify-between">
                <span>{resource.type}:</span>
                <span className="text-green-400">{resource.amount}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {processedResources.length > 0 && (
        <Card className="bg-slate-900/80 backdrop-blur-sm border-purple-600/30 p-4">
          <CardHeader className="p-0 mb-2">
            <CardTitle className="text-purple-400 font-semibold">
              Processed Materials
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-1 text-sm max-h-32 overflow-y-auto">
            {processedResources.map((resource, index) => (
              <div key={index} className="flex justify-between">
                <span>{resource.type}:</span>
                <span className="text-purple-400">{resource.amount}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
