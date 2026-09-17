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
  milestones: PassportMilestone[];
}

const MOCK_PASSPORT_DATA: PassportData = {
  businessName: 'Acme Corp',
  industry: 'Retail & E-commerce',
  coveragePeriod: 'Jan 2026 - Sep 2026',
  trustScore: 85,
  verifiedTransactions: 142,
  evidenceDocuments: 156,
  milestones: [
    {
      id: 'ms-2',
      title: 'Reached $10,000 Verified Monthly Revenue',
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
