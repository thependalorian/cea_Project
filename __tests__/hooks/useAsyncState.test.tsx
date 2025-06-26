/**
 * useAsyncState Hook Tests
 * Testing async state management functionality
 */

import { renderHook, act } from '@testing-library/react'
import { useAsyncState, useLoading } from '@/hooks/useAsyncState'

describe('useAsyncState', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAsyncState())

    expect(result.current.state).toEqual({
      data: null,
      loading: false,
      error: null,
    })
  })

  it('should initialize with provided initial data', () => {
    const initialData = { id: 1, name: 'test' }
    const { result } = renderHook(() => useAsyncState(initialData))

    expect(result.current.state.data).toEqual(initialData)
  })

  it('should handle successful async operation', async () => {
    const { result } = renderHook(() => useAsyncState())
    const mockData = { id: 1, name: 'success' }

    const asyncFn = jest.fn().mockResolvedValue(mockData)

    await act(async () => {
      const response = await result.current.execute(asyncFn)
      expect(response).toEqual(mockData)
    })

    expect(result.current.state).toEqual({
      data: mockData,
      loading: false,
      error: null,
    })
    expect(asyncFn).toHaveBeenCalledTimes(1)
  })

  it('should handle failed async operation', async () => {
    const { result } = renderHook(() => useAsyncState())
    const mockError = new Error('Test error')

    const asyncFn = jest.fn().mockRejectedValue(mockError)

    await act(async () => {
      const response = await result.current.execute(asyncFn)
      expect(response).toBeNull()
    })

    expect(result.current.state).toEqual({
      data: null,
      loading: false,
      error: mockError,
    })
  })

  it('should set loading state during async operation', async () => {
    const { result } = renderHook(() => useAsyncState())
    
    const asyncFn = jest.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve('data'), 100))
    )

    act(() => {
      result.current.execute(asyncFn)
    })

    expect(result.current.state.loading).toBe(true)

    await act(async () => {
      await asyncFn()
    })

    expect(result.current.state.loading).toBe(false)
  })

  it('should reset state correctly', () => {
    const initialData = { id: 1 }
    const { result } = renderHook(() => useAsyncState(initialData))

    act(() => {
      result.current.setData({ id: 2 })
    })

    expect(result.current.state.data).toEqual({ id: 2 })

    act(() => {
      result.current.reset()
    })

    expect(result.current.state).toEqual({
      data: initialData,
      loading: false,
      error: null,
    })
  })
})

describe('useLoading', () => {
  it('should initialize with loading false', () => {
    const { result } = renderHook(() => useLoading())
    expect(result.current.loading).toBe(false)
  })

  it('should handle loading state with withLoading', async () => {
    const { result } = renderHook(() => useLoading())
    const mockData = 'success'
    const asyncFn = jest.fn().mockResolvedValue(mockData)

    await act(async () => {
      const response = await result.current.withLoading(asyncFn)
      expect(response).toBe(mockData)
    })

    expect(result.current.loading).toBe(false)
    expect(asyncFn).toHaveBeenCalledTimes(1)
  })

  it('should set loading to false even if async function throws', async () => {
    const { result } = renderHook(() => useLoading())
    const asyncFn = jest.fn().mockRejectedValue(new Error('Test error'))

    await act(async () => {
      try {
        await result.current.withLoading(asyncFn)
      } catch (error) {
        // Expected to throw
      }
    })

    expect(result.current.loading).toBe(false)
  })
}) 