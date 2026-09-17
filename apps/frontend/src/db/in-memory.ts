import type { Transaction } from '../services/transactions.service'
import type { InventoryItem } from '../services/inventory.service'

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
      id: 'TX-10026',
      date: 'Sep 17, 2026 14:30',
      description: 'Daily Over-the-Counter Sales',
      counterparty: 'Walk-in Customers',
      amount: 1250000,
      type: 'Retail Sales',
      status: 'attested',
      evidenceChain: [
        { id: 'e1', step: 'Sales Recorded', timestamp: 'Sep 17, 2026 09:00', actor: 'POS System', completed: true },
        { id: 'e2', step: 'Reconciled', timestamp: 'Sep 17, 2026 10:15', actor: 'Store Manager', completed: true },
        { id: 'e5', step: 'Settled', timestamp: 'Sep 17, 2026 14:30', actor: 'Bank Gateway', completed: true },
      ]
    },
    {
      id: 'TX-10025',
      date: 'Sep 16, 2026 09:15',
      description: 'Wholesale Pharmaceutical Supply',
      counterparty: 'Mina Pharma Distributors',
      amount: 500000,
      type: 'B2B Sales',
      status: 'settled',
      evidenceChain: [
        { id: 'e1', step: 'Order Placed', timestamp: 'Sep 10, 2026 10:00', actor: 'Sales Rep', completed: true },
        { id: 'e2', step: 'Dispatched', timestamp: 'Sep 15, 2026 11:30', actor: 'Logistics', completed: true },
        { id: 'e5', step: 'Settled', timestamp: 'Sep 16, 2026 09:15', actor: 'Bank Gateway', completed: true },
      ]
    },
    {
      id: 'TX-10024',
      date: 'Sep 17, 2026 14:30',
      description: 'Restocking Anti-Malarial Drugs',
      counterparty: 'Fidson Healthcare PLC',
      amount: -450000,
      type: 'Inventory',
      status: 'attested',
      evidenceChain: [
        { id: 'e1', step: 'Order Placed', timestamp: 'Sep 16, 2026 09:00', actor: 'Procurement', completed: true },
        { id: 'e2', step: 'Verified', timestamp: 'Sep 16, 2026 10:15', actor: 'Fidson Sales API', completed: true },
        { id: 'e3', step: 'Delivered', timestamp: 'Sep 17, 2026 11:00', actor: 'Logistics', completed: true },
        { id: 'e4', step: 'Stock Added', timestamp: 'Sep 17, 2026 11:01', actor: 'Inventory Sync', completed: true },
        { id: 'e5', step: 'Settled', timestamp: 'Sep 17, 2026 14:30', actor: 'Bank Gateway', completed: true },
      ]
    },
    {
      id: 'TX-10023',
      date: 'Sep 16, 2026 09:15',
      description: 'Prescription Fulfillment Payout',
      counterparty: 'Hygeia HMO',
      amount: 125000,
      type: 'Insurance Payout',
      status: 'settled',
      evidenceChain: [
        { id: 'e1', step: 'Claims Submitted', timestamp: 'Sep 15, 2026 10:00', actor: 'Billing Dept', completed: true },
        { id: 'e2', step: 'Verified', timestamp: 'Sep 15, 2026 11:30', actor: 'HMO System', completed: true },
        { id: 'e5', step: 'Settled', timestamp: 'Sep 16, 2026 09:15', actor: 'Bank Gateway', completed: true },
      ]
    },
    { id: 'TX-10022', date: 'Sep 15, 2026 16:45', description: 'Pharmacy Packaging Supplies', counterparty: 'PolyProducts Ltd', amount: -15000, type: 'Expense', status: 'recorded' },
    { id: 'TX-10021', date: 'Sep 14, 2026 11:20', description: 'Refrigeration Unit Maintenance', counterparty: 'Cooling Experts', amount: -85000, type: 'Maintenance', status: 'recorded' },
    { id: 'TX-10020', date: 'Sep 12, 2026 08:00', description: 'Pharmacy Management Software', counterparty: 'HealthTech POS', amount: -25000, type: 'Software', status: 'settled' },
    {
      id: 'TX-10019',
      date: 'Aug 28, 2026 14:00',
      description: 'Pharmacy Lease Payment',
      counterparty: 'Property Management Inc',
      amount: -1500000,
      type: 'Rent',
      status: 'attested',
      evidenceChain: [
        { id: 'e1', step: 'Invoice Received', timestamp: 'Aug 15, 2026 09:00', actor: 'Admin', completed: true },
        { id: 'e2', step: 'Approved', timestamp: 'Aug 20, 2026 10:15', actor: 'Owner', completed: true },
        { id: 'e5', step: 'Settled', timestamp: 'Aug 28, 2026 14:00', actor: 'Bank Gateway', completed: true },
      ]
    },
    {
      id: 'TX-10018',
      date: 'Aug 30, 2026 09:00',
      description: 'Pharmacist Salaries',
      counterparty: 'Staff',
      amount: -240000,
      type: 'Payroll',
      status: 'settled',
      evidenceChain: [
        { id: 'e1', step: 'Payroll Run', timestamp: 'Aug 28, 2026 10:00', actor: 'HR System', completed: true },
        { id: 'e2', step: 'Approved', timestamp: 'Aug 29, 2026 11:30', actor: 'Owner', completed: true },
        { id: 'e5', step: 'Settled', timestamp: 'Aug 30, 2026 09:00', actor: 'Bank Gateway', completed: true },
      ]
    }
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

  public prescriptions: Prescription[] = [
    {
      id: 'RX-DEMO1',
      patientName: 'Jane Smith',
      medication: 'Amoxicillin 500mg',
      quantity: 1,
      refills: 0,
      notes: 'Take after meals',
      status: 'pending',
      createdAt: new Date().toISOString()
    }
  ]
}

declare global {
  var __db__: InMemoryDB | undefined
}

export const db = global.__db__ || new InMemoryDB()
if (process.env.NODE_ENV !== 'production') global.__db__ = db
