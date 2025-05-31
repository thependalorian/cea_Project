import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        storageKey: 'cea-supabase-auth',
        storage: {
          getItem: (key) => {
            if (typeof window === 'undefined') {
              return null
            }
            const value = localStorage.getItem(key)
            if (!value) return null
            try {
              return JSON.parse(value)
            } catch (error) {
              console.error('Error parsing auth value:', error)
              return null
            }
          },
          setItem: (key, value) => {
            if (typeof window === 'undefined') {
              return
            }
            localStorage.setItem(key, JSON.stringify(value))
          },
          removeItem: (key) => {
            if (typeof window === 'undefined') {
              return
            }
            localStorage.removeItem(key)
          },
        },
      },
    }
  )
}
