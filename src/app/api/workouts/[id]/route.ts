import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

interface Exercise {
  id: string
  name: string
  sets: number
  reps: number
  weight?: number
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .select(`
        *,
        exercises (*)
      `)
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single()

    if (workoutError) {
      console.error('Error fetching workout:', workoutError)
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 })
    }

    return NextResponse.json(workout)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const workoutData = await request.json()

    if (!workoutData.title || !workoutData.exercises || workoutData.exercises.length === 0) {
      return NextResponse.json(
        { error: 'Title and at least one exercise are required' },
        { status: 400 }
      )
    }

    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .update({
        title: workoutData.title,
        description: workoutData.description,
        duration: workoutData.duration,
        calories: workoutData.calories,
        level: workoutData.level,
      })
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select()
      .single()

    if (workoutError) {
      console.error('Workout update error:', workoutError)
      return NextResponse.json(
        { error: 'Failed to update workout' },
        { status: 500 }
      )
    }

    const { error: deleteError } = await supabase
      .from('exercises')
      .delete()
      .eq('workout_id', id)

    if (deleteError) {
      console.error('Error deleting exercises:', deleteError)
      return NextResponse.json(
        { error: 'Failed to update exercises' },
        { status: 500 }
      )
    }

    const exercisesToInsert = workoutData.exercises.map((exercise: Exercise) => ({
      workout_id: id,
      name: exercise.name,
      sets: exercise.sets,
      reps: exercise.reps,
      weight: exercise.weight === undefined ? null : exercise.weight,
    }))

    const { error: exercisesError } = await supabase
      .from('exercises')
      .insert(exercisesToInsert)

    if (exercisesError) {
      console.error('Exercises update error:', exercisesError)
      return NextResponse.json(
        { error: `Failed to update exercises: ${exercisesError.message}` },
        { status: 500 }
      )
    }

    if (workoutData.share_to_community) {
      try {
        const exercisesList = workoutData.exercises
          .map((exercise: Exercise) => 
            `• ${exercise.name}: ${exercise.sets} sets × ${exercise.reps} reps${exercise.weight ? ` (${exercise.weight}kg)` : ''}`
          )
          .join('\n')

        const postContent = `🏋️‍♂️ Updated Workout: ${workoutData.title}\n\n${workoutData.description}\n\n💪 Exercises:\n${exercisesList}\n\n⏱️ Duration: ${workoutData.duration} minutes\n🔥 Calories: ${workoutData.calories}\n📈 Level: ${workoutData.level}\n\nTry this updated workout and let me know what you think! 💪`

        const { data: post, error: postError } = await supabase
          .from('posts')
          .insert({
            user_id: session.user.id,
            content: postContent,
            workout_id: id,
          })
          .select(`
            *,
            users (id, name, image),
            likes (id, user_id),
            comments (
              id,
              content,
              created_at,
              users (id, name, image)
            )
          `)
          .single()

        if (postError) {
          console.error('Post creation error:', postError)
        } else {
          console.log('Successfully created community post:', post)
        }
      } catch (error) {
        console.error('Error creating community post:', error)
      }
    }

    return NextResponse.json(workout)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error: exercisesError } = await supabase
      .from('exercises')
      .delete()
      .eq('workout_id', id)

    if (exercisesError) {
      console.error('Error deleting exercises:', exercisesError)
      return NextResponse.json(
        { error: 'Failed to delete exercises' },
        { status: 500 }
      )
    }

    const { error: workoutError } = await supabase
      .from('workouts')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id)

    if (workoutError) {
      console.error('Error deleting workout:', workoutError)
      return NextResponse.json(
        { error: 'Failed to delete workout' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Workout deleted successfully' })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 