import { createServerFn } from '@tanstack/react-start'

import { db } from '../db/in-memory'

export interface ActivityEvent {
  id: string;
  timestamp: string;
  type: string;
  description: string;
  partyA: string;
  partyB: string;
  amount: number;
  status: 'pending' | 'verified' | 'settled';
  steps: {
    label: string;
    status: 'completed' | 'current' | 'upcoming';
    date?: string;
  }[];
}

export const getVerifiedActivity = createServerFn({ method: 'GET' }).handler(async () => {
    const useMocks = process.env.VITE_USE_MOCKS !== 'false';
    const { getRequestHeader } = await import('@tanstack/react-start/server');
    const cookie = getRequestHeader('cookie') || '';
    const match = cookie.match(/active_org_id=(\d+)/);
    const org_id = match ? parseInt(match[1]) : 23;

    if (!useMocks) {
      const res = await fetch(`${process.env.VITE_BACKEND_URL || 'http://localhost:8000'}/passport/${org_id}/verified-activity`)
      if (!res.ok) throw new Error('Failed to fetch activity')
      const data = await res.json()
      
      return data.items.map((d: any): ActivityEvent => ({
        id: `DISP-${d.dispense_id}`,
        timestamp: new Date(d.dispensed_at).toLocaleString(),
        type: 'Dispense',
        description: `Prescription #${d.prescription_id}`,
        partyA: d.from_org,
        partyB: d.to_org,
        amount: d.amount,
        status: 'settled',
        steps: d.steps.map((s: string, idx: number) => ({
          label: s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' '),
          status: 'completed',
          date: new Date(d.dispensed_at).toLocaleString()
        }))
      }))
    }

    // --- MOCK FALLBACK ---
    const verifiedTxs = db.transactions.filter(tx => 
      (tx.status === 'attested' || tx.status === 'settled') && 
      tx.evidenceChain && tx.evidenceChain.length > 0
    )

    const activities: ActivityEvent[] = verifiedTxs.map(tx => {
      // Map evidence chain to steps
      const steps = tx.evidenceChain!.map((e, index) => ({
        label: e.step,
        status: e.completed ? 'completed' as const : 'current' as const,
        date: e.timestamp
      }))

      // If it's not fully settled, add an upcoming "Settled" step visually
      if (tx.status !== 'attested' && !steps.some(s => s.label === 'Settled')) {
        steps.push({
          label: 'Settled',
          status: 'upcoming',
        })
      }

      return {
        id: tx.id,
        timestamp: tx.date, // We use the date as the timestamp
        type: tx.type,
        description: tx.description,
        partyA: 'Wellcare Pharmacy', // Hardcoded self business for now
        partyB: tx.counterparty,
        amount: Math.abs(tx.amount), // Display as absolute positive value in activity log
        status: tx.status === 'attested' ? 'settled' : 'verified',
        steps
      }
    })

    return activities;
  }
)
