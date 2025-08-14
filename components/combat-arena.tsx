"use client"

import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useBattle } from "@/hooks"
import { TargetPanel } from "./target-panel"
import { WeaponPanel } from "./weapon-panel"
import { BattleLogPanel } from "./battle-log"

interface CombatArenaProps {
  onBack: () => void
}

export function CombatArena({ onBack }: CombatArenaProps) {
  const {
    selectedTarget,
    battleLog,
    playerShip,
    enemyShips,
    handleAttack,
    handleTargetSelect,
    missions,
    currentMission,
    startMission,
  } = useBattle()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-black relative">
      <header className="relative z-10 border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <h1 className="text-2xl font-bold text-white">Combat Arena</h1>
          </div>
        </div>
      </header>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        <div className="space-y-4">
          <Card className="bg-slate-900/80 backdrop-blur-sm border-pink-600/30">
            <CardHeader>
              <CardTitle className="text-white">Missions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {missions.map((mission) => (
                <Button
                  key={mission.id}
                  size="sm"
                  variant={currentMission?.id === mission.id ? "default" : "secondary"}
                  onClick={() => startMission(mission.id)}
                  className="w-full"
                >
                  {mission.name}
                </Button>
              ))}
            </CardContent>
          </Card>
          <TargetPanel enemyShips={enemyShips} selectedTarget={selectedTarget} onSelect={handleTargetSelect} />
        </div>
        <WeaponPanel ship={playerShip} onAttack={handleAttack} />
        <BattleLogPanel log={battleLog} />
      </div>
    </div>
  )
}

