import { createServerFn } from '@tanstack/react-start'

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

const MOCK_ACTIVITY: ActivityEvent[] = [
  {
    id: 'ACT-9021',
    timestamp: '2 mins ago',
    type: 'Prescription Fulfillment',
    description: 'Amoxicillin 500mg Dispensed',
    partyA: 'City General Hospital',
    partyB: 'HealthPlus Pharmacy',
    amount: 15.00,
    status: 'settled',
    steps: [
      { label: 'Prescribed', status: 'completed', date: '10:05 AM' },
      { label: 'Verified', status: 'completed', date: '10:12 AM' },
      { label: 'Dispensed', status: 'completed', date: '10:30 AM' },
      { label: 'Stock Reduced', status: 'completed', date: '10:30 AM' },
      { label: 'Settled', status: 'completed', date: '10:31 AM' },
    ]
  },
  {
    id: 'ACT-9020',
    timestamp: '45 mins ago',
    type: 'Medical Equipment Order',
    description: 'Digital Thermometers (x10)',
    partyA: 'City General Hospital',
    partyB: 'MedEquip Suppliers',
    amount: 250.00,
    status: 'verified',
    steps: [
      { label: 'Ordered', status: 'completed', date: '09:15 AM' },
      { label: 'Verified', status: 'completed', date: '09:45 AM' },
      { label: 'Dispatched', status: 'current', date: '10:00 AM' },
      { label: 'Received', status: 'upcoming' },
      { label: 'Settled', status: 'upcoming' },
    ]
  }
];

export const getVerifiedActivity = createServerFn({ method: 'GET' })
  .handler(async () => {
    return MOCK_ACTIVITY;
  });
