import { createFileRoute } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, Banknote, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const Route = createFileRoute('/')({
  component: Dashboard,
})

// MOCK DATA for the Dashboard
const metricsSummary = {
  revenue: 24500,
  expenses: 12050,
  profit: 12450,
  cashPosition: 45000,
}

// Coverage Breakdown
const coverage = {
  recorded: 20, // grey
  settled: 30,  // blue
  attested: 50  // green
}

const recentActivity = [
  { id: 'tx-1', date: '2026-09-17', desc: 'Pharmacy B Restock', amount: 500, type: 'Sale', status: 'attested' },
  { id: 'tx-2', date: '2026-09-16', desc: 'Supplier Invoice', amount: -120, type: 'Expense', status: 'recorded' },
  { id: 'tx-3', date: '2026-09-15', desc: 'Patient Copay', amount: 1200, type: 'Sale', status: 'settled' },
  { id: 'tx-4', date: '2026-09-14', desc: 'Equipment Purchase', amount: -450, type: 'Purchase', status: 'attested' },
]

function getStatusBadge(status: string) {
  switch (status) {
    case 'attested':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Attested</Badge>
    case 'settled':
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">Settled</Badge>
    case 'recorded':
    default:
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200" variant="outline">Self-reported</Badge>
  }
}

function Dashboard() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-7xl mx-auto bg-white min-h-screen">
      <div className="flex items-center justify-between space-y-2 mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">Business Health</h2>
          <p className="text-muted-foreground text-sm">Overview of your financial passport and recent transactions.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Revenue Card */}
        <Card className="rounded-2xl shadow-sm border-[#E7E9F3]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#111827]">${metricsSummary.revenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        {/* Expenses Card */}
        <Card className="rounded-2xl shadow-sm border-[#E7E9F3]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expenses</CardTitle>
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#111827]">${metricsSummary.expenses.toLocaleString()}</div>
          </CardContent>
        </Card>

        {/* Profit Card */}
        <Card className="rounded-2xl shadow-sm border-[#E7E9F3]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Profit</CardTitle>
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <Activity className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#111827]">${metricsSummary.profit.toLocaleString()}</div>
          </CardContent>
        </Card>

        {/* Cash Position Hero Card (Dark Navy) */}
        <Card className="rounded-2xl shadow-sm bg-[#1B2559] text-white border-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Cash Position</CardTitle>
            <Banknote className="h-4 w-4 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${metricsSummary.cashPosition.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 space-y-6">
          {/* Coverage Bar & Health Explanation */}
          <Card className="rounded-2xl shadow-sm border-[#E7E9F3]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#111827]">Financial Coverage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Stacked Horizontal Bar */}
              <div className="h-4 w-full flex rounded-full overflow-hidden">
                <div style={{ width: `${coverage.attested}%` }} className="bg-[#16A34A]" title="Attested"></div>
                <div style={{ width: `${coverage.settled}%` }} className="bg-[#4C8DFF]" title="Settled"></div>
                <div style={{ width: `${coverage.recorded}%` }} className="bg-gray-300" title="Self-Reported"></div>
              </div>
              <div className="flex gap-4 text-sm font-medium text-muted-foreground">
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#16A34A]"></div> {coverage.attested}% Attested</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#4C8DFF]"></div> {coverage.settled}% Settled</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-gray-300"></div> {coverage.recorded}% Recorded</div>
              </div>
              
              {/* Health Explanation */}
              <div className="p-4 bg-[#F7F8FC] rounded-lg text-sm text-[#111827] leading-relaxed">
                Your business health is <strong>strong</strong>. {coverage.attested}% of your financial volume is fully attested by verified evidence, giving you a high trust score with lending partners. 
                <a href="/verified-activity" className="text-[#4C8DFF] font-medium flex items-center gap-1 mt-2 hover:underline">
                  View evidence trail <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-3">
          {/* Recent Activity */}
          <Card className="rounded-2xl shadow-sm border-[#E7E9F3]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#111827]">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-[#E7E9F3]">
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentActivity.map((tx) => (
                    <TableRow key={tx.id} className="border-[#E7E9F3] hover:bg-muted/50 cursor-pointer">
                      <TableCell>
                        <div className="font-medium text-[#111827]">{tx.desc}</div>
                        <div className="text-xs text-muted-foreground">{tx.date} • {tx.type}</div>
                      </TableCell>
                      <TableCell className={`text-right font-medium ${tx.amount > 0 ? "text-[#111827]" : "text-muted-foreground"}`}>
                        {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {getStatusBadge(tx.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
