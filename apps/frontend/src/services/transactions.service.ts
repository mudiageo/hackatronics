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
    const { getRequestHeader } = await import('@tanstack/react-start/server');
    const cookie = getRequestHeader('cookie') || '';
    const match = cookie.match(/active_org_id=(\d+)/);
    const org_id = match ? parseInt(match[1]) : 23;

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

export const addTransactionFn = createServerFn({ method: 'POST' })
  .validator((data: Omit<Transaction, 'id' | 'status' | 'evidenceChain'>) => data)
  .handler(async ({ data }) => {
    const useMocks = process.env.VITE_USE_MOCKS !== 'false';
    const { getRequestHeader } = await import('@tanstack/react-start/server');
    const cookie = getRequestHeader('cookie') || '';
    const match = cookie.match(/active_org_id=(\d+)/);
    const org_id = match ? parseInt(match[1]) : 23;

    if (!useMocks) {
      // For now, if the backend doesn't support manual addition via this UI component, we throw
      throw new Error('Adding transactions manually is not yet supported by the backend API')
    }

    // --- MOCK FALLBACK ---
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const newTx: Transaction = {
      ...data,
      id: `TX-${Math.floor(Math.random() * 10000) + 10000}`,
      status: 'recorded'
    };
    
    db.transactions.push(newTx);
    return newTx;
  });
