'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useEffect, useState } from "react"

interface Post {
  id: string
  content: string
  created_at: string
  users: {
    id: string
    name: string
    image: string
  }
  likes: {
    id: string
    user_id: string
  }[]
  comments: {
    id: string
    content: string
    created_at: string
    users: {
      id: string
      name: string
      image: string
    }
  }[]
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [newPost, setNewPost] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    try {
      const response = await fetch('/api/posts')
      if (!response.ok) {
        throw new Error('Failed to fetch posts')
      }
      const data = await response.json()
      setPosts(data)
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmitPost(e: React.FormEvent) {
    e.preventDefault()
    if (!newPost.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newPost }),
      })

      if (!response.ok) {
        throw new Error('Failed to create post')
      }

      setNewPost('')
      fetchPosts()
    } catch (error) {
      console.error('Error creating post:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="container py-8">Loading...</div>
  }

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Community</h1>

        <form onSubmit={handleSubmitPost} className="mb-8">
          <Textarea
            placeholder="Share your fitness journey..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="mb-4"
          />
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Posting...' : 'Post'}
          </Button>
        </form>

        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardHeader className="flex items-center space-x-4">
                <img
                  src={post.users.image || '/default-avatar.png'}
                  alt={post.users.name}
                  className="h-10 w-10 rounded-full"
                />
                <div>
                  <h3 className="font-semibold">{post.users.name}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{post.content}</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    ❤️ {post.likes.length}
                  </Button>
                  <Button variant="ghost" size="sm">
                    💬 {post.comments.length}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
} 