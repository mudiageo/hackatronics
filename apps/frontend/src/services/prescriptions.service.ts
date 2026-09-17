import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/in-memory'
import type { Prescription } from '../db/in-memory'

export const generatePrescriptionFn = createServerFn(
  'POST',
  async (payload: { patientName: string; medication: string; quantity: number; refills: number; notes?: string }) => {
    // Generate a secure 6-character code
    const code = 'RX-' + Math.random().toString(36).substring(2, 8).toUpperCase()
    
    const newPrescription: Prescription = {
      id: code,
      patientName: payload.patientName,
      medication: payload.medication,
      quantity: payload.quantity,
      refills: payload.refills,
      notes: payload.notes,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    
    db.prescriptions.unshift(newPrescription)
    return newPrescription
  }
)

export const verifyPrescriptionFn = createServerFn(
  'POST',
  async (payload: { code: string }) => {
    const rx = db.prescriptions.find((p) => p.id === payload.code.toUpperCase())
    if (!rx) {
      throw new Error('Prescription not found')
    }
    return rx
  }
)

export const dispensePrescriptionFn = createServerFn(
  'POST',
  async (payload: { code: string }) => {
    const rx = db.prescriptions.find((p) => p.id === payload.code.toUpperCase())
    if (!rx) {
      throw new Error('Prescription not found')
    }
    if (rx.status === 'dispensed') {
      throw new Error('Prescription has already been dispensed')
    }
    
    // Update status
    rx.status = 'dispensed'

    // Attempt to reduce stock in inventory based on medication name
    const inventoryItem = db.inventory.find(i => rx.medication.toLowerCase().includes(i.name.toLowerCase().split(' ')[0]))
    
    let amount = 15000 // default mock amount
    if (inventoryItem) {
      inventoryItem.qtyOnHand = Math.max(0, inventoryItem.qtyOnHand - rx.quantity)
      if (inventoryItem.qtyOnHand <= inventoryItem.reorderLevel) {
        inventoryItem.status = 'Low Stock'
      }
      if (inventoryItem.qtyOnHand === 0) {
        inventoryItem.status = 'Out of Stock'
      }
      
      amount = inventoryItem.unitPrice * rx.quantity
    }
    
    // Automatically create a settled transaction to represent the payout
    db.transactions.unshift({
      id: 'TX-' + Math.floor(10000 + Math.random() * 90000),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      description: `Dispensed: ${rx.medication}`,
      counterparty: rx.patientName,
      amount: amount, // Positive amount (revenue)
      type: 'Pharmacy Sales',
      status: 'attested',
      evidenceChain: [
        { id: 'e1', step: 'Prescribed', timestamp: rx.createdAt, actor: 'Clinic', completed: true },
        { id: 'e2', step: 'Verified', timestamp: new Date().toISOString(), actor: 'Pharmacy', completed: true },
        { id: 'e3', step: 'Dispensed', timestamp: new Date().toISOString(), actor: 'Pharmacy', completed: true },
        { id: 'e5', step: 'Settled', timestamp: new Date().toISOString(), actor: 'Bank Gateway', completed: true },
      ]
    })

    return rx
  }
)
