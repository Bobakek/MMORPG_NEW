"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { useRef, useEffect, useMemo } from "react"
import * as THREE from "three"

interface PlanetProps {
  distance: number
  size: number
  speed: number
  color: string
}

function Planet({ distance, size, speed, color }: PlanetProps) {
  const ref = useRef<THREE.Mesh>(null!)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed
    ref.current.position.set(Math.cos(t) * distance, 0, Math.sin(t) * distance)
  })

  return (
    <>
      <mesh ref={ref}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
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

  return (
    <Canvas style={{ width: 800, height: 600 }} camera={{ position: [0, 20, 40], fov: 60 }}>
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
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial emissive="yellow" />
      </mesh>

      <Planet distance={6} size={0.5} speed={1} color="blue" />
      <Planet distance={10} size={0.8} speed={0.6} color="red" />

      <OrbitControls />
      <SceneCleanup />
    </Canvas>
  )
}

export default SolarSystemView

