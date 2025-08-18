"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useRef, useEffect, useMemo, useState } from "react"
import * as THREE from "three"
import SpaceControls from "./space-controls"
// import { TextureLoader } from "three"
import type { Planet } from "@/types/resources"
import { PlanetList } from "./ui/planet-list"
import { Button } from "./ui/button"
import { useShipNavigation } from "@/hooks"
import { PlanetInteractionMenu } from "./planet-interaction-menu"

export interface OrbitPlanet extends Planet {
  distance: number
  speed: number
  texture?: string
  inclination: number
  rotationSpeed: number
}

function PlanetMesh({
  distance,
  size,
  inclination,
  color,
  // texture,
  onPositionChange,
  onSelect,
  isSelected = false,
}: OrbitPlanet & {
  onPositionChange: (pos: THREE.Vector3) => void
  onSelect?: () => void
  isSelected?: boolean
}) {
  const groupRef = useRef<THREE.Group>(null!)
  // const colorMap = useLoader(TextureLoader, texture)

  useEffect(() => {
    const position = new THREE.Vector3(
      Math.cos(0) * distance,
      0,
      Math.sin(0) * distance,
    )
    position.applyAxisAngle(new THREE.Vector3(1, 0, 0), inclination)
    groupRef.current.position.copy(position)
    onPositionChange(position)
  }, [distance, inclination, onPositionChange])

  return (
    <>
      <group
        ref={groupRef}
        onContextMenu={(e) => {
          e.nativeEvent.preventDefault()
          onSelect?.()
        }}
      >
        <mesh>
          <sphereGeometry args={[size, 32, 32]} />
          <meshStandardMaterial
            color={color}
            /* map={colorMap} */
          />
        </mesh>
        {isSelected && (
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[size * 1.2, size * 1.4, 32]} />
            <meshBasicMaterial
              color="yellow"
              side={THREE.DoubleSide}
              transparent
              opacity={0.5}
            />
          </mesh>
        )}
      </group>
      <mesh rotation={[-Math.PI / 2 + inclination, 0, 0]}>
        <ringGeometry args={[distance - 0.05, distance + 0.05, 64]} />
        <meshBasicMaterial color="gray" side={THREE.DoubleSide} />
      </mesh>
    </>
  )
}

function CameraController({
  target,
  planetPositions,
}: {
  target: OrbitPlanet | null
  planetPositions: React.MutableRefObject<Record<string, THREE.Vector3>>
}) {
  const { camera } = useThree()
  useEffect(() => {
    if (!target) return
    const pos = planetPositions.current[target.id]
    if (!pos) return
    const offset = target.size * 5
    camera.position.set(pos.x + offset, pos.y + offset, pos.z + offset)
    camera.lookAt(pos)
  }, [target, planetPositions, camera])
  return null
}

function ShipController({
  update,
}: {
  update: (delta: number) => void
}) {
  useFrame((_, delta) => update(delta))
  return null
}

function ShipMesh({
  shipRef,
  position,
}: {
  shipRef: React.MutableRefObject<THREE.Mesh | null>
  position: THREE.Vector3
}) {
  const particlesGeometry = useMemo(() => {
    const count = 100
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.2
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.2
      positions[i * 3 + 2] = Math.random() * -2
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    return geometry
  }, [])

  const particlesRef = useRef<THREE.Points>(null!)

  useFrame((_, delta) => {
    if (!shipRef.current) return
    shipRef.current.position.copy(position)
    if (particlesRef.current) {
      const pos = particlesRef.current.geometry
        .getAttribute("position") as THREE.BufferAttribute
      for (let i = 0; i < pos.count; i++) {
        pos.array[i * 3 + 2] -= delta * 5
        if (pos.array[i * 3 + 2] < -5) pos.array[i * 3 + 2] = Math.random() * -2
      }
  pos.needsUpdate = true
    }
  })
  return (
    <mesh ref={shipRef}>
      <boxGeometry args={[1, 1, 3]} />
      <meshStandardMaterial color="white" emissive="#444" emissiveIntensity={0.6} />
      <points ref={particlesRef} geometry={particlesGeometry}>
        <pointsMaterial color="orange" size={0.1} />
      </points>
    </mesh>
  )
}

function ThirdPersonShipControls({
  shipRef,
  position,
  disabled = false,
}: {
  shipRef: React.MutableRefObject<THREE.Mesh | null>
  position: THREE.Vector3
  disabled?: boolean
}) {
  const move = useRef({ forward: false, backward: false, left: false, right: false })
  const velocity = useRef(0)
  const rotating = useRef(false)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          move.current.forward = true
          break
        case "KeyS":
        case "ArrowDown":
          move.current.backward = true
          break
        case "KeyA":
        case "ArrowLeft":
          move.current.left = true
          break
        case "KeyD":
        case "ArrowRight":
          move.current.right = true
          break
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          move.current.forward = false
          break
        case "KeyS":
        case "ArrowDown":
          move.current.backward = false
          break
        case "KeyA":
        case "ArrowLeft":
          move.current.left = false
          break
        case "KeyD":
        case "ArrowRight":
          move.current.right = false
          break
      }
    }
    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 2) rotating.current = true
    }
    const onMouseUp = (e: MouseEvent) => {
      if (e.button === 2) rotating.current = false
    }
    const onMouseMove = (e: MouseEvent) => {
      if (!rotating.current || !shipRef.current) return
      const sensitivity = 0.002
      shipRef.current.rotation.y -= e.movementX * sensitivity
      shipRef.current.rotation.x -= e.movementY * sensitivity
      const halfPi = Math.PI / 2
      shipRef.current.rotation.x = Math.max(
        -halfPi,
        Math.min(halfPi, shipRef.current.rotation.x),
      )
    }
    const onContextMenu = (e: MouseEvent) => e.preventDefault()

    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    window.addEventListener("mousedown", onMouseDown)
    window.addEventListener("mouseup", onMouseUp)
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("contextmenu", onContextMenu)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
       window.removeEventListener("mousedown", onMouseDown)
       window.removeEventListener("mouseup", onMouseUp)
       window.removeEventListener("mousemove", onMouseMove)
       window.removeEventListener("contextmenu", onContextMenu)
    }
  }, [])

  useFrame((_, delta) => {
    if (disabled || !shipRef.current) return
    const rotationSpeed = Math.PI
    const acceleration = 20
    const deceleration = 10
    const maxSpeed = 50

    if (move.current.left) shipRef.current.rotation.y += rotationSpeed * delta
    if (move.current.right) shipRef.current.rotation.y -= rotationSpeed * delta

    if (move.current.forward) {
      velocity.current = Math.min(
        velocity.current + acceleration * delta,
        maxSpeed,
      )
    } else if (move.current.backward) {
      velocity.current = Math.max(
        velocity.current - acceleration * delta,
        -maxSpeed / 2,
      )
    } else {
      if (velocity.current > 0) {
        velocity.current = Math.max(velocity.current - deceleration * delta, 0)
      } else if (velocity.current < 0) {
        velocity.current = Math.min(velocity.current + deceleration * delta, 0)
      }
    }

    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(
      shipRef.current.quaternion,
    )
    position.addScaledVector(forward, velocity.current * delta)
  })
  return null
}

function ThirdPersonCameraController({
  shipRef,
}: {
  shipRef: React.MutableRefObject<THREE.Mesh | null>
}) {
  const { camera } = useThree()
  const offset = useMemo(() => new THREE.Vector3(0, 5, -10), [])
  useFrame(() => {
    if (!shipRef.current) return
    const relativeOffset = offset
      .clone()
      .applyQuaternion(shipRef.current.quaternion)
    const targetPosition = shipRef.current.position.clone().add(relativeOffset)
    camera.position.lerp(targetPosition, 0.1)
    camera.lookAt(shipRef.current.position)
  })
  return null
}

function OrbitViewController({
  firstPerson,
  destinationPlanet,
  maxDistance,
}: {
  firstPerson: boolean
  destinationPlanet: OrbitPlanet | null
  maxDistance: number
}) {
  const { camera } = useThree()
  const wasFirstPerson = useRef(firstPerson)
  useEffect(() => {
    if (wasFirstPerson.current && !firstPerson && !destinationPlanet) {
      camera.position.set(0, maxDistance * 2, maxDistance * 3)
      camera.lookAt(0, 0, 0)
    }
    wasFirstPerson.current = firstPerson
  }, [firstPerson, destinationPlanet, camera, maxDistance])
  return null
}

function SceneCleanup() {
  const { gl } = useThree()
  useEffect(() => {
    return () => {
      gl.dispose()
    }
  }, [gl])
  return null
}

function PlanetProximityDetector({
  shipRef,
  planets,
  planetPositions,
  threshold,
  dismissedPlanetId,
  onChange,
}: {
  shipRef: React.MutableRefObject<THREE.Mesh | null>
  planets: OrbitPlanet[]
  planetPositions: React.MutableRefObject<Record<string, THREE.Vector3>>
  threshold: number
  dismissedPlanetId: React.MutableRefObject<string | null>
  onChange: (planet: OrbitPlanet | null) => void
}) {
  const current = useRef<OrbitPlanet | null>(null)
  useFrame(() => {
    if (!shipRef.current) return
    const shipPos = shipRef.current.position
    let found: OrbitPlanet | null = null
    for (const p of planets) {
      const pos = planetPositions.current[p.id]
      if (!pos) continue
      if (pos.distanceTo(shipPos) < threshold) {
        found = p
        break
      }
    }
    if (found) {
      if (dismissedPlanetId.current === found.id) return
      if (current.current?.id !== found.id) {
        current.current = found
        onChange(found)
      }
    } else if (current.current) {
      current.current = null
      dismissedPlanetId.current = null
      onChange(null)
    }
  })
  return null
}

interface SolarSystemViewProps {
  planets: OrbitPlanet[]
  onPlanetSelect?: (planet: OrbitPlanet) => void
}

export function SolarSystemView({ planets, onPlanetSelect }: SolarSystemViewProps) {
  const starPositions = useMemo(() => {
    const count = 1000
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200
      positions[i * 3 + 1] = (Math.random() - 0.5) * 200
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200
    }
    return positions
  }, [])

  const maxDistance = useMemo(
    () => planets.reduce((max, p) => Math.max(max, p.distance), 0),
    [planets],
  )

  // const sunTexture = useLoader(TextureLoader, "/textures/sun.jpg")

  const planetPositions = useRef<Record<string, THREE.Vector3>>({})
  const {
    shipPosition,
    destinationPlanet,
    sendShipToPlanet,
    updateShipPosition,
    isTraveling,
  } = useShipNavigation()
  const [firstPerson, setFirstPerson] = useState(false)
  const shipRef = useRef<THREE.Mesh>(null!)
  const [nearbyPlanet, setNearbyPlanet] = useState<OrbitPlanet | null>(null)
  const dismissedPlanetId = useRef<string | null>(null)
  const proximityThreshold = 10

  const handlePlanetSelect = (p: OrbitPlanet) => {
    setFirstPerson(false)
    sendShipToPlanet(p, () => onPlanetSelect?.(p))
  }

  const handleInteractionClose = () => {
    if (nearbyPlanet) {
      dismissedPlanetId.current = nearbyPlanet.id
      setNearbyPlanet(null)
    }
  }

  return (
    <div className="relative w-full h-screen">
      <PlanetList
        planets={planets}
        onSelect={handlePlanetSelect}
        className="absolute left-4 top-4 z-10 w-40"
      />
      <Button
        onClick={() => setFirstPerson((prev) => !prev)}
        className="absolute right-4 top-4 z-10"
      >
        {firstPerson ? "Switch to Orbit" : "Switch to First-Person"}
      </Button>
      {nearbyPlanet && (
        <PlanetInteractionMenu
          planet={nearbyPlanet}
          onClose={handleInteractionClose}
        />
      )}
      <Canvas
        style={{ width: "100%", height: "100%" }}
        camera={{ position: [0, 40, 80], fov: 60 }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[0, 0, 0]} intensity={2} />

        <mesh>
          <sphereGeometry args={[500, 64, 64]} />
          <meshBasicMaterial color="black" side={THREE.BackSide} />
        </mesh>

        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              array={starPositions}
              count={starPositions.length / 3}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial color="white" size={0.5} sizeAttenuation />
        </points>

        <mesh>
          <sphereGeometry args={[7, 32, 32]} />
          <meshStandardMaterial
            color="yellow"
            emissive="yellow"
            emissiveIntensity={1.5}
            /* map={sunTexture} */
            /* emissiveMap={sunTexture} */
          />
        </mesh>

        {planets.map((p) => (
          <PlanetMesh
            key={p.id}
            {...p}
            isSelected={destinationPlanet?.id === p.id}
            onSelect={() => handlePlanetSelect(p)}
            onPositionChange={(pos) => (planetPositions.current[p.id] = pos.clone())}
          />
        ))}

        <ShipMesh shipRef={shipRef} position={shipPosition} />

        <ShipController update={updateShipPosition} />

        <PlanetProximityDetector
          shipRef={shipRef}
          planets={planets}
          planetPositions={planetPositions}
          threshold={proximityThreshold}
          dismissedPlanetId={dismissedPlanetId}
          onChange={setNearbyPlanet}
        />

        {firstPerson ? (
          <SpaceControls />
        ) : (
          <>
            <ThirdPersonShipControls
              shipRef={shipRef}
              position={shipPosition}
              disabled={isTraveling}
            />
            <ThirdPersonCameraController shipRef={shipRef} />
          </>
        )}
        <OrbitViewController
          firstPerson={firstPerson}
          destinationPlanet={destinationPlanet}
          maxDistance={maxDistance}
        />
        <CameraController target={destinationPlanet} planetPositions={planetPositions} />
        <SceneCleanup />
      </Canvas>
    </div>
  )
}

export default SolarSystemView
