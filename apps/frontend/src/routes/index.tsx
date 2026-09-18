import { Sparkles } from "lucide-react";
import { analyzeBusinessFn } from "../services/ai.service";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "../components/ui/sheet";

import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, TrendingDown, Activity, Banknote, ArrowRight, CheckCircle2, Circle, CheckCircle, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getDashboardData } from "../services/dashboard.service"
import { PageHeader } from "../components/PageHeader"

import { CoverageChart } from '../components/CoverageChart'

export const Route = createFileRoute('/')({
  component: Dashboard,
  loader: async () => {
    return await getDashboardData()
  }
})

function getStatusBadge(status: string) {
  switch (status) {
    case 'attested':
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100/80 border-0 flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3" /> Attested</Badge>
    case 'settled':
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100/80 border-0 flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3" /> Settled</Badge>
    default:
      return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100/80 border-0 flex items-center gap-1 w-fit"><Circle className="w-3 h-3" /> Self-Reported</Badge>
  }
}

export const formatMoney = (kobo: number) => { return '₦' + (kobo / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }
function Dashboard() {
  const { metricsSummary, coverage, recentActivity } = Route.useLoaderData()
  const [analysis, setAnalysis] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    try {
      const data = await analyzeBusinessFn()
      setAnalysis(data)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const coverageData = [
    {
      name: "Coverage",
      recorded: 100, // Background
      settled: coverage.settled,
      attested: coverage.attested,
    }
  ]

  const coverageConfig = {
    recorded: { label: "Self-Reported", color: "#e5e7eb" },
    settled: { label: "Settled", color: "#3b82f6" },
    attested: { label: "Attested", color: "#22c55e" },
  }

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <div className="flex justify-between items-start">
        <PageHeader 
          title="Business Health" 
          description="Monitor the financial and operational health of the business based on verified data." 
        />
        <Sheet>
          <SheetTrigger asChild>
            <Button onClick={handleAnalyze} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
              <Sparkles className="w-4 h-4" /> Ask AI Analyst
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:w-[540px] overflow-y-auto border-l-border bg-card">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" /> Executive Summary
              </SheetTitle>
              <SheetDescription>
                AI-generated analysis of this month's performance.
              </SheetDescription>
            </SheetHeader>
            
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Sparkles className="w-8 h-8 text-indigo-400 animate-spin" />
                <p className="text-muted-foreground animate-pulse">Analyzing transactions and stock levels...</p>
              </div>
            ) : analysis ? (
              <div className="space-y-6">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900">
                  <p className="text-sm leading-relaxed text-indigo-900 dark:text-indigo-200">{analysis.summary}</p>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Key Metrics</h3>
                  {analysis.metrics.map((m: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-3 border rounded-lg">
                      <span className="text-sm font-medium">{m.label}</span>
                      <span className={`text-sm font-bold ${m.positive ? 'text-green-600' : 'text-red-600'}`}>{m.value}</span>
                    </div>
                  ))}
                </div>
                
                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-100 dark:border-amber-900">
                  <h3 className="font-semibold text-sm text-amber-900 dark:text-amber-200 mb-2">Recommendation</h3>
                  <p className="text-sm text-amber-800 dark:text-amber-300">{analysis.recommendation}</p>
                </div>
              </div>
            ) : null}
          </SheetContent>
        </Sheet>
      </div>
      
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
            <div className="text-2xl xl:text-3xl font-bold text-foreground truncate" title={`₦${metricsSummary.revenue.toLocaleString()}`}>{formatMoney(metricsSummary.revenue)}</div>
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
            <div className="text-2xl xl:text-3xl font-bold text-foreground truncate" title={`₦${metricsSummary.expenses.toLocaleString()}`}>{formatMoney(metricsSummary.expenses)}</div>
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
            <div className="text-2xl xl:text-3xl font-bold text-foreground truncate" title={`₦${metricsSummary.profit.toLocaleString()}`}>{formatMoney(metricsSummary.profit)}</div>
          </CardContent>
        </Card>

        {/* Cash Position Hero Card (Dark Navy) */}
        <Card className="rounded-2xl shadow-sm bg-primary text-primary-foreground border-transparent overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary-foreground/80">Cash Position</CardTitle>
            <Banknote className="h-4 w-4 text-primary-foreground/80 shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl xl:text-3xl font-bold truncate" title={`₦${metricsSummary.cashPosition.toLocaleString()}`}>{formatMoney(metricsSummary.cashPosition)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4 space-y-6 min-w-0">
          {/* Coverage Bar & Health Explanation */}
          <Card className="rounded-2xl shadow-sm border-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Financial Coverage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Nested Horizontal Bar using Custom Recharts Shape */}
              <div className="flex items-center gap-4">
                <div className="h-10 flex-1 relative">
                  <CoverageChart coverageData={coverageData} coverageConfig={coverageConfig} />
                </div>
                <div className="text-sm font-bold">100%</div>
              </div>
              
              <div className="flex flex-wrap gap-6 text-sm font-medium text-foreground items-center">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-200"></div> 100% Self-Reported</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div> {coverage.settled}% Settled</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div> {coverage.attested}% Attested</div>
              </div>
              
              {/* Health Explanation Alert */}
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border border-muted/50 text-sm text-foreground leading-relaxed mt-2 justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100/50 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    {coverage.attested}% of your recorded financial volume is fully attested, 
                    with {coverage.settled}% supported by settlement evidence.
                  </div>
                </div>
                <Link to="/verified-activity">
                  <Button variant="outline" size="sm" className="shrink-0 gap-2">
                    View Evidence
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 min-w-0">
          {/* Recent Activity */}
          <Card className="rounded-2xl shadow-sm border-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="min-w-[400px]">
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
                        {tx.amount > 0 ? '+' : ''}{formatMoney(Math.abs(tx.amount))}
                      </TableCell>
                      <TableCell className="text-right">
                        {getStatusBadge(tx.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
