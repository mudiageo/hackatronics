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

const MOCK_TRANSACTIONS: Transaction[] = [
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
  {
    id: 'TX-10022',
    date: 'Sep 15, 2026 16:45',
    description: 'Office Supplies',
    counterparty: 'Stationery Hub',
    amount: -15000,
    type: 'Expense',
    status: 'recorded'
  },
  {
    id: 'TX-10021',
    date: 'Sep 14, 2026 11:20',
    description: 'Equipment Maintenance',
    counterparty: 'MedTech Repairs',
    amount: -85000,
    type: 'Maintenance',
    status: 'recorded'
  },
  {
    id: 'TX-10020',
    date: 'Sep 12, 2026 08:00',
    description: 'Monthly Software Subscription',
    counterparty: 'HealthSaaS Inc',
    amount: -25000,
    type: 'Software',
    status: 'settled'
  }
];

export const getTransactions = createServerFn({ method: 'GET' })
  .handler(async () => {
    const useMocks = process.env.VITE_USE_MOCKS !== 'false';
    
    if (useMocks) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return MOCK_TRANSACTIONS;
    }

    // Live API fetch would go here
    return MOCK_TRANSACTIONS;
  });
