import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/in-memory'

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

export const getPassportData = createServerFn({ method: 'GET' }).handler(async () => {
    const useMocks = process.env.VITE_USE_MOCKS !== 'false';
    const org_id = 23;

    if (!useMocks) {
      const res = await fetch(`${process.env.VITE_BACKEND_URL || 'http://localhost:8000'}/passport/${org_id}/passport`)
      if (!res.ok) throw new Error('Failed to fetch passport')
      const data = await res.json()
      
      const score = data.readiness.score
      
      return {
        businessName: data.business.name,
        industry: 'Retail Pharmacy',
        coveragePeriod: 'Current Year',
        trustScore: score,
        verifiedTransactions: data.metrics.find((m: any) => m.key === 'unique_patients')?.value || 0,
        evidenceDocuments: data.metrics.find((m: any) => m.key === 'months_history')?.value || 0,
        flags: data.flags.length,
        milestones: [
          {
            id: 'ms-2',
            title: `Reached ~₦${(data.coverage.recorded / 12).toFixed(0)} Verified Monthly Revenue`,
            date: 'Current'
          }
        ],
        totalIncome: data.coverage.recorded,
        totalExpenses: 0, // Not explicitly provided in this payload
        incomeRange: `~₦${(data.coverage.recorded / 12).toFixed(0)} / mo`,
        expenseRange: 'Unknown',
        operationalCost: 0,
        operatingStatus: score > 70 ? 'Healthy' : 'Needs Review',
        operatingStatusDesc: data.flags.length > 0 ? data.flags[0].detail : "Business operates within acceptable parameters."
      }
    }

    // --- MOCK FALLBACK ---
    const verifiedTx = db.transactions.filter(
      (tx) => tx.status === 'attested' || tx.status === 'settled'
    )
    
    let totalIncome = 0
    let totalExpenses = 0
    
    verifiedTx.forEach(tx => {
      if (tx.amount > 0) totalIncome += tx.amount
      else totalExpenses += Math.abs(tx.amount)
    })
    
    const trustScore = 88

    return {
      businessName: 'Wellcare Pharmacy',
      industry: 'Retail Pharmacy',
      coveragePeriod: 'Jan 2026 - Present',
      trustScore,
      verifiedTransactions: verifiedTx.length,
      evidenceDocuments: 156,
      flags: 0,
      totalIncome,
      totalExpenses,
      incomeRange: '₦1.2M - ₦2.1M / mo',
      expenseRange: '₦800k - ₦1.1M / mo',
      operationalCost: 850000, 
      operatingStatus: trustScore >= 80 ? 'Healthy & Expanding' : 'Stable',
      operatingStatusDesc: `Business maintains a consistent margin with low volatility in operational costs. High reliance on 2 primary vendors.`,
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
    }
  }
)
