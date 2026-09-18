import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, Activity } from 'lucide-react'
import { toast } from 'sonner'
import { analyzeBusinessFn } from '../services/ai.service'

export const Route = createFileRoute('/ai-analyst')({
  component: AIAnalystRoute,
})

function AIAnalystRoute() {
  const [analysis, setAnalysis] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

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

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8 max-w-4xl mx-auto">
      <PageHeader 
        title="AI Executive Analyst (v2)" 
        description="Generates insights based on live business metrics using Gemini 2.0." 
      />
      <Card className="border-indigo-100 dark:border-indigo-900/50 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Activity className="w-48 h-48 text-indigo-500" />
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-5 h-5" /> Executive Analyst
          </CardTitle>
          <CardDescription>Click below to generate a deep-dive analysis of your current financial health.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative z-10 max-w-sm">
            <Button size="lg" onClick={handleAnalyze} disabled={isAnalyzing} className="w-full bg-indigo-600 hover:bg-indigo-700">
              {isAnalyzing ? "Analyzing Business..." : "Run Analysis"}
            </Button>
          </div>
          
          {analysis && (
            <div className="relative z-10 p-6 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900 mt-6">
              <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100 mb-4">Executive Summary</h3>
              <p className="font-medium text-indigo-800 dark:text-indigo-200 mb-6">{analysis.summary}</p>
              
              <div className="space-y-3">
                {analysis.metrics.map((m: any, i: number) => (
                  <div key={i} className="flex justify-between border-t border-indigo-200 dark:border-indigo-800 pt-3">
                    <span className="text-muted-foreground font-medium">{m.label}</span>
                    <span className={\`font-bold \${m.positive ? 'text-green-600' : 'text-red-600'}\`}>{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
