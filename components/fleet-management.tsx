"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Rocket, Shield, Zap, Package } from "lucide-react"
import { useFleetManagement } from "@/hooks/use-fleet-management"
import { Starfield } from "@/components/starfield"

interface FleetManagementProps {
  onBack: () => void
}

export function FleetManagement({ onBack }: FleetManagementProps) {
  const {
    ships,
    selectedShip,
    selectShip,
    getStatusColor,
    getHealthPercentage,
    getTotalCargoVolume,
  } = useFleetManagement()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-black relative">
      <Starfield />

      {/* Header */}
      <header className="relative z-10 border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Command
            </Button>
            <Rocket className="w-8 h-8 text-pink-600" />
            <h1 className="text-2xl font-bold text-white">Fleet Management</h1>
          </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-pink-600 border-pink-600">
                {ships.length} Ships
              </Badge>
            </div>
        </div>
      </header>

      <div className="relative z-10 flex h-[calc(100vh-80px)]">
        {/* Ship List */}
          <div className="w-80 p-4 space-y-4 overflow-y-auto">
            {ships.map((ship) => (
              <Card
                key={ship.id}
                onClick={() => selectShip(ship)}
              className={`cursor-pointer transition-all duration-200 ${
                selectedShip?.id === ship.id
                  ? "bg-slate-800/80 border-pink-600/60 scale-105"
                  : "bg-slate-900/80 border-pink-600/30 hover:border-pink-600/50"
              } backdrop-blur-sm`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">{ship.name}</CardTitle>
                  <Badge variant="outline" className={getStatusColor(ship.status)}>
                    {ship.status.toUpperCase()}
                  </Badge>
                </div>
                <CardDescription className="text-slate-300">
                  {ship.type.charAt(0).toUpperCase() + ship.type.slice(1)}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-400 text-xs">Hull</span>
                      <span className="text-white text-xs">
                        {Math.round(getHealthPercentage(ship.hull, ship.maxHull))}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div
                        className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${getHealthPercentage(ship.hull, ship.maxHull)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-400 text-xs">Shield</span>
                      <span className="text-white text-xs">
                        {Math.round(getHealthPercentage(ship.shield, ship.maxShield))}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${getHealthPercentage(ship.shield, ship.maxShield)}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 mt-2">{ship.location}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Ship Details */}
        <div className="flex-1 p-4">
          {selectedShip ? (
            <div className="space-y-4 h-full">
              <Card className="bg-slate-900/80 backdrop-blur-sm border-pink-600/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl text-white">{selectedShip.name}</CardTitle>
                      <CardDescription className="text-slate-300 text-lg">
                        {selectedShip.type.charAt(0).toUpperCase() + selectedShip.type.slice(1)}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className={getStatusColor(selectedShip.status)}>
                      {selectedShip.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-slate-300">
                        <Shield className="w-4 h-4 mr-2" />
                        <span className="text-sm">Hull</span>
                      </div>
                      <div className="text-white font-semibold">
                        {selectedShip.hull.toLocaleString()} / {selectedShip.maxHull.toLocaleString()}
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getHealthPercentage(selectedShip.hull, selectedShip.maxHull)}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-slate-300">
                        <Zap className="w-4 h-4 mr-2" />
                        <span className="text-sm">Shield</span>
                      </div>
                      <div className="text-white font-semibold">
                        {selectedShip.shield.toLocaleString()} / {selectedShip.maxShield.toLocaleString()}
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getHealthPercentage(selectedShip.shield, selectedShip.maxShield)}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-slate-300">
                        <Shield className="w-4 h-4 mr-2" />
                        <span className="text-sm">Armor</span>
                      </div>
                      <div className="text-white font-semibold">
                        {selectedShip.armor.toLocaleString()} / {selectedShip.maxArmor.toLocaleString()}
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getHealthPercentage(selectedShip.armor, selectedShip.maxArmor)}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-slate-300">
                        <Package className="w-4 h-4 mr-2" />
                        <span className="text-sm">Cargo</span>
                      </div>
                      <div className="text-white font-semibold">
                        {getTotalCargoVolume(selectedShip)} / {selectedShip.maxCargo}
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(getTotalCargoVolume(selectedShip) / selectedShip.maxCargo) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-slate-300">
                    <strong>Location:</strong> {selectedShip.location}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
                <Card className="bg-slate-900/80 backdrop-blur-sm border-pink-600/30">
                  <CardHeader>
                    <CardTitle className="text-white">Fitted Modules</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedShip.modules.map((module) => (
                        <div key={module.id} className="p-3 bg-slate-800/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-white font-semibold">{module.name}</h4>
                            <Badge
                              variant="outline"
                              className={
                                module.status === "online"
                                  ? "text-green-400 border-green-400"
                                  : module.status === "offline"
                                    ? "text-gray-400 border-gray-400"
                                    : "text-red-400 border-red-400"
                              }
                            >
                              {module.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-slate-300">
                            <div>Type: {module.type}</div>
                            <div>Slot: {module.slot}</div>
                            {Object.entries(module.stats).map(([key, value]) => (
                              <div key={key}>
                                {key}: {value}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/80 backdrop-blur-sm border-pink-600/30">
                  <CardHeader>
                    <CardTitle className="text-white">Cargo Hold</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedShip.cargo.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                          <div>
                            <h4 className="text-white font-semibold">{item.name}</h4>
                            <p className="text-slate-300 text-sm">Volume: {item.volume} m³</p>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-semibold">{item.quantity.toLocaleString()}</div>
                            <div className="text-slate-400 text-sm">units</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card className="bg-slate-900/80 backdrop-blur-sm border-pink-600/30 h-full flex items-center justify-center">
              <CardContent className="text-center">
                <Rocket className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                <h3 className="text-xl text-white mb-2">Select a Ship</h3>
                <p className="text-slate-400">
                  Choose a ship from the list to view its details and manage its configuration
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
