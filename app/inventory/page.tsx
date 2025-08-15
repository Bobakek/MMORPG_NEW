"use client"

import { InventoryPanel } from "@/components/inventory-panel"

export default function InventoryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-black p-6">
      <div className="max-w-2xl mx-auto">
        <InventoryPanel />
      </div>
    </div>
  )
}

