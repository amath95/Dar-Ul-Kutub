import { auth } from '@/lib/auth'
import { UserRole } from '@prisma/client'
import { redirect } from 'next/navigation'

export async function getSession() {
  return await auth()
}

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user
}

export async function requireAuth() {
  const session = await getSession()

  if (!session?.user) {
    redirect('/auth/login')
  }

  return session.user
}

export async function requireRole(roles: UserRole | UserRole[]) {
  const user = await requireAuth()

  const allowedRoles = Array.isArray(roles) ? roles : [roles]

  if (!allowedRoles.includes(user.role)) {
    redirect('/auth/unauthorized')
  }

  return user
}

export async function requireAdmin() {
  return await requireRole('ADMIN')
}

export async function requireVendor() {
  return await requireRole(['ADMIN', 'VENDOR'])
}
