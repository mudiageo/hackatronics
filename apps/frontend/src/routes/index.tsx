import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Dashboard,
})

function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard / Business Health</h1>
      <p>Answers "how is my business doing right now?"</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="p-4 border rounded-lg bg-card">
          <h3 className="text-sm font-medium text-muted-foreground">Business Health Score</h3>
          <p className="text-3xl font-bold text-green-600">85 / 100</p>
          <p className="text-xs text-muted-foreground">Status: Good</p>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <h3 className="text-sm font-medium text-muted-foreground">Net Cash Flow</h3>
          <p className="text-3xl font-bold">$12,450</p>
          <p className="text-xs text-muted-foreground">Last 30 days</p>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <h3 className="text-sm font-medium text-muted-foreground">Verified Activity</h3>
          <p className="text-3xl font-bold text-blue-600">68%</p>
          <p className="text-xs text-muted-foreground">Attach evidence to boost</p>
        </div>
      </div>
    </div>
  )
}
