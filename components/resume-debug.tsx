"use client";

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export default function ResumeDebug() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [resume, setResume] = useState<any>(null)
  const [pyBackendRunning, setPyBackendRunning] = useState<boolean | null>(null)
  const supabase = createClient()
  
  // Get current user on component mount
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        setUser(data.user)
        addResult('Auth check', 'User found', { id: data.user.id })
      } else {
        addResult('Auth check', 'No user found', {})
      }
    }
    
    getUser()
  }, [supabase])
  
  const addResult = (title: string, message: string, data: any = {}) => {
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
      const response = await fetch('/api/health')
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
        body: JSON.stringify({ user_id: user.id }),
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
      // Create a direct API call to the Python backend
      const response = await fetch('http://localhost:8000/api/check-user-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: user.id }),
      })
      
      const data = await response.json()
      addResult('Direct API call', 'Response from Python backend', data)
    } catch (err) {
      addResult('Direct API call', 'Exception calling Python backend', { error: String(err) })
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
              <div key={result.id} className="border p-3 rounded-md">
                <div className="flex justify-between">
                  <p className="font-medium">{result.title}</p>
                  <p className="text-sm text-muted-foreground">{result.timestamp}</p>
                </div>
                <p className="mt-1">{result.message}</p>
                {Object.keys(result.data).length > 0 && (
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