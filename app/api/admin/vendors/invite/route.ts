import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { successResponse, errorResponse, ValidationError } from '@/lib/api-response'
import { sendEmail } from '@/lib/email/resend'
import { vendorInviteEmail } from '@/lib/email/templates/vendor-invite'
import { z } from 'zod'

const createInviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  expirationDays: z.number().int().positive().optional().default(7),
})

// Create vendor invite
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin()

    const body = await request.json()
    const validation = createInviteSchema.safeParse(body)

    if (!validation.success) {
      throw new ValidationError('Invalid request data', validation.error.errors)
    }

    const { email, expirationDays } = validation.data

    // Check if email already has an active user account
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return errorResponse('EMAIL_EXISTS', 'A user with this email already exists', 400)
    }

    // Check for existing pending invite
    const existingInvite = await db.vendorInvite.findFirst({
      where: {
        email,
        status: 'PENDING',
        expiresAt: {
          gte: new Date(),
        },
      },
    })

    if (existingInvite) {
      return errorResponse(
        'INVITE_EXISTS',
        'An active invitation already exists for this email',
        400
      )
    }

    // Create new invite
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expirationDays)

    const invite = await db.vendorInvite.create({
      data: {
        email,
        expiresAt,
        invitedBy: admin.id,
      },
    })

    // Generate invite URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const inviteUrl = `${appUrl}/vendor/signup?token=${invite.token}`

    // Send invitation email
    try {
      await sendEmail({
        to: email,
        subject: 'Invitation to Join Dar-Ul-Kutub as a Vendor',
        html: vendorInviteEmail({
          inviteUrl,
          expiresInDays: expirationDays,
        }),
      })
    } catch (emailError) {
      console.error('Failed to send invite email:', emailError)
      // Don't fail the request if email fails - invite still created
    }

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: admin.id,
        userRole: admin.role,
        action: 'VENDOR_INVITED',
        entity: 'vendor_invites',
        entityId: invite.id,
        metadata: {
          email,
          expiresAt: invite.expiresAt,
        },
      },
    })

    return successResponse({
      invite: {
        id: invite.id,
        email: invite.email,
        status: invite.status,
        expiresAt: invite.expiresAt,
        inviteUrl, // Include for admin to copy if needed
      },
    })
  } catch (error) {
    if (error instanceof ValidationError) {
      return errorResponse(error.code, error.message, error.status, error.details)
    }
    console.error('Failed to create vendor invite:', error)
    return errorResponse('INTERNAL_ERROR', 'Failed to create vendor invite', 500)
  }
}

// List vendor invites
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as 'PENDING' | 'USED' | 'EXPIRED' | 'REVOKED' | null

    const where = status ? { status } : {}

    const invites = await db.vendorInvite.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: 100, // Limit to last 100
    })

    // Check for expired invites and update them
    const now = new Date()
    const expiredInvites = invites.filter(
      (invite) => invite.status === 'PENDING' && invite.expiresAt < now
    )

    if (expiredInvites.length > 0) {
      await db.vendorInvite.updateMany({
        where: {
          id: {
            in: expiredInvites.map((i) => i.id),
          },
        },
        data: {
          status: 'EXPIRED',
        },
      })
    }

    return successResponse({
      invites: invites.map((invite) => ({
        id: invite.id,
        email: invite.email,
        status: invite.status === 'PENDING' && invite.expiresAt < now ? 'EXPIRED' : invite.status,
        expiresAt: invite.expiresAt,
        usedAt: invite.usedAt,
        revokedAt: invite.revokedAt,
        createdAt: invite.createdAt,
      })),
    })
  } catch (error) {
    console.error('Failed to list vendor invites:', error)
    return errorResponse('INTERNAL_ERROR', 'Failed to list vendor invites', 500)
  }
}
