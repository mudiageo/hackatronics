import { createFileRoute } from '@tanstack/react-router'
import { Plus, CheckCircle2, CheckCircle, Circle, FileText, ArrowRight, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getTransactions } from '../services/transactions.service'
import type { Transaction, EvidenceStep } from '../services/transactions.service'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { toast } from 'sonner'

export const Route = createFileRoute('/transactions')({
  component: Transactions,
  loader: async () => await getTransactions(),
})

function getStatusBadge(status: string) {
  switch (status) {
    case 'attested':
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100/80 border-0 flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3" /> Attested</Badge>
    case 'settled':
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100/80 border-0 flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3" /> Settled</Badge>
    default:
      return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100/80 border-0 flex items-center gap-1 w-fit"><Circle className="w-3 h-3" /> Recorded</Badge>
  }
}

function Transactions() {
  const initialTransactions = Route.useLoaderData()
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [filterLevel, setFilterLevel] = useState<string>('all')

  const handleAddTransaction = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const newTx: Transaction = {
      id: `TX-${Math.floor(Math.random() * 10000) + 10000}`,
      date: formData.get('date') as string || new Date().toISOString().split('T')[0],
      description: formData.get('description') as string,
      counterparty: formData.get('counterparty') as string,
      amount: Number(formData.get('amount')),
      type: formData.get('type') as string,
      status: 'recorded'
    }

    setTransactions([newTx, ...transactions])
    setIsAddModalOpen(false)
    toast.success('Transaction recorded successfully', {
      description: 'This transaction is self-reported and pending verification.'
    })
  }

  const filteredTransactions = transactions.filter(tx => 
    filterLevel === 'all' ? true : tx.status === filterLevel
  );

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <PageHeader 
        title="Transactions" 
        description="The system of record for everything that happened financially." 
        action={
          <div className="flex items-center gap-4">
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="bg-muted text-foreground text-sm font-medium border-0 rounded-full py-2 px-4 focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
            >
              <option value="all">All Levels</option>
              <option value="recorded">Recorded</option>
              <option value="settled">Settled</option>
              <option value="attested">Attested</option>
            </select>
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="flex gap-2 items-center">
                  <Plus className="w-4 h-4" /> Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Transaction</DialogTitle>
                <DialogDescription>
                  Record a new financial transaction manually.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddTransaction} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" name="description" placeholder="e.g. Office Supplies" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="counterparty">Counterparty</Label>
                  <Input id="counterparty" name="counterparty" placeholder="e.g. Stationery Hub" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input id="amount" name="amount" type="number" step="0.01" placeholder="-150.00" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Input id="type" name="type" placeholder="e.g. Expense" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                <DialogFooter className="pt-4">
                  <Button type="submit">Record Transaction</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      
      <div className="border rounded-lg bg-card shadow-sm overflow-x-auto">
        <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow className="bg-muted/50 border-border">
              <TableHead className="font-medium text-foreground">Date</TableHead>
              <TableHead className="font-medium text-foreground">Description</TableHead>
              <TableHead className="font-medium text-foreground">Counterparty</TableHead>
              <TableHead className="text-right font-medium text-foreground">Amount</TableHead>
              <TableHead className="font-medium text-foreground text-right pr-6">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx) => (
                <TableRow 
                  key={tx.id} 
                  className="border-border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedTx(tx)}
                >
                  <TableCell className="text-muted-foreground">{tx.date.split(' ')[0]}</TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">{tx.description}</div>
                    <div className="text-xs text-muted-foreground">{tx.id} • {tx.type}</div>
                  </TableCell>
                  <TableCell className="text-foreground">{tx.counterparty}</TableCell>
                  <TableCell className={`text-right font-medium ${tx.amount > 0 ? "text-foreground" : "text-muted-foreground"}`}>
                    {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toLocaleString()}
                  </TableCell>
                  <TableCell className="flex justify-end pr-6">
                    {getStatusBadge(tx.status)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No transactions found for this filter level.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={!!selectedTx} onOpenChange={(open) => !open && setSelectedTx(null)}>
        <SheetContent className="w-full sm:w-[540px] overflow-y-auto border-l-border bg-card">
          {selectedTx && (
            <>
              <SheetHeader className="mb-6">
                <SheetTitle className="text-xl font-bold flex items-center justify-between">
                  Transaction Details
                  {getStatusBadge(selectedTx.status)}
                </SheetTitle>
                <SheetDescription>
                  Reference: {selectedTx.id}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-muted/50">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Amount</div>
                    <div className={`text-2xl font-bold ${selectedTx.amount > 0 ? "text-foreground" : "text-muted-foreground"}`}>
                      {selectedTx.amount > 0 ? '+' : ''}${Math.abs(selectedTx.amount).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Date</div>
                    <div className="text-sm font-medium text-foreground">{selectedTx.date}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-muted-foreground mb-1">Counterparty</div>
                    <div className="text-sm font-medium text-foreground">{selectedTx.counterparty}</div>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" /> Evidence Chain
                  </h3>
                  
                  {selectedTx.evidenceChain ? (
                    <div className="relative pl-6 border-l-2 border-muted space-y-8 mt-4 ml-3">
                      {selectedTx.evidenceChain.map((step, idx) => (
                        <div key={step.id} className="relative">
                          <div className="absolute -left-[35px] bg-primary w-5 h-5 rounded-full border-4 border-card flex items-center justify-center"></div>
                          <div>
                            <div className="font-bold text-foreground text-sm">{step.step}</div>
                            <div className="text-sm font-medium text-muted-foreground flex items-center gap-2 mt-1">
                              <FileText className="w-3 h-3" /> {step.actor}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">{step.timestamp}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 border border-dashed rounded-xl text-center text-muted-foreground bg-muted/20">
                      <p className="text-sm">No evidence chain available for this transaction.</p>
                      <p className="text-xs mt-1">Status: Self-reported</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
