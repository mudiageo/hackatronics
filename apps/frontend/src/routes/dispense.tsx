import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Search, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { verifyPrescriptionFn, dispensePrescriptionFn } from '../services/prescriptions.service'

export const Route = createFileRoute('/dispense')({
  component: DispenseRoute,
})

function DispenseRoute() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'search' | 'verify' | 'success'>('search')
  const [loading, setLoading] = useState(false)
  const [rxData, setRxData] = useState<any>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code) return
    setLoading(true)
    
    try {
      const data = await verifyPrescriptionFn({ code })
      setRxData(data)
      setStep('verify')
      toast.success('Prescription found and verified!')
    } catch (err: any) {
      toast.error(err.message || 'Invalid prescription code')
    } finally {
      setLoading(false)
    }
  }

  const handleDispense = async () => {
    setLoading(true)
    try {
      await dispensePrescriptionFn({ code })
      setStep('success')
      toast.success('Medication dispensed and inventory updated')
      await router.invalidate() // Refresh inventory/transactions
    } catch (err: any) {
      toast.error(err.message || 'Failed to dispense')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <PageHeader 
        title="Verify & Dispense" 
        description="Verify a secure prescription code to dispense medication and update stock." 
      />
      
      <div className="max-w-2xl">
        {step === 'search' && (
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle>Enter Prescription Code</CardTitle>
              <CardDescription>
                Ask the patient for their 6-character secure code (e.g., RX-A1B2C3).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 absolute left-3 top-2.5 text-muted-foreground" />
                  <Input 
                    placeholder="RX-..." 
                    className="pl-10 text-lg uppercase tracking-wider font-mono"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" size="lg" disabled={loading} className="w-32">
                  {loading ? 'Verifying...' : 'Verify'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 'verify' && rxData && (
          <Card className="border-border shadow-sm border-primary/20">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <ShieldCheck className="w-5 h-5" />
                Valid Prescription
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-2 gap-y-6">
                <div>
                  <div className="text-sm text-muted-foreground">Patient Name</div>
                  <div className="font-semibold text-lg">{rxData.patientName}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Code</div>
                  <div className="font-mono font-bold text-lg">{rxData.id}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm text-muted-foreground">Medication to Dispense</div>
                  <div className="font-semibold text-xl text-primary bg-primary/10 p-4 rounded-lg mt-2 flex items-center justify-between">
                    <span>{rxData.medication}</span>
                    <span className="bg-primary text-primary-foreground text-sm px-3 py-1 rounded-full">
                      Qty: {rxData.quantity}
                    </span>
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm text-muted-foreground">Clinical Notes</div>
                  <div className="italic text-foreground mt-1">{rxData.notes || 'None'}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div className="font-semibold text-foreground mt-1 uppercase">{rxData.status}</div>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <Button variant="outline" className="flex-1" onClick={() => setStep('search')}>
                  Cancel
                </Button>
                <Button 
                  className="flex-1 gap-2" 
                  onClick={handleDispense} 
                  disabled={loading || rxData.status === 'dispensed'}
                >
                  {loading ? 'Dispensing...' : 'Dispense Medication'} <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'success' && (
           <Card className="border-border shadow-sm border-green-500/50 bg-green-500/5">
           <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
             <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
               <CheckCircle2 className="w-8 h-8 text-green-600" />
             </div>
             
             <div className="space-y-2">
               <h3 className="text-2xl font-bold">Successfully Dispensed</h3>
               <p className="text-muted-foreground max-w-md mx-auto">
                 The medication has been logged as dispensed, inventory has been reduced, and a settled transaction has been recorded.
               </p>
             </div>

             <Button variant="outline" className="mt-4" onClick={() => {
               setCode('')
               setStep('search')
               setRxData(null)
             }}>
               Verify Another Code
             </Button>
           </CardContent>
         </Card>
        )}
      </div>
    </div>
  )
}
