'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'

function mapAuthError(error: string): string {
  if (error.toLowerCase().includes('user already registered')) {
    return 'This email is already in use'
  }
  return error
}

export function RegisterForm() {
  const { signUp, user, loading, error: authError } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [displayNameError, setDisplayNameError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Public registration always creates a 'student' (enforced server-side
  // by the handle_new_user trigger), so there's no role to branch on here.
  const redirectTo = searchParams.get('redirect') || '/learn'

  // Redirect when user becomes authenticated
  useEffect(() => {
    if (user && !loading) {
      router.push(redirectTo)
    }
  }, [user, loading, router, redirectTo])

  function validateForm(): boolean {
    let valid = true
    setEmailError('')
    setDisplayNameError('')
    setPasswordError('')

    if (!email.includes('@')) {
      setEmailError('Please enter a valid email address')
      valid = false
    }

    if (!displayName.trim()) {
      setDisplayNameError('Display name is required')
      valid = false
    }

    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      valid = false
    }

    return valid
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validateForm()) return

    setSubmitting(true)
    await signUp(email, password, displayName.trim())
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#FAFAFA]">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-sm border border-[#E4E4E7] p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold" style={{ color: '#FE669A' }}>WordPal</h1>
            <p className="mt-2 text-[#71717A]">Create your account to start learning</p>
          </div>

          {/* Auth error */}
          {authError && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
              {mapAuthError(authError)}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#18181B] mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-[#E4E4E7] bg-white text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                placeholder="you@example.com"
                autoComplete="email"
              />
              {emailError && (
                <p className="mt-1 text-sm text-red-600">{emailError}</p>
              )}
            </div>

            {/* Display Name */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-[#18181B] mb-1">
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-[#E4E4E7] bg-white text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                placeholder="Your name"
                autoComplete="name"
              />
              {displayNameError && (
                <p className="mt-1 text-sm text-red-600">{displayNameError}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#18181B] mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-[#E4E4E7] bg-white text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
              {passwordError && (
                <p className="mt-1 text-sm text-red-600">{passwordError}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-lg bg-[#6366F1] hover:bg-[#4F46E5] text-white font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Link to sign in */}
          <p className="mt-6 text-center text-sm text-[#71717A]">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-[#6366F1] hover:text-[#4F46E5] font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
