import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

interface Exercise {
  name: string
  sets: number
  reps: number
  weight?: number
}

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: workouts, error } = await supabase
      .from('workouts')
      .select(`
        *,
        exercises (*)
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(workouts)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const workoutData = await request.json()

    // Validate required fields
    if (!workoutData.title || !workoutData.exercises || workoutData.exercises.length === 0) {
      return NextResponse.json(
        { error: 'Title and at least one exercise are required' },
        { status: 400 }
      )
    }

    // Insert workout
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .insert({
        user_id: session.user.id,
        title: workoutData.title,
        description: workoutData.description,
        duration: workoutData.duration,
        calories: workoutData.calories,
        level: workoutData.level,
      })
      .select()
      .single()

    if (workoutError) {
      console.error('Workout creation error:', workoutError)
      return NextResponse.json(
        { error: 'Failed to create workout' },
        { status: 500 }
      )
    }

    // Insert exercises
    const exercisesToInsert = workoutData.exercises.map((exercise: Exercise) => ({
      workout_id: workout.id,
      name: exercise.name,
      sets: exercise.sets,
      reps: exercise.reps,
      weight: exercise.weight === undefined ? null : exercise.weight,
    }))

    const { error: exercisesError } = await supabase
      .from('exercises')
      .insert(exercisesToInsert)

    if (exercisesError) {
      console.error('Exercises creation error:', exercisesError)
      // Rollback workout creation
      await supabase.from('workouts').delete().eq('id', workout.id)
      return NextResponse.json(
        { error: `Failed to create exercises: ${exercisesError.message}` },
        { status: 500 }
      )
    }

    // If sharing to community, create a post
    if (workoutData.share_to_community) {
      try {
        // Format exercises list
        const exercisesList = workoutData.exercises
          .map((exercise: Exercise) => 
            `• ${exercise.name}: ${exercise.sets} sets × ${exercise.reps} reps${exercise.weight ? ` (${exercise.weight}kg)` : ''}`
          )
          .join('\n')

        // Create the post content with workout details
        const postContent = `🏋️‍♂️ New Workout: ${workoutData.title}\n\n${workoutData.description}\n\n💪 Exercises:\n${exercisesList}\n\n⏱️ Duration: ${workoutData.duration} minutes\n🔥 Calories: ${workoutData.calories}\n📈 Level: ${workoutData.level}\n\nTry this workout and let me know what you think! 💪`

        // Insert the post
        const { data: post, error: postError } = await supabase
          .from('posts')
          .insert({
            user_id: session.user.id,
            content: postContent,
            workout_id: workout.id,
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
          // Log the error but don't fail the workout creation
        } else {
          console.log('Successfully created community post:', post)
        }
      } catch (error) {
        console.error('Error creating community post:', error)
        // Log the error but don't fail the workout creation
      }
    }

    return NextResponse.json(workout, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Workout ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id)

    if (error) throw error

    return NextResponse.json({ message: 'Workout deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 