import { z } from 'zod'

export const vendorInviteSchema = z.object({
  email: z.string().email('Invalid email'),
  expirationDays: z.number().int().positive().default(7),
})

export type VendorInviteInput = z.infer<typeof vendorInviteSchema>

export const vendorSignupSchema = z.object({
  token: z.string().uuid(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  businessName: z.string().min(1, 'Business name is required'),
  businessType: z.enum(['BOOKSTORE', 'MASJID', 'PUBLISHER', 'ORGANIZATION', 'INDIVIDUAL']),
  description: z.string().optional(),

  contactName: z.string().min(1, 'Contact name is required'),
  contactEmail: z.string().email('Invalid email'),
  contactPhone: z.string().regex(/^\+?1?\d{10,15}$/, 'Invalid phone number'),

  addressLine1: z.string().min(1, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().length(2, 'State must be 2-letter code'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
  country: z.string().default('US'),

  acceptedTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
})

export type VendorSignupInput = z.infer<typeof vendorSignupSchema>

export const updateVendorSchema = z.object({
  businessName: z.string().min(1).optional(),
  description: z.string().optional(),
  contactName: z.string().min(1).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().regex(/^\+?1?\d{10,15}$/).optional(),
  addressLine1: z.string().min(1).optional(),
  addressLine2: z.string().optional(),
  city: z.string().min(1).optional(),
  state: z.string().length(2).optional(),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/).optional(),
})

export type UpdateVendorInput = z.infer<typeof updateVendorSchema>
