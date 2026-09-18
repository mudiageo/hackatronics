import { createServerFn } from '@tanstack/react-start'

// In-memory ledger for the wallet 
let walletLedger = [
  { id: 'W-001', date: new Date(Date.now() - 86400000 * 5).toISOString(), type: 'Deposit', amount: 5000000, description: 'Initial Capital', counterparty: 'Self' },
  { id: 'W-002', date: new Date(Date.now() - 86400000 * 2).toISOString(), type: 'Withdrawal', amount: -150000, description: 'Vendor Payment', counterparty: 'Supplier Inc' },
]

export const getWalletDataFn = createServerFn({ method: 'GET' }).handler(async () => {
  const balance = walletLedger.reduce((acc, tx) => acc + tx.amount, 0);
  return {
    balance,
    transactions: [...walletLedger].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }
})

export const transferFundsFn = createServerFn({ method: 'POST' })
  .validator((data: { amount: number; recipientAccount: string; bankName: string }) => data)
  .handler(async ({ data }) => {
    // Simulate network latency for realism
    await new Promise(r => setTimeout(r, 1200))
    
    const balance = walletLedger.reduce((acc, tx) => acc + tx.amount, 0);
    if (balance < data.amount) {
      throw new Error("Insufficient funds in Wema Bank wallet")
    }
    
    walletLedger.push({
      id: `W-${Math.floor(Math.random() * 10000)}`,
      date: new Date().toISOString(),
      type: 'Transfer',
      amount: -data.amount,
      description: `Transfer to ${data.recipientAccount}`,
      counterparty: data.bankName
    })
    
    return { success: true }
  })

export const receiveFundsFn = createServerFn({ method: 'POST' })
  .validator((data: { amount: number; description: string }) => data)
  .handler(async ({ data }) => {
    await new Promise(r => setTimeout(r, 800))
    
    walletLedger.push({
      id: `W-${Math.floor(Math.random() * 10000)}`,
      date: new Date().toISOString(),
      type: 'Deposit',
      amount: data.amount,
      description: data.description,
      counterparty: 'External Funding'
    })
    
    return { success: true }
  })
