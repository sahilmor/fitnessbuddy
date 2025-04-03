'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Workout {
  id: string
  title: string
  description: string
  duration: number
  calories: number
  created_at: string
  exercises: {
    name: string
    sets: number
    reps: number
    weight: number | null
  }[]
}

export default function TrackingPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalCalories: 0,
    totalDuration: 0,
    streak: 0
  })

  useEffect(() => {
    fetchWorkouts()
  }, [])

  async function fetchWorkouts() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('workouts')
        .select(`
          *,
          exercises (*)
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setWorkouts(data || [])

      // Calculate stats
      const totalCalories = data?.reduce((sum, w) => sum + w.calories, 0) || 0
      const totalDuration = data?.reduce((sum, w) => sum + w.duration, 0) || 0
      const streak = calculateStreak(data || [])

      setStats({
        totalWorkouts: data?.length || 0,
        totalCalories,
        totalDuration,
        streak
      })
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to fetch workouts')
    } finally {
      setLoading(false)
    }
  }

  function calculateStreak(workouts: Workout[]): number {
    if (!workouts.length) return 0

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    let streak = 0
    let currentDate = today

    for (const workout of workouts) {
      const workoutDate = new Date(workout.created_at)
      workoutDate.setHours(0, 0, 0, 0)

      if (currentDate.getTime() === workoutDate.getTime()) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  }

  if (loading) {
    return <div className="container py-8">Loading...</div>
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Workout Tracking</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Workouts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalWorkouts}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Calories</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalCalories}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalDuration} min</p>
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

      {/* Workout History */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-4">Workout History</h2>
        {workouts.map((workout) => (
          <Card key={workout.id}>
            <CardHeader>
              <CardTitle>{workout.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{workout.description}</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-medium">{workout.duration} min</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Calories</p>
                  <p className="font-medium">{workout.calories}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Exercises</p>
                <ul className="space-y-2">
                  {workout.exercises.map((exercise, index) => (
                    <li key={index} className="flex items-center">
                      <span className="font-medium">{exercise.name}</span>
                      <span className="mx-2">•</span>
                      <span>{exercise.sets} sets × {exercise.reps} reps</span>
                      {exercise.weight && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{exercise.weight} kg</span>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 