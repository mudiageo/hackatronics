import { createFileRoute } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts'

export const Route = createFileRoute('/')({
  component: Dashboard,
})

// MOCK DATA for the Dashboard
const metricsSummary = {
  healthScore: 85,
  healthTier: 'Good',
  revenue: 24500,
  expenses: 12050,
  netCashFlow: 12450,
  verifiedPercentage: 68,
}

const recentActivity = [
  { id: 'tx-1', date: '2026-09-17', type: 'Sale', amount: 500, status: 'Verified' },
  { id: 'tx-2', date: '2026-09-16', type: 'Expense', amount: -120, status: 'Unverified' },
  { id: 'tx-3', date: '2026-09-15', type: 'Sale', amount: 1200, status: 'Verified' },
  { id: 'tx-4', date: '2026-09-14', type: 'Purchase', amount: -450, status: 'Verified' },
  { id: 'tx-5', date: '2026-09-12', type: 'Sale', amount: 300, status: 'Pending' },
]

const trendSeries = [
  { day: 'Mon', revenue: 4000, expenses: 2400 },
  { day: 'Tue', revenue: 3000, expenses: 1398 },
  { day: 'Wed', revenue: 2000, expenses: 9800 },
  { day: 'Thu', revenue: 2780, expenses: 3908 },
  { day: 'Fri', revenue: 1890, expenses: 4800 },
  { day: 'Sat', revenue: 2390, expenses: 3800 },
  { day: 'Sun', revenue: 3490, expenses: 4300 },
]

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: '#22c55e', // text-green-500
  },
  expenses: {
    label: 'Expenses',
    color: '#ef4444', // text-red-500
  },
} satisfies ChartConfig

function Dashboard() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Business Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline">Download Report</Button>
        </div>
      </div>

      {metricsSummary.verifiedPercentage < 80 && (
        <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-800 dark:text-blue-300">Boost your Financial Passport</h3>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Only {metricsSummary.verifiedPercentage}% of your recent activity is verified. Attach evidence to boost your score!
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Attach Evidence</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Health Score Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Business Health Score</CardTitle>
            <span className="text-2xl">❤️‍🔥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricsSummary.healthScore} / 100</div>
            <p className="text-xs text-muted-foreground mt-1">
              Status: <span className="text-green-600 font-semibold">{metricsSummary.healthTier}</span>
            </p>
          </CardContent>
        </Card>

        {/* Net Cash Flow Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
            <span className="text-2xl">💵</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metricsSummary.netCashFlow.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        {/* Revenue Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue (30d)</CardTitle>
            <span className="text-2xl">📈</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metricsSummary.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total incoming volume
            </p>
          </CardContent>
        </Card>

        {/* Verified Activity Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Activity</CardTitle>
            <span className="text-2xl">🛡️</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricsSummary.verifiedPercentage}%</div>
            <Progress value={metricsSummary.verifiedPercentage} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Cash Flow Trend</CardTitle>
            <CardDescription>Revenue and expenses over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
              <BarChart accessibilityLayer data={trendSeries}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis 
                  tickFormatter={(value) => `$${value}`} 
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="var(--color-expenses)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest transactions and verification status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivity.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <div className="font-medium">{tx.type}</div>
                      <div className="text-xs text-muted-foreground">{tx.date}</div>
                    </TableCell>
                    <TableCell className={tx.amount > 0 ? "text-green-600" : "text-red-600"}>
                      {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge 
                        variant={tx.status === 'Verified' ? 'default' : tx.status === 'Pending' ? 'secondary' : 'destructive'}
                        className={tx.status === 'Verified' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                      >
                        {tx.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
