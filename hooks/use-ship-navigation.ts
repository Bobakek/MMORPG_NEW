"use client"

import { useState } from "react"
import * as THREE from "three"
import type { OrbitPlanet } from "@/components/solar-system-view"

export function useShipNavigation() {
  const [shipPosition, setShipPosition] = useState(() => new THREE.Vector3())
  const [destinationPlanet, setDestinationPlanet] =
    useState<OrbitPlanet | null>(null)

  const sendShipToPlanet = (planet: OrbitPlanet) => {
    setDestinationPlanet(planet)
  }

  const updateShipPosition = (delta: number) => {
    if (!destinationPlanet) return

    const t = (Date.now() / 1000) * destinationPlanet.speed
    const target = new THREE.Vector3(
      Math.cos(t) * destinationPlanet.distance,
      0,
      Math.sin(t) * destinationPlanet.distance,
    )
    target.applyAxisAngle(
      new THREE.Vector3(1, 0, 0),
      destinationPlanet.inclination,
    )

    const direction = target.clone().sub(shipPosition)
    const distance = direction.length()
    const speed = 10
    if (distance < 0.1) {
      setShipPosition(target)
      setDestinationPlanet(null)
      return
    }
    direction.normalize()
    const move = Math.min(speed * delta, distance)
    setShipPosition((pos) => pos.clone().add(direction.multiplyScalar(move)))
  }

  return {
    shipPosition,
    destinationPlanet,
    sendShipToPlanet,
    updateShipPosition,
  }
}
