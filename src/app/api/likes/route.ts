import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { post_id } = body

    // Check if like already exists
    const { data: existingLike } = await supabase
      .from('likes')
      .select()
      .eq('post_id', post_id)
      .eq('user_id', session.user.id)
      .single()

    if (existingLike) {
      // Unlike the post
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', post_id)
        .eq('user_id', session.user.id)

      if (error) throw error
      return NextResponse.json({ liked: false })
    }

    // Like the post
    const { error } = await supabase
      .from('likes')
      .insert([
        {
          post_id,
          user_id: session.user.id
        }
      ])

    if (error) throw error

    return NextResponse.json({ liked: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const post_id = searchParams.get('post_id')

    if (!post_id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    const { data: likes, error } = await supabase
      .from('likes')
      .select('user_id')
      .eq('post_id', post_id)

    if (error) throw error

    return NextResponse.json(likes)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 