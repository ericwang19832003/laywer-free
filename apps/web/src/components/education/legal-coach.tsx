'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  MessageCircle, 
  Send, 
  Lightbulb, 
  BookOpen, 
  HelpCircle,
  ChevronRight,
  Sparkles,
  X
} from 'lucide-react'
import { COMMON_EDUCATION } from './legal-education-card'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: string[]
}

interface QuickTopic {
  label: string
  topic: string
  icon?: React.ReactNode
}

interface LegalCoachProps {
  userProfile?: {
    state?: string
    caseType?: string
    stage?: string
  }
  className?: string
  onClose?: () => void
}

const INITIAL_MESSAGE = `Hi! I'm your legal guide. I can help you understand legal concepts, explain court processes, and answer questions about your case.

What would you like help with?`

const QUICK_TOPICS: QuickTopic[] = [
  { label: "What is a defendant?", topic: "defendant", icon: <HelpCircle className="h-4 w-4" /> },
  { label: "How do I file?", topic: "filing", icon: <BookOpen className="h-4 w-4" /> },
  { label: "What happens if I win?", topic: "winning", icon: <Sparkles className="h-4 w-4" /> },
  { label: "I don't understand this form", topic: "forms", icon: <HelpCircle className="h-4 w-4" /> },
]

const EXAMPLE_QUESTIONS = [
  "What does 'cause of action' mean?",
  "Can I sue without a lawyer?",
  "What if I can't afford filing fees?",
  "How long will this take?",
  "What should I bring to court?",
]

const PRE_BUILT_ANSWERS: Record<string, string> = {
  defendant: COMMON_EDUCATION.defendant.content?.props?.children?.[0]?.props?.children || 
    "The defendant is the person or business you're filing the lawsuit against. Think of them as 'the other side' of your case.",
  plaintiff: "The plaintiff is the person who files the lawsuit. In most cases, that's YOU. You are asking the court for help because you believe someone else harmed you.",
  filing: "Filing a lawsuit involves: 1) Preparing your petition, 2) Filing it with the court, 3) Paying filing fees (or requesting a waiver), 4) Serving the defendant. This app guides you through each step.",
  winning: "If you win, the judge issues a judgment in your favor. But winning doesn't always mean getting paid immediately. You may need to take additional steps to collect, such as garnishing wages or seizing assets.",
  forms: "Legal forms can be confusing! Tell me which form you're looking at and I'll explain what each section means in plain language.",
  lawyer: "You don't need a lawyer to use this app! You can represent yourself (called 'pro se' representation). We'll guide you through each step. If at any point you feel overwhelmed, we can help you find legal assistance.",
  fees: "Filing fees vary by court:\n• Justice Court: ~$46-50\n• County Court: ~$100-150\n• District Court: ~$300\n\nIf you can't afford fees, you can ask for a fee waiver (called 'indigent' status).",
  timeline: "Timeline varies by case type and court:\n• Small claims: 30-90 days\n• Regular civil cases: 6-18 months\n• Complex cases: 2+ years\n\nMost cases filed through this app settle before trial.",
  court: "Here's what to expect at court:\n1. Arrive 30 minutes early\n2. Check in with the clerk\n3. Wait for your case to be called\n4. Present your case when called\n5. Listen to the judge's decision\n\nDress professionally and be respectful.",
  evidence: "Good evidence includes:\n• Documents (contracts, receipts, letters)\n• Photos or videos\n• Witness statements\n• Medical records\n• Police reports\n\nOrganize your evidence and bring copies for the judge and other party.",
}

function getAnswer(question: string): string {
  const lowerQ = question.toLowerCase()
  
  // Match keywords to pre-built answers
  if (lowerQ.includes('defend')) return PRE_BUILT_ANSWERS.defendant
  if (lowerQ.includes('plaintiff')) return PRE_BUILT_ANSWERS.plaintiff
  if (lowerQ.includes('file') || lowerQ.includes('filing')) return PRE_BUILT_ANSWERS.filing
  if (lowerQ.includes('win') || lowerQ.includes('judgment')) return PRE_BUILT_ANSWERS.winning
  if (lowerQ.includes('form') || lowerQ.includes('understand')) return PRE_BUILT_ANSWERS.forms
  if (lowerQ.includes('lawyer') || lowerQ.includes('attorney') || lowerQ.includes('pro se')) return PRE_BUILT_ANSWERS.lawyer
  if (lowerQ.includes('fee') || lowerQ.includes('afford') || lowerQ.includes('cost')) return PRE_BUILT_ANSWERS.fees
  if (lowerQ.includes('how long') || lowerQ.includes('timeline') || lowerQ.includes('take')) return PRE_BUILT_ANSWERS.timeline
  if (lowerQ.includes('court') || lowerQ.includes('judge') || lowerQ.includes('hearing')) return PRE_BUILT_ANSWERS.court
  if (lowerQ.includes('evidence') || lowerQ.includes('document') || lowerQ.includes('proof')) return PRE_BUILT_ANSWERS.evidence
  
  // Default response
  return `That's a great question! Based on your question, here are some thoughts:

I can't give legal advice, but I can share general information:

• For specific legal questions, consider consulting a lawyer
• Texas Legal Aid provides free help: 1-800-622-2520
• Your local courthouse has a self-help center

Is there something specific about your case I can help explain?`
}

export function LegalCoach({ userProfile, className, onClose }: LegalCoachProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: INITIAL_MESSAGE }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simulate thinking delay
    await new Promise(resolve => setTimeout(resolve, 800))

    const answer = getAnswer(userMessage.content)
    
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: answer
    }

    setMessages(prev => [...prev, assistantMessage])
    setIsTyping(false)
  }

  const handleQuickTopic = async (topic: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `Tell me about ${topic}`
    }

    setMessages(prev => [...prev, userMessage])
    setIsTyping(true)

    await new Promise(resolve => setTimeout(resolve, 800))

    const answer = getAnswer(topic)
    
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: answer
    }

    setMessages(prev => [...prev, assistantMessage])
    setIsTyping(false)
  }

  return (
    <Card className={cn('flex flex-col h-full', className)}>
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-calm-indigo" />
            <CardTitle className="text-base">Legal Guide</CardTitle>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-warm-muted hover:text-warm-text">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <p className="text-xs text-warm-muted mt-1">
          I can explain legal terms and processes. I&apos;m not a lawyer.
        </p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-lg px-4 py-3 text-sm',
                    message.role === 'user'
                      ? 'bg-calm-indigo text-white'
                      : 'bg-warm-bg text-warm-text'
                  )}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-warm-bg rounded-lg px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-warm-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-warm-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-warm-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={scrollRef} />
          </div>
        </div>

        {/* Quick Topics */}
        {messages.length === 1 && (
          <div className="px-4 pb-2">
            <p className="text-xs text-warm-muted mb-2">Quick topics:</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_TOPICS.map((topic) => (
                <button
                  key={topic.topic}
                  onClick={() => handleQuickTopic(topic.topic)}
                  className="flex items-center gap-1.5 text-xs bg-warm-bg hover:bg-calm-indigo/10 text-warm-text px-2.5 py-1.5 rounded-full border border-warm-border transition-colors"
                >
                  {topic.icon}
                  {topic.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a question..."
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={!input.trim() || isTyping} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-warm-muted mt-2 text-center">
            This is general information, not legal advice.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
