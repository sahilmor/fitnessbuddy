'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface UserProfile {
  name: string
  bio: string
  fitness_level: string
}

interface WorkoutStats {
  total: number
  thisWeek: number
  streak: number
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<WorkoutStats>({
    total: 0,
    thisWeek: 0,
    streak: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  async function fetchDashboardData() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session')

      // Fetch user profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      setProfile(profile)

      // Fetch workout stats
      const { data: workouts } = await supabase
        .from('workouts')
        .select('created_at')
        .eq('user_id', session.user.id)

      if (workouts) {
        const now = new Date()
        const thisWeek = workouts.filter(w => {
          const workoutDate = new Date(w.created_at)
          return now.getTime() - workoutDate.getTime() <= 7 * 24 * 60 * 60 * 1000
        })

        setStats({
          total: workouts.length,
          thisWeek: thisWeek.length,
          streak: calculateStreak(workouts)
        })
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  function calculateStreak(workouts: any[]): number {
    // Add streak calculation logic here
    return 0
  }

  if (loading) {
    return <div className="container py-8">Loading...</div>
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Welcome back, {profile?.name}!</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Workouts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.thisWeek}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.streak} days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Workouts</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add upcoming workouts component */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add recent activity component */}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 