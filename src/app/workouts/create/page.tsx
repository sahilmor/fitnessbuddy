'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

interface Exercise {
  name: string
  sets: number
  reps: number
  weight?: number
}

export default function CreateWorkoutPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [shareToCommunity, setShareToCommunity] = useState(false)
  const [exercises, setExercises] = useState<Exercise[]>([{ name: '', sets: 0, reps: 0 }])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 0,
    calories: 0,
    level: 'Beginner',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const requestData = {
        ...formData,
        exercises,
        share_to_community: shareToCommunity,
      }
      console.log('Sending workout data:', requestData)

      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('API Error:', error)
        throw new Error(error.error || 'Failed to create workout')
      }

      toast.success('Workout created successfully!')
      router.push('/workouts')
    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create workout')
    } finally {
      setLoading(false)
    }
  }

  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: 0, reps: 0 }])
  }

  const updateExercise = (index: number, field: keyof Exercise, value: string | number | undefined) => {
    const newExercises = [...exercises]
    newExercises[index] = { ...newExercises[index], [field]: value }
    setExercises(newExercises)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Workout</CardTitle>
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
                <div key={index} className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
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
              ))}
            </div>

            {/* <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">Share with Community</CardTitle>
                <CardDescription>
                  Would you like to share this workout with the community? Other users will be able to see and try your workout.
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
            </Card> */}

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/workouts')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Workout'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 