"use client"

import { useRef, useState } from "react"
import * as THREE from "three"
import type { OrbitPlanet } from "@/components/solar-system-view"

export function useShipNavigation() {
  const [shipPosition, setShipPosition] = useState(() => new THREE.Vector3())
  const [destinationPlanet, setDestinationPlanet] =
    useState<OrbitPlanet | null>(null)
  const [isTraveling, setIsTraveling] = useState(false)
  const arrivalCallback = useRef<(() => void) | null>(null)
  const velocity = useRef(0)

  const sendShipToPlanet = (
    planet: OrbitPlanet,
    onArrive?: () => void,
  ) => {
    if (isTraveling) return
    setDestinationPlanet(planet)
    setIsTraveling(true)
    arrivalCallback.current = onArrive || null
    velocity.current = 0
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

    if (distance < 0.1) {
      setShipPosition(target)
      setDestinationPlanet(null)
      setIsTraveling(false)
      velocity.current = 0
      arrivalCallback.current?.()
      arrivalCallback.current = null
      return
    }

    direction.normalize()

    const maxSpeed = 20
    const acceleration = 5
    const deceleration = 5
    const brakingDistance =
      (velocity.current * velocity.current) / (2 * deceleration)

    if (distance <= brakingDistance) {
      velocity.current = Math.max(velocity.current - deceleration * delta, 0)
    } else {
      velocity.current = Math.min(velocity.current + acceleration * delta, maxSpeed)
    }

    const move = Math.min(velocity.current * delta, distance)
    const nextPos = shipPosition.clone().add(direction.multiplyScalar(move))

    const orbitRadius = destinationPlanet.distance
    if (Math.abs(nextPos.length() - orbitRadius) < 0.1) {
      setShipPosition(nextPos)
      setDestinationPlanet(null)
      setIsTraveling(false)
      velocity.current = 0
      arrivalCallback.current?.()
      arrivalCallback.current = null
      return
    }

    setShipPosition(nextPos)
  }

  return {
    shipPosition,
    destinationPlanet,
    sendShipToPlanet,
    updateShipPosition,
    isTraveling,
  }
}
