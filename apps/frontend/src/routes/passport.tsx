import { createFileRoute, Link } from '@tanstack/react-router'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '../components/PageHeader'
import { toast } from 'sonner'
import { getPassportData } from '../services/passport.service'

export const Route = createFileRoute('/passport')({
  component: Passport,
  loader: async () => await getPassportData(),
})

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
        
        <div className="flex flex-col items-center justify-center mb-8">
          <Link to="/verified-activity" className="w-32 h-32 rounded-full border-4 border-green-500 flex flex-col items-center justify-center hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors cursor-pointer group" title="View Evidence Drill-down">
            <span className="text-4xl font-bold text-green-600 group-hover:scale-110 transition-transform">{passport.trustScore}</span>
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground mt-1">Trust Score</span>
          </Link>
        </div>
        
        <div className="grid grid-cols-2 gap-6 mb-8">
          <Link to="/transactions" search={{ filter: 'attested' } as any} className="p-4 border rounded-lg text-center bg-muted/20 hover:bg-muted/50 transition-colors cursor-pointer block" title="View Verified Transactions">
            <p className="text-sm text-muted-foreground mb-1">Verified Transactions</p>
            <p className="text-2xl font-bold">{passport.verifiedTransactions}</p>
          </Link>
          <Link to="/verified-activity" className="p-4 border rounded-lg text-center bg-muted/20 hover:bg-muted/50 transition-colors cursor-pointer block" title="View Evidence Chain">
            <p className="text-sm text-muted-foreground mb-1">Evidence Documents</p>
            <p className="text-2xl font-bold">{passport.evidenceDocuments}</p>
          </Link>
        </div>
        
        <div>
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
