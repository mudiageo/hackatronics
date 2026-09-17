import { createServerFn } from '@tanstack/react-start'

export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  qtyOnHand: number;
  reorderLevel: number;
  unitPrice: number;
  costPrice: number;
  status: StockStatus;
  movements: StockMovement[];
}

export interface StockMovement {
  id: string;
  date: string;
  type: 'In' | 'Out' | 'Adjustment';
  qty: number;
  reference: string;
}

import { db } from '../db/in-memory'

export const getInventory = createServerFn({ method: 'GET' })
  .handler(async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...db.inventory]; // Return from our in-memory DB
  });

export const addInventoryItemFn = createServerFn({ method: 'POST' })
  .validator((data: Omit<InventoryItem, 'id' | 'status' | 'movements'>) => data)
  .handler(async ({ data }) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let status: StockStatus = 'In Stock';
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
