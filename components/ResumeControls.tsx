import { useState, useEffect, useCallback } from 'react'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from './ui/tooltip'
import { Loader2, AlertCircle, Search } from 'lucide-react'
import { Alert, AlertDescription } from './ui/alert'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface ResumeData {
  id?: string;
  file_name?: string;
  user_id?: string;
  [key: string]: string | undefined;
}

interface ResumeControlsProps {
  onToggleRAG: (enabled: boolean) => void
  onToggleEnhancedSearch: (enabled: boolean) => void
  resumeData?: ResumeData | null
  setResumeData: (data: ResumeData) => void
}

export default function ResumeControls({
  onToggleRAG,
  onToggleEnhancedSearch,
  setResumeData
}: ResumeControlsProps) {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [ragEnabled, setRagEnabled] = useState(false)
  const [enhancedSearchEnabled, setEnhancedSearchEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [enhancedSearchLoading, setEnhancedSearchLoading] = useState(false)
  const [resumeStatus, setResumeStatus] = useState<{
    hasResume: boolean
    resumeId?: string
    fileName?: string
    hasSocialData: boolean
    socialLinks: Record<string, string | null>
  }>({
    hasResume: false,
    hasSocialData: false,
    socialLinks: {}
  })
  const [error, setError] = useState<string | null>(null)
  const [socialDataMessage, setSocialDataMessage] = useState<string | null>(null)

  // Get current user on component mount
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        setUser(data.user)
      }
    }
    
    getUser()
  }, [supabase])

  // Function to check if user has a resume
  const checkUserResume = useCallback(async () => {
    if (!user?.id) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/check-user-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: user.id }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setResumeStatus({
          hasResume: data.has_resume,
          resumeId: data.resume_id,
          fileName: data.file_name,
          hasSocialData: data.has_social_data,
          socialLinks: data.social_links || {}
        })
        
        // If user has a resume, update resumeData in parent component
        if (data.has_resume) {
          setResumeData({
            id: data.resume_id,
            file_name: data.file_name,
            user_id: user.id
          })
        }
        
        // Enable RAG if resume exists and was previously enabled
        if (data.has_resume && ragEnabled) {
          onToggleRAG(true)
        } else if (!data.has_resume && ragEnabled) {
          setRagEnabled(false)
          onToggleRAG(false)
        }
        
        // Enable enhanced search if social data exists and was previously enabled
        if (data.has_social_data && enhancedSearchEnabled) {
          onToggleEnhancedSearch(true)
        } else if (!data.has_social_data && enhancedSearchEnabled) {
          setEnhancedSearchEnabled(false)
          onToggleEnhancedSearch(false)
        }
      } else {
        setError('Failed to check resume status')
        console.error('Resume check error:', data)
      }
    } catch (err) {
      console.error('Error checking resume status:', err)
      setError('Failed to check resume status')
    } finally {
      setLoading(false)
    }
  }, [user, ragEnabled, enhancedSearchEnabled, onToggleRAG, onToggleEnhancedSearch, setResumeData])

  // Check if user has a resume when component mounts or user changes
  useEffect(() => {
    if (user?.id) {
      checkUserResume()
    }
  }, [user, checkUserResume])

  // Handle RAG toggle
  const handleRagToggle = (checked: boolean) => {
    if (checked && !resumeStatus.hasResume) {
      setError('Please upload a resume first')
      return
    }
    
    setRagEnabled(checked)
    onToggleRAG(checked)
  }
  
  // Handle Enhanced Search toggle
  const handleEnhancedSearchToggle = async (checked: boolean) => {
    if (!checked) {
      setEnhancedSearchEnabled(false)
      onToggleEnhancedSearch(false)
      return
    }
    
    if (!resumeStatus.hasResume) {
      setError('Please upload a resume first')
      return
    }
    
    if (!resumeStatus.hasSocialData) {
      // Start the enhanced search process
      await triggerEnhancedSearch()
    } else {
      // Just enable the toggle if data already exists
      setEnhancedSearchEnabled(true)
      onToggleEnhancedSearch(true)
    }
  }
  
  // Trigger enhanced search API
  const triggerEnhancedSearch = async (forceRefresh = false) => {
    if (!user?.id || !resumeStatus.resumeId) return
    
    setEnhancedSearchLoading(true)
    setSocialDataMessage(null)
    setError(null)
    
    try {
      const response = await fetch('/api/enhanced-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          resume_id: resumeStatus.resumeId,
          force_refresh: forceRefresh
        }),
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        // Update resume status
        setResumeStatus(prev => ({
          ...prev,
          hasSocialData: data.has_social_data
        }))
        
        // Enable enhanced search
        setEnhancedSearchEnabled(true)
        onToggleEnhancedSearch(true)
        
        // Show success message
        setSocialDataMessage(data.message)
      } else {
        setError(data.message || 'Failed to perform enhanced search')
        console.error('Enhanced search error:', data)
      }
    } catch (err) {
      console.error('Error in enhanced search:', err)
      setError('Failed to perform enhanced search')
    } finally {
      setEnhancedSearchLoading(false)
    }
  }

  return (
    <div className="flex flex-col space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-lg font-medium">Resume Options</h3>
      
      {error && (
        <Alert variant="destructive" className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {socialDataMessage && (
        <Alert className="mb-2">
          <AlertDescription>{socialDataMessage}</AlertDescription>
        </Alert>
      )}
      
      {!resumeStatus.hasResume && !loading && (
        <div className="text-sm text-gray-500 mb-2">
          No resume detected. Please upload a resume to use these features.
        </div>
      )}
      
      {resumeStatus.hasResume && (
        <div className="text-sm text-gray-700 mb-2">
          Current resume: <span className="font-medium">{resumeStatus.fileName}</span>
        </div>
      )}
      
      {/* Horizontal toggles layout with clear separation */}
      <TooltipProvider>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-3 rounded-md border border-gray-100">
          <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-3 w-full">
                  <Switch
                    id="rag-mode"
                    checked={ragEnabled}
                    onCheckedChange={handleRagToggle}
                    disabled={loading || !resumeStatus.hasResume}
                    className="data-[state=checked]:bg-green-500"
                  />
                  <Label htmlFor="rag-mode" className="cursor-pointer font-medium">
                    Chat with Resume
                  </Label>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {resumeStatus.hasResume
                  ? 'Enable to use your resume context in conversations'
                  : 'Upload a resume to enable this feature'}
              </TooltipContent>
            </Tooltip>
            
            {loading && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}
          </div>
          
          <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-3 w-full">
                  <Switch
                    id="enhanced-search"
                    checked={enhancedSearchEnabled}
                    onCheckedChange={handleEnhancedSearchToggle}
                    disabled={
                      enhancedSearchLoading || 
                      loading || 
                      !resumeStatus.hasResume
                    }
                    className="data-[state=checked]:bg-blue-500"
                  />
                  <Label htmlFor="enhanced-search" className="cursor-pointer font-medium">
                    Enhanced Social Context
                  </Label>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {!resumeStatus.hasResume
                  ? 'Upload a resume to enable this feature'
                  : resumeStatus.hasSocialData
                  ? 'Using social profile information to enhance responses'
                  : 'Search for additional information from your social profiles'}
              </TooltipContent>
            </Tooltip>
            
            {enhancedSearchLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
            )}
          </div>
        </div>
      </TooltipProvider>
      
      {resumeStatus.hasSocialData && (
        <Button 
          variant="outline" 
          size="sm"
          className="mt-2 w-fit"
          onClick={() => triggerEnhancedSearch(true)}
          disabled={enhancedSearchLoading}
        >
          {enhancedSearchLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Search className="h-4 w-4 mr-2" />
          )}
          Refresh Social Data
        </Button>
      )}
    </div>
  )
} 