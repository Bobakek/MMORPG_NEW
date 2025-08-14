"use client"

import { useState } from "react"

export type ViewType = "main" | "galaxy" | "fleet" | "combat" | "social" | "trading"

export function useNavigation() {
  const [currentView, setCurrentView] = useState<ViewType>("main")

  const navigateToMain = () => setCurrentView("main")
  const navigateToGalaxy = () => setCurrentView("galaxy")
  const navigateToFleet = () => setCurrentView("fleet")
  const navigateToCombat = () => setCurrentView("combat")
  const navigateToSocial = () => setCurrentView("social")
  const navigateToTrading = () => setCurrentView("trading")

  return {
    currentView,
    navigateToMain,
    navigateToGalaxy,
    navigateToFleet,
    navigateToCombat,
    navigateToSocial,
    navigateToTrading,
  }
}
