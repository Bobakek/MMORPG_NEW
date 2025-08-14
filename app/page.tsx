"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Rocket, Users, Map, Globe, Sword, ArrowLeft } from "lucide-react"

import { CombatArena } from "@/components/combat-arena"
import { GalaxyMap } from "@/components/galaxy-map"
import { FleetManagement } from "@/components/fleet-management"
import { SocialHub } from "@/components/social-hub"
import { TradingHub } from "@/components/trading-hub"

import { useNavigation } from "@/hooks/use-navigation"

const Page = () => {
  const {
    currentView,
    navigateToMain,
    navigateToGalaxy,
    navigateToFleet,
    navigateToCombat,
    navigateToSocial,
    navigateToTrading,
  } = useNavigation()

  const stars = useMemo(
    () =>
      Array.from({ length: 300 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 3}s`,
        animationDuration: `${2 + Math.random() * 2}s`,
      })),
    []
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-black relative">
      {/* Starfield background */}
      <div className="absolute inset-0">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: star.left,
              top: star.top,
              animationDelay: star.animationDelay,
              animationDuration: star.animationDuration,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={navigateToMain}
              className="text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Main
            </Button>
            <h1 className="text-2xl font-bold text-white">Galactic Command</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-amber-600 border-amber-600">
              Explore and Manage
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        {currentView === "main" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Galaxy Map */}
            <Card
              onClick={navigateToGalaxy}
              className="bg-slate-900/80 backdrop-blur-sm border-amber-600/30 hover:border-amber-600/60 transition-all duration-300 hover:scale-105 cursor-pointer group"
            >
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-amber-600/20 rounded-full group-hover:bg-amber-600/30 transition-colors">
                    <Map className="w-8 h-8 text-amber-600" />
                  </div>
                </div>
                <CardTitle className="text-xl text-white">Exploration Hub</CardTitle>
                <CardDescription className="text-slate-300">Navigate and explore star systems</CardDescription>
              </CardHeader>
            </Card>

            {/* Fleet Management */}
            <Card
              onClick={navigateToFleet}
              className="bg-slate-900/80 backdrop-blur-sm border-amber-600/30 hover:border-amber-600/60 transition-all duration-300 hover:scale-105 cursor-pointer group"
            >
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-amber-600/20 rounded-full group-hover:bg-amber-600/30 transition-colors">
                    <Rocket className="w-8 h-8 text-pink-600" />
                  </div>
                </div>
                <CardTitle className="text-xl text-white">Fleet Management</CardTitle>
                <CardDescription className="text-slate-300">Manage your ships, crew, and equipment</CardDescription>
              </CardHeader>
            </Card>

            {/* Combat Arena */}
            <Card
              onClick={navigateToCombat}
              className="bg-slate-900/80 backdrop-blur-sm border-pink-600/30 hover:border-pink-600/60 transition-all duration-300 hover:scale-105 cursor-pointer group"
            >
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-pink-600/20 rounded-full group-hover:bg-pink-600/30 transition-colors">
                    <Sword className="w-8 h-8 text-pink-600" />
                  </div>
                </div>
                <CardTitle className="text-xl text-white">Combat Arena</CardTitle>
                <CardDescription className="text-slate-300">Engage in PvP battles</CardDescription>
              </CardHeader>
            </Card>

            {/* Community Nexus */}
            <Card
              onClick={navigateToSocial}
              className="bg-slate-900/80 backdrop-blur-sm border-amber-600/30 hover:border-amber-600/60 transition-all duration-300 hover:scale-105 cursor-pointer group"
            >
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-amber-600/20 rounded-full group-hover:bg-amber-600/30 transition-colors">
                    <Users className="w-8 h-8 text-amber-600" />
                  </div>
                </div>
                <CardTitle className="text-xl text-white">Community Nexus</CardTitle>
                <CardDescription className="text-slate-300">
                  Join corporations and communicate with other players
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Trading Hub */}
            <Card
              onClick={navigateToTrading}
              className="bg-slate-900/80 backdrop-blur-sm border-amber-600/30 hover:border-amber-600/60 transition-all duration-300 hover:scale-105 cursor-pointer group"
            >
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-amber-600/20 rounded-full group-hover:bg-amber-600/30 transition-colors">
                    <Globe className="w-8 h-8 text-amber-600" />
                  </div>
                </div>
                <CardTitle className="text-xl text-white">Trading Hub</CardTitle>
                <CardDescription className="text-slate-300">
                  Buy, sell, and trade resources across the galaxy
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}

        {currentView === "galaxy" && <GalaxyMap onBack={navigateToMain} />}
        {currentView === "fleet" && <FleetManagement onBack={navigateToMain} />}
        {currentView === "combat" && <CombatArena onBack={navigateToMain} />}
        {currentView === "social" && <SocialHub onBack={navigateToMain} />}
        {currentView === "trading" && <TradingHub onBack={navigateToMain} />}
      </main>
    </div>
  )
}

export default Page
