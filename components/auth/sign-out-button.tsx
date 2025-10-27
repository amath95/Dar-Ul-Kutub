'use client'

import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { ButtonProps } from '@/components/ui/button'

interface SignOutButtonProps extends ButtonProps {
  callbackUrl?: string
}

export function SignOutButton({ callbackUrl = '/', ...props }: SignOutButtonProps) {
  const handleSignOut = async () => {
    await signOut({ callbackUrl })
  }

  return (
    <Button onClick={handleSignOut} {...props}>
      Sign Out
    </Button>
  )
}
