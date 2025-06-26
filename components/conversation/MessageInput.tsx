/**
 * Message input component with brand styling
 * Purpose: User input field following ACT design guidelines
 * Location: /components/conversation/MessageInput.tsx
 */
import { useState } from 'react'

interface MessageInputProps {
  onSendMessage: (content: string) => void
  disabled?: boolean
  loading?: boolean
}

export function MessageInput({ onSendMessage, disabled = false, loading = false }: MessageInputProps) {
  const [value, setValue] = useState('')
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim() && !disabled) {
      onSendMessage(value)
      setValue('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ask about climate careers, resume help, training programs, or resources..."
          className="w-full min-h-24 p-4 border-2 border-[var(--sand-gray)] rounded-lg 
                     focus:border-[var(--spring-green)] focus:outline-none
                     font-body text-body text-[var(--midnight-forest)]
                     placeholder:text-[var(--moss-green)]
                     resize-none"
          disabled={disabled || loading}
          rows={3}
        />
        
        {/* Character count or other indicators */}
        <div className="absolute bottom-2 right-2 text-caption text-[var(--moss-green)]">
          {value.length}/1000
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <QuickActionButton 
            icon="document" 
            label="Upload Resume" 
            onClick={() => {/* Handle resume upload */}}
          />
          <QuickActionButton 
            icon="search" 
            label="Find Jobs" 
            onClick={() => {/* Handle job search */}}
          />
          <QuickActionButton 
            icon="academic-cap" 
            label="Training" 
            onClick={() => {/* Handle training search */}}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading || disabled || !value.trim()}
          className="px-6 py-3 bg-[var(--spring-green)] text-[var(--midnight-forest)] 
                     font-body-semibold rounded-lg
                     hover:bg-[var(--spring-green-90)] 
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors duration-200
                     flex items-center space-x-2"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <span>Send Message</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>
      </div>
    </form>
  )
}

interface QuickActionButtonProps {
  icon: string
  label: string
  onClick: () => void
}

function QuickActionButton({ icon, label, onClick }: QuickActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center space-x-2 px-3 py-2 rounded-md
                 text-[var(--moss-green)] hover:text-[var(--spring-green)]
                 hover:bg-[var(--sand-gray)]
                 transition-colors duration-200"
    >
      {/* Icon placeholder */}
      <div className="w-4 h-4 bg-current rounded-full opacity-30"></div>
      <span className="text-body-small font-body-medium">{label}</span>
    </button>
  )
}

function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }
  
  return (
    <div className={`${sizeClasses[size]} animate-spin`}>
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  )
} 