import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ShieldCheck, ArrowRight, AlertTriangle, XCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { verifyPrescriptionFn, dispensePrescriptionFn } from '../services/prescriptions.service'
import { useRole } from '../components/RoleProvider'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/dispense')({
  component: DispenseRoute,
})

function DispenseRoute() {
  const router = useRouter()
  const { role } = useRole()
  const [code, setCode] = useState('')
  const [patientSearch, setPatientSearch] = useState("Patient 421")
  const patientId = 421;
  const pharmacistId = 38;
  
  const [step, setStep] = useState<'search' | 'verify' | 'invalid' | 'success'>('search')
  const [loading, setLoading] = useState(false)
  const [rxData, setRxData] = useState<any>(null)
  const [errorData, setErrorData] = useState<{message: string, reason_code: string} | null>(null)
  const [dispenseData, setDispenseData] = useState<any>(null)

  const formatMoney = (kobo: number) => {
    return '₦' + (kobo / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code) return
    setLoading(true)
    setErrorData(null)
    
    try {
      const data = await verifyPrescriptionFn({ code: code.toUpperCase(), patient_id: patientId, org_id: 23 })
      if (!data.valid) {
        setErrorData({ message: data.message || 'Prescription validation failed', reason_code: data.reason_code || 'UNKNOWN_ERROR' })
        setStep('invalid')
      } else {
        setRxData(data)
        setStep('verify')
      }
    } catch (err: any) {
      setErrorData({ message: err.message || 'Prescription validation failed', reason_code: err.reason_code || 'NETWORK_ERROR' })
      setStep('invalid')
    } finally {
      setLoading(false)
    }
  }

  const handleDispense = async () => {
    setLoading(true)
    try {
      const result = await dispensePrescriptionFn({ 
        code: code.toUpperCase(), 
        patient_id: patientId,
        org_id: 23,
        pharmacist_id: pharmacistId
      })
      setDispenseData(result)
      setStep('success')
      await router.invalidate() 
    } catch (err: any) {
      setErrorData({ message: err.message || 'Failed to dispense', reason_code: 'DISPENSE_ERROR' })
      setStep('invalid')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      {role === 'Pharmacy' && (
        <div className="bg-emerald-900 text-white p-4 rounded-xl mb-6 shadow-sm flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Wellcare Pharmacy, Ikeja</h2>
            <p className="text-emerald-200 text-sm">Pharmacist Portal • Pharm. Tobi Ade</p>
          </div>
          <ShieldCheck className="w-8 h-8 opacity-50" />
        </div>
      )}
      
      <PageHeader 
        title="Verify & Dispense" 
        description="Verify a secure prescription code to dispense medication and automatically update stock." 
      />
      
      <div className="max-w-2xl">
        {step === 'search' && (
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle>Lookup Prescription</CardTitle>
              <CardDescription>
                Ask the patient for their 6-character secure code.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="patientSearch">Patient</Label>
                  <Input 
                    id="patientSearch" 
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    placeholder="Search patient..." 
                  />
                  <p className="text-xs text-muted-foreground">Selected: Patient ID {patientId}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code" className="text-lg">Secure Code</Label>
                  <Input 
                    id="code" 
                    name="code" 
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. RX-A1B2C3" 
                    className="text-3xl tracking-widest font-mono h-16 uppercase placeholder:text-muted/50" 
                    required 
                    maxLength={10}
                  />
                </div>
                
                <Button type="submit" className="w-full gap-2 h-14 text-lg" disabled={loading || !code}>
                  <ShieldCheck className="w-5 h-5" /> 
                  {loading ? 'Verifying on Ledger...' : 'Verify Cryptographic Code'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 'invalid' && errorData && (
          <Card className="border-red-200 shadow-sm bg-red-50 dark:bg-red-950/20">
            <CardContent className="pt-8 flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-red-700 dark:text-red-400">Verification Failed</h3>
                <p className="text-red-600 dark:text-red-300 font-medium text-lg max-w-md">
                  {errorData.message}
                </p>
              </div>
              <Badge variant="outline" className="text-red-500 border-red-200 bg-white dark:bg-red-950 font-mono">
                {errorData.reason_code}
              </Badge>
              <Button onClick={() => setStep('search')} variant="outline" className="w-full mt-4">
                Try Another Code
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'verify' && rxData && (
          <Card className="border-border shadow-sm">
            <CardHeader className="bg-muted/30 border-b pb-6">
              <div className="flex justify-between items-start mb-2">
                <Badge className="bg-blue-100 text-blue-700 border-none px-3 py-1">Valid Prescription</Badge>
                <span className="font-mono text-muted-foreground">{rxData.prescription.code}</span>
              </div>
              <CardTitle className="text-2xl">{rxData.prescription.patient?.name || `Patient #${patientId}`}</CardTitle>
              <div className="mt-4 p-4 bg-white dark:bg-card border-l-4 border-primary shadow-sm rounded-r-lg">
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-bold mb-1">Independence Claim</p>
                <p className="text-lg font-medium text-foreground">
                  Issued by {rxData.prescription.prescriber?.name || 'Dr Maximum Alex'} · <span className="text-primary font-bold">Grace Medical Centre</span>
                </p>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              
              {!rxData.stock_ok && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 rounded-lg flex gap-3 items-start">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-amber-800 dark:text-amber-400">Insufficient Stock</h4>
                    <ul className="list-disc pl-4 mt-1 text-sm text-amber-700 dark:text-amber-300">
                      {rxData.stock_warnings?.map((w: string, i: number) => <li key={i}>{w}</li>)}
                      {(!rxData.stock_warnings || rxData.stock_warnings.length === 0) && (
                        <li>One or more items do not have enough stock to fulfill this prescription.</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}

              <div className="space-y-4 border rounded-xl overflow-hidden">
                <div className="bg-muted px-4 py-2 grid grid-cols-12 gap-2 text-xs font-bold text-muted-foreground uppercase">
                  <div className="col-span-6">Medication</div>
                  <div className="col-span-2 text-center">Qty</div>
                  <div className="col-span-4 text-right">Line Total</div>
                </div>
                <div className="divide-y">
                  {rxData.prescription.items.map((item: any, idx: number) => (
                    <div key={idx} className="px-4 py-3 grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-6">
                        <div className="font-bold">{item.drug_name}</div>
                        <div className="text-sm text-muted-foreground">{item.dose} · {item.frequency_per_day}x/day for {item.days} days</div>
                      </div>
                      <div className="col-span-2 text-center font-mono font-medium">
                        {item.quantity}
                      </div>
                      <div className="col-span-4 text-right font-medium">
                        {formatMoney(item.line_total)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-muted/30 px-4 py-4 border-t flex justify-between items-center">
                  <span className="font-bold text-muted-foreground">Total (Kobo: {rxData.prescription.total})</span>
                  <span className="text-2xl font-black text-primary">{formatMoney(rxData.prescription.total)}</span>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setStep('search')}>
                  Cancel
                </Button>
                <Button 
                  className="flex-2 w-2/3 gap-2" 
                  onClick={handleDispense} 
                  disabled={loading || !rxData.stock_ok}
                >
                  <ArrowRight className="w-4 h-4" /> 
                  {loading ? 'Dispensing...' : 'Confirm & Dispense'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'success' && dispenseData && (
          <Card className="border-border shadow-sm border-green-500/50 bg-green-50/30 dark:bg-green-950/10">
            <CardContent className="pt-8 flex flex-col items-center text-center space-y-8">
              
              <div className="space-y-4 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-3xl font-bold text-foreground">Successfully Dispensed</h3>
                
                <div className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 px-6 py-2 rounded-full font-black text-lg tracking-wide border border-green-200 dark:border-green-800 flex items-center gap-2 shadow-sm">
                  <ShieldCheck className="w-5 h-5" /> 
                  Recorded as ATTESTED revenue
                </div>
              </div>

              <div className="w-full bg-background border rounded-xl p-6 shadow-inner text-left space-y-4">
                <div className="flex justify-between items-center border-b pb-4">
                  <span className="text-muted-foreground font-medium">Payment Ref</span>
                  <span className="font-mono font-bold text-lg">{dispenseData.payment_reference}</span>
                </div>
                
                <div className="pt-2">
                  <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Stock Movement Updates</h4>
                  <div className="space-y-3">
                    {dispenseData.stock_changes?.map((change: any, i: number) => (
                      <div key={i} className="flex justify-between items-center bg-muted/30 p-3 rounded-lg border">
                        <span className="font-medium">{change.drug_name}</span>
                        <div className="flex items-center gap-3 font-mono text-lg">
                          <span className="text-muted-foreground">{change.before}</span>
                          <ArrowRight className="w-4 h-4 text-primary" />
                          <span className="font-black text-primary">{change.after}</span>
                        </div>
                      </div>
                    ))}
                    {(!dispenseData.stock_changes || dispenseData.stock_changes.length === 0) && (
                      <div className="text-muted-foreground text-sm italic">Stock changes recorded on ledger.</div>
                    )}
                  </div>
                </div>
              </div>
              
              <Button size="lg" onClick={() => {
                setCode('')
                setStep('search')
              }} className="w-full">
                Verify Next Prescription
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
