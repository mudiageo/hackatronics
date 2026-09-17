import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, TrendingDown, Activity, Banknote, ArrowRight, CheckCircle2, Circle, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getDashboardData } from "../services/dashboard.service"
import { PageHeader } from "../components/PageHeader"

import { BarChart, Bar, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

export const Route = createFileRoute('/')({
  component: Dashboard,
  loader: async () => {
    return await getDashboardData()
  }
})

function getStatusBadge(status: string) {
  switch (status) {
    case 'attested':
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100/80 border-0 flex items-center gap-1 w-fit ml-auto"><CheckCircle2 className="w-3 h-3" /> Attested</Badge>
    case 'settled':
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100/80 border-0 flex items-center gap-1 w-fit ml-auto"><CheckCircle className="w-3 h-3" /> Settled</Badge>
    default:
      return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100/80 border-0 flex items-center gap-1 w-fit ml-auto"><Circle className="w-3 h-3" /> Recorded</Badge>
  }
}

function Dashboard() {
  const { metricsSummary, coverage, recentActivity } = Route.useLoaderData()

  const coverageData = [
    {
      name: "Coverage",
      attested: coverage.attested,
      settledOnly: coverage.settled - coverage.attested,
      recordedOnly: 100 - coverage.settled,
    }
  ]

  const coverageConfig = {
    attested: { label: "Attested", color: "#16a34a" },
    settledOnly: { label: "Settled", color: "hsl(var(--accent))" },
    recordedOnly: { label: "Recorded", color: "#d1d5db" },
  }

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <PageHeader 
        title="Business Health" 
        description="Monitor the financial and operational health of the business based on verified data." 
      />

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
        {/* Revenue Card */}
        <Card className="rounded-2xl shadow-sm border-border overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl xl:text-3xl font-bold text-foreground truncate" title={`₦${metricsSummary.revenue.toLocaleString()}`}>₦{metricsSummary.revenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        {/* Expenses Card */}
        <Card className="rounded-2xl shadow-sm border-border overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expenses</CardTitle>
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl xl:text-3xl font-bold text-foreground truncate" title={`₦${metricsSummary.expenses.toLocaleString()}`}>₦{metricsSummary.expenses.toLocaleString()}</div>
          </CardContent>
        </Card>

        {/* Profit Card */}
        <Card className="rounded-2xl shadow-sm border-border overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Profit</CardTitle>
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <Activity className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl xl:text-3xl font-bold text-foreground truncate" title={`₦${metricsSummary.profit.toLocaleString()}`}>₦{metricsSummary.profit.toLocaleString()}</div>
          </CardContent>
        </Card>

        {/* Cash Position Hero Card (Dark Navy) */}
        <Card className="rounded-2xl shadow-sm bg-primary text-primary-foreground border-transparent overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary-foreground/80">Cash Position</CardTitle>
            <Banknote className="h-4 w-4 text-primary-foreground/80 shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl xl:text-3xl font-bold truncate" title={`₦${metricsSummary.cashPosition.toLocaleString()}`}>₦{metricsSummary.cashPosition.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 space-y-6">
          {/* Coverage Bar & Health Explanation */}
          <Card className="rounded-2xl shadow-sm border-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Financial Coverage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Nested Horizontal Bar */}
              <div className="h-8 w-full rounded-full overflow-hidden">
                <ChartContainer config={coverageConfig} className="h-full w-full">
                  <BarChart data={coverageData} layout="vertical" stackOffset="expand">
                    <XAxis type="number" hide domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" hide />
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Bar dataKey="attested" stackId="a" fill="var(--color-attested)" />
                    <Bar dataKey="settledOnly" stackId="a" fill="var(--color-settledOnly)" />
                    <Bar dataKey="recordedOnly" stackId="a" fill="var(--color-recordedOnly)" />
                  </BarChart>
                </ChartContainer>
              </div>
              <div className="flex flex-wrap gap-2 text-sm font-medium text-muted-foreground items-center">
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#d1d5db]"></div> 100% Recorded</div>
                <ArrowRight className="w-3 h-3 text-muted-foreground/50" />
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-accent"></div> {coverage.settled}% Settled</div>
                <ArrowRight className="w-3 h-3 text-muted-foreground/50" />
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-600"></div> {coverage.attested}% Attested</div>
              </div>
              
              {/* Health Explanation */}
              <div className="p-4 bg-muted/50 rounded-lg text-sm text-foreground leading-relaxed">
                Your business health is <strong>strong</strong>. {coverage.attested}% of your total recorded financial volume has been fully attested by verified evidence, giving you a high trust score with lending partners. 
                <a href="/verified-activity" className="text-accent font-medium flex items-center gap-1 mt-2 hover:underline">
                  View evidence trail <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-3">
          {/* Recent Activity */}
          <Card className="rounded-2xl shadow-sm border-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentActivity.map((tx) => (
                    <TableRow key={tx.id} className="border-border hover:bg-muted/50 cursor-pointer">
                      <TableCell>
                        <div className="font-medium text-foreground">{tx.desc}</div>
                        <div className="text-xs text-muted-foreground">{tx.date} • {tx.type}</div>
                      </TableCell>
                      <TableCell className={`text-right font-medium ${tx.amount > 0 ? "text-foreground" : "text-muted-foreground"}`}>
                        {tx.amount > 0 ? '+' : ''}₦{Math.abs(tx.amount)}
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
