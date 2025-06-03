import { useState, useEffect, useCallback, useRef } from 'react'
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

// Key for caching resume status
const RESUME_CACHE_KEY = 'cea-resume-status';

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
  const hasCheckedResume = useRef(false)
  const isInitializing = useRef(true)
  const authChecksCount = useRef(0)

  // Try to get user data from localStorage first for immediate UI response
  useEffect(() => {
    try {
      const authData = localStorage.getItem('cea-supabase-auth')
      if (authData) {
        const parsedAuth = JSON.parse(authData)
        console.log("📁 Found auth data in localStorage:", !!parsedAuth)
        
        // Extract user from the session if available
        if (parsedAuth?.session?.user) {
          console.log("📁 Using cached user data for initial state")
          setUser(parsedAuth.session.user)
          
          // Try to also load cached resume data
          const cachedResume = localStorage.getItem(`${RESUME_CACHE_KEY}-${parsedAuth.session.user.id}`)
          if (cachedResume) {
            try {
              const parsedCache = JSON.parse(cachedResume)
              console.log("📁 Found cached resume status:", parsedCache)
              
              // Check if cache is not too old (less than 1 hour)
              const cacheTime = parsedCache.timestamp || 0
              const now = Date.now()
              const cacheAge = now - cacheTime
              
              if (cacheAge < 60 * 60 * 1000) { // 1 hour
                setResumeStatus(parsedCache.status)
                
                // If user has a resume, update resumeData in parent component
                if (parsedCache.status.hasResume) {
                  console.log("📁 Using cached resume data")
                  setResumeData({
                    id: parsedCache.status.resumeId,
                    file_name: parsedCache.status.fileName,
                    user_id: parsedAuth.session.user.id
                  })
                }
              }
            } catch (e) {
              console.error("📁 Error parsing cached resume data:", e)
            }
          }
        }
      } else {
        console.log("📁 No auth data found in localStorage")
      }
    } catch (e) {
      console.error("📁 Error reading auth data from localStorage:", e)
    }
  }, [setResumeData])

  // Get current user and initialize state on component mount
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        isInitializing.current = true
        
        // Get user authentication
        console.log("📁 Checking auth via supabase.auth.getUser()")
        const { data, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error("📁 Auth error:", error.message)
        }
        
        if (data?.user) {
          console.log("📁 Auth successful - user found:", data.user.id)
          setUser(data.user)
          
          // Try to restore resume status from cache first
          try {
            const cachedResume = localStorage.getItem(`${RESUME_CACHE_KEY}-${data.user.id}`)
            if (cachedResume) {
              const parsedCache = JSON.parse(cachedResume)
              console.log("📁 Found cached resume status:", parsedCache)
              
              // Check if cache is not too old (less than 1 hour)
              const cacheTime = parsedCache.timestamp || 0
              const now = Date.now()
              const cacheAge = now - cacheTime
              
              if (cacheAge < 60 * 60 * 1000) { // 1 hour
                setResumeStatus(parsedCache.status)
                
                // If user has a resume, update resumeData in parent component
                if (parsedCache.status.hasResume) {
                  console.log("📁 Using cached resume data")
                  setResumeData({
                    id: parsedCache.status.resumeId,
                    file_name: parsedCache.status.fileName,
                    user_id: data.user.id
                  })
                }
              } else {
                console.log("📁 Cached resume data too old, will refetch")
              }
            } else {
              console.log("📁 No cached resume data found")
            }
          } catch (e) {
            console.error("📁 Error reading cached resume data:", e)
          }
        } else {
          console.log("📁 No user found in auth.getUser()")
        }
        
        // Try to restore toggle state from localStorage
        if (typeof window !== 'undefined') {
          try {
            const savedRagState = localStorage.getItem('ragEnabled')
            const savedEnhancedSearchState = localStorage.getItem('enhancedSearchEnabled')
            
            console.log("📁 Restoring saved state:", { savedRagState, savedEnhancedSearchState })
            
            if (savedRagState === 'true') {
              setRagEnabled(true)
            }
            
            if (savedEnhancedSearchState === 'true') {
              setEnhancedSearchEnabled(true)
            }
          } catch (e) {
            console.error("📁 Error restoring state from localStorage:", e)
          }
        }
      } finally {
        isInitializing.current = false
      }
    }
    
    // Execute initialization
    initializeComponent()
    
    // Also try the current session method
    const checkSession = async () => {
      try {
        console.log("📁 Checking auth via supabase.auth.getSession()")
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error("📁 Session error:", sessionError.message)
        }
        
        if (sessionData?.session?.user) {
          console.log("📁 Session found - user:", sessionData.session.user.id)
          setUser(sessionData.session.user)
        } else {
          console.log("📁 No active session found")
        }
      } catch (e) {
        console.error("📁 Error checking session:", e)
      }
    }
    
    checkSession()
    
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("📁 Auth state changed:", event)
        
        if (session?.user) {
          console.log("📁 Auth update - user now available:", session.user.id)
          setUser(session.user)
        } else {
          console.log("📁 Auth update - user signed out or unavailable")
          setUser(null)
          hasCheckedResume.current = false
        }
      }
    )
    
    return () => {
      console.log("📁 Cleaning up auth listener")
      authListener?.subscription.unsubscribe()
    }
  }, [supabase, setResumeData])

  // Additional check for auth in case other methods fail
  useEffect(() => {
    // Only try this a few times to avoid infinite loop
    if (authChecksCount.current >= 3 || user) return
    
    const retryAuth = async () => {
      authChecksCount.current += 1
      console.log(`📁 Retry auth check #${authChecksCount.current}`)
      
      try {
        const { data, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error("📁 Retry auth error:", error.message)
        }
        
        if (data?.user) {
          console.log("📁 Retry auth successful - user found:", data.user.id)
          setUser(data.user)
        } else {
          console.log("📁 Retry auth - no user found")
        }
      } catch (e) {
        console.error("📁 Error in retry auth check:", e)
      }
    }
    
    // Delay retry attempts
    const timer = setTimeout(retryAuth, 1000 * authChecksCount.current)
    
    return () => clearTimeout(timer)
  }, [supabase, user])

  // Save state to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitializing.current) {
      try {
        localStorage.setItem('ragEnabled', ragEnabled.toString())
        localStorage.setItem('enhancedSearchEnabled', enhancedSearchEnabled.toString())
        console.log("📁 Saved state to localStorage:", { ragEnabled, enhancedSearchEnabled })
      } catch (e) {
        console.error("📁 Error saving state to localStorage:", e)
      }
    }
  }, [ragEnabled, enhancedSearchEnabled])

  // Function to check if user has a resume
  const checkUserResume = useCallback(async () => {
    if (!user?.id) {
      console.log("📁 Cannot check resume - no user ID available")
      return
    }
    
    console.log("📁 Checking resume for user:", user.id)
    setLoading(true)
    setError(null)
    hasCheckedResume.current = true
    
    try {
      const response = await fetch('/api/check-user-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: user.id }),
      })
      
      console.log("📁 Resume check response status:", response.status)
      const data = await response.json()
      console.log("📁 Resume check data:", data)
      
      if (response.ok) {
        const newStatus = {
          hasResume: data.has_resume,
          resumeId: data.resume_id,
          fileName: data.file_name,
          hasSocialData: data.has_social_data,
          socialLinks: data.social_links || {}
        }
        
        setResumeStatus(newStatus)
        
        // Cache the resume status for future page loads
        try {
          localStorage.setItem(
            `${RESUME_CACHE_KEY}-${user.id}`, 
            JSON.stringify({
              status: newStatus,
              timestamp: Date.now()
            })
          )
          console.log("📁 Cached resume status")
        } catch (e) {
          console.error("📁 Error caching resume status:", e)
        }
        
        // If user has a resume, update resumeData in parent component
        if (data.has_resume) {
          console.log("📁 Resume found, updating parent component")
          setResumeData({
            id: data.resume_id,
            file_name: data.file_name,
            user_id: user.id
          })
        } else {
          console.log("📁 No resume found for user")
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
        console.error('📁 Resume check error:', data)
      }
    } catch (err) {
      console.error('📁 Error checking resume status:', err)
      setError('Failed to check resume status')
    } finally {
      setLoading(false)
    }
  }, [user, ragEnabled, enhancedSearchEnabled, onToggleRAG, onToggleEnhancedSearch, setResumeData])

  // Check if user has a resume when component mounts or user changes
  useEffect(() => {
    if (user?.id && !hasCheckedResume.current) {
      console.log("📁 User ID detected, checking resume...")
      // Add a small delay to ensure other state has been initialized
      const timer = setTimeout(() => {
        checkUserResume()
      }, 200)
      
      return () => clearTimeout(timer)
    } else if (!user?.id) {
      console.log("📁 No user ID found")
      hasCheckedResume.current = false
    }
  }, [user, checkUserResume])

  // Force a resume check if needed after a delay (backup plan)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (user?.id && !resumeStatus.hasResume && !loading && !isInitializing.current) {
        console.log("📁 Triggering backup resume check...")
        checkUserResume()
      }
    }, 1500) // 1.5 second delay
    
    return () => clearTimeout(timer)
  }, [user, resumeStatus.hasResume, loading, checkUserResume])

  // Update toggle states when resume status changes
  useEffect(() => {
    if (isInitializing.current || !user?.id) return
    
    // If there's a resume, make sure RAG toggle is in the correct state
    if (resumeStatus.hasResume && ragEnabled) {
      onToggleRAG(true)
    } else if (!resumeStatus.hasResume && ragEnabled) {
      setRagEnabled(false)
      onToggleRAG(false)
    }
    
    // If there's social data, make sure enhanced search toggle is in correct state
    if (resumeStatus.hasSocialData && enhancedSearchEnabled) {
      onToggleEnhancedSearch(true)
    } else if (!resumeStatus.hasSocialData && enhancedSearchEnabled) {
      setEnhancedSearchEnabled(false)
      onToggleEnhancedSearch(false)
    }
  }, [resumeStatus, ragEnabled, enhancedSearchEnabled, onToggleRAG, onToggleEnhancedSearch, user])

  // Handle RAG toggle
  const handleRagToggle = (checked: boolean) => {
    if (checked && !resumeStatus.hasResume) {
      setError('Please upload a resume first')
      return
    }
    
    console.log("📁 RAG toggle changed:", checked)
    setRagEnabled(checked)
    onToggleRAG(checked)
    
    // Force update the state
    if (typeof window !== 'undefined') {
      localStorage.setItem('ragEnabled', checked.toString())
    }
  }
  
  // Handle Enhanced Search toggle
  const handleEnhancedSearchToggle = async (checked: boolean) => {
    if (!checked) {
      console.log("📁 Enhanced search disabled")
      setEnhancedSearchEnabled(false)
      onToggleEnhancedSearch(false)
      
      // Force update the state
      if (typeof window !== 'undefined') {
        localStorage.setItem('enhancedSearchEnabled', 'false')
      }
      return
    }
    
    if (!resumeStatus.hasResume) {
      setError('Please upload a resume first')
      return
    }
    
    console.log("📁 Enhanced search enabling check:", {
      hasSocialData: resumeStatus.hasSocialData
    })
    
    if (!resumeStatus.hasSocialData) {
      // Start the enhanced search process
      await triggerEnhancedSearch()
    } else {
      // Just enable the toggle if data already exists
      console.log("📁 Enhanced search enabled (social data exists)")
      setEnhancedSearchEnabled(true)
      onToggleEnhancedSearch(true)
      
      // Force update the state
      if (typeof window !== 'undefined') {
        localStorage.setItem('enhancedSearchEnabled', 'true')
      }
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
        const updatedStatus = {
          ...resumeStatus,
          hasSocialData: data.has_social_data
        }
        
        setResumeStatus(updatedStatus)
        
        // Update the cached resume status
        try {
          localStorage.setItem(
            `${RESUME_CACHE_KEY}-${user.id}`, 
            JSON.stringify({
              status: updatedStatus,
              timestamp: Date.now()
            })
          )
        } catch (e) {
          console.error("Error updating cached resume status:", e)
        }
        
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