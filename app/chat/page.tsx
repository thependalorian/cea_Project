'use client'

import { useState, FormEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Send } from 'lucide-react'
import ResumeControls from '@/components/ResumeControls'

interface Message {
  content: string;
  role: string;
  sources?: {
    content: string;
    metadata: Record<string, unknown>;
  }[];
}

interface ResumeData {
  id?: string;
  file_name?: string;
  user_id?: string;
  [key: string]: string | undefined;
}

export default function Chat() {
  const [useResumeRAG, setUseResumeRAG] = useState(false)
  const [useEnhancedSearch, setUseEnhancedSearch] = useState(false)
  const [resumeData, setResumeData] = useState<ResumeData | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  
  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return
    
    setIsLoading(true)
    
    // Add user message to the list
    const userMessage: Message = {
      content,
      role: 'user'
    }
    
    setMessages(prev => [...prev, userMessage])
    
    // Prepare message with context for API
    const messageWithContext = {
      content,
      role: 'user',
      context: 'job-seeker',
      useResumeRAG,
      resumeData: resumeData,
      useEnhancedSearch // Send this flag to the API
    }
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageWithContext),
      })
      
      const data = await response.json()
      
      // Add assistant response to the list
      setMessages(prev => [...prev, data])
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
      setInputValue('')
    }
  }
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    handleSendMessage(inputValue)
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto pb-24 pt-4 px-4">
        {messages.map((message, index) => (
          <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-3 rounded-lg ${
              message.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              {message.content}
            </div>
          </div>
        ))}
      </div>
      
      <div className="border-t bg-white p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <ResumeControls 
              onToggleRAG={setUseResumeRAG}
              onToggleEnhancedSearch={setUseEnhancedSearch}
              resumeData={resumeData}
              setResumeData={setResumeData}
            />
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={!inputValue.trim() || isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 