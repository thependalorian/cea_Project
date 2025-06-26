/**
 * useAsyncState Hook
 * Purpose: Manage async operations with loading, error, and data states
 * Location: /hooks/useAsyncState.ts
 */

import { useState, useCallback } from 'react'

interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

interface UseAsyncStateResult<T> {
  state: AsyncState<T>
  execute: (asyncFunction: () => Promise<T>) => Promise<T | null>
  reset: () => void
  setData: (data: T) => void
}

export function useAsyncState<T = any>(
  initialData: T | null = null
): UseAsyncStateResult<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    loading: false,
    error: null,
  })

  const execute = useCallback(async (asyncFunction: () => Promise<T>) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const result = await asyncFunction()
      setState({ data: result, loading: false, error: null })
      return result
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error))
      setState(prev => ({ ...prev, loading: false, error: errorObj }))
      return null
    }
  }, [])

  const reset = useCallback(() => {
    setState({ data: initialData, loading: false, error: null })
  }, [initialData])

  const setData = useCallback((data: T) => {
    setState(prev => ({ ...prev, data, error: null }))
  }, [])

  return { state, execute, reset, setData }
}

// Utility hook for simple boolean loading states
export function useLoading() {
  const [loading, setLoading] = useState(false)

  const withLoading = useCallback(async <T>(asyncFunction: () => Promise<T>) => {
    setLoading(true)
    try {
      const result = await asyncFunction()
      return result
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, withLoading, setLoading }
} 