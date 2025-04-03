'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        // No session, redirect to login
        router.push('/login')
        return
      }

      // Check if profile exists
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (!profile) {
        // No profile, redirect to profile setup
        router.push('/onboarding')
      } else {
        // Profile exists, redirect to dashboard
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error:', error)
      router.push('/login')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-pulse">Loading...</div>
    </div>
  )
}
