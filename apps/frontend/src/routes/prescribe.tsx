import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FileText, Copy, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { generatePrescriptionFn } from '../services/prescriptions.service'

export const Route = createFileRoute('/prescribe')({
  component: PrescribeRoute,
})

function PrescribeRoute() {
  const router = useRouter()
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    
    try {
      const rx = await generatePrescriptionFn({
        patient_id: parseInt(formData.get('patientId') as string, 10),
        prescriber_id: 36, // Hardcoded doctor ID
        items: [
          {
            drug_id: parseInt(formData.get('drugId') as string, 10),
            dose: formData.get('dose') as string,
            frequency_per_day: parseInt(formData.get('frequency') as string, 10),
            days: parseInt(formData.get('days') as string, 10),
          }
        ]
      })
      
      setGeneratedCode(rx.code)
      toast.success('Prescription generated successfully')
      
      await router.invalidate()
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate prescription')
    } finally {
      setLoading(false)
    }
  }

  const copyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode)
      toast.success('Code copied to clipboard')
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <PageHeader 
        title="New Prescription" 
        description="Generate a secure, verifiable prescription code for a patient." 
      />
      
      <div className="max-w-2xl">
        {!generatedCode ? (
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle>Prescription Details</CardTitle>
              <CardDescription>
                Enter the medication details below. A unique cryptographic code will be generated.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="patientId">Patient ID</Label>
                    <Input id="patientId" name="patientId" type="number" defaultValue="421" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="drugId">Drug ID</Label>
                    <Input id="drugId" name="drugId" type="number" defaultValue="57" required />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dose">Dose</Label>
                    <Input id="dose" name="dose" placeholder="500mg" defaultValue="500mg" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Freq / Day</Label>
                    <Input id="frequency" name="frequency" type="number" defaultValue="3" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="days">Days</Label>
                    <Input id="days" name="days" type="number" defaultValue="7" required />
                  </div>
                </div>

                <Button type="submit" className="w-full gap-2" disabled={loading}>
                  <FileText className="w-4 h-4" /> 
                  {loading ? 'Generating...' : 'Generate Secure Prescription'}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border shadow-sm border-primary/50 bg-primary/5">
            <CardContent className="pt-6 flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Prescription Ready</h3>
                <p className="text-muted-foreground">
                  Provide this code to the patient. They can use it at any verified pharmacy.
                </p>
              </div>

              <div className="bg-background border-2 border-dashed border-primary/30 p-6 rounded-xl w-full flex flex-col items-center gap-4">
                <div className="text-4xl font-mono font-bold tracking-widest text-primary">
                  {generatedCode}
                </div>
                <Button variant="outline" onClick={copyCode} className="gap-2">
                  <Copy className="w-4 h-4" /> Copy Code
                </Button>
              </div>

              <Button variant="ghost" onClick={() => setGeneratedCode(null)}>
                Create Another Prescription
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
