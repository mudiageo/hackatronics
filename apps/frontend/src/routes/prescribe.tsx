import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FileText, Copy, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/prescribe')({
  component: PrescribeRoute,
})

function PrescribeRoute() {
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate cryptographic generation
    setTimeout(() => {
      setGeneratedCode('RX-' + Math.random().toString(36).substring(2, 8).toUpperCase())
      setLoading(false)
      toast.success('Prescription generated successfully')
    }, 1000)
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
        title="Create Prescription" 
        description="Generate a cryptographically verifiable prescription code for the patient." 
      />

      <div className="max-w-2xl mx-auto">
        {!generatedCode ? (
          <Card className="shadow-sm border-border">
            <CardHeader>
              <CardTitle>Prescription Details</CardTitle>
              <CardDescription>Enter the medication details to generate a secure code.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="patientName">Patient Name</Label>
                  <Input id="patientName" placeholder="John Doe" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="medication">Medication</Label>
                  <Input id="medication" placeholder="Amoxicillin 500mg" required />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input id="quantity" type="number" placeholder="30" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="refills">Refills</Label>
                    <Input id="refills" type="number" defaultValue="0" min="0" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes / Instructions</Label>
                  <Input id="notes" placeholder="Take 1 tablet every 8 hours" />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Generating Secure Code...' : 'Generate Secure Prescription'}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-sm border-border text-center py-8">
            <CardContent className="space-y-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Prescription Generated</h3>
                <p className="text-muted-foreground mt-2">Give this secure code to the patient. The pharmacy will use it to verify and dispense the medication.</p>
              </div>
              
              <div className="bg-muted/50 p-6 rounded-xl border border-border inline-block min-w-[300px]">
                <div className="text-sm font-medium text-muted-foreground mb-2">Secure RX Code</div>
                <div className="text-4xl font-mono font-bold tracking-widest text-foreground">{generatedCode}</div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={copyCode} className="gap-2">
                  <Copy className="w-4 h-4" /> Copy Code
                </Button>
                <Button onClick={() => setGeneratedCode(null)}>Create Another</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
