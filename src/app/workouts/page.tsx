'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Pencil, Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Workout {
  id: string
  title: string
  description: string
  duration: number
  calories: number
  level: string
  created_at: string
  exercises: {
    id: string
    name: string
    sets: number
    reps: number
    weight: number | null
  }[]
}

export default function WorkoutsPage() {
  const router = useRouter()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [workoutToDelete, setWorkoutToDelete] = useState<string | null>(null)

  useEffect(() => {
    fetchWorkouts()
  }, [])

  async function fetchWorkouts() {
    try {
      const response = await fetch('/api/workouts')
      if (!response.ok) {
        throw new Error('Failed to fetch workouts')
      }
      const data = await response.json()
      setWorkouts(data || [])
    } catch (error) {
      console.error('Error fetching workouts:', error)
      setError('Failed to load workouts')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(workoutId: string) {
    try {
      const response = await fetch(`/api/workouts?id=${workoutId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete workout')
      }

      toast.success('Workout deleted successfully')
      fetchWorkouts()
    } catch (error) {
      console.error('Error deleting workout:', error)
      toast.error('Failed to delete workout')
    } finally {
      setDeleteDialogOpen(false)
      setWorkoutToDelete(null)
    }
  }

  if (loading) {
    return <div className="container py-8">Loading...</div>
  }

  if (error) {
    return <div className="container py-8 text-red-500">{error}</div>
  }

  return (
    <div className="container p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Workouts</h1>
        <Button onClick={() => router.push('/workouts/create')}>
          Create Workout
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {workouts.map((workout) => (
          <Card key={workout.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{workout.title}</CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => router.push(`/workouts/edit/${workout.id}`)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setWorkoutToDelete(workout.id)
                    setDeleteDialogOpen(true)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{workout.description}</p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Duration:</span> {workout.duration} minutes
                </div>
                <div>
                  <span className="font-medium">Calories:</span> {workout.calories}
                </div>
                <div>
                  <span className="font-medium">Level:</span> {workout.level}
                </div>
              </div>
              <div className="mt-4">
                <h3 className="font-medium mb-2">Exercises:</h3>
                <ul className="space-y-2">
                  {workout.exercises?.map((exercise) => (
                    <li key={exercise.id} className="text-sm">
                      {exercise.name}: {exercise.sets} sets × {exercise.reps} reps
                      {exercise.weight ? ` (${exercise.weight}kg)` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the workout.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => workoutToDelete && handleDelete(workoutToDelete)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 