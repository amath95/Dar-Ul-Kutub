import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { successResponse, errorResponse, NotFoundError } from '@/lib/api-response'
import { sendEmail } from '@/lib/email/resend'
import { vendorInviteEmail } from '@/lib/email/templates/vendor-invite'

// Resend invite
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin()
    const inviteId = params.id

    const invite = await db.vendorInvite.findUnique({
      where: { id: inviteId },
    })

    if (!invite) {
      throw new NotFoundError('Invite not found')
    }

    if (invite.status !== 'PENDING' && invite.status !== 'EXPIRED') {
      return errorResponse('INVALID_STATUS', 'Can only resend pending or expired invites', 400)
    }

    // Create new invite (invalidates old token)
    const expirationDays = parseInt(process.env.VENDOR_INVITE_EXPIRATION_DAYS || '7')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expirationDays)

    // Revoke old invite
    await db.vendorInvite.update({
      where: { id: inviteId },
      data: { status: 'REVOKED' },
    })

    // Create new invite
    const newInvite = await db.vendorInvite.create({
      data: {
        email: invite.email,
        expiresAt,
        invitedBy: admin.id,
      },
    })

    // Generate invite URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const inviteUrl = `${appUrl}/vendor/signup?token=${newInvite.token}`

    // Resend email
    try {
      await sendEmail({
        to: invite.email,
        subject: 'Invitation to Join Dar-Ul-Kutub as a Vendor (Resent)',
        html: vendorInviteEmail({
          inviteUrl,
          expiresInDays: expirationDays,
        }),
      })
    } catch (emailError) {
      console.error('Failed to resend invite email:', emailError)
    }

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: admin.id,
        userRole: admin.role,
        action: 'VENDOR_INVITE_RESENT',
        entity: 'vendor_invites',
        entityId: newInvite.id,
        metadata: {
          email: invite.email,
          oldInviteId: inviteId,
        },
      },
    })

    return successResponse({
      invite: {
        id: newInvite.id,
        email: newInvite.email,
        status: newInvite.status,
        expiresAt: newInvite.expiresAt,
      },
    })
  } catch (error) {
    if (error instanceof NotFoundError) {
      return errorResponse(error.code, error.message, error.status)
    }
    console.error('Failed to resend vendor invite:', error)
    return errorResponse('INTERNAL_ERROR', 'Failed to resend vendor invite', 500)
  }
}

// Revoke invite
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin()
    const inviteId = params.id

    const invite = await db.vendorInvite.findUnique({
      where: { id: inviteId },
    })

    if (!invite) {
      throw new NotFoundError('Invite not found')
    }

    if (invite.status !== 'PENDING') {
      return errorResponse('INVALID_STATUS', 'Can only revoke pending invites', 400)
    }

    await db.vendorInvite.update({
      where: { id: inviteId },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
      },
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: admin.id,
        userRole: admin.role,
        action: 'VENDOR_INVITE_REVOKED',
        entity: 'vendor_invites',
        entityId: inviteId,
        metadata: {
          email: invite.email,
        },
      },
    })

    return successResponse({
      message: 'Invite revoked successfully',
    })
  } catch (error) {
    if (error instanceof NotFoundError) {
      return errorResponse(error.code, error.message, error.status)
    }
    console.error('Failed to revoke vendor invite:', error)
    return errorResponse('INTERNAL_ERROR', 'Failed to revoke vendor invite', 500)
  }
}
