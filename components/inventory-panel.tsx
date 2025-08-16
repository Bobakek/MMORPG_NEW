"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useStore } from "@/store"

export function InventoryPanel() {
  const { inventory, removeResource } = useStore((s) => ({
    inventory: s.inventory,
    removeResource: s.removeResource,
  }))
  const entries = Object.entries(inventory)

  return (
    <Card className="bg-slate-900/80 backdrop-blur-sm border-amber-600/30 p-4">
      <CardHeader className="p-0 mb-2">
        <CardTitle className="text-amber-400 font-semibold">Inventory</CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-2 text-sm">
        {entries.length === 0 && <div className="text-slate-300">Inventory is empty</div>}
        {entries.map(([type, amount]) => (
          <div key={type} className="flex justify-between items-center">
            <span>{type}</span>
            <div className="flex items-center gap-2">
              <span className="text-amber-400">{amount}</span>
              <Button
                size="sm"
                onClick={() => removeResource(type, 1)}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Use
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

