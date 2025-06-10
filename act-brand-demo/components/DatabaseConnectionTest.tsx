/**
 * Database Connection Test Component - Alliance for Climate Transition
 * Tests and displays live database connection status
 * Location: act-brand-demo/components/DatabaseConnectionTest.tsx
 */

"use client";

import React, { useState, useEffect } from 'react';
import { AnalyticsService } from '../lib/database';
import { ACTCard } from './ui/ACTCard';
import { CheckCircle, XCircle, RefreshCw, Database, AlertTriangle } from 'lucide-react';

interface ConnectionStatus {
  connected: boolean;
  error?: string;
  lastChecked?: Date;
  responseTime?: number;
}

export function DatabaseConnectionTest() {
  const [status, setStatus] = useState<ConnectionStatus>({
    connected: false,
    lastChecked: undefined,
    responseTime: undefined,
  });
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    const startTime = Date.now();
    
    try {
      console.log('🔍 Testing database connection...');
      const result = await AnalyticsService.testConnection();
      const responseTime = Date.now() - startTime;
      
      setStatus({
        connected: result.success,
        error: result.error,
        lastChecked: new Date(),
        responseTime,
      });
      
      console.log('📊 Connection test result:', {
        success: result.success,
        error: result.error,
        responseTime: `${responseTime}ms`
      });
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      setStatus({
        connected: false,
        error: String(error),
        lastChecked: new Date(),
        responseTime: Date.now() - startTime,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <ACTCard className="mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Database className="w-5 h-5 text-spring-green" />
        <h3 className="text-ios-title-3 font-sf-pro font-medium text-midnight-forest">
          Database Connection Status
        </h3>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {isLoading ? (
            <RefreshCw className="w-5 h-5 text-spring-green animate-spin" />
          ) : status.connected ? (
            <CheckCircle className="w-5 h-5 text-spring-green" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
          
          <div>
            <span className={`text-ios-body font-sf-pro font-medium ${
              status.connected ? 'text-spring-green' : 'text-red-500'
            }`}>
              {isLoading ? 'Testing...' : status.connected ? 'Connected' : 'Disconnected'}
            </span>
            
            {status.lastChecked && (
              <p className="text-ios-caption text-midnight-forest/60 font-sf-pro">
                Last checked: {status.lastChecked.toLocaleTimeString()}
                {status.responseTime && ` (${status.responseTime}ms)`}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={testConnection}
          disabled={isLoading}
          className="px-3 py-1.5 bg-spring-green/10 text-spring-green rounded-ios-button text-ios-caption font-sf-pro hover:bg-spring-green/20 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Again'}
        </button>
      </div>

      {status.error && (
        <div className="bg-red-50 border border-red-200 rounded-ios-lg p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-ios-caption font-sf-pro font-medium text-red-800">
                Connection Error:
              </p>
              <p className="text-ios-caption font-sf-pro text-red-700 mt-1">
                {status.error}
              </p>
            </div>
          </div>
        </div>
      )}

      {!status.connected && (
        <div className="bg-seafoam-blue/10 border border-seafoam-blue/20 rounded-ios-lg p-3 mt-3">
          <div className="flex items-start gap-2">
            <Database className="w-4 h-4 text-seafoam-blue mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-ios-caption font-sf-pro font-medium text-seafoam-blue">
                Using Fallback Data:
              </p>
              <p className="text-ios-caption font-sf-pro text-midnight-forest/70 mt-1">
                The dashboard will display realistic demo data while the database connection is being established.
              </p>
            </div>
          </div>
        </div>
      )}
    </ACTCard>
  );
} 