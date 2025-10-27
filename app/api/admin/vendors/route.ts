import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-response'

// List all vendors
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const vendors = await db.vendor.findMany({
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return successResponse({
      vendors: vendors.map((vendor) => ({
        id: vendor.id,
        businessName: vendor.businessName,
        businessType: vendor.businessType,
        contactEmail: vendor.contactEmail,
        status: vendor.status,
        createdAt: vendor.createdAt,
        approvedAt: vendor.approvedAt,
      })),
    })
  } catch (error) {
    console.error('Failed to list vendors:', error)
    return errorResponse('INTERNAL_ERROR', 'Failed to list vendors', 500)
  }
}
