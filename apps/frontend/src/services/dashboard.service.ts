import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/in-memory'

export const getDashboardData = createServerFn({ method: 'GET' })
  .handler(async () => {
    const transactions = db.transactions

    let revenue = 0
    let expenses = 0

    let totalRecordedVolume = 0
    let totalSettledVolume = 0
    let totalAttestedVolume = 0

    for (const tx of transactions) {
      const absAmount = Math.abs(tx.amount)
      
      if (tx.amount > 0) {
        revenue += tx.amount
      } else {
        expenses += absAmount
      }

      totalRecordedVolume += absAmount

      if (tx.status === 'settled' || tx.status === 'attested') {
        totalSettledVolume += absAmount
      }
      if (tx.status === 'attested') {
        totalAttestedVolume += absAmount
      }
    }

    const profit = revenue - expenses
    const cashPosition = profit // Simplified calculation for now

    // Calculate coverage percentages based on volume
    // To avoid dividing by zero, default to 0 if total volume is 0
    const coverage = {
      recorded: 100, // By definition, anything in the ledger is 100% recorded
      settled: totalRecordedVolume > 0 ? Math.round((totalSettledVolume / totalRecordedVolume) * 100) : 0,
      attested: totalRecordedVolume > 0 ? Math.round((totalAttestedVolume / totalRecordedVolume) * 100) : 0,
    }

    // Recent activity: Top 5 most recent transactions
    const recentActivity = transactions.slice(0, 5).map(tx => ({
      id: tx.id,
      desc: tx.description,
      date: tx.date.split(' ')[0] + ' ' + tx.date.split(' ')[1] + ' ' + tx.date.split(' ')[2], // Extract just the date part roughly
      amount: tx.amount,
      type: tx.type,
      status: tx.status
    }))

    return {
      metricsSummary: {
        revenue,
        expenses,
        profit,
        cashPosition,
      },
      coverage,
      recentActivity,
    }
  });
