"use client"

import { useThree, useFrame } from "@react-three/fiber"
import { PointerLockControls } from "@react-three/drei"
import { useEffect, useRef, useState } from "react"
import * as THREE from "three"

export function SpaceControls() {
  const { camera, gl } = useThree()
  const controlsRef = useRef<any>(null)
  const move = useRef({ forward: false, backward: false, left: false, right: false })
  const velocity = useRef(new THREE.Vector3())
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
          move.current.forward = true
          break
        case "KeyS":
          move.current.backward = true
          break
        case "KeyA":
          move.current.left = true
          break
        case "KeyD":
          move.current.right = true
          break
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
          move.current.forward = false
          break
        case "KeyS":
          move.current.backward = false
          break
        case "KeyA":
          move.current.left = false
          break
        case "KeyD":
          move.current.right = false
          break
      }
    }
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
    }
  }, [])

  useEffect(() => {
    setSupported(typeof document !== "undefined" && !!document.body?.requestPointerLock)
  }, [])

  useEffect(() => {
    if (!supported) return
    const dom = gl.domElement
    const handleClick = () => {
      if (!document.pointerLockElement) {
        if (dom.isConnected || document.contains(dom)) {
          try {
            controlsRef.current?.lock()
          } catch (err) {
            console.error("Pointer lock failed", err)
          }
        } else {
          console.warn("Pointer lock skipped: canvas is not in the DOM")
        }
      }
    }
    const handlePointerLockError = (err: Event) => {
      console.error("Pointer lock error", err)
      dom.addEventListener("click", handleClick, { once: true })
    }
    const handleUnlock = () => {
      console.info("Pointer lock released")
      dom.addEventListener("click", handleClick, { once: true })
    }
    dom.addEventListener("click", handleClick, { once: true })
    dom.addEventListener("pointerlockerror", handlePointerLockError)
    controlsRef.current?.addEventListener("unlock", handleUnlock)
    return () => {
      dom.removeEventListener("click", handleClick)
      dom.removeEventListener("pointerlockerror", handlePointerLockError)
      controlsRef.current?.removeEventListener("unlock", handleUnlock)
    }
  }, [gl, supported])

  useFrame((_, delta) => {
    const acceleration = 20
    const maxSpeed = 10
    const damping = 0.95
    const forward = new THREE.Vector3()
    camera.getWorldDirection(forward)
    forward.y = 0
    forward.normalize()

    const right = new THREE.Vector3()
    right.crossVectors(camera.up, forward).normalize()

    let input = false
    if (move.current.forward) {
      velocity.current.addScaledVector(forward, acceleration * delta)
      input = true
    }
    if (move.current.backward) {
      velocity.current.addScaledVector(forward, -acceleration * delta)
      input = true
    }
    if (move.current.left) {
      velocity.current.addScaledVector(right, acceleration * delta)
      input = true
    }
    if (move.current.right) {
      velocity.current.addScaledVector(right, -acceleration * delta)
      input = true
    }

    if (!input) {
      velocity.current.multiplyScalar(damping)
    }

    if (velocity.current.length() > maxSpeed) {
      velocity.current.setLength(maxSpeed)
    }

    camera.position.addScaledVector(velocity.current, delta)
  })

  if (!supported) return null
  return <PointerLockControls ref={controlsRef} />
}

export default SpaceControls

