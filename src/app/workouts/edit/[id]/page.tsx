'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { use } from 'react'

interface Exercise {
  id: string
  name: string
  sets: number
  reps: number
  weight?: number
}

interface Workout {
  id: string
  title: string
  description: string
  duration: number
  calories: number
  level: string
  exercises: Exercise[]
}

export default function EditWorkoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [shareToCommunity, setShareToCommunity] = useState(false)
  const [exercises, setExercises] = useState<Exercise[]>([{ id: '', name: '', sets: 0, reps: 0 }])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 0,
    calories: 0,
    level: 'Beginner',
  })

  useEffect(() => {
    fetchWorkout()
  }, [id])

  async function fetchWorkout() {
    try {
      const response = await fetch(`/api/workouts/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch workout')
      }
      const workout: Workout = await response.json()
      setFormData({
        title: workout.title,
        description: workout.description || '',
        duration: workout.duration,
        calories: workout.calories,
        level: workout.level,
      })
      setExercises(workout.exercises)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching workout:', error)
      toast.error('Failed to load workout')
      router.push('/workouts')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const requestData = {
        ...formData,
        exercises,
        share_to_community: shareToCommunity,
      }

      const response = await fetch(`/api/workouts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update workout')
      }

      toast.success('Workout updated successfully!')
      router.push('/workouts')
    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update workout')
    } finally {
      setSaving(false)
    }
  }

  const addExercise = () => {
    setExercises([...exercises, { id: '', name: '', sets: 0, reps: 0 }])
  }

  const updateExercise = (index: number, field: keyof Exercise, value: string | number | undefined) => {
    const newExercises = [...exercises]
    newExercises[index] = { ...newExercises[index], [field]: value }
    setExercises(newExercises)
  }

  const removeExercise = (index: number) => {
    const newExercises = exercises.filter((_, i) => i !== index)
    setExercises(newExercises)
  }

  if (loading) {
    return <div className="container py-8">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Workout</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="calories">Calories Burned</Label>
                  <Input
                    id="calories"
                    type="number"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={formData.level}
                  onValueChange={(value) => setFormData({ ...formData, level: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Exercises</Label>
                <Button type="button" variant="outline" onClick={addExercise}>
                  Add Exercise
                </Button>
              </div>

              {exercises.map((exercise, index) => (
                <div key={index} className="grid grid-cols-5 gap-4 p-4 border rounded-lg">
                  <div className="col-span-4 grid grid-cols-4 gap-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={exercise.name}
                        onChange={(e) => updateExercise(index, 'name', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label>Sets</Label>
                      <Input
                        type="number"
                        value={exercise.sets}
                        onChange={(e) => updateExercise(index, 'sets', Number(e.target.value))}
                        required
                      />
                    </div>
                    <div>
                      <Label>Reps</Label>
                      <Input
                        type="number"
                        value={exercise.reps}
                        onChange={(e) => updateExercise(index, 'reps', Number(e.target.value))}
                        required
                      />
                    </div>
                    <div>
                      <Label>Weight (kg)</Label>
                      <Input
                        type="number"
                        value={exercise.weight || ''}
                        onChange={(e) => updateExercise(index, 'weight', e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeExercise(index)}
                      className="text-red-500"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">Share with Community</CardTitle>
                <CardDescription>
                  Would you like to share this updated workout with the community?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="share"
                    checked={shareToCommunity}
                    onCheckedChange={(checked) => setShareToCommunity(checked as boolean)}
                  />
                  <Label htmlFor="share" className="text-base">
                    Yes, share this workout with the community
                  </Label>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/workouts')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 