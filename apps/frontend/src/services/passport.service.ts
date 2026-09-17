import { createServerFn } from '@tanstack/react-start'

export interface PassportMilestone {
  id: string;
  title: string;
  date: string;
}

export interface PassportData {
  businessName: string;
  industry: string;
  coveragePeriod: string;
  trustScore: number;
  verifiedTransactions: number;
  evidenceDocuments: number;
  flags: number;
  milestones: PassportMilestone[];

  // Business Operating Profile
  totalIncome: number;
  totalExpenses: number;
  incomeRange: string;
  expenseRange: string;
  operationalCost: number;
  operatingStatus: string;
  operatingStatusDesc: string;
}

const MOCK_PASSPORT_DATA: PassportData = {
  businessName: 'City General Hospital',
  industry: 'Healthcare Services',
  coveragePeriod: 'Jan 2026 - Present',
  trustScore: 94,
  verifiedTransactions: 1245,
  evidenceDocuments: 3750,
  flags: 0,

  // Business Operating Profile Mock Data
  totalIncome: 14500000,
  totalExpenses: 9800000,
  incomeRange: '₦1.2M - ₦1.8M / month',
  expenseRange: '₦800K - ₦1.1M / month',
  operationalCost: 4500000,
  operatingStatus: 'Healthy & Expanding',
  operatingStatusDesc: 'Business maintains a consistent 32% profit margin with low volatility in operational costs.',
  milestones: [
    {
      id: 'ms-2',
      title: 'Reached ₦10,000 Verified Monthly Revenue',
      date: 'Aug 2026'
    },
    {
      id: 'ms-1',
      title: 'Passport Initiated',
      date: 'Jan 2026'
    }
  ]
};

export const getPassportData = createServerFn({ method: 'GET' })
  .handler(async () => {
    return MOCK_PASSPORT_DATA;
  });
