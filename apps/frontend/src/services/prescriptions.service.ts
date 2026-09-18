import { createServerFn } from '@tanstack/react-start'

import { db } from '../db/in-memory'
import type { Prescription } from '../db/in-memory'

// Expected Backend Schema
export interface ItemIn {
  drug_id: number;
  dose: string;
  frequency_per_day: number;
  days: number;
}

export interface PrescriptionIn {
  patient_id: number;
  prescriber_id: number;
  items: ItemIn[];
}

export const generatePrescriptionFn = createServerFn({ method: 'POST' })
  .validator((data: PrescriptionIn) => data)
  .handler(async ({ data: payload }) => {
    // Check if we should use mocks
    const useMocks = process.env.VITE_USE_MOCKS !== 'false';
    
    if (!useMocks) {
      // Integration with real FastAPI backend
      const res = await fetch(`${process.env.VITE_BACKEND_URL || 'http://localhost:8000'}/prescriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const errorText = await res.text();
        try {
          const errData = JSON.parse(errorText);
          if (errData?.detail?.error?.message) {
            throw new Error(errData.detail.error.message);
          } else if (typeof errData?.detail === 'string') {
            throw new Error(errData.detail);
          } else if (errData?.message) {
            throw new Error(errData.message);
          }
        } catch (e) {
          if (e.message !== errorText) throw e;
        }
        throw new Error(errorText);
      }
      const data = await res.json()
      return data
    }

    // --- MOCK FALLBACK ---
    const code = 'RX-' + Math.random().toString(36).substring(2, 8).toUpperCase()
    const firstItem = payload.items[0]
    
    const newPrescription: Prescription = {
      id: code,
      patientName: `Patient #${payload.patient_id}`, // Mock string
      medication: `Drug #${firstItem.drug_id} (${firstItem.dose})`,
      quantity: firstItem.frequency_per_day * firstItem.days,
      refills: 0,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    db.prescriptions.unshift(newPrescription)
    
    // Return backend-like structure
    return {
      id: 999,
      code: code,
      expires_at: new Date().toISOString(),
      prescriber: { id: payload.prescriber_id },
      patient: { id: payload.patient_id, name: newPrescription.patientName },
      items: [{
        drug_name: newPrescription.medication,
        dose: firstItem.dose,
        frequency_per_day: firstItem.frequency_per_day,
        days: firstItem.days,
        quantity: newPrescription.quantity,
        unit_price: 1500,
        line_total: 1500 * newPrescription.quantity
      }],
      total: 1500 * newPrescription.quantity
    }
  }
)

export const verifyPrescriptionFn = createServerFn({ method: 'POST' })
  .validator((data: { code: string; patient_id: number; org_id: number }) => data)
  .handler(async ({ data: payload }) => {
    const useMocks = process.env.VITE_USE_MOCKS !== 'false';
    
    if (!useMocks) {
      const url = `${process.env.VITE_BACKEND_URL || 'http://localhost:8000'}/dispense/verify?code=${payload.code}&patient_id=${payload.patient_id}&org_id=${payload.org_id}`
      const res = await fetch(url)
      const data = await res.json()
      if (!data.valid) throw new Error(data.message || data.reason_code)
      return data
    }

    // --- MOCK FALLBACK ---
    const rx = db.prescriptions.find((p) => p.id === payload.code.toUpperCase())
    if (!rx) return { valid: false, reason_code: "NOT_FOUND" }
    
    return {
      valid: true,
      reason_code: null,
      message: null,
      prescription: {
        id: 999,
        code: rx.id,
        expires_at: new Date().toISOString(),
        prescriber: { id: 36, name: "Dr. Smith" },
        patient: { id: payload.patient_id, name: rx.patientName },
        items: [{
          drug_name: rx.medication,
          dose: "500mg",
          frequency_per_day: 3,
          days: 7,
          quantity: rx.quantity,
          unit_price: 1500,
          line_total: rx.quantity * 1500
        }],
        total: rx.quantity * 1500
      },
      stock_ok: true,
      stock_warnings: []
    }
  }
)

export const dispensePrescriptionFn = createServerFn({ method: 'POST' })
  .validator((data: { code: string; patient_id: number; org_id: number; pharmacist_id: number }) => data)
  .handler(async ({ data: payload }) => {
    const useMocks = process.env.VITE_USE_MOCKS !== 'false';
    
    if (!useMocks) {
      const res = await fetch(`${process.env.VITE_BACKEND_URL || 'http://localhost:8000'}/dispense`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Backend error: ' + await res.text())
      return await res.json()
    }

    // --- MOCK FALLBACK ---
    const rx = db.prescriptions.find((p) => p.id === payload.code.toUpperCase())
    if (!rx) throw new Error('Prescription not found')
    if (rx.status === 'dispensed') throw new Error('Prescription has already been dispensed')
    rx.status = 'dispensed'
    
    // Fake a transaction
    db.transactions.unshift({
      id: 'TX-' + Math.floor(10000 + Math.random() * 90000),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      description: `Dispensed: ${rx.medication}`,
      counterparty: rx.patientName,
      amount: 15000, 
      type: 'Pharmacy Sales',
      status: 'attested',
      evidenceChain: [
        { id: 'e1', step: 'Prescribed', timestamp: rx.createdAt, actor: 'Clinic', completed: true },
        { id: 'e2', step: 'Verified', timestamp: new Date().toISOString(), actor: 'Pharmacy', completed: true },
        { id: 'e3', step: 'Dispensed', timestamp: new Date().toISOString(), actor: 'Pharmacy', completed: true },
        { id: 'e5', step: 'Settled', timestamp: new Date().toISOString(), actor: 'Bank Gateway', completed: true },
      ]
    })

    return {
      dispense_id: 888,
      total: 15000,
      payment_reference: "PAY-123",
      attestation_level: "ATTESTED",
      stock_changes: [],
      transaction_id: 9999
    }
  }
)
