'use client'

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { createSupabaseBrowserClient } from '@/lib/services/supabase-browser'
import { getRoleFromAppMetadata, isValidRole } from '@/lib/services/role-service'
import type { UserRole } from '@/types/admin'

export interface AuthState {
  user: User | null
  session: Session | null
  /** App role read from the JWT's app_metadata, resolved alongside the session. */
  role: UserRole | null
  loading: boolean
  error: string | null
}

export interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signOut: () => Promise<void>
}

function roleFromSession(session: Session | null): UserRole | null {
  const raw = getRoleFromAppMetadata(session?.user?.app_metadata)
  return isValidRole(raw) ? raw : null
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = useMemo(() => {
    try {
      return createSupabaseBrowserClient()
    } catch {
      return null
    }
  }, [])

  // Restore session on mount and subscribe to auth state changes
  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession)
      setUser(currentSession?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!supabase) {
        setError('Supabase not configured')
        return
      }
      setError(null)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (signInError) {
        setError(signInError.message)
      }
    },
    [supabase]
  )

  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      if (!supabase) {
        setError('Supabase not configured')
        return
      }
      setError(null)
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
        },
      })
      if (signUpError) {
        setError(signUpError.message)
      }
    },
    [supabase]
  )

  const signOut = useCallback(async () => {
    if (!supabase) {
      setError('Supabase not configured')
      return
    }
    setError(null)
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) {
      setError(signOutError.message)
    } else {
      setUser(null)
      setSession(null)
    }
  }, [supabase])

  const role = useMemo(() => roleFromSession(session), [session])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      role,
      loading,
      error,
      signIn,
      signUp,
      signOut,
    }),
    [user, session, role, loading, error, signIn, signUp, signOut]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
