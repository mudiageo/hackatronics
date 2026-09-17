import { createServerFn } from '@tanstack/react-start'

export type TransactionStatus = 'attested' | 'settled' | 'recorded';

export interface EvidenceStep {
  id: string;
  step: 'Prescribed' | 'Verified' | 'Dispensed' | 'Stock Reduced' | 'Settled';
  timestamp: string;
  actor: string;
  completed: boolean;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  counterparty: string;
  amount: number;
  type: string;
  status: TransactionStatus;
  evidenceChain?: EvidenceStep[];
}

import { db } from '../db/in-memory'

export const getTransactions = createServerFn({ method: 'GET' })
  .handler(async () => {
    // Simulate latency
    await new Promise(resolve => setTimeout(resolve, 400));
    // Sort transactions by date descending (assuming id is roughly chronological, or sort by date)
    return [...db.transactions].reverse();
  });

export const addTransactionFn = createServerFn({ method: 'POST' })
  .validator((data: Omit<Transaction, 'id' | 'status' | 'evidenceChain'>) => data)
  .handler(async ({ data }) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const newTx: Transaction = {
      ...data,
      id: `TX-${Math.floor(Math.random() * 10000) + 10000}`,
      status: 'recorded'
    };
    
    db.transactions.push(newTx);
    return newTx;
  });
