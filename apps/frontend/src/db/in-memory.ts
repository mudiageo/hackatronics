import { Transaction } from '../services/transactions.service'
import { InventoryItem } from '../services/inventory.service'

export interface Prescription {
  id: string
  patientName: string
  medication: string
  quantity: number
  refills: number
  notes?: string
  status: 'pending' | 'dispensed'
  createdAt: string
}

class InMemoryDB {
  public transactions: Transaction[] = [
    {
      id: 'TX-10024',
      date: 'Sep 17, 2026 14:30',
      description: 'Malaria Treatment Bulk Purchase',
      counterparty: 'PharmaDistributors Ltd',
      amount: -450000,
      type: 'Inventory',
      status: 'attested',
      evidenceChain: [
        { id: 'e1', step: 'Prescribed', timestamp: 'Sep 16, 2026 09:00', actor: 'Clinic A (Dr. Smith)', completed: true },
        { id: 'e2', step: 'Verified', timestamp: 'Sep 16, 2026 10:15', actor: 'HealthSystem API', completed: true },
        { id: 'e3', step: 'Dispensed', timestamp: 'Sep 17, 2026 11:00', actor: 'Pharmacy B', completed: true },
        { id: 'e4', step: 'Stock Reduced', timestamp: 'Sep 17, 2026 11:01', actor: 'Inventory Sync', completed: true },
        { id: 'e5', step: 'Settled', timestamp: 'Sep 17, 2026 14:30', actor: 'Bank Gateway', completed: true },
      ]
    },
    {
      id: 'TX-10023',
      date: 'Sep 16, 2026 09:15',
      description: 'Consultation Fees payout',
      counterparty: 'HMO Partners',
      amount: 125000,
      type: 'Service',
      status: 'settled',
      evidenceChain: [
        { id: 'e1', step: 'Prescribed', timestamp: 'Sep 15, 2026 10:00', actor: 'Clinic A', completed: true },
        { id: 'e2', step: 'Verified', timestamp: 'Sep 15, 2026 11:30', actor: 'HMO System', completed: true },
        { id: 'e5', step: 'Settled', timestamp: 'Sep 16, 2026 09:15', actor: 'Bank Gateway', completed: true },
      ]
    },
    { id: 'TX-10022', date: 'Sep 15, 2026 16:45', description: 'Office Supplies', counterparty: 'Stationery Hub', amount: -15000, type: 'Expense', status: 'recorded' },
    { id: 'TX-10021', date: 'Sep 14, 2026 11:20', description: 'Equipment Maintenance', counterparty: 'MedTech Repairs', amount: -85000, type: 'Maintenance', status: 'recorded' },
    { id: 'TX-10020', date: 'Sep 12, 2026 08:00', description: 'Monthly Software Subscription', counterparty: 'HealthSaaS Inc', amount: -25000, type: 'Software', status: 'settled' }
  ]

  public inventory: InventoryItem[] = [
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
  ]

  public prescriptions: Prescription[] = []
}

declare global {
  var __db__: InMemoryDB | undefined
}

export const db = global.__db__ || new InMemoryDB()
if (process.env.NODE_ENV !== 'production') global.__db__ = db
