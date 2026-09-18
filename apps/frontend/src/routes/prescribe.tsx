import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FileText, Copy, CheckCircle2, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { generatePrescriptionFn, searchPatientsFn, listDrugsFn } from '../services/prescriptions.service'
import { useEffect, useCallback } from 'react'
import { useRole } from '../components/RoleProvider'

export const Route = createFileRoute('/prescribe')({
  component: PrescribeRoute,
})

function PrescribeRoute() {
  const router = useRouter()
  const { role } = useRole()
  const [generatedRx, setGeneratedRx] = useState<any | null>(null)
  const [patientSearch, setPatientSearch] = useState("Patient 421")
  const [patientId, setPatientId] = useState(421)
  
  const [patients, setPatients] = useState<any[]>([])
  const [drugs, setDrugs] = useState<any[]>([])
  
  useEffect(() => {
    listDrugsFn().then(d => setDrugs(d.items || [])).catch(() => {})
  }, [])
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (patientSearch.length > 1) {
        searchPatientsFn({ data: patientSearch }).then(d => setPatients(d.items || [])).catch(() => {})
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [patientSearch])

  const [loading, setLoading] = useState(false)
  
  // Simulated Typeaheads
  
  
  
  const [items, setItems] = useState([
    { drugId: 57, drugName: "Drug 57", dose: "500mg", frequency: 3, days: 7, unitPriceKobo: 150000 }
  ])

  const formatMoney = (kobo: number) => {
    return '₦' + (kobo / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const addItem = () => {
    setItems([...items, { drugId: 0, drugName: "", dose: "", frequency: 1, days: 1, unitPriceKobo: 0 }])
  }
  
  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx))
  }

  const updateItem = (idx: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[idx] = { ...newItems[idx], [field]: value }
    setItems(newItems)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const rx = await generatePrescriptionFn({ data: {
        patient_id: patientId,
        prescriber_id: 36, // Dr Maximum Alex
        items: items.map(item => ({
          drug_id: item.drugId,
          dose: item.dose,
          frequency_per_day: item.frequency,
          days: item.days,
        }))
      } })
      
      setGeneratedRx(rx)
      toast.success('Prescription generated successfully')
      await router.invalidate()
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate prescription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      {role === 'Clinic' && (
        <div className="bg-blue-900 text-white p-4 rounded-xl mb-6 shadow-sm flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Grace Medical Centre</h2>
            <p className="text-blue-200 text-sm">Prescriber Portal • Dr Maximum Alex</p>
          </div>
          <FileText className="w-8 h-8 opacity-50" />
        </div>
      )}
      
      <PageHeader 
        title="New Prescription" 
        description="Generate a secure, verifiable prescription code for a patient." 
      />
      
      <div className="max-w-3xl">
        {!generatedRx ? (
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle>Prescription Details</CardTitle>
              <CardDescription>
                Search for a patient and add medication items.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                
                <div className="space-y-2">
                  <Label htmlFor="patientSearch">Patient</Label>
                  
                  <div className="relative">
                    <Input 
                      id="patientSearch" 
                      value={patientSearch}
                      onChange={(e) => {
                        setPatientSearch(e.target.value)
                        setPatientId(0) // reset until selected
                      }}
                      placeholder="Search patient by name or phone..." 
                      className="max-w-md"
                    />
                    {patients.length > 0 && !patientId && (
                      <div className="absolute z-10 w-full max-w-md bg-popover text-popover-foreground border rounded-md mt-1 shadow-md">
                        {patients.map(p => (
                          <div 
                            key={p.id} 
                            className="px-4 py-2 hover:bg-muted cursor-pointer text-sm"
                            onClick={() => {
                              setPatientId(p.id)
                              setPatientSearch(p.name)
                              setPatients([])
                            }}
                          >
                            <span className="font-semibold">{p.name}</span> <span className="text-muted-foreground ml-2">{p.phone}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground">Selected: Patient ID {patientId}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">Medication Items</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-2">
                      <Plus className="w-4 h-4" /> Add Drug
                    </Button>
                  </div>
                  
                  {items.map((item, idx) => (
                    <div key={idx} className="p-4 border rounded-xl bg-muted/20 space-y-4 relative">
                      {items.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500" onClick={() => removeItem(idx)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Drug Search</Label>
                          
                          <select 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={item.drugId}
                            onChange={(e) => {
                              const d = drugs.find(d => d.id === parseInt(e.target.value))
                              if (d) {
                                updateItem(idx, 'drugId', d.id)
                                updateItem(idx, 'drugName', d.name)
                                updateItem(idx, 'unitPriceKobo', d.unit_price)
                              }
                            }}
                          >
                            <option value={57}>Select Drug...</option>
                            {drugs.map(d => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                          </select>

                          <p className="text-xs text-muted-foreground">ID: {item.drugId} • Unit Price: {formatMoney(item.unitPriceKobo)}</p>
                        </div>
                        <div className="space-y-2">
                          <Label>Dose</Label>
                          <Input value={item.dose} onChange={(e) => updateItem(idx, 'dose', e.target.value)} placeholder="e.g. 500mg" required />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 items-end">
                        <div className="space-y-2">
                          <Label>Freq / Day</Label>
                          <Input type="number" min="1" value={item.frequency} onChange={(e) => updateItem(idx, 'frequency', parseInt(e.target.value)||0)} required />
                        </div>
                        <div className="space-y-2">
                          <Label>Days</Label>
                          <Input type="number" min="1" value={item.days} onChange={(e) => updateItem(idx, 'days', parseInt(e.target.value)||0)} required />
                        </div>
                        <div className="p-3 bg-muted rounded-lg text-center border">
                          <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Total Quantity</div>
                          <div className="font-mono font-bold text-foreground">
                            {item.frequency} × {item.days} = <span className="text-primary text-lg">{item.frequency * item.days} units</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-end pt-2 border-t">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Estimated Total (Before Markup)</div>
                      <div className="text-2xl font-bold text-foreground">
                        {formatMoney(items.reduce((acc, item) => acc + (item.frequency * item.days * item.unitPriceKobo), 0))}
                      </div>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full gap-2 text-lg h-12" disabled={loading}>
                  <FileText className="w-5 h-5" /> 
                  {loading ? 'Generating...' : 'Sign & Generate Prescription'}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border shadow-sm border-primary/50 bg-primary/5">
            <CardContent className="pt-8 flex flex-col items-center text-center space-y-8">
              
              <div className="space-y-3">
                <h3 className="text-3xl font-bold text-foreground">Prescription Ready</h3>
                <p className="text-muted-foreground">
                  Give this code to the patient. Valid at any participating pharmacy.
                </p>
              </div>

              <div className="bg-background border-4 border-primary p-8 rounded-2xl w-full max-w-md shadow-lg flex flex-col items-center gap-6">
                <div className="text-6xl sm:text-7xl font-mono font-black tracking-widest text-primary drop-shadow-sm">
                  {generatedRx.code}
                </div>
                <Button variant="outline" size="lg" onClick={() => {
                  navigator.clipboard.writeText(generatedRx.code)
                  toast.success('Code copied to clipboard')
                }} className="gap-2 w-full">
                  <Copy className="w-5 h-5" /> Copy Code
                </Button>
              </div>
              
              <div className="w-full max-w-md text-left space-y-4 bg-background p-6 rounded-xl border shadow-sm">
                <div className="flex justify-between border-b pb-3">
                  <span className="text-muted-foreground">Patient</span>
                  <span className="font-bold">{generatedRx.patient?.name || `Patient #${patientId}`}</span>
                </div>
                <div className="flex justify-between border-b pb-3">
                  <span className="text-muted-foreground">Prescriber</span>
                  <span className="font-bold text-primary">Dr Maximum Alex (Grace Medical Centre)</span>
                </div>
                <div className="flex justify-between border-b pb-3">
                  <span className="text-muted-foreground">Expires</span>
                  <span className="font-medium">{new Date(generatedRx.expires_at || Date.now() + 86400000).toLocaleDateString()}</span>
                </div>
                
                <div className="pt-2 space-y-3">
                  <span className="text-muted-foreground text-sm uppercase font-bold tracking-wider">Items</span>
                  {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{item.drugName} ({item.dose})</span>
                      <span className="font-mono">{item.frequency * item.days} units</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button size="lg" variant="secondary" onClick={() => setGeneratedRx(null)} className="w-full max-w-md h-12">
                Start New Prescription
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
