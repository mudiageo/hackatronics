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

export const getPassportData = createServerFn({ method: 'GET' })
  .handler(async () => {
    const transactions = db.transactions

    let totalIncome = 0
    let totalExpenses = 0
    let verifiedTransactions = 0
    let evidenceDocuments = 0

    let totalRecordedVolume = 0
    let totalAttestedVolume = 0

    for (const tx of transactions) {
      const absAmount = Math.abs(tx.amount)
      
      if (tx.amount > 0) {
        totalIncome += tx.amount
      } else {
        totalExpenses += absAmount
      }

      totalRecordedVolume += absAmount

      if (tx.status === 'attested') {
        totalAttestedVolume += absAmount
        verifiedTransactions += 1
      }
      
      if (tx.evidenceChain) {
        evidenceDocuments += tx.evidenceChain.length
      }
    }

    const profit = totalIncome - totalExpenses

    // Trust Score: Math.round((attested_volume / total_volume) * 100) or 0
    const trustScore = totalRecordedVolume > 0 ? Math.round((totalAttestedVolume / totalRecordedVolume) * 100) : 0

    // Compute Operating Status
    let operatingStatus = "Stable"
    let operatingStatusDesc = "The business is maintaining stable operations."
    
    if (profit > 0 && trustScore >= 80) {
      operatingStatus = 'Healthy & Verified'
      operatingStatusDesc = 'Business maintains a positive profit margin with highly verified financial records.'
    } else if (profit <= 0) {
      operatingStatus = 'Operating at a Loss'
      operatingStatusDesc = 'Business expenses currently exceed recorded revenue.'
    } else if (trustScore < 50) {
      operatingStatus = 'Low Trust Coverage'
      operatingStatusDesc = 'Business is profitable but lacks cryptographic evidence for most operations.'
    }

    return {
      businessName: 'City General Hospital',
      industry: 'Healthcare Services',
      coveragePeriod: 'Jan 2026 - Present',
      trustScore,
      verifiedTransactions,
      evidenceDocuments,
      flags: 0,
      totalIncome,
      totalExpenses,
      incomeRange: 'Dynamic Range', // We can improve these ranges later
      expenseRange: 'Dynamic Range',
      operationalCost: totalExpenses,
      operatingStatus,
      operatingStatusDesc,
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
  });
