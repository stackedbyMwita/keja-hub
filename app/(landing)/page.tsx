'use client'
import MaxWidthWrapper from "@/components/layout/MaxWidthWrapper";
import Display from "@/components/theme/Display";
import { createClient } from '@/lib/supabase/client';
import { useSession, useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export default function Home() {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  // The `useUser()` hook is used to ensure that Clerk has loaded data about the signed in user
  const { user } = useUser()
  // The `useSession()` hook is used to get the Clerk session object
  // The session object is used to get the Clerk session token
  const { session } = useSession()

  // Create a `client` object for accessing Supabase data using the Clerk token
  const client = createClient()

  // This `useEffect` will wait for the User object to be loaded before requesting
  // the tasks for the signed in user
  useEffect(() => {
    if (!user) return

    async function loadTasks() {
      setLoading(true)
      const { data, error } = await client.from('tasks').select()
      if (!error) setTasks(data)
      setLoading(false)
    }

    loadTasks()
  }, [user])

  async function createTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // Insert task into the "tasks" database
    await client.from('tasks').insert({
      name,
    })
    window.location.reload()
  }
  return (
    <div className="min-h-screen bg-background">
      <MaxWidthWrapper>
        <div>
          <h1>Tasks</h1>

          {loading && <p>Loading...</p>}

          {!loading && tasks.length > 0 && tasks.map((task: any) => <p key={task.id}>{task.name}</p>)}

          {!loading && tasks.length === 0 && <p>No tasks found</p>}

          <form onSubmit={createTask}>
            <input
              autoFocus
              type="text"
              name="name"
              placeholder="Enter new task"
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
            <button type="submit">Add</button>
          </form>
        </div>
        <Display />
      </MaxWidthWrapper>
    </div>
  );
}
