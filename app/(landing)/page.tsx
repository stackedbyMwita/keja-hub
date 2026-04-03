'use client'

import MaxWidthWrapper from '@/components/layout/MaxWidthWrapper'
import { PostCard } from '@/components/posts/PostCard'
import { Button } from '@/components/ui/button'
import { usePosts } from '@/hooks/usePosts'
import { useUser } from '@clerk/nextjs'
import { ArrowRight, Loader2, Shield, Users, Zap } from 'lucide-react'
import Link from 'next/link'

function PublicFeed() {
  const { data: posts, isLoading } = usePosts()

  if (isLoading) return (
    <div className="flex justify-center py-12">
      <Loader2 className="animate-spin text-muted-foreground" />
    </div>
  )

  return (
    <div className="space-y-3">
      {posts?.slice(0, 5).map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}

export default function LandingPage() {
  const { user } = useUser()

  return (
    <div className="min-h-screen bg-background">

      {/* hero */}
      <MaxWidthWrapper className="max-w-4xl">
        <div className="py-20 text-center space-y-6">
          <h1 className="font-bold tracking-tight">
            The platform built for
            <span className="text-primary"> teams who move fast</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Manage, collaborate, and ship — all in one place. Join thousands of teams already using Hello World.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {user ? (
              <Link href="/dashboard">
                <Button size="lg">
                  Go to dashboard <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/sign-up">
                  <Button size="lg">
                    Get started free <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Link>
                <Link href="/sign-in">
                  <Button size="lg" variant="outline">Sign in</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </MaxWidthWrapper>

      {/* features */}
      <div id="features" className="border-y border-border bg-muted/20">
        <MaxWidthWrapper className="max-w-4xl">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: 'Ship faster', desc: 'Built-in tools that remove friction and help your team deliver.' },
              { icon: Shield, title: 'Secure by default', desc: 'Row-level security and role-based access out of the box.' },
              { icon: Users, title: 'Built for teams', desc: 'Real-time collaboration features designed for modern teams.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon size={18} className="text-primary" />
                </div>
                <h3 className="font-semibold text-base">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </MaxWidthWrapper>
      </div>

      {/* public feed preview */}
      <div id="customers" className="py-4">
        <MaxWidthWrapper className="max-w-2xl">
          <div className="text-center mb-8">
            <h2 className="font-bold mb-2">What people are saying</h2>
            <p className="text-sm text-muted-foreground">
              Join the conversation. {!user && <Link href="/sign-up" className="text-primary hover:underline">Sign up</Link>} to post and interact.
            </p>
          </div>
          <PublicFeed />
          {!user && (
            <div className="mt-6 text-center">
              <Link href="/sign-up">
                <Button variant="outline">
                  See more — join for free <ArrowRight size={14} className="ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </MaxWidthWrapper>
      </div>

    </div>
  )
}