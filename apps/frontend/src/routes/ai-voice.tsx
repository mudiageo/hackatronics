import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mic } from 'lucide-react'
import { toast } from 'sonner'
import { processVoiceCommandFn } from '../services/ai.service'

export const Route = createFileRoute('/ai-voice')({
  component: AIVoiceRoute,
})

function AIVoiceRoute() {
  const [isListening, setIsListening] = useState(false)

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

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8 max-w-4xl mx-auto">
      <PageHeader 
        title="AI Voice Assistant (v2)" 
        description="Translate voice intent into actionable JSON payloads." 
      />
      <Card className="border-rose-100 dark:border-rose-900/50 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Mic className="w-48 h-48 text-rose-500" />
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <Mic className="w-5 h-5" /> Voice Assistant
          </CardTitle>
          <CardDescription>Simulate a voice command to test the NLP pipeline.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative z-10 max-w-sm">
            <Button 
              size="lg"
              onClick={handleVoiceCommand} 
              disabled={isListening} 
              className={\`w-full \${isListening ? 'bg-rose-500 animate-pulse' : 'bg-rose-600 hover:bg-rose-700'}\`}
            >
              {isListening ? "Listening..." : "Test Voice Command"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
