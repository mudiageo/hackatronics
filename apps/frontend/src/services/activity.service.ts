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

export const getVerifiedActivity = createServerFn({ method: 'GET' })
  .handler(async () => {
    // Return only attested/settled transactions that have an evidence chain
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
        partyA: 'City General Hospital', // Hardcoded self business for now
        partyB: tx.counterparty,
        amount: Math.abs(tx.amount), // Display as absolute positive value in activity log
        status: tx.status === 'attested' ? 'settled' : 'verified',
        steps
      }
    })

    return activities;
  });
