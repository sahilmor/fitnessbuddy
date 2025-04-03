'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    fitnessLevel: 'beginner',
    goals: [] as string[],
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session')

      // Create user profile
      const { error } = await supabase
        .from('users')
        .upsert({
          id: session.user.id,
          name: formData.name,
          bio: formData.bio,
          email: session.user.email,
        })

      if (error) throw error

      // Create initial goals
      if (formData.goals.length > 0) {
        const { error: goalsError } = await supabase
          .from('goals')
          .insert(
            formData.goals.map(goal => ({
              user_id: session.user.id,
              title: goal,
              target: 0,
              current: 0,
              unit: 'times'
            }))
          )

        if (goalsError) throw goalsError
      }

      toast.success('Profile created successfully!')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to create profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-md">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Complete Your Profile</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself and your fitness journey"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Fitness Level</label>
              <select
                className="w-full rounded-md border border-gray-300 p-2"
                value={formData.fitnessLevel}
                onChange={(e) => setFormData({ ...formData, fitnessLevel: e.target.value })}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Fitness Goals</label>
              <div className="space-y-2">
                {['Weight Loss', 'Muscle Gain', 'Endurance', 'Flexibility'].map((goal) => (
                  <label key={goal} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.goals.includes(goal)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            goals: [...formData.goals, goal]
                          })
                        } else {
                          setFormData({
                            ...formData,
                            goals: formData.goals.filter(g => g !== goal)
                          })
                        }
                      }}
                      className="mr-2"
                    />
                    {goal}
                  </label>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Creating Profile...' : 'Complete Profile'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
} 