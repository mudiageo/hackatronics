import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Search, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/dispense')({
  component: DispenseRoute,
})

function DispenseRoute() {
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'search' | 'verify' | 'success'>('search')
  const [loading, setLoading] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStep('verify')
      toast.success('Prescription found and verified!')
    }, 1000)
  }

  const handleDispense = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStep('success')
      toast.success('Medication dispensed and inventory updated')
    }, 1000)
  }

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <PageHeader 
        title="Verify & Dispense" 
        description="Verify a secure prescription code to dispense medication and update stock." 
      />

      <div className="max-w-2xl mx-auto">
        {step === 'search' && (
          <Card className="shadow-sm border-border">
            <CardHeader>
              <CardTitle>Verify Secure Code</CardTitle>
              <CardDescription>Enter the RX code provided by the patient.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="rxcode">Secure RX Code</Label>
                  <div className="flex gap-4">
                    <Input 
                      id="rxcode" 
                      placeholder="e.g. RX-A1B2C3" 
                      className="font-mono text-lg uppercase"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      required 
                    />
                    <Button type="submit" disabled={loading || !code}>
                      {loading ? 'Verifying...' : <><Search className="w-4 h-4 mr-2" /> Lookup</>}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 'verify' && (
          <Card className="shadow-sm border-border border-2 border-accent">
            <CardHeader className="bg-accent/10 border-b pb-4">
              <div className="flex items-center gap-2 text-accent">
                <ShieldCheck className="w-5 h-5" />
                <CardTitle>Cryptographically Verified</CardTitle>
              </div>
              <CardDescription className="pt-2">This prescription is authentic and has not been altered.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Medication</div>
                  <div className="font-semibold text-lg">Amoxicillin 500mg</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Quantity</div>
                  <div className="font-semibold text-lg">30 tablets</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Patient</div>
                  <div className="font-semibold">John Doe</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Prescribing Clinic</div>
                  <div className="font-semibold">City General Hospital</div>
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-4">
                <Button variant="outline" onClick={() => setStep('search')}>Cancel</Button>
                <Button onClick={handleDispense} disabled={loading} className="gap-2">
                  {loading ? 'Processing...' : <><CheckCircle2 className="w-4 h-4" /> Dispense Medication</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'success' && (
          <Card className="shadow-sm border-border text-center py-8">
            <CardContent className="space-y-6">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Successfully Dispensed</h3>
                <p className="text-muted-foreground mt-2">The medication has been dispensed. Inventory has been automatically reduced, and the settlement evidence has been recorded.</p>
              </div>
              
              <Button onClick={() => { setStep('search'); setCode(''); }}>Process Next Prescription</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
