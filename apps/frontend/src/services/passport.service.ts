import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/in-memory'

export interface PassportData {
  businessName: string
  industry: string
  coveragePeriod: string
  trustScore: number
  verifiedTransactions: number
  profile: {
    totalIncome: number
    totalExpenses: number
    incomeRange: string
    expenseRange: string
    operationalCost: number
    operatingStatus: string
    statusMessage: string
  }
}

export const getPassportData = createServerFn({ method: 'GET' }).handler(async () => {
    const useMocks = process.env.VITE_USE_MOCKS !== 'false';
    const org_id = 23;

    if (!useMocks) {
      const res = await fetch(`${process.env.VITE_BACKEND_URL || 'http://localhost:8000'}/passport/${org_id}/passport`)
      if (!res.ok) throw new Error('Failed to fetch passport')
      const data = await res.json()
      
      return {
        businessName: data.business.name,
        industry: 'Retail Pharmacy',
        coveragePeriod: 'Current Year',
        trustScore: data.readiness.score,
        verifiedTransactions: data.metrics.find((m: any) => m.key === 'unique_patients')?.value || 0,
        profile: {
          totalIncome: data.coverage.recorded,
          totalExpenses: 0, // Not explicitly provided in this payload
          incomeRange: `~₦${(data.coverage.recorded / 12).toFixed(0)} / mo`,
          expenseRange: 'Unknown',
          operationalCost: 0,
          operatingStatus: data.readiness.score > 70 ? 'Healthy' : 'Needs Review',
          statusMessage: data.flags.length > 0 ? data.flags[0].detail : "Business operates within acceptable parameters."
        }
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
      businessName: 'HealthPlus Pharmacy',
      industry: 'Retail Pharmacy',
      coveragePeriod: 'Jan 2026 - Present',
      trustScore,
      verifiedTransactions: verifiedTx.length,
      profile: {
        totalIncome,
        totalExpenses,
        incomeRange: '₦1.2M - ₦2.1M / mo',
        expenseRange: '₦800k - ₦1.1M / mo',
        operationalCost: 850000, 
        operatingStatus: trustScore >= 80 ? 'Healthy & Expanding' : 'Stable',
        statusMessage: `Business maintains a consistent margin with low volatility in operational costs. High reliance on 2 primary vendors.`
      }
    }
  }
)
