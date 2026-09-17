import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/verified-activity')({
  component: VerifiedActivity,
})

function VerifiedActivity() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Verified Activity</h1>
      <p className="text-muted-foreground mb-6">A trust-focused view — shows only activity that has evidence attached.</p>
      
      <div className="mb-6 p-4 border rounded-lg bg-blue-50/50 dark:bg-blue-950/20">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium text-sm">Verification Progress (This Month)</span>
          <span className="font-bold text-blue-600">68%</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2.5">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '68%' }}></div>
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-medium">Date</th>
              <th className="text-left p-3 font-medium">Evidence</th>
              <th className="text-left p-3 font-medium">Type</th>
              <th className="text-right p-3 font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t hover:bg-muted/50 cursor-pointer">
              <td className="p-3">2026-09-17</td>
              <td className="p-3">
                <div className="w-10 h-10 bg-muted border flex items-center justify-center rounded overflow-hidden">
                  <span className="text-xs">🧾</span>
                </div>
              </td>
              <td className="p-3">Sale (Invoice #102)</td>
              <td className="p-3 text-right text-green-600">+$500.00</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
