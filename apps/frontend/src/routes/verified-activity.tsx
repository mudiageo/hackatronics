import { createFileRoute } from '@tanstack/react-router'
import { FileText, ArrowRight, CheckCircle2, Circle, ShieldCheck } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { getVerifiedActivity } from '../services/activity.service'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/verified-activity')({
  component: VerifiedActivity,
  loader: async () => await getVerifiedActivity(),
})

function VerifiedActivity() {
  const activities = Route.useLoaderData()

  return (
    <div className="flex-1 space-y-8 p-6 md:p-8">
      <PageHeader 
        title="Verified Activity" 
        description="A trust-focused view — shows only activity that has cryptographically verified evidence attached." 
      />
      
      <div className="max-w-4xl space-y-6">
        {activities.map((activity) => (
          <Card key={activity.id} className="overflow-hidden border-border shadow-sm">
            <div className="bg-muted/30 px-6 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-accent" />
                <span className="font-semibold text-foreground">{activity.type}</span>
                <span className="text-muted-foreground text-sm px-2 py-0.5 rounded-full bg-muted border border-border">
                  {activity.id}
                </span>
              </div>
              <div className="text-sm font-medium text-muted-foreground">
                {activity.timestamp}
              </div>
            </div>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{activity.description}</h3>
                  <div className="flex items-center gap-2 text-muted-foreground font-medium">
                    <span>{activity.partyA}</span>
                    <ArrowRight className="w-4 h-4" />
                    <span>{activity.partyB}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-foreground mb-1">${activity.amount.toFixed(2)}</div>
                  {activity.status === 'settled' ? (
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100/80 border-0">Fully Settled</Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100/80 border-0">In Progress</Badge>
                  )}
                </div>
              </div>

              {/* Progress Trail */}
              <div className="relative overflow-x-auto pb-4 -mx-6 px-6 sm:mx-0 sm:px-0 scrollbar-hide">
                <div className="min-w-[500px] relative">
                  <div className="absolute top-4 left-4 right-4 h-0.5 bg-muted z-0"></div>
                  <div 
                    className="absolute top-4 left-4 h-0.5 bg-accent z-0 transition-all duration-500"
                    style={{ 
                      width: `${
                        (activity.steps.filter(s => s.status === 'completed').length / (activity.steps.length - 1)) * 100
                      }%` 
                    }}
                  ></div>
                  
                  <div className="relative z-10 flex justify-between">
                    {activity.steps.map((step, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-2 relative">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 z-10 ${
                        step.status === 'completed' ? 'bg-accent border-accent text-accent-foreground' : 
                        step.status === 'current' ? 'bg-background border-accent text-accent' : 
                        'bg-background border-muted text-muted-foreground'
                      }`}>
                        {step.status === 'completed' ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Circle className={`w-3 h-3 ${step.status === 'current' ? 'fill-accent' : 'fill-muted-foreground'}`} />
                        )}
                      </div>
                      <div className="text-center w-24">
                        <div className={`text-sm font-bold ${
                          step.status === 'upcoming' ? 'text-muted-foreground' : 'text-foreground'
                        }`}>
                          {step.label}
                        </div>
                        {step.date && (
                          <div className="text-xs text-muted-foreground mt-0.5">{step.date}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
