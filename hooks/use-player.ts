"use client"

import { useState, useEffect } from "react"
import type { Player } from "@/types"

const calculateNextLevelExp = (level: number) => level * 1000

export function usePlayer() {
  const [player, setPlayer] = useState<Player>({
    level: 1,
    experience: 0,
    nextLevelExp: calculateNextLevelExp(1),
  })

  useEffect(() => {
    const stored = localStorage.getItem("player")
    if (stored) {
      try {
        setPlayer(JSON.parse(stored))
      } catch {
        // ignore malformed data
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("player", JSON.stringify(player))
  }, [player])

  const addExperience = (amount: number) => {
    setPlayer((prev) => {
      let { level, experience } = prev
      experience += amount
      let nextLevelExp = calculateNextLevelExp(level)
      while (experience >= nextLevelExp) {
        experience -= nextLevelExp
        level += 1
        nextLevelExp = calculateNextLevelExp(level)
      }
      return { level, experience, nextLevelExp }
    })
  }

  return { ...player, addExperience }
}
