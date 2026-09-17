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

const MOCK_INVENTORY: InventoryItem[] = [
  {
    id: 'INV-001',
    name: 'Amoxicillin 500mg (100 pack)',
    sku: 'MED-AMX-500',
    qtyOnHand: 45,
    reorderLevel: 20,
    unitPrice: 15.00,
    costPrice: 8.50,
    status: 'In Stock',
    movements: [
      { id: 'm1', date: 'Sep 17, 2026', type: 'Out', qty: -5, reference: 'TX-10024' },
      { id: 'm2', date: 'Sep 10, 2026', type: 'In', qty: 50, reference: 'PO-9012' }
    ]
  },
  {
    id: 'INV-002',
    name: 'Digital Thermometer',
    sku: 'EQP-THR-01',
    qtyOnHand: 4,
    reorderLevel: 10,
    unitPrice: 25.00,
    costPrice: 12.00,
    status: 'Low Stock',
    movements: [
      { id: 'm1', date: 'Sep 15, 2026', type: 'Out', qty: -2, reference: 'TX-10018' },
      { id: 'm2', date: 'Aug 20, 2026', type: 'In', qty: 20, reference: 'PO-8842' }
    ]
  },
  {
    id: 'INV-003',
    name: 'Surgical Masks (Box of 50)',
    sku: 'PPE-MSK-50',
    qtyOnHand: 120,
    reorderLevel: 50,
    unitPrice: 18.50,
    costPrice: 5.00,
    status: 'In Stock',
    movements: [
      { id: 'm1', date: 'Sep 16, 2026', type: 'Out', qty: -10, reference: 'TX-10020' },
      { id: 'm2', date: 'Sep 01, 2026', type: 'In', qty: 100, reference: 'PO-8991' }
    ]
  },
  {
    id: 'INV-004',
    name: 'Ibuprofen 400mg',
    sku: 'MED-IBU-400',
    qtyOnHand: 0,
    reorderLevel: 30,
    unitPrice: 8.00,
    costPrice: 3.20,
    status: 'Out of Stock',
    movements: [
      { id: 'm1', date: 'Sep 14, 2026', type: 'Out', qty: -15, reference: 'TX-10012' },
      { id: 'm2', date: 'Sep 12, 2026', type: 'Out', qty: -20, reference: 'TX-10008' }
    ]
  }
];

export const getInventory = createServerFn({ method: 'GET' })
  .handler(async () => {
    const useMocks = process.env.VITE_USE_MOCKS !== 'false';
    
    if (useMocks) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return MOCK_INVENTORY;
    }

    return MOCK_INVENTORY;
  });
