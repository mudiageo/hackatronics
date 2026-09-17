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
        patientName: formData.get('patientName') as string,
        medication: formData.get('medication') as string,
        quantity: parseInt(formData.get('quantity') as string, 10),
        refills: parseInt(formData.get('refills') as string, 10) || 0,
        notes: (formData.get('notes') as string) || undefined,
      })
      
      setGeneratedCode(rx.id)
      toast.success('Prescription generated successfully')
      
      // Optionally invalidate router to refresh other data if needed
      await router.invalidate()
    } catch (error: any) {
      toast.error('Failed to generate prescription: ' + error.message)
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
                <div className="space-y-2">
                  <Label htmlFor="patientName">Patient Name</Label>
                  <Input id="patientName" name="patientName" placeholder="John Doe" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="medication">Medication</Label>
                  <Input id="medication" name="medication" placeholder="Amoxicillin 500mg" required />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input id="quantity" name="quantity" type="number" placeholder="30" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="refills">Refills</Label>
                    <Input id="refills" name="refills" type="number" defaultValue="0" min="0" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Clinical Notes (Optional)</Label>
                  <Input id="notes" name="notes" placeholder="Take after meals" />
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
