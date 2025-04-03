'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"

interface Schedule {
  id: string
  day: string
  time: string
  workouts: {
    id: string
    title: string
    description: string
    duration: number
    level: string
    calories: number
  }
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSchedules()
  }, [])

  async function fetchSchedules() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('schedules')
        .select(`
          *,
          workouts (
            id,
            title,
            description,
            duration,
            level,
            calories
          )
        `)
        .eq('user_id', session.user.id)
        .order('day', { ascending: true })
        .order('time', { ascending: true })

      if (error) throw error
      setSchedules(data || [])
    } catch (error) {
      console.error('Error fetching schedules:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="container py-8">Loading...</div>
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Weekly Schedule</h1>
        <Button>Add Workout</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {DAYS.map((day) => {
          const daySchedules = schedules.filter((s) => s.day === day)
          return (
            <Card key={day} className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">{day}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {daySchedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="p-3 bg-primary-50 rounded-lg"
                    >
                      <p className="font-medium text-sm">
                        {schedule.time}
                      </p>
                      <p className="font-semibold">
                        {schedule.workouts.title}
                      </p>
                      <div className="mt-2 text-sm text-gray-600">
                        <p>{schedule.workouts.duration} min</p>
                        <p>{schedule.workouts.level}</p>
                      </div>
                    </div>
                  ))}
                  {daySchedules.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No workouts scheduled
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
} 