import { createFileRoute, Link } from '@tanstack/react-router'
import { Download, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '../components/PageHeader'
import { toast } from 'sonner'
import { getPassportData } from '../services/passport.service'

export const Route = createFileRoute('/passport')({
  component: Passport,
  loader: async () => await getPassportData(),
})

import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts'
import { ChartContainer } from '@/components/ui/chart'

function TrustScoreCircle({ score }: { score: number }) {
  let strokeColor = "hsl(var(--primary))";
  if (score < 50) strokeColor = "hsl(var(--destructive))";
  else if (score < 80) strokeColor = "hsl(var(--alert) / 0.8)"; // or just a string color
  else strokeColor = "#22c55e"; // green-500

  const chartData = [{ name: "score", value: score, fill: strokeColor }]
  const chartConfig = { score: { label: "Trust Score", color: strokeColor } }

  return (
    <div className="relative flex items-center justify-center w-36 h-36 group">
      <ChartContainer config={chartConfig} className="w-full h-full absolute inset-0">
        <RadialBarChart
          data={chartData}
          innerRadius="75%"
          outerRadius="100%"
          startAngle={90}
          endAngle={-270}
          barSize={10}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar dataKey="value" cornerRadius={10} background={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} />
        </RadialBarChart>
      </ChartContainer>
      
      <div className="flex flex-col items-center justify-center relative z-10 bg-background rounded-full w-24 h-24 shadow-sm border border-border">
        <span className="text-3xl font-bold text-foreground group-hover:scale-110 transition-transform">{score}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">Trust</span>
      </div>
    </div>
  )
}

function Passport() {
  const passport = Route.useLoaderData()

  const handleExport = () => {
    toast.info('Generating PDF...', {
      description: 'Your financial passport is being prepared for print/export.'
    });
    setTimeout(() => {
      window.print();
    }, 500);
  }

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <PageHeader 
        title="Financial Passport" 
        description="An exportable, presentable summary of the business's verified financial history." 
        action={
          <Button className="flex gap-2 items-center" onClick={handleExport}>
            <Download className="w-4 h-4" /> Export PDF
          </Button>
        }
      />
      
      <div className="border rounded-lg p-6 bg-card max-w-3xl mx-auto shadow-sm">
        <div className="text-center mb-8 border-b pb-6">
          <h2 className="text-3xl font-bold">{passport.businessName}</h2>
          <p className="text-muted-foreground">{passport.industry}</p>
          <p className="text-sm mt-2">Coverage: {passport.coveragePeriod}</p>
        </div>
        
        <div className="flex flex-col items-center justify-center mb-10">
          <Link to="/verified-activity" className="hover:opacity-80 transition-opacity cursor-pointer" title="View Evidence Drill-down">
            <TrustScoreCircle score={passport.trustScore} />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 gap-6 mb-10">
          <Link to="/transactions" search={{ filter: 'attested' } as any} className="p-4 border rounded-lg text-center bg-muted/20 hover:bg-muted/50 transition-colors cursor-pointer block" title="View Verified Transactions">
            <p className="text-sm text-muted-foreground mb-1">Verified Transactions</p>
            <p className="text-2xl font-bold">{passport.verifiedTransactions}</p>
          </Link>
          <Link to="/verified-activity" className="p-4 border rounded-lg text-center bg-muted/20 hover:bg-muted/50 transition-colors cursor-pointer block" title="View Evidence Chain">
            <p className="text-sm text-muted-foreground mb-1">Evidence Documents</p>
            <p className="text-2xl font-bold">{passport.evidenceDocuments}</p>
          </Link>
        </div>
        
        <div className="mb-8">
          <h3 className="font-bold border-b pb-2 mb-4">Business Operating Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-4">
              <div className="p-4 bg-muted/20 border rounded-lg">
                <div className="text-sm text-muted-foreground">Total Verified Income</div>
                <div className="text-xl font-bold">₦{passport.totalIncome.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-1">Range: {passport.incomeRange}</div>
              </div>
              <div className="p-4 bg-muted/20 border rounded-lg">
                <div className="text-sm text-muted-foreground">Total Verified Expenses</div>
                <div className="text-xl font-bold">₦{passport.totalExpenses.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-1">Range: {passport.expenseRange}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-6 bg-muted/20 border rounded-lg h-full flex flex-col justify-center shadow-inner">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-5 h-5 text-accent" />
                  <h4 className="font-semibold text-foreground text-lg">Operational Status</h4>
                </div>
                <div className="inline-flex w-fit px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold mb-4">
                  {passport.operatingStatus}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {passport.operatingStatusDesc}
                </p>
                <div className="mt-6 pt-4 border-t border-border/50">
                  <div className="text-xs text-muted-foreground mb-1">Fixed Operational Cost</div>
                  <div className="font-semibold text-lg text-foreground">₦{passport.operationalCost.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">/ mo</span></div>
                </div>
              </div>
            </div>
            
          </div>
        </div>

        <div className="mt-10">
          <h3 className="font-bold border-b pb-2 mb-4">Timeline Milestones</h3>
          <ul className="space-y-4">
            {passport.milestones.map((milestone) => (
              <li key={milestone.id} className="flex gap-4">
                <div className="w-2 h-2 mt-2 rounded-full bg-accent shrink-0"></div>
                <div>
                  <p className="font-medium text-foreground">{milestone.title}</p>
                  <p className="text-sm text-muted-foreground">{milestone.date}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  )
}
