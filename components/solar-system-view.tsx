"use client"

import { Canvas, useFrame, useThree /*, useLoader*/ } from "@react-three/fiber"
import { useRef, useEffect, useMemo } from "react"
import * as THREE from "three"
import SpaceControls from "./space-controls"
// import { TextureLoader } from "three"
import type { Planet } from "@/types/resources"

interface OrbitPlanet extends Planet {
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
}: OrbitPlanet) {
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

function SceneCleanup() {
  const { gl } = useThree()
  useEffect(() => {
    return () => {
      gl.dispose()
    }
  }, [gl])
  return null
}

export function SolarSystemView() {
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

  const planets: OrbitPlanet[] = [
    {
      id: "mercury",
      name: "Mercury",
      position: [0, 0, 0],
      size: 0.5,
      color: "#b1b1b1",
      // texture: "/textures/mercury.jpg",
      distance: 8,
      speed: 4.74,
      inclination: 0.02,
      rotationSpeed: 0.02,
    },
    {
      id: "venus",
      name: "Venus",
      position: [0, 0, 0],
      size: 0.9,
      color: "#e5c555",
      // texture: "/textures/venus.jpg",
      distance: 11,
      speed: 3.5,
      inclination: 0.01,
      rotationSpeed: 0.015,
    },
    {
      id: "earth",
      name: "Earth",
      position: [0, 0, 0],
      size: 1,
      color: "#2a6fdd",
      // texture: "/textures/earth.jpg",
      distance: 14,
      speed: 3,
      inclination: 0.03,
      rotationSpeed: 0.03,
    },
    {
      id: "mars",
      name: "Mars",
      position: [0, 0, 0],
      size: 0.8,
      color: "#b55442",
      // texture: "/textures/mars.jpg",
      distance: 17,
      speed: 2.4,
      inclination: 0.05,
      rotationSpeed: 0.025,
    },
  ]

  return (
    <Canvas
      style={{ width: 800, height: 600 }}
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
        <PlanetMesh key={p.id} {...p} />
      ))}

      <SpaceControls />
      <SceneCleanup />
    </Canvas>
  )
}

export default SolarSystemView
