import { createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/inventory')({
  component: Inventory,
})

function Inventory() {
  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Inventory</h2>
          <p className="text-muted-foreground text-sm">Track stock so it can feed into transactions and financial intelligence.</p>
        </div>
        <Button className="flex gap-2 items-center">
          <Plus className="w-4 h-4" /> Add Item
        </Button>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-medium">Item Name</th>
              <th className="text-left p-3 font-medium">SKU</th>
              <th className="text-right p-3 font-medium">Qty on Hand</th>
              <th className="text-right p-3 font-medium">Unit Price</th>
              <th className="text-center p-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t hover:bg-muted/50">
              <td className="p-3 font-medium">Premium Widget</td>
              <td className="p-3 text-muted-foreground">WDG-001</td>
              <td className="p-3 text-right">45</td>
              <td className="p-3 text-right">$25.00</td>
              <td className="p-3 text-center">
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">In Stock</span>
              </td>
            </tr>
            <tr className="border-t hover:bg-muted/50">
              <td className="p-3 font-medium">Basic Widget</td>
              <td className="p-3 text-muted-foreground">WDG-002</td>
              <td className="p-3 text-right text-red-600 font-bold">2</td>
              <td className="p-3 text-right">$10.00</td>
              <td className="p-3 text-center">
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Low Stock</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
