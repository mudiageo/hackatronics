import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/in-memory'

export interface Transaction {
  id: string
  date: string
  description: string
  counterparty: string
  amount: number
  type: string
  status: 'recorded' | 'verified' | 'attested' | 'settled'
  evidenceChain?: { id: string, step: string, timestamp: string, actor: string, completed: boolean }[]
}

export const getTransactions = createServerFn({ method: 'GET' }).handler(async () => {
    const useMocks = process.env.VITE_USE_MOCKS !== 'false';
    const org_id = 23; // Hardcoded for demo

    if (!useMocks) {
      const res = await fetch(`${process.env.VITE_BACKEND_URL || 'http://localhost:8000'}/passport/${org_id}/transactions`)
      if (!res.ok) throw new Error('Failed to fetch transactions')
      const data = await res.json()
      // Map backend structure to frontend structure
      return data.items.map((t: any) => ({
        id: `TX-${t.id}`,
        date: new Date(t.occurred_at).toLocaleDateString(),
        description: t.description,
        counterparty: 'Unknown', // Not provided by backend yet
        amount: t.amount,
        type: t.type,
        status: t.attestation_level.toLowerCase(),
        // Mock evidence chain for now until backend provides it in the list
        evidenceChain: t.attestation_level.toLowerCase() !== 'recorded' ? [
          { id: 'e1', step: 'Recorded', timestamp: t.occurred_at, actor: 'System', completed: true },
          { id: 'e2', step: 'Settled', timestamp: t.occurred_at, actor: 'Bank Gateway', completed: true }
        ] : undefined
      }))
    }

    // --- MOCK FALLBACK ---
    return db.transactions
  }
)
