import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Badge } from '../components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { ArrowDownLeft, ArrowUpRight, Building2, CreditCard, Landmark, Send, Wallet as WalletIcon } from 'lucide-react'
import { getWalletDataFn, transferFundsFn, receiveFundsFn } from '../services/wallet.service'
import { formatMoney } from './index'
import { toast } from 'sonner'
import { useRole } from '../components/RoleProvider'

export const Route = createFileRoute('/wallet')({
  component: WalletRoute,
  loader: async () => {
    return await getWalletDataFn()
  }
})

function WalletRoute() {
  const data = Route.useLoaderData()
  const router = useRouter()
  const { role } = useRole()
  
  const [transferAmount, setTransferAmount] = useState('')
  const [transferAccount, setTransferAccount] = useState('')
  const [transferBank, setTransferBank] = useState('')
  const [isTransferring, setIsTransferring] = useState(false)
  const [isTransferOpen, setIsTransferOpen] = useState(false)

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsTransferring(true)
    try {
      await transferFundsFn({ data: { 
        amount: parseInt(transferAmount) * 100, // Convert N to Kobo
        recipientAccount: transferAccount, 
        bankName: transferBank 
      }})
      toast.success('Transfer successful!')
      setIsTransferOpen(false)
      setTransferAmount('')
      setTransferAccount('')
      setTransferBank('')
      router.invalidate()
    } catch (err: any) {
      toast.error(err.message || 'Transfer failed')
    } finally {
      setIsTransferring(false)
    }
  }

  const handleReceiveDemo = async () => {
    toast('Generating test deposit...', { icon: '🔄' })
    try {
      await receiveFundsFn({ data: { amount: 5000000, description: 'Demo Funding' } })
      await router.invalidate()
      toast.success('Successfully received ₦50,000.00!')
    } catch (err) {
      toast.error('Failed to receive funds')
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <Landmark className="w-8 h-8 text-primary" />
          Business Wallet
        </h1>
        <p className="text-muted-foreground mt-2">Manage your operating capital and seamlessly transfer funds.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Balance & Actions */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-primary to-primary/80 border-none shadow-lg text-primary-foreground overflow-hidden relative">
            <div className="absolute top-0 right-0 p-6 opacity-20">
              <Building2 className="w-24 h-24" />
            </div>
            <CardContent className="pt-8 pb-8 relative z-10 space-y-8">
              <div className="space-y-1">
                <p className="text-primary-foreground/80 font-medium tracking-wider uppercase text-sm">Available Balance</p>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                  {formatMoney(data.balance)}
                </h2>
              </div>
              
              <div className="flex gap-4 pt-4">
                <div className="space-y-1">
                  <p className="text-primary-foreground/60 text-xs uppercase tracking-wider">Account Number</p>
                  <p className="font-mono font-medium tracking-widest text-lg">0123456789</p>
                </div>
                <div className="space-y-1">
                  <p className="text-primary-foreground/60 text-xs uppercase tracking-wider">Sort Code</p>
                  <p className="font-mono font-medium tracking-widest text-lg">035150</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Button size="lg" variant="outline" className="h-24 flex flex-col gap-2" onClick={handleReceiveDemo}>
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 flex items-center justify-center">
                <ArrowDownLeft className="w-5 h-5" />
              </div>
              Receive Funds
            </Button>
            
            <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
              <DialogTrigger asChild>
                <Button size="lg" variant="outline" className="h-24 flex flex-col gap-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center">
                    <Send className="w-5 h-5 ml-1" />
                  </div>
                  Send Money
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send Money</DialogTitle>
                  <DialogDescription>Transfer funds instantly via our secure infrastructure.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleTransfer} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Amount (₦)</Label>
                    <Input type="number" min="1" required value={transferAmount} onChange={e => setTransferAmount(e.target.value)} placeholder="e.g. 50000" />
                  </div>
                  <div className="space-y-2">
                    <Label>Recipient Account Number</Label>
                    <Input required value={transferAccount} onChange={e => setTransferAccount(e.target.value)} placeholder="10 digit account number" maxLength={10} />
                  </div>
                  <div className="space-y-2">
                    <Label>Destination Bank</Label>
                    <select required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" value={transferBank} onChange={e => setTransferBank(e.target.value)}>
                      <option value="">Select Bank...</option>
                      <option value="GTBank">GTBank</option>
                      <option value="Zenith Bank">Zenith Bank</option>
                      <option value="Access Bank">Access Bank</option>
                      <option value="First Bank">First Bank</option>
                    </select>
                  </div>
                  <Button type="submit" className="w-full" disabled={isTransferring}>
                    {isTransferring ? 'Processing...' : 'Complete Transfer'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Right Column: Transaction History */}
        <Card className="lg:col-span-2 border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WalletIcon className="w-5 h-5 text-muted-foreground" />
              Wallet Ledger
            </CardTitle>
            <CardDescription>Recent inbound and outbound activity on this account.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No recent transactions.</div>
              ) : (
                data.transactions.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.amount > 0 ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {tx.amount > 0 ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{tx.description}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          <span>{tx.counterparty}</span>
                          <span>•</span>
                          <span>{new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold font-mono tracking-tight ${tx.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-foreground'}`}>
                        {tx.amount > 0 ? '+' : ''}{formatMoney(tx.amount)}
                      </span>
                      <p className="text-xs text-muted-foreground">Ref: {tx.id}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        
      </div>
    </div>
  )
}
