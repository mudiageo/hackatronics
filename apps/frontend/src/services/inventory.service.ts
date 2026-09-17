import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'
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
    const cookie = getRequestHeader('cookie') || '';
    const match = cookie.match(/active_org_id=(\d+)/);
    const org_id = match ? parseInt(match[1]) : 23;

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

export const addInventoryItemFn = createServerFn({ method: 'POST' })
  .validator((data: Omit<InventoryItem, 'id' | 'status' | 'movements'>) => data)
  .handler(async ({ data }) => {
    const useMocks = process.env.VITE_USE_MOCKS !== 'false';
    const cookie = getRequestHeader('cookie') || '';
    const match = cookie.match(/active_org_id=(\d+)/);
    const org_id = match ? parseInt(match[1]) : 23;

    if (!useMocks) {
      // For now, if the backend doesn't support manual addition via this UI component, we throw
      throw new Error('Adding inventory items manually is not yet supported by the backend API')
    }

    // --- MOCK FALLBACK ---
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
    if (data.qtyOnHand === 0) status = 'Out of Stock';
    else if (data.qtyOnHand <= data.reorderLevel) status = 'Low Stock';

    const newItem: InventoryItem = {
      ...data,
      id: `INV-${Math.floor(Math.random() * 1000) + 1000}`,
      status,
      movements: [
        { id: `m-${Math.random()}`, date: new Date().toISOString().split('T')[0], type: 'In', qty: data.qtyOnHand, reference: 'Initial Stock' }
      ]
    };
    
    db.inventory.push(newItem);
    return newItem;
  });
