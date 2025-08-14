"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { BattleLog } from "@/types"

interface BattleLogPanelProps {
  log: BattleLog[]
}

export function BattleLogPanel({ log }: BattleLogPanelProps) {
  return (
    <Card className="bg-slate-900/80 backdrop-blur-sm border-pink-600/30">
      <CardHeader>
        <CardTitle className="text-white">Battle Log</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 max-h-[400px] overflow-y-auto">
        {log.map((entry) => (
          <div key={entry.id} className="text-sm text-slate-300">
            {entry.message}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

