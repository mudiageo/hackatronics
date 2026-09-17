import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/in-memory'

export interface VerifiedActivityItem {
  id: string
  timestamp: string
  type: string
  description: string
  partyA: string
  partyB: string
  amount: number
  status: 'verified' | 'settled'
  evidenceChain: { id: string, step: string, timestamp: string, actor: string, completed: boolean }[]
}

export const getVerifiedActivity = createServerFn({ method: 'GET' }).handler(async () => {
    const useMocks = process.env.VITE_USE_MOCKS !== 'false';
    const org_id = 23;

    if (!useMocks) {
      const res = await fetch(`${process.env.VITE_BACKEND_URL || 'http://localhost:8000'}/passport/${org_id}/verified-activity`)
      if (!res.ok) throw new Error('Failed to fetch activity')
      const data = await res.json()
      
      return data.items.map((d: any) => ({
        id: `DISP-${d.dispense_id}`,
        timestamp: new Date(d.dispensed_at).toLocaleString(),
        type: 'Dispense',
        description: `Prescription #${d.prescription_id}`,
        partyA: d.from_org,
        partyB: d.to_org,
        amount: d.amount,
        status: 'settled',
        // Map backend flat strings to UI objects (mocking timestamps since backend doesn't have them yet)
        evidenceChain: d.steps.map((s: string, idx: number) => ({
          id: `step-${idx}`,
          step: s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' '),
          timestamp: new Date(d.dispensed_at).toLocaleString(), // Mocking timestamp for now
          actor: 'System',
          completed: true
        }))
      }))
    }

    // --- MOCK FALLBACK ---
    const verifiedTx = db.transactions.filter(
      (tx) => tx.status === 'attested' || tx.status === 'settled'
    )
    return verifiedTx.map((tx): VerifiedActivityItem => {
      return {
        id: tx.id,
        timestamp: tx.date,
        type: tx.type,
        description: tx.description,
        partyA: 'HealthPlus Pharmacy',
        partyB: tx.counterparty,
        amount: Math.abs(tx.amount),
        status: tx.status === 'attested' ? 'settled' : 'verified',
        evidenceChain: tx.evidenceChain || [],
      }
    })
  }
)
