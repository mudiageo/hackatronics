import { createFileRoute } from '@tanstack/react-router'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/passport')({
  component: Passport,
})

function Passport() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 md:pt-6 max-w-7xl mx-auto bg-background min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Financial Passport</h2>
          <p className="text-muted-foreground text-sm">An exportable, presentable summary of the business's verified financial history.</p>
        </div>
        <Button className="flex gap-2 items-center">
          <Download className="w-4 h-4" /> Export PDF
        </Button>
      </div>
      
      <div className="border rounded-lg p-6 bg-card max-w-3xl mx-auto shadow-sm">
        <div className="text-center mb-8 border-b pb-6">
          <h2 className="text-3xl font-bold">Acme Corp</h2>
          <p className="text-muted-foreground">Retail & E-commerce</p>
          <p className="text-sm mt-2">Coverage: Jan 2026 - Sep 2026</p>
        </div>
        
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-32 h-32 rounded-full border-4 border-green-500 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-green-600">85</span>
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Trust Score</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="p-4 border rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-1">Verified Transactions</p>
            <p className="text-2xl font-bold">142</p>
          </div>
          <div className="p-4 border rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-1">Evidence Documents</p>
            <p className="text-2xl font-bold">156</p>
          </div>
        </div>
        
        <div>
          <h3 className="font-bold border-b pb-2 mb-4">Timeline Milestones</h3>
          <ul className="space-y-4">
            <li className="flex gap-4">
              <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 shrink-0"></div>
              <div>
                <p className="font-medium">Reached $10,000 Verified Monthly Revenue</p>
                <p className="text-sm text-muted-foreground">Aug 2026</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 shrink-0"></div>
              <div>
                <p className="font-medium">Passport Initiated</p>
                <p className="text-sm text-muted-foreground">Jan 2026</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
