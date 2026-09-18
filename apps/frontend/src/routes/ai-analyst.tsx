import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sparkles, Activity, Send, User } from 'lucide-react'
import { chatWithAnalystFn } from '../services/ai.service'

export const Route = createFileRoute('/ai-analyst')({
  component: AIAnalystRoute,
})

function AIAnalystRoute() {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: 'Hello! I am your Executive Analyst. You can ask me questions about your revenue, expenses, profit, or overall business performance. How can I help you today?' }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isTyping) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMessage }])
    setIsTyping(true)

    try {
      const data = await chatWithAnalystFn({ data: { message: userMessage, history: [] } })
      setMessages(prev => [...prev, { role: 'ai', text: data.response }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "I'm sorry, I'm having trouble analyzing the data right now. Please try again later." }])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8 max-w-4xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
      <PageHeader 
        title="AI Executive Analyst (v2)" 
        description="Chat with your business metrics using Gemini 2.0." 
      />
      
      <Card className="border-indigo-100 dark:border-indigo-900/50 shadow-sm flex flex-col flex-1 min-h-[500px]">
        <CardHeader className="border-b border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20">
          <CardTitle className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-5 h-5" /> Executive Chat
          </CardTitle>
          <CardDescription>Ask questions about your revenue, expenses, and overall business health.</CardDescription>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
            {messages.map((msg, idx) => (
              <div key={idx} className={\`flex gap-3 \${msg.role === 'user' ? 'justify-end' : 'justify-start'}\`}>
                {msg.role === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-1">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}
                <div className={\`max-w-[80%] rounded-2xl px-4 py-3 \${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                    : 'bg-background border shadow-sm rounded-tl-sm'
                }\`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="bg-background border shadow-sm rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-background border-t">
            <form onSubmit={handleSend} className="flex gap-2">
              <Input 
                value={input} 
                onChange={e => setInput(e.target.value)}
                placeholder="e.g. How is our business doing this month compared to last?" 
                className="flex-1 focus-visible:ring-indigo-500"
                disabled={isTyping}
              />
              <Button type="submit" disabled={isTyping || !input.trim()} className="bg-indigo-600 hover:bg-indigo-700">
                <Send className="w-4 h-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
