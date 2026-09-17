import { createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/transactions')({
  component: Transactions,
})

function Transactions() {
  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Transactions</h2>
          <p className="text-muted-foreground text-sm">The system of record for everything that happened financially.</p>
        </div>
        <Button className="flex gap-2 items-center">
          <Plus className="w-4 h-4" /> Add Transaction
        </Button>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-medium">Date</th>
              <th className="text-left p-3 font-medium">Type</th>
              <th className="text-left p-3 font-medium">Counterparty</th>
              <th className="text-right p-3 font-medium">Amount</th>
              <th className="text-center p-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t hover:bg-muted/50 cursor-pointer">
              <td className="p-3">2026-09-17</td>
              <td className="p-3">Sale</td>
              <td className="p-3">Acme Corp</td>
              <td className="p-3 text-right text-green-600">+$500.00</td>
              <td className="p-3 text-center">
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Verified</span>
              </td>
            </tr>
            <tr className="border-t hover:bg-muted/50 cursor-pointer">
              <td className="p-3">2026-09-16</td>
              <td className="p-3">Expense</td>
              <td className="p-3">Office Supplies Inc</td>
              <td className="p-3 text-right text-red-600">-$120.00</td>
              <td className="p-3 text-center">
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Pending</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
