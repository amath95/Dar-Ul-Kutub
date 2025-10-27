'use client'

import { useSession } from 'next-auth/react'
import { SignOutButton } from './sign-out-button'

export function UserNav() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div className="text-sm text-muted-foreground">Loading...</div>
  }

  if (!session?.user) {
    return (
      <a
        href="/auth/login"
        className="text-sm font-medium text-primary hover:underline"
      >
        Sign In
      </a>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <div className="text-sm">
        <div className="font-medium">{session.user.name}</div>
        <div className="text-muted-foreground">{session.user.role}</div>
      </div>
      <SignOutButton variant="outline" size="sm" />
    </div>
  )
}
