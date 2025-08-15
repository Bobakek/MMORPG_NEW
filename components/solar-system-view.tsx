"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useRef, useEffect, useMemo, useState } from "react"
import * as THREE from "three"
import SpaceControls from "./space-controls"
// import { TextureLoader } from "three"
import type { Planet } from "@/types/resources"
import { PlanetList } from "./ui/planet-list"

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
  speed,
  inclination,
  rotationSpeed,
  color,
  // texture,
  onPositionChange,
}: OrbitPlanet & { onPositionChange: (pos: THREE.Vector3) => void }) {
  const ref = useRef<THREE.Mesh>(null!)
  // const colorMap = useLoader(TextureLoader, texture)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed
    const position = new THREE.Vector3(
      Math.cos(t) * distance,
      0,
      Math.sin(t) * distance,
    )
    position.applyAxisAngle(new THREE.Vector3(1, 0, 0), inclination)
    ref.current.position.copy(position)
    ref.current.rotation.y += rotationSpeed
    onPositionChange(position)
  })

  return (
    <>
      <mesh ref={ref}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          /* map={colorMap} */
        />
      </mesh>
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

function SceneCleanup() {
  const { gl } = useThree()
  useEffect(() => {
    return () => {
      gl.dispose()
    }
  }, [gl])
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

  // const sunTexture = useLoader(TextureLoader, "/textures/sun.jpg")

  const planetPositions = useRef<Record<string, THREE.Vector3>>({})
  const [selectedPlanet, setSelectedPlanet] = useState<OrbitPlanet | null>(null)

  return (
    <div className="relative" style={{ width: 800, height: 600 }}>
      <PlanetList
        planets={planets}
        onSelect={(p) => {
          setSelectedPlanet(p)
          onPlanetSelect?.(p)
        }}
        className="absolute left-4 top-4 z-10 w-40"
      />
      <Canvas
        style={{ width: "100%", height: "100%" }}
        camera={{ position: [0, 20, 40], fov: 60 }}
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
            onPositionChange={(pos) => (planetPositions.current[p.id] = pos.clone())}
          />
        ))}

        <SpaceControls />
        <CameraController target={selectedPlanet} planetPositions={planetPositions} />
        <SceneCleanup />
      </Canvas>
    </div>
  )
}

export default SolarSystemView
