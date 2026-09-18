import { createServerFn } from '@tanstack/react-start'

import { db } from '../db/in-memory'

export interface DashboardData {
  metricsSummary: {
    revenue: number
    expenses: number
    profit: number
    cashPosition: number
  }
  coverage: {
    recorded: number
    settled: number
    attested: number
  }
  recentActivity: {
    id: string
    desc: string
    date: string
    amount: number
    type: string
    status: 'recorded' | 'verified' | 'attested' | 'settled'
  }[]
}

export const getDashboardData = createServerFn({ method: 'GET' }).handler(async () => {
    const useMocks = process.env.VITE_USE_MOCKS !== 'false';
    const { getRequestHeader } = await import('@tanstack/react-start/server');
    const cookie = getRequestHeader('cookie') || '';
    const match = cookie.match(/active_org_id=(\d+)/);
    const org_id = match ? parseInt(match[1]) : 23;

    if (!useMocks) {
      // 1. Fetch transactions to calculate revenue/expenses manually (since there's no dashboard-metrics endpoint yet)
      const txRes = await fetch(`${process.env.VITE_BACKEND_URL || 'http://localhost:8000'}/passport/${org_id}/transactions?limit=100`)
      const txData = await txRes.json()
      
      let revenue = 0;
      let expenses = 0;
      
      txData.items.forEach((t: any) => {
        if (t.amount > 0) revenue += t.amount;
        else expenses += Math.abs(t.amount);
      });
      
      const profit = revenue - expenses;
      const cashPosition = profit;

      // 2. Fetch coverage from passport endpoint
      const passportRes = await fetch(`${process.env.VITE_BACKEND_URL || 'http://localhost:8000'}/passport/${org_id}/passport`)
      const passportData = await passportRes.json()
      const cov = passportData.coverage;

      return {
        metricsSummary: {
          revenue,
          expenses,
          profit,
          cashPosition
        },
        coverage: {
          recorded: 100, // Normalized for UI bar
          settled: cov.settled_pct,
          attested: cov.attested_pct
        },
        recentActivity: txData.items.slice(0, 5).map((t: any) => ({
          id: `TX-${t.id}`,
          desc: t.description,
          date: new Date(t.occurred_at).toLocaleDateString(),
          amount: t.amount,
          type: t.type,
          status: t.attestation_level.toLowerCase()
        }))
      }
    }

    // --- MOCK FALLBACK ---
    let revenue = 0
    let expenses = 0

    db.transactions.forEach(tx => {
      if (tx.amount > 0) revenue += tx.amount
      else expenses += Math.abs(tx.amount)
    })

    const profit = revenue - expenses
    const cashPosition = profit 

    let recordedCount = 0
    let settledCount = 0
    let attestedCount = 0

    db.transactions.forEach(tx => {
      recordedCount++
      if (tx.status === 'settled' || tx.status === 'attested') settledCount++
      if (tx.status === 'attested') attestedCount++
    })

    const coverage = {
      recorded: 100,
      settled: Math.round((settledCount / recordedCount) * 100),
      attested: Math.round((attestedCount / recordedCount) * 100),
    }

    const recentActivity = db.transactions.slice(0, 5).map(tx => ({
      id: tx.id,
      desc: tx.description,
      date: tx.date.split(',')[0], 
      amount: tx.amount,
      type: tx.type,
      status: tx.status
    }))

    return {
      metricsSummary: {
        revenue,
        expenses,
        profit,
        cashPosition
      },
      coverage,
      recentActivity
    }
  }
)
