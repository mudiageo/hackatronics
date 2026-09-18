import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Camera, Sparkles, Mic, FileText, Activity } from 'lucide-react'
import { toast } from 'sonner'
import { analyzeBusinessFn, scanTransactionFn, processVoiceCommandFn } from '../services/ai.service'

export const Route = createFileRoute('/ai')({
  component: AIHubRoute,
})

function AIHubRoute() {
  // Voice State
  const [isListening, setIsListening] = useState(false)
  
  // Analyst State
  const [analysis, setAnalysis] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  // Scan State
  const [isScanning, setIsScanning] = useState(false)

  const handleVoiceCommand = async () => {
    setIsListening(true);
    toast("Listening to command...", { icon: <Mic className="w-4 h-4 animate-pulse" /> });
    
    setTimeout(async () => {
      try {
        const res = await processVoiceCommandFn({ data: { transcript: "Add 20 units of Panadol Extra" } });
        toast.success(res.message);
      } catch (err) {
        toast.error("Failed to process voice command");
      } finally {
        setIsListening(false);
      }
    }, 2000);
  }

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    try {
      const data = await analyzeBusinessFn()
      setAnalysis(data)
      toast.success("Business analysis complete!")
    } catch (err) {
      toast.error("Analysis failed")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsScanning(true);
    toast("Scanning receipt with Gemini...", { icon: <Sparkles className="w-4 h-4 animate-spin" /> })
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Str = (event.target?.result as string).split(',')[1];
        const res = await scanTransactionFn({ data: { base64Data: base64Str, mimeType: file.type }});
        toast.success(\`Scanned \${res.items.length} items from \${res.customer}\`);
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
    <div className="flex-1 space-y-6 p-6 md:p-8 max-w-7xl mx-auto">
      <PageHeader 
        title="AI Intelligence Hub (v2)" 
        description="Experience the Gemini-powered capabilities embedded across the platform in one unified view." 
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Analyst Card */}
        <Card className="border-indigo-100 dark:border-indigo-900/50 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Activity className="w-24 h-24 text-indigo-500" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" /> Executive Analyst
            </CardTitle>
            <CardDescription>Generates insights based on live business metrics.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full bg-indigo-600 hover:bg-indigo-700">
              {isAnalyzing ? "Analyzing Business..." : "Run Analysis"}
            </Button>
            
            {analysis && (
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900 text-sm mt-4">
                <p className="font-medium text-indigo-900 dark:text-indigo-200 mb-3">{analysis.summary}</p>
                <div className="space-y-2">
                  {analysis.metrics.map((m: any, i: number) => (
                    <div key={i} className="flex justify-between border-t border-indigo-100 dark:border-indigo-900 pt-2">
                      <span className="text-muted-foreground">{m.label}</span>
                      <span className={m.positive ? 'text-green-600' : 'text-red-600'}>{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scanner Card */}
        <Card className="border-blue-100 dark:border-blue-900/50 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <FileText className="w-24 h-24 text-blue-500" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Camera className="w-5 h-5" /> Receipt Scanner
            </CardTitle>
            <CardDescription>Extracts handwritten line items using Gemini Vision.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <input type="file" id="ai-hub-upload" accept="image/*" className="hidden" onChange={handleFileScan} />
              <Button 
                onClick={() => document.getElementById('ai-hub-upload')?.click()} 
                disabled={isScanning} 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isScanning ? "Scanning Receipt..." : "Upload Receipt"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Voice Card */}
        <Card className="border-rose-100 dark:border-rose-900/50 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Mic className="w-24 h-24 text-rose-500" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <Mic className="w-5 h-5" /> Voice Assistant
            </CardTitle>
            <CardDescription>Translates voice intent into actionable JSON payloads.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleVoiceCommand} 
              disabled={isListening} 
              className={\`w-full \${isListening ? 'bg-rose-500 animate-pulse' : 'bg-rose-600 hover:bg-rose-700'}\`}
            >
              {isListening ? "Listening..." : "Test Voice Command"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
