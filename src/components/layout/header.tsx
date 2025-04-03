'use client'

import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function Header() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <img src="/logo.png" alt="Fitness Buddy" className="h-8 w-8" />
          <span className="font-bold text-xl">Fitness Buddy</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/workouts" className="text-sm font-medium hover:text-primary-500">
            Workouts
          </Link>
          <Link href="/community" className="text-sm font-medium hover:text-primary-500">
            Community
          </Link>
          <Link href="/schedule" className="text-sm font-medium hover:text-primary-500">
            Schedule
          </Link>
          <Link href="/profile" className="text-sm font-medium hover:text-primary-500">
            Profile
          </Link>
          <Button
            variant="outline"
            onClick={handleSignOut}
            disabled={loading}
          >
            {loading ? 'Signing out...' : 'Sign out'}
          </Button>
        </nav>
      </div>
    </header>
  )
} 