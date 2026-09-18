import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Camera, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { scanTransactionFn } from '../services/ai.service'

export const Route = createFileRoute('/ai-scanner')({
  component: AIScannerRoute,
})

function AIScannerRoute() {
  const [isScanning, setIsScanning] = useState(false)

  const handleFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsScanning(true);
    toast("Scanning receipt with Gemini...", { icon: <Camera className="w-4 h-4 animate-spin" /> })
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Str = (event.target?.result as string).split(',')[1];
        const res = await scanTransactionFn({ data: { base64Data: base64Str, mimeType: file.type }});
        toast.success(`Scanned ${res.items.length} items from ${res.customer}`);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      toast.error('Failed to scan receipt');
    } finally {
      setIsScanning(false);
      e.target.value = '';
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8 max-w-4xl mx-auto">
      <PageHeader 
        title="AI Receipt Scanner (v2)" 
        description="Extract handwritten line items using Gemini Vision." 
      />
      <Card className="border-blue-100 dark:border-blue-900/50 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <FileText className="w-48 h-48 text-blue-500" />
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Camera className="w-5 h-5" /> Receipt Scanner
          </CardTitle>
          <CardDescription>Upload a photo of a pharmacy receipt to automatically extract data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative z-10 max-w-sm">
            <input type="file" id="scanner-upload" accept="image/*" className="hidden" onChange={handleFileScan} />
            <Button 
              size="lg"
              onClick={() => document.getElementById('scanner-upload')?.click()} 
              disabled={isScanning} 
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isScanning ? "Scanning Receipt..." : "Upload Receipt"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
