import { createServerFn } from '@tanstack/start'

// Mock Data
const MOCK_DASHBOARD_DATA = {
  metricsSummary: {
    revenue: 1825000,
    expenses: 2315000,
    profit: 1250000,
    cashPosition: -490000,
  },
  coverage: {
    attested: 45,
    settled: 30,
    recorded: 25,
  },
  recentActivity: [
    { id: 1, desc: 'Term 1 Tuition Bulk Payment', date: 'Sep 14, 2026', amount: 1250000, type: 'Tuition Fees', status: 'attested' },
    { id: 2, desc: 'Alumni Association Grant', date: 'Sep 12, 2026', amount: 500000, type: 'Donations', status: 'settled' },
    { id: 3, desc: 'Weekend Football Pitch Hire', date: 'Sep 10, 2026', amount: 75000, type: 'Facility Rental', status: 'recorded' },
    { id: 4, desc: 'Library Books Restock', date: 'Sep 09, 2026', amount: -125000, type: 'Expenses', status: 'settled' },
    { id: 5, desc: 'Maintenance Contractor', date: 'Sep 08, 2026', amount: -450000, type: 'Expenses', status: 'recorded' }
  ]
};

export const getDashboardData = createServerFn({ method: 'GET' })
  .handler(async () => {
    // Check if we should use mocks (simulating a Vite env var check on the server)
    const useMocks = process.env.VITE_USE_MOCKS !== 'false';
    
    if (useMocks) {
      // Simulate network latency
      await new Promise(resolve => setTimeout(resolve, 600));
      return MOCK_DASHBOARD_DATA;
    }

    // In the future, we would fetch from the Python FastAPI backend here:
    // const response = await fetch('http://localhost:8000/api/dashboard');
    // return response.json();
    return MOCK_DASHBOARD_DATA;
  });
