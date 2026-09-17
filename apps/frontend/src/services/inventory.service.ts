import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/in-memory'

export interface InventoryItem {
  id: string
  name: string
  sku: string
  qtyOnHand: number
  reorderLevel: number
  unitPrice: number
  costPrice: number
  status: 'In Stock' | 'Low Stock' | 'Out of Stock'
  movements?: { id: string, date: string, type: 'In' | 'Out', qty: number, reference: string }[]
}

export const getInventory = createServerFn({ method: 'GET' }).handler(async () => {
    const useMocks = process.env.VITE_USE_MOCKS !== 'false';
    const org_id = 23;

    if (!useMocks) {
      const res = await fetch(`${process.env.VITE_BACKEND_URL || 'http://localhost:8000'}/inventory/${org_id}/inventory`)
      if (!res.ok) throw new Error('Failed to fetch inventory')
      const data = await res.json()
      
      return data.items.map((i: any) => ({
        id: `DRUG-${i.drug_id}`,
        name: `${i.name} ${i.strength}`,
        sku: `SKU-${i.drug_id}`,
        qtyOnHand: i.quantity,
        reorderLevel: 20, // Hardcoded, API doesn't provide
        unitPrice: i.unit_price,
        costPrice: i.unit_cost,
        status: i.quantity === 0 ? 'Out of Stock' : (i.low_stock ? 'Low Stock' : 'In Stock'),
        movements: [] // API doesn't provide stock movements in this endpoint yet
      }))
    }

    // --- MOCK FALLBACK ---
    return db.inventory
  }
)
