import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Player } from "@/types"

type Inventory = Record<string, number>

const calculateNextLevelExp = (level: number) => level * 1000

interface StoreState {
  player: Player
  addExperience: (amount: number) => void
  inventory: Inventory
  addResource: (type: string, amount: number) => void
  removeResource: (type: string, amount: number) => void
  getQuantity: (type: string) => number
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      player: {
        level: 1,
        experience: 0,
        nextLevelExp: calculateNextLevelExp(1),
      },
      addExperience: (amount) => {
        set((state) => {
          let { level, experience } = state.player
          experience += amount
          let nextLevelExp = calculateNextLevelExp(level)
          while (experience >= nextLevelExp) {
            experience -= nextLevelExp
            level += 1
            nextLevelExp = calculateNextLevelExp(level)
          }
          return { player: { level, experience, nextLevelExp } }
        })
      },
      inventory: {},
      addResource: (type, amount) => {
        if (amount <= 0) return
        set((state) => ({
          inventory: {
            ...state.inventory,
            [type]: (state.inventory[type] || 0) + amount,
          },
        }))
      },
      removeResource: (type, amount) => {
        if (amount <= 0) return
        set((state) => {
          const current = state.inventory[type] || 0
          const next = Math.max(0, current - amount)
          const newInventory = { ...state.inventory }
          if (next === 0) {
            delete newInventory[type]
          } else {
            newInventory[type] = next
          }
          return { inventory: newInventory }
        })
      },
      getQuantity: (type) => get().inventory[type] || 0,
    }),
    {
      name: "mmorpg-store",
      partialize: (state) => ({
        player: state.player,
        inventory: state.inventory,
      }),
    },
  ),
)
