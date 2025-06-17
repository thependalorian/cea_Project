"use client";

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from '@/contexts/auth-context'
import { createClient } from '@/lib/supabase/client'

interface User {
  id: string;
  email?: string;
}

export default function ResumeDebug() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Record<string, unknown>[]>([])
  const [resume, setResume] = useState<Record<string, unknown> | null>(null)
  const [pyBackendRunning, setPyBackendRunning] = useState<boolean | null>(null)
  const { user } = useAuth()
  const supabase = createClient()
  
  // Get current user on component mount
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        addResult('Auth check', 'User found', { id: data.user.id })
      } else {
        addResult('Auth check', 'No user found', {})
      }
    }
    
    getUser()
  }, [])
  
  const addResult = (title: string, message: string, data: Record<string, unknown> = {}) => {
    setResults(prev => [
      {
        id: Date.now(),
        title,
        message,
        data,
        timestamp: new Date().toLocaleTimeString()
      },
      ...prev
    ])
  }
  
  const checkBackendHealth = async () => {
    try {
      const response = await fetch('/api/v1/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json()
      
      setPyBackendRunning(data.isHealthy || false)
      addResult(
        'Backend health check', 
        data.isHealthy ? 'Backend is running' : 'Backend is NOT running',
        data
      )
      
      return data.isHealthy
    } catch (error) {
      setPyBackendRunning(false)
      addResult('Backend health check', 'Error checking backend health', { error })
      return false
    }
  }
  
  const checkUserResume = async () => {
    if (!user?.id) {
      addResult('Resume check', 'No user ID available', {})
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/check-user-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id
        }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setResume(data)
        addResult(
          'Resume check', 
          data.has_resume ? 'Resume found' : 'No resume found', 
          data
        )
      } else {
        addResult('Resume check', 'Error checking resume', data)
      }
    } catch (err) {
      addResult('Resume check', 'Exception checking resume', { error: String(err) })
    } finally {
      setLoading(false)
    }
  }
  
  const checkDirectDb = async () => {
    if (!user?.id) {
      addResult('Direct DB check', 'No user ID available', {})
      return
    }
    
    setLoading(true)
    
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('id, file_name, created_at, processed, social_data')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (error) {
        addResult('Direct DB check', 'Error querying database', { error })
      } else {
        addResult('Direct DB check', `Found ${data.length} resumes`, { resumes: data })
      }
    } catch (err) {
      addResult('Direct DB check', 'Exception querying database', { error: String(err) })
    } finally {
      setLoading(false)
    }
  }
  
  const directApiCall = async () => {
    if (!user?.id) {
      addResult('Direct API call', 'No user ID available', {})
      return
    }
    
    if (!pyBackendRunning) {
      const isHealthy = await checkBackendHealth()
      if (!isHealthy) {
        addResult('Direct API call', 'Backend is not running', {})
        return
      }
    }
    
    setLoading(true)
    
    try {
      // Call v1 proxy API route instead of direct backend call
      const response = await fetch('/api/v1/check-user-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: user.id }),
      })
      
      const data = await response.json()
      addResult('v1 Proxy API call', 'Response from Next.js proxy to Python backend', data)
    } catch (err) {
      addResult('v1 Proxy API call', 'Exception calling v1 proxy endpoint', { error: String(err) })
    } finally {
      setLoading(false)
    }
  }
  
  const runAllChecks = async () => {
    await checkBackendHealth()
    await checkUserResume()
    await checkDirectDb()
    await directApiCall()
  }
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Resume Detection Debugger</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>User: {user ? user.email : 'Not logged in'}</p>
            <p>Backend status: {
              pyBackendRunning === null ? 'Unknown' : 
              pyBackendRunning ? 'Running' : 'Not running'
            }</p>
            <p>Resume status: {
              resume === null ? 'Not checked' :
              resume.has_resume ? `Found (${resume.file_name})` : 'Not found'
            }</p>
            
            <div className="flex flex-wrap gap-2 mt-4">
              <Button 
                onClick={checkBackendHealth} 
                disabled={loading}
                variant="outline"
              >
                Check Backend
              </Button>
              
              <Button 
                onClick={checkUserResume} 
                disabled={loading}
                variant="outline"
              >
                Check Resume
              </Button>
              
              <Button 
                onClick={checkDirectDb} 
                disabled={loading}
                variant="outline"
              >
                Direct DB Check
              </Button>
              
              <Button 
                onClick={directApiCall} 
                disabled={loading || pyBackendRunning === false}
                variant="outline"
              >
                Direct API Call
              </Button>
              
              <Button 
                onClick={runAllChecks} 
                disabled={loading}
              >
                Run All Checks
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {results.map(result => (
              <div key={result.id as string} className="border p-3 rounded-md">
                <div className="flex justify-between">
                  <p className="font-medium">{result.title as string}</p>
                  <p className="text-sm text-muted-foreground">{result.timestamp as string}</p>
                </div>
                <p className="mt-1">{result.message as string}</p>
                {Object.keys(result.data as Record<string, unknown>).length > 0 && (
                  <pre className="mt-2 bg-muted p-2 rounded text-xs overflow-x-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                )}
              </div>
            ))}
            
            {results.length === 0 && (
              <p className="text-muted-foreground">No results yet. Run some checks to see output here.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 