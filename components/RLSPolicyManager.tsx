'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

export default function RLSPolicyManager() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [detailedMessage, setDetailedMessage] = useState<string>('');

  const applyRLSPolicies = async () => {
    try {
      setStatus('loading');
      setMessage('Applying RLS policies...');
      
      const response = await fetch('/api/direct-sql');
      const data = await response.json();
      
      if (response.ok) {
        setStatus('success');
        setMessage('RLS policies applied successfully');
        setDetailedMessage(JSON.stringify(data, null, 2));
      } else {
        setStatus('error');
        setMessage('Failed to apply RLS policies');
        setDetailedMessage(JSON.stringify(data, null, 2));
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred');
      setDetailedMessage(error instanceof Error ? error.message : String(error));
    }
  };

  const setupStorage = async () => {
    try {
      setStatus('loading');
      setMessage('Setting up storage bucket and policies...');
      
      const response = await fetch('/api/setup-storage');
      const data = await response.json();
      
      if (response.ok) {
        setStatus('success');
        setMessage('Storage setup completed successfully');
        setDetailedMessage(JSON.stringify(data, null, 2));
      } else {
        setStatus('error');
        setMessage('Failed to set up storage');
        setDetailedMessage(JSON.stringify(data, null, 2));
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred');
      setDetailedMessage(error instanceof Error ? error.message : String(error));
    }
  };

  const checkEnvironment = async () => {
    try {
      setStatus('loading');
      setMessage('Checking environment variables...');
      
      const response = await fetch('/api/check-env');
      const data = await response.json();
      
      if (response.ok) {
        if (data.status === 'ok') {
          setStatus('success');
          setMessage('Environment is properly configured');
        } else {
          setStatus('error');
          setMessage('Environment is missing variables');
        }
        setDetailedMessage(JSON.stringify(data, null, 2));
      } else {
        setStatus('error');
        setMessage('Failed to check environment');
        setDetailedMessage(JSON.stringify(data, null, 2));
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred');
      setDetailedMessage(error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Supabase Configuration Manager</CardTitle>
        <CardDescription>
          Apply proper Row Level Security (RLS) policies and set up storage for your application
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            These actions will configure your Supabase database with appropriate RLS policies 
            and set up storage buckets that your application needs.
          </p>
          
          {status !== 'idle' && (
            <Alert className={
              status === 'loading' ? 'bg-blue-50' : 
              status === 'success' ? 'bg-green-50' : 
              'bg-red-50'
            }>
              <AlertTitle>
                {status === 'loading' ? 'Processing...' : 
                 status === 'success' ? 'Success!' : 
                 'Error!'}
              </AlertTitle>
              <AlertDescription>
                <p>{message}</p>
                {detailedMessage && (
                  <pre className="mt-2 p-2 bg-black/5 rounded text-xs overflow-auto">
                    {detailedMessage}
                  </pre>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-wrap justify-between gap-2">
        <Button 
          onClick={checkEnvironment}
          disabled={status === 'loading'}
          variant="outline"
        >
          Check Environment
        </Button>
        
        <Button 
          onClick={applyRLSPolicies}
          disabled={status === 'loading'}
          variant="outline"
        >
          Apply RLS Policies
        </Button>
        
        <Button 
          onClick={setupStorage}
          disabled={status === 'loading'}
          className="w-full mt-2"
        >
          Set Up Storage (Recommended)
        </Button>
      </CardFooter>
    </Card>
  );
} 